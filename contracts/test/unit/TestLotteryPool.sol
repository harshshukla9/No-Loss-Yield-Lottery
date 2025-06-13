// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import "../../src/LotteryPool.sol";

// Minimal ERC20 mock for USDC/aUSDC
contract ERC20Mock is IERC20, Test {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient");
        require(allowance[from][msg.sender] >= amount, "Not allowed");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        return true;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function burn(address from, uint256 amount) external {
        require(balanceOf[from] >= amount, "Insufficient");
        balanceOf[from] -= amount;
        totalSupply -= amount;
    }
}

// Minimal Aave Lending Pool mock
contract AaveLendingPoolMock {
    ERC20Mock public usdc;
    ERC20Mock public aUsdc;

    constructor(address _usdc, address _aUsdc) {
        usdc = ERC20Mock(_usdc);
        aUsdc = ERC20Mock(_aUsdc);
    }

    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external {
        require(asset == address(usdc), "Only USDC");
        usdc.transferFrom(msg.sender, address(this), amount);
        aUsdc.mint(onBehalfOf, amount);
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        require(asset == address(usdc), "Only USDC");
        // Burn aUSDC from msg.sender
        aUsdc.burn(msg.sender, amount);
        usdc.transfer(to, amount);
        return amount;
    }
}

contract TestLotteryPool is Test {
    VRFCoordinatorV2_5Mock vrfCoordinator;
    ERC20Mock usdc;
    ERC20Mock aUsdc;
    AaveLendingPoolMock aaveLendingPool;
    LotteryPool lottery;

    uint256 subId;
    address owner = address(this);
    address user1 = address(0x1);
    address user2 = address(0x2);

    function setUp() public {
        // Deploy mocks
        vrfCoordinator = new VRFCoordinatorV2_5Mock(1e17, 1e9, 1e18);
        usdc = new ERC20Mock("USDC", "USDC", 6);
        aUsdc = new ERC20Mock("aUSDC", "aUSDC", 6);
        aaveLendingPool = new AaveLendingPoolMock(address(usdc), address(aUsdc));
        // Create and fund subscription
        subId = vrfCoordinator.createSubscription();
        vrfCoordinator.fundSubscription(subId, 100e18);

        // Deploy LotteryPool
        lottery = new LotteryPool(
            address(vrfCoordinator),
            0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae,
            subId,
            address(usdc),
            address(aaveLendingPool),
            address(aUsdc),
            1 days,
            1e6, // ticket cost (1 USDC)
            owner
        );

        // Add consumer
        vrfCoordinator.addConsumer(subId, address(lottery));

        // Mint USDC to users
        usdc.mint(user1, 100e6);
        usdc.mint(user2, 100e6);

        // Approve lottery to spend USDC
        vm.prank(user1);
        usdc.approve(address(lottery), type(uint256).max);
        vm.prank(user2);
        usdc.approve(address(lottery), type(uint256).max);
    }

    function testStakeAndEnterLottery() public {
        vm.prank(user1);
        lottery.stake(10e6); // 10 USDC

        assertEq(lottery.getTicketCount(), 1);
        assertEq(lottery.userStakes(user1), 10e6);
    }

    function testCannotStakeZero() public {
        vm.prank(user1);
        vm.expectRevert(LotteryPool.Lottery_InvalidAmount.selector);
        lottery.stake(0);
    }

    function testCannotStakeBelowTicketCost() public {
        vm.prank(user1);
        vm.expectRevert(LotteryPool.Lottery_InsufficientUSDC.selector);
        lottery.stake(1e5); // 0.1 USDC
    }

    function testPerformUpkeepAndWinnerSelection() public {
        // Stake for two users
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);

        // Simulate yield: mint aUSDC to the pool to represent yield
        aUsdc.mint(address(lottery), 3e6); // 3 USDC yield

        // Simulate time passing
        vm.warp(block.timestamp + 2 days);

        // Calculate expected values BEFORE fulfillment
        uint256 totalStaked = 10e6 + 20e6;
        uint256 currentBalance = aUsdc.balanceOf(address(lottery));
        uint256 yield = currentBalance - totalStaked; // should be 3e6
        uint256 fee = (yield * 100) / 10000; // 1% fee
        uint256 winnerAmount = yield - fee;

        // Call performUpkeep and fulfill
        lottery.setCurrentRound(2);
        lottery.performUpkeep("");
        uint256 requestId = 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(lottery));

        // Now check balances
        uint256 expectedWinnerBalance = 80e6 + winnerAmount;
        console.log("user2 balance", usdc.balanceOf(user2));
        console.log("winnerAmount", winnerAmount);
        console.log("expectedWinnerBalance", expectedWinnerBalance);
        assertEq(usdc.balanceOf(user2), expectedWinnerBalance);

        // Check platform fee recipient's USDC balance increased by fee
        assertEq(usdc.balanceOf(owner), fee);

        // Check round incremented
        assertEq(lottery.currentRound(), 3);

        // Optionally, check events (if using vm.expectEmit)
    }

    function testGetTicketCount() public {
                // Stake for two users
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);

        assertEq(lottery.getTicketCount(), 2);
    }

    function testWithdrawAllOfAUsersTickets() public {
        // Stake for user1 and user2
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);

        // user1's balance after staking
        uint256 user1BalanceAfterStake = usdc.balanceOf(user1);
        assertEq(user1BalanceAfterStake, 90e6);

        // Call withdrawAllOfAUsersTickets as user1
        vm.prank(user1);
        lottery.withdrawAllOfAUsersTickets();

        // user1's balance should be restored to initial (100e6)
        assertEq(usdc.balanceOf(user1), 100e6);

        // user1 should have no tickets left
        assertEq(lottery.userStakes(user1), 0);
        // Optionally, check that user2's state is unchanged
        assertEq(lottery.userStakes(user2), 20e6);
        // aUSDC balance of the pool should be 20e6 (only user2's stake remains)
        assertEq(aUsdc.balanceOf(address(lottery)), 20e6);
    }

    function testEmergencyWithdraw() public {
        // Stake for user1 and user2
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);

        // user1's balance after staking
        uint256 user1BalanceAfterStake = usdc.balanceOf(user1);
        console.log("user1BalanceAfterStake", user1BalanceAfterStake);
        assertEq(user1BalanceAfterStake, 90e6);


        // contract owner pause the contract
        vm.prank(owner);
        lottery.pause();

        // Call emergencyWithdraw as user1  
        vm.prank(user1);
        lottery.emergencyWithdraw();

        uint256 user1BalanceAfterEmergencyWithdraw = usdc.balanceOf(user1);
        console.log("user1BalanceAfterEmergencyWithdraw", user1BalanceAfterEmergencyWithdraw);
        assertEq(user1BalanceAfterEmergencyWithdraw, 100e6);
    }

    function testEmergencyWithdrawFailsIfNotPaused() public {
        // Stake for user1 and user2
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);

        // user1's balance after staking
        uint256 user1BalanceAfterStake = usdc.balanceOf(user1);
        console.log("user1BalanceAfterStake", user1BalanceAfterStake);
        assertEq(user1BalanceAfterStake, 90e6);

        // Call emergencyWithdraw as user1  
        vm.prank(user1);    
        vm.expectRevert("Pausable: not paused");
        lottery.emergencyWithdraw();

    }

    // Add more tests for:
    // - withdrawInterest
    // - pausing/unpausing
    // - edge cases (no tickets, no yield, etc.)
}
