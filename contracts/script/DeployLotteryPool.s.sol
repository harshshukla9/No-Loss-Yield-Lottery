// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { Script } from "forge-std/Script.sol";
import { LotteryPool } from "../src/LotteryPool.sol";

contract DeployLotteryPool is Script {
    function run() external {
        // --- Set your deployment parameters here ---
        address vrfCoordinator = 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE;
        bytes32 keyHash = 0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887;
        uint64 subscriptionId = 0; // Your Chainlink VRF subscription ID
        address usdc = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E; // Avalanche USDC
        address aaveLendingPool = 0x794a61358D6845594F94dc1DB02A252b5b4814aD;
        address aUsdc = 0x625E7708f30cA75bfd92586e17077590C60eb4cD;
        uint256 interval = 1 days;
        uint256 ticketPurchaseCost = 1_000_000; // 1 USDC (6 decimals)

        vm.startBroadcast();

        new LotteryPool(
            vrfCoordinator,
            keyHash,
            subscriptionId,
            usdc,
            aaveLendingPool,
            aUsdc,
            interval,
            ticketPurchaseCost
        );

        vm.stopBroadcast();
    }
}