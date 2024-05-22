// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {FunctionsClient} from "chainlink/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "chainlink/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract Consumer is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    address private immutable router;
    address public walletFactory;
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    uint32 gasLimit = 300000;
    bytes32 donId;

    error UnexpectedRequestID(bytes32 requestId);

    event ChainlinkFunctionsResponse(bytes32 indexed requestId, string character, bytes response, bytes err);

    string constant source = "const address = args[0];" "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://93d8-2607-fea8-a9a8-a900-d89c-5a8f-dc2a-f17b.ngrok-free.app/api/request-2fa/${address}/`" "});"
        "if (apiResponse.error) {" "throw Error('Request failed');" "}" "const { data } = apiResponse;"
        "return Functions.encodeString(data.name);";

    mapping(address => bool) public authorizedWallets;

    constructor(address _router, bytes32 _donId) FunctionsClient(_router) {
        router = _router;
        donId = _donId;
    }

    /**
     * @notice Sends an HTTP request for character information
     * @param subscriptionId The ID for the Chainlink subscription
     * @param args The arguments to pass to the HTTP request
     * @return requestId The ID of the request
     */
    function sendRequest(uint64 subscriptionId, string[] memory args) external returns (bytes32 requestId) {
        if (!authorizedWallets[msg.sender]) {
            revert("Unauthorized wallet");
        }

        FunctionsRequest.Request memory req;

        req.initializeRequestForInlineJavaScript(source); // Initialize the request with JS code
        if (args.length > 0) req.setArgs(args); // Set the arguments for the request
        // Send the request and store the request ID
        s_lastRequestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);

        return s_lastRequestId;
    }

    /**
     * @notice Callback function for fulfilling a request
     * @param requestId The ID of the request to fulfill
     * @param response The HTTP response data
     * @param err Any errors from the Functions request
     */
    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }

        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        s_lastError = err;

        // Emit an event to log the response
        emit ChainlinkFunctionsResponse(requestId, string(response), s_lastResponse, s_lastError);
    }

    function setWalletFactoryAddress(address _walletFactory) external {
        walletFactory = _walletFactory;
    }

    function setAuthorizedWallet(address wallet, bool isAuthorized) external {
        if (msg.sender != walletFactory) {
            revert("Unauthorized");
        }
        authorizedWallets[wallet] = isAuthorized;
    }
}
