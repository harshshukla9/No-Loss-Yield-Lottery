// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { Test } from "forge-std/Test.sol";
import { LotteryPool } from "../../src/LotteryPool.sol";
import { MockERC20 } from "../../src/mocks/MockERC20.sol";
import { MockAaveLendingPool } from "../../src/mocks/MockAaveLendingPool.sol";
import { MockVRFCoordinatorV2 } from "../../src/mocks/MockVRFCoordinatorV2.sol";


// --- Test Contract ---
contract TestLotteryPool is Test {
    LotteryPool public lotteryPool;
    MockERC20 public usdc;
    MockERC20 public aUsdc;
    MockAaveLendingPool public aaveLendingPool;
    MockVRFCoordinatorV2 public vrfCoordinator;

    address public user = address(0x123);

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        aUsdc = new MockERC20("Aave USDC", "aUSDC", 6);
        aaveLendingPool = new MockAaveLendingPool(address(usdc), address(aUsdc));
        vrfCoordinator = new MockVRFCoordinatorV2();
        // Deploy LotteryPool with mock addresses and dummy params
        lotteryPool = new LotteryPool(
            address(vrfCoordinator),
            bytes32(0), // keyHash
            1, // subscriptionId
            address(usdc),
            address(aaveLendingPool),
            address(aUsdc),
            1 days, // interval
            1e6 // ticketPurchaseCost (1 USDC)
        );
        // Mint USDC to user for testing
        usdc.mint(user, 1000e6);
    }

    function testStakeIncreasesUserStakeAndTickets() public {
        // Start as user
        vm.startPrank(user);
        // Approve LotteryPool to spend USDC
        usdc.approve(address(lotteryPool), 100e6);
        // Stake 100 USDC
        lotteryPool.stake(100e6);
        vm.stopPrank();

        // Check userStakes mapping
        assertEq(lotteryPool.userStakes(user), 100e6);
        // Check ticket count
        assertEq(lotteryPool.getTicketCount(), 1);
    }

    function testWithdrawAllOfAUsersTicketsReturnsFunds() public {
        // User stakes first
        vm.startPrank(user);
        usdc.approve(address(lotteryPool), 100e6);
        lotteryPool.stake(100e6);
        vm.stopPrank();

        // Approve aUSDC for withdrawal by the pool
        vm.prank(address(lotteryPool));
        aUsdc.approve(address(aaveLendingPool), 100e6);

        // User withdraws all tickets
        vm.startPrank(user);
        // Check USDC balance before
        uint256 before = usdc.balanceOf(user);
        lotteryPool.withdrawAllOfAUsersTickets();
        // Check USDC balance after (should be refunded)
        uint256 afterBalance = usdc.balanceOf(user);
        assertGt(afterBalance, before, "User should get USDC back");
        // Check userStakes mapping
        assertEq(lotteryPool.userStakes(user), 0);
        // Check ticket count
        assertEq(lotteryPool.getTicketCount(), 0);
        vm.stopPrank();
    }

    function testFullRoundWithFiveUsersAndWinnerGetsInterest() public {
        address[5] memory users = [
            address(0x1),
            address(0x2),
            address(0x3),
            address(0x4),
            address(0x5)
        ];
        uint256 stakeAmount = 100e6;
        uint256 totalStake = stakeAmount * 5;

        // Mint USDC to all users and have them stake
        for (uint256 i = 0; i < users.length; i++) {
            usdc.mint(users[i], stakeAmount);
            vm.startPrank(users[i]);
            usdc.approve(address(lotteryPool), stakeAmount);
            lotteryPool.stake(stakeAmount);
            vm.stopPrank();
        }

        // Simulate yield: mint extra aUSDC to the pool to represent interest
        uint256 interest = 50e6; // 50 USDC as yield
        aUsdc.mint(address(lotteryPool), interest);

        // Move time forward by one week
        vm.warp(block.timestamp + 7 days);

        // Check upkeep (should be true)
        (bool upkeepNeeded, ) = lotteryPool.checkUpkeep("");
        assertTrue(upkeepNeeded, "Upkeep should be needed after interval");

        // Perform upkeep (should request randomness)
        lotteryPool.performUpkeep("");

        // Simulate VRF callback: pick a winner (e.g., user at index 2)
        uint256 requestId = 1; // MockVRF increments from 1
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 2; // This will select user at index 2 as winner
        // Approve aUSDC for withdrawal by the pool (simulate Aave logic)
        vm.prank(address(lotteryPool));
        aUsdc.approve(address(aaveLendingPool), type(uint256).max);
        // Fulfill randomness
        MockVRFCoordinatorV2(address(vrfCoordinator)).fulfillRandomWords(requestId, address(lotteryPool), randomWords);

        // Check winner received the interest
        address winner = users[2];
        uint256 winnerBalance = usdc.balanceOf(winner);
        assertEq(winnerBalance, interest, "Winner should receive all interest");

        // Check losers did not receive interest
        for (uint256 i = 0; i < users.length; i++) {
            if (i != 2) {
                assertEq(usdc.balanceOf(users[i]), 0, "Losers should not receive interest");
            }
        }

        // Check pool's USDC balance is zero (all principal is still in Aave)
        assertEq(usdc.balanceOf(address(lotteryPool)), 0, "Pool should have no USDC after interest payout");

        // Check aUSDC balance (should be total staked, as all is still supplied)
        assertEq(aUsdc.balanceOf(address(lotteryPool)), totalStake, "Pool should have aUSDC for all staked");
    }
}