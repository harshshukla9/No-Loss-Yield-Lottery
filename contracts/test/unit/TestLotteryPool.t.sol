// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";
import { LotteryPool } from "../../src/LotteryPool.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { VRFCoordinatorV2_5Mock } from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

// Inherit from LotteryPool to expose fulfillRandomWords for testing
contract LotteryPoolTestable is LotteryPool {
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        address _usdc,
        address _aaveLendingPool,
        address _aUsdc,
        uint256 _interval,
        uint256 _ticketPurchaseCost
    ) LotteryPool(
        _vrfCoordinator,
        _keyHash,
        _subscriptionId,
        _usdc,
        _aaveLendingPool,
        _aUsdc,
        _interval,
        _ticketPurchaseCost
    ) {}

    function callFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) public {
        fulfillRandomWords(requestId, randomWords);
    }

    function setCurrentRound(uint256 round) public {
        currentRound = round;
    }
}

contract TestLotteryPool is Test {
    LotteryPoolTestable pool;
    VRFCoordinatorV2_5Mock vrfCoordinatorMock;
    address vrfCoordinator;
    bytes32 keyHash = bytes32(uint256(0x2));
    uint64 subscriptionId = 1;
    address usdc = address(0x3);
    address aaveLendingPool = address(0x4);
    address aUsdc = address(0x5);
    uint256 interval = 1 days;
    uint256 ticketPurchaseCost = 1_000_000; // 1 USDC (6 decimals)
    address user = address(0x10);

    function setUp() public {
        vrfCoordinatorMock = new VRFCoordinatorV2_5Mock(0, 0, 0);
        vrfCoordinator = address(vrfCoordinatorMock);
        pool = new LotteryPoolTestable(
            vrfCoordinator,
            keyHash,
            subscriptionId,
            usdc,
            aaveLendingPool,
            aUsdc,
            interval,
            ticketPurchaseCost
        );
        vm.label(user, "User");
    }

    function testCannotStakeZeroAmount() public {
        vm.prank(user);
        vm.expectRevert(LotteryPool.Lottery_InvalidAmount.selector);
        pool.stake(0);
    }

    function testCannotStakeLessThanTicketCost() public {
        vm.prank(user);
        vm.expectRevert(LotteryPool.Lottery_InsufficientUSDC.selector);
        pool.stake(ticketPurchaseCost - 1);
    }

    function testStakeEmitsEvent() public {
        // Mock USDC transferFrom and approve
        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.transferFrom.selector), abi.encode(true));
        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.approve.selector), abi.encode(true));
        vm.mockCall(aaveLendingPool, abi.encodeWithSignature("supply(address,uint256,address,uint16)", usdc, ticketPurchaseCost, address(pool), 0), abi.encode(true));

        vm.prank(user);
        vm.expectEmit(true, true, false, true);
        emit LotteryPool.Staked(user, ticketPurchaseCost);
        pool.stake(ticketPurchaseCost);
    }

    function testCannotPerformUpkeepIfNoTickets() public {
        // Fast-forward time to pass the interval check
        vm.warp(block.timestamp + interval + 1);
        vm.expectRevert(LotteryPool.Lottery_NoTicketsInRound.selector);
        pool.performUpkeep("");
    }

    function testCannotWithdrawIfNoTickets() public {
        vm.prank(user);
        vm.expectRevert(LotteryPool.Lottery_NoTicketsToWithdraw.selector);
        pool.withdrawAllOfAUsersTickets();
    }

    function testWithdrawAllOfAUsersTickets() public {
        // Mock USDC and Aave interactions
        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.transferFrom.selector), abi.encode(true));
        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.approve.selector), abi.encode(true));
        vm.mockCall(aaveLendingPool, abi.encodeWithSignature("supply(address,uint256,address,uint16)", usdc, ticketPurchaseCost, address(pool), 0), abi.encode(true));
        vm.mockCall(aaveLendingPool, abi.encodeWithSignature("withdraw(address,uint256,address)", usdc, ticketPurchaseCost, user), abi.encode(true));

        vm.prank(user);
        pool.stake(ticketPurchaseCost);

        vm.prank(user);
        pool.withdrawAllOfAUsersTickets();
        // Optionally, assert userStakes[user] == 0
        assertEq(pool.userStakes(user), 0);
    }

    function testCannotWithdrawInterestIfNoInterest() public {
        // Stake so totalStaked is ticketPurchaseCost
        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.transferFrom.selector), abi.encode(true));
        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.approve.selector), abi.encode(true));
        vm.mockCall(aaveLendingPool, abi.encodeWithSignature("supply(address,uint256,address,uint16)", usdc, ticketPurchaseCost, address(pool), 0), abi.encode(true));
        vm.prank(user);
        pool.stake(ticketPurchaseCost);

        // Now mock aUSDC balance to be equal to totalStaked
        vm.mockCall(aUsdc, abi.encodeWithSelector(IERC20.balanceOf.selector, address(pool)), abi.encode(ticketPurchaseCost));
        vm.prank(user);
        vm.expectRevert(LotteryPool.Lottery_NoInterestAccrued.selector);
        pool.withdrawInterest(user);
    }

    // Add more tests for winner selection logic, e.g.:
    function testFulfillRandomWordsSelectsWinner() public {
        // Set round to 0
        pool.setCurrentRound(0);

        // Warp to just before the cutoff for round 1
        vm.warp(block.timestamp + interval - pool.entryCutoffTime() - 1);

        // Mock USDC and Aave interactions
        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.transferFrom.selector), abi.encode(true));
        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.approve.selector), abi.encode(true));
        vm.mockCall(aaveLendingPool, abi.encodeWithSignature("supply(address,uint256,address,uint16)", usdc, ticketPurchaseCost, address(pool), 0), abi.encode(true));

        vm.prank(user);
        pool.stake(ticketPurchaseCost);

        // Advance to round 1
        pool.setCurrentRound(1);

        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 0;

        vm.mockCall(usdc, abi.encodeWithSelector(IERC20.transfer.selector), abi.encode(true));
        pool.callFulfillRandomWords(0, randomWords);

        // Optionally, check events or state changes
    }
}