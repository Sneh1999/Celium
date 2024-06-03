# Celium

Celium is a ERC-4337 smart wallet that allows users to set up "guardians" which can block suspicious transactions and require two-factor authentication to execute them. It also enables a loyalty points program by awarding points to users who execute transactions through the wallet. The earned points can later be redeemed through the Celium Paymaster for free transactions.

Celium integrates with Chainlink Price Feeds, Chainlink Functions, and Chainlink CCIP to perform its functions.

## Supported Chains

- Ethereum Sepolia
- Arbitrum Sepolia
- Avalanche Fuji
- Scroll Sepolia
- Polygon Amoy

> NOTE: Some chains have restrictions that do not allow Celium's full functionality to be possible.

## User Flow

There are two aspects to the user flow. Security and Loyalty Points.

### Security

1. User signs up to Celium, and links an email account to their wallet
2. User can then create any number of wallets on any one of the supported chains. While setting up a wallet, they can also set up a maximum USD amount for transactions which should be allowed to happen without 2FA.
3. User can then conduct their transactions through the wallet.
4. If a transaction is detected that transfers the native token, an ERC-20, or attempts to do a swap through Uniswap - and the amount being transferred exceeds the maximum USD amount allowed, the transaction will be paused and a 2FA code will be required to execute it. A chainlink function will be used to send a notification to the user's email account.
5. The user needs to come back to Celium and enter the 2FA code to execute the transaction.
6. The transaction will be executed as normal

### Loyalty Points

1. User signs up to Celium, and links an email account to their wallet
2. User can then create any number of wallets on any one of the supported chains.
3. User can then conduct their transactions through the wallet.
4. For each transaction, the user earns 1,000 Points (can be made dynamic in the future depending on gas cost, for example)
5. For every 2,000 points collected, the user will be rewarded with a free transaction on the Celium Paymaster.

## Tech Used

### Chainlink Price Feeds

Chainlink Price Feeds are used to get the current price of tokens on the supported chains. When a transaction is detected that is moving money around, Chainlink Price Feeds are checked to figure out the USD Value of the transaction.

If the USD value exceeds the maximum USD amount allowed, the transaction will be paused and a 2FA code will be required to execute it.

This includes the following transactions:

- Native token transfer
- ERC-20 `approve`
- ERC-20 `transfer`

By extension, basically all transactions involving movement of fungible tokens get detected and blocked.

**Use Cases:**

- Set a spending limit for a wallet
- Prevent getting drained easily if you lose your owner private key

### Chainlink Functions

Chainlink Functions are used to send a notification to the user's email account when a transaction is detected that is marked suspicious.

Chainlink Functions call an API Endpoint on Celium's Guardian Backend, which triggers an email notification to the user's email account.

**Use Cases:**

- Notify the user when a transaction is detected that is marked suspicious
- Notify the user when a transaction is detected that is moving money around

### Chainlink CCIP

Chainlink CCIP is used to have a native points-enabled way of conducting swaps+bridges through Celium.

We integrate with the Uniswap Universal Router to allow for swaps to be conducted through Celium. The user, if they wish, can have the output tokens of the swap be sent to another chain through CCIP in this process. This is a native points-enabled way of conducting swaps+bridges through Celium.

Compared to doing this transaction normally, where it might get blocked by the 2FA requirement due to a separate `approve` transaction needing to happen before, and then a `transfer` inside the `swap`, and another `transfer` in the `bridge` - this transaction will be allowed to happen with a single possible 2FA block while still letting the paymaster handle the transaction.

**Use Cases:**

- Allow users to swap and bridge tokens through Celium
- Allow users to swap and bridge tokens to other chains through Celium

### Points Paymaster

A custom paymaster created by Celium that allows users to earn points for executing transactions through Celium.

> NOTE: Due to time constraints, the paymaster is not enabled on the frontend yet. It exists and has Foundry Tests that show it working, but is not a part of the frontend.

## Challenges

The frontend is far from finished yet. Due to time constraints, and our focus on having Foundry Tests working first as it felt like a faster way to test all our functionality was working, the frontend has some issues around the edges.

Secondly, finding testnet tokens for Sepolia and Sepolia L2's has been a challenge - making testing on real testnets hard.

Thirdly, the Supabase free tier database being used for the Celium Guardian Backend can sometimes go down, causing issued.

Fourthly, public RPCs used for ERC-4337 Bundlers sometimes have issues and throw random RPC errors, causing issues with the frontend.
