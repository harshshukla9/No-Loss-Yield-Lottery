// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { Script } from "forge-std/Script.sol";
import { LotteryPool } from "../src/LotteryPool.sol";

contract DeployLotteryPool is Script {
    function run() external {
        // --- Set your deployment parameters here ---
        // address vrfCoordinator = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B; //sepolia
        bytes32 keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae; //sepolia
        uint256 subscriptionId = 44372626609795092558678873294396821897896890677167149334111221502956617602280; // Your Chainlink VRF subscription ID
        address usdc = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238; // Avalanche USDC
        address aaveLendingPool = 0x794a61358D6845594F94dc1DB02A252b5b4814aD;
        address aUsdc = 0x625E7708f30cA75bfd92586e17077590C60eb4cD;
        uint256 interval = 1 days; //1 day for testing 7 days for production
        uint256 ticketPurchaseCost = 1_000_000; // 1 USDC (6 decimals) for testing 10 usdc for production
        address platformFeeRecipient = 0x473fa0F100981fffFf40dB48B29B97AF9A44Dbbc; // The address that will receive the platform fee multisig

        vm.startBroadcast();

        new LotteryPool(
            // vrfCoordinator,
            keyHash,
            subscriptionId,
            usdc,
            aaveLendingPool,
            aUsdc,
            interval,
            ticketPurchaseCost,
            platformFeeRecipient
        );

        vm.stopBroadcast();
    }
}