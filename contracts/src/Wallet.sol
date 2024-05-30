// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {BaseAccount} from "account-abstraction/core/BaseAccount.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {Initializable} from "openzeppelin-contracts/contracts/proxy/utils/Initializable.sol";
import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

import {MessageHashUtils} from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {AggregatorV3Interface} from "chainlink/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {IUniversalRouter} from "universal-router/contracts/interfaces/IUniversalRouter.sol";

import {Client} from "ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";

import "./Consumer.sol";
import "forge-std/console.sol";
import "./FeedsRegistry.sol";

contract Wallet is BaseAccount, Initializable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Events
    event WalletInitialized(IEntryPoint indexed entryPoint, address owner, address guardian, uint256 maxAmountAllowed);
    event TwoFactorAuthRequired(uint256 indexed pausedNonce);
    event ChainlinkDataFeedNotFound(address token);

    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);

    event TokensTransferred( // The unique ID of the message.
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        address token,
        uint256 tokenAmount,
        address feeToken,
        uint256 fees
    );

    // Errors
    error NotEntrypointOrFactory();
    error InvalidPausedTransactionNonce();
    error GuardianSignatureVerificationFailed();
    error NotSelf();
    error InvalidReceiverAddress(); // Used when the receiver address is 0.

    // Structs
    struct Transaction {
        address target;
        uint256 value;
        bytes data;
    }

    // Storage
    address private immutable _walletFactory;
    IEntryPoint private immutable _entryPoint;
    FeedsRegistry private immutable feedsRegistry;
    Consumer private immutable consumer;
    IRouterClient private immutable s_router;
    // Permit2 private immutable permit2;
    IUniversalRouter private immutable universalRouter;

    bytes4 private constant TRANSFER_SELECTOR = bytes4(keccak256("transfer(address,uint256)"));
    bytes4 private constant APPROVE_SELECTOR = bytes4(keccak256("approve(address,uint256)"));
    bytes4 private constant SWAP_AND_BRIDGE_SELECTOR =
        bytes4(keccak256("swapAndBridge(address,uint256,address,uint256,bytes,uint64)"));
    bytes4 private constant BRIDGE_SELECTOR = bytes4(keccak256("bridge(address,uint256,uint64)"));
    uint256 lastUsedPausedNonce;
    uint256 maxTransferAllowedWithoutAuthUSD;
    address public owner;
    address public guardian;
    address zero;
    uint64 immutable subscriptionId;

    mapping(uint256 nonce => Transaction txn) public pausedTransactions;

    AggregatorV3Interface internal dataFeed;

    // Modifiers
    modifier _requireFromEntryPointOrFactory() {
        if (msg.sender != address(_entryPoint) && msg.sender != _walletFactory) revert NotEntrypointOrFactory();
        _;
    }

    modifier _requireFromSelf() {
        if (msg.sender != address(this)) revert NotSelf();
        _;
    }

    modifier validateReceiver(address _receiver) {
        if (_receiver == address(0)) revert InvalidReceiverAddress();
        _;
    }

    constructor(
        IEntryPoint anEntryPoint,
        address ourWalletFactory,
        address _feedsRegistry,
        address _consumer,
        address _universalRouter,
        // address _permit2,
        address ccipRouter,
        uint64 _subscriptionId
    ) {
        _entryPoint = anEntryPoint;
        _walletFactory = ourWalletFactory;
        consumer = Consumer(_consumer);
        universalRouter = IUniversalRouter(_universalRouter);
        // permit2 = Permit2(_permit2);
        s_router = IRouterClient(ccipRouter);
        feedsRegistry = FeedsRegistry(_feedsRegistry);
        subscriptionId = _subscriptionId;
    }

    function initialize(address _owner, address _guardian, uint256 _maxAmountAllowed) public initializer {
        owner = _owner;
        guardian = _guardian;
        maxTransferAllowedWithoutAuthUSD = _maxAmountAllowed;

        emit WalletInitialized(_entryPoint, _owner, _guardian, _maxAmountAllowed);
    }

    function execute(address target, uint256 value, bytes calldata data) external _requireFromEntryPointOrFactory {
        bool is2FARequired = _twoFactorRequired(target, value, data);

        if (!is2FARequired) {
            _call(target, value, data);
        }
    }

    function approveTransaction(uint256 pausedNonce, bytes calldata approveSignature)
        public
        _requireFromEntryPointOrFactory
    {
        Transaction memory txn = pausedTransactions[pausedNonce];
        if (txn.data.length == 0) revert InvalidPausedTransactionNonce();
        bytes32 txnHash = keccak256(abi.encode(txn)).toEthSignedMessageHash();

        if (guardian != txnHash.recover(approveSignature)) revert GuardianSignatureVerificationFailed();

        _call(txn.target, txn.value, txn.data);
    }

    function swapAndBridge(
        address tokenIn,
        uint256 amountIn,
        address tokenOut,
        uint256 amountOutMin,
        bytes memory path,
        uint64 _destinationChainSelector
    ) public _requireFromSelf returns (bytes32) {
        ERC20(tokenIn).transfer(address(universalRouter), amountIn);

        uint256 balanceBefore = ERC20(tokenOut).balanceOf(address(this));
        // Uniswap V3 exactInputSwap
        bytes memory commands = hex"00";
        bytes[] memory inputs = new bytes[](1);
        inputs[0] = abi.encode(address(this), amountIn, amountOutMin, path, false);

        universalRouter.execute(commands, inputs, block.timestamp);

        uint256 amountOut = ERC20(tokenOut).balanceOf(address(this)) - balanceBefore;

        bytes32 messageId = _transferTokensPayNative(_destinationChainSelector, address(this), tokenOut, amountOut);
        return messageId;
    }

    function bridge(address token, uint256 amount, uint64 _destinationChainSelector)
        public
        _requireFromSelf
        returns (bytes32)
    {
        return _transferTokensPayNative(_destinationChainSelector, address(this), token, amount);
    }

    function addDeposit() public payable {
        _entryPoint.depositTo{value: msg.value}(address(this));
    }

    // Internal Functions
    function _twoFactorRequired(address target, uint256 value, bytes memory data) internal returns (bool) {
        bytes4 selector;
        uint256 tokenPrice;
        uint256 amount;
        string[] memory args = new string[](4);

        // TODO
        // if (value / 10 ** 18 > maxTransferAllowedWithoutAuthUSD) {
        //     return false;
        // }

        if (data.length > 0) {
            assembly {
                selector := mload(add(data, 32))
            }
            if (
                selector != TRANSFER_SELECTOR && selector != APPROVE_SELECTOR && selector != BRIDGE_SELECTOR
                    && selector != SWAP_AND_BRIDGE_SELECTOR
            ) {
                return false;
            }

            assembly {
                // Skip 32 + 4 + 32 (length + func sig + address)
                amount := mload(add(data, 68))
            }
        }

        return _twoFactorRequiredERC20(target, amount, value, data);
    }

    function _twoFactorRequiredERC20(address token, uint256 amount, uint256 value, bytes memory data)
        internal
        returns (bool)
    {
        uint256 tokenPrice;
        string[] memory args = new string[](4);

        if (feedsRegistry.feeds(token) == zero) {
            return false;
        }

        dataFeed = AggregatorV3Interface(feedsRegistry.feeds(token));
        try dataFeed.latestRoundData() returns (uint80, int256 answer, uint256, uint256, uint80) {
            tokenPrice = uint256(answer);
        } catch {
            emit ChainlinkDataFeedNotFound(token);
            return false;
        }

        uint8 tokenDecimals = ERC20(token).decimals();

        if ((amount * tokenPrice) / (10 ** (tokenDecimals + dataFeed.decimals())) < maxTransferAllowedWithoutAuthUSD) {
            return false;
        }

        unchecked {
            lastUsedPausedNonce++;
        }
        emit TwoFactorAuthRequired(lastUsedPausedNonce);

        args[0] = Strings.toHexString(address(this));
        args[1] = Strings.toHexString(lastUsedPausedNonce);
        args[2] = Strings.toHexString(_entryPoint.getNonce(address(this), 0));
        args[3] = Strings.toHexString(block.chainid);

        pausedTransactions[lastUsedPausedNonce] = Transaction({data: data, value: value, target: target});

        consumer.sendRequest(subscriptionId, args);
        return true;
    }

    function _validateSignature(PackedUserOperation calldata userOp, bytes32 userOpHash)
        internal
        view
        override
        returns (uint256)
    {
        if (owner == userOpHash.recover(userOp.signature)) {
            return 0;
        }

        return 1;
    }

    // TODO add check for allowing only allowlist chains
    function _transferTokensPayNative(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount
    ) internal validateReceiver(_receiver) returns (bytes32 messageId) {
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(_receiver, _token, _amount, address(0));

        uint256 fees = s_router.getFee(_destinationChainSelector, evm2AnyMessage);

        if (fees > address(this).balance) {
            revert NotEnoughBalance(address(this).balance, fees);
        }

        ERC20(_token).approve(address(s_router), _amount);

        messageId = s_router.ccipSend{value: fees}(_destinationChainSelector, evm2AnyMessage);

        // Emit an event with message details
        emit TokensTransferred(messageId, _destinationChainSelector, _receiver, _token, _amount, address(0), fees);

        // Return the message ID
        return messageId;
    }

    function _buildCCIPMessage(address _receiver, address _token, uint256 _amount, address _feeTokenAddress)
        private
        pure
        returns (Client.EVM2AnyMessage memory)
    {
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({token: _token, amount: _amount});

        return Client.EVM2AnyMessage({
            receiver: abi.encode(_receiver),
            data: "",
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 0})),
            feeToken: _feeTokenAddress
        });
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    // View Private Variables
    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    function walletFactory() public view returns (address) {
        return _walletFactory;
    }

    receive() external payable {}
}
