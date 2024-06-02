// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FeedsRegistry is Ownable {
    mapping(address => address) public feeds;

    event FeedAdded(address indexed token, address indexed feed);
    event FeedRemoved(address indexed token);

    constructor(address[] memory tokens, address[] memory _feeds) Ownable() {
        // NOTE: this implementation is for testnet only as their is no FeedRegistry Contract deployed on testnets
        for (uint256 i = 0; i < tokens.length; i++) {
            feeds[tokens[i]] = _feeds[i];
        }
    }

    function addFeed(address token, address feed) external onlyOwner {
        feeds[token] = feed;
        emit FeedAdded(token, feed);
    }

    function removeFeed(address token) external onlyOwner {
        delete feeds[token];
        emit FeedRemoved(token);
    }
}
