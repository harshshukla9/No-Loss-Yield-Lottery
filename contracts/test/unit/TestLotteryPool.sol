// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import "../../src/LotteryPool.sol";

// Minimal ERC20 mock for link/aEthLink
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
    ERC20Mock public link;
    ERC20Mock public aEthLink;

    constructor(address _link, address _aEthLink) {
        link = ERC20Mock(_link);
        aEthLink = ERC20Mock(_aEthLink);
    }

    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external {
        require(asset == address(link), "Only link");
        link.transferFrom(msg.sender, address(this), amount);
        aEthLink.mint(onBehalfOf, amount);
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        require(asset == address(link), "Only link");
        // Burn aEthLink from msg.sender
        aEthLink.burn(msg.sender, amount);
        link.transfer(to, amount);
        return amount;
    }
}

contract TestLotteryPool is Test {
    VRFCoordinatorV2_5Mock vrfCoordinator;
    ERC20Mock link;
    ERC20Mock aEthLink;
    AaveLendingPoolMock aaveLendingPool;
    LotteryPool lottery;

    uint256 subId;
    address owner = address(this);
    address user1 = address(0x1);
    address user2 = address(0x2);

    function setUp() public {
        // Deploy mocks
        vrfCoordinator = new VRFCoordinatorV2_5Mock(1e17, 1e9, 1e18);
        link = new ERC20Mock("link", "link", 6);
        aEthLink = new ERC20Mock("aEthLink", "aEthLink", 6);
        aaveLendingPool = new AaveLendingPoolMock(address(link), address(aEthLink));
        // Create and fund subscription
        subId = vrfCoordinator.createSubscription();
        vrfCoordinator.fundSubscription(subId, 100e18);

        // Deploy LotteryPool
        lottery = new LotteryPool(
            address(vrfCoordinator),
            0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae,
            subId,
            address(link),
            address(aaveLendingPool),
            address(aEthLink),
            1 days,
            1e6, // ticket cost (1 link)
            owner
        );

        // Add consumer
        vrfCoordinator.addConsumer(subId, address(lottery));

        // Mint link to users
        link.mint(user1, 100e6);
        link.mint(user2, 100e6);

        // Approve lottery to spend link
        vm.prank(user1);
        link.approve(address(lottery), type(uint256).max);
        vm.prank(user2);
        link.approve(address(lottery), type(uint256).max);
    }

    function testStakeAndEnterLottery() public {
        vm.prank(user1);
        lottery.stake(10e6); // 10 link

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
        vm.expectRevert(LotteryPool.Lottery_InsufficientLINK.selector);
        lottery.stake(1e5); // 0.1 link
    }

    function testPerformUpkeepAndWinnerSelection() public {
        // Stake for two users
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);

        // Simulate yield: mint aEthLink to the pool to represent yield
        aEthLink.mint(address(lottery), 3e6); // 3 link yield

        // Simulate time passing
        vm.warp(block.timestamp + 2 days);

        // Calculate expected values BEFORE fulfillment
        uint256 totalStaked = 10e6 + 20e6;
        uint256 currentBalance = aEthLink.balanceOf(address(lottery));
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
        console.log("user2 balance", link.balanceOf(user2));
        console.log("winnerAmount", winnerAmount);
        console.log("expectedWinnerBalance", expectedWinnerBalance);
        assertEq(link.balanceOf(user2), expectedWinnerBalance);

        // Check platform fee recipient's link balance increased by fee
        assertEq(link.balanceOf(owner), fee);

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

    function testGetAaveInvestmentBalance() public {
        // Stake for user1
        vm.prank(user1);
        lottery.stake(10e6); // 10 link

        // The contract should have received 10 aEthLink
        uint256 aEthLinkBalance = lottery.getAaveInvestmentBalance();
        assertEq(aEthLinkBalance, 10e6);

        // Stake for user2
        vm.prank(user2);
        lottery.stake(20e6); // 20 link

        // The contract should now have 30 aEthLink
        aEthLinkBalance = lottery.getAaveInvestmentBalance();
        assertEq(aEthLinkBalance, 30e6);
    }

    function testWithdrawAllOfAUsersTickets() public {
        // Stake for user1 and user2
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);

        // user1's balance after staking
        uint256 user1BalanceAfterStake = link.balanceOf(user1);
        assertEq(user1BalanceAfterStake, 90e6);

        // Call withdrawAllOfAUsersTickets as user1
        vm.prank(user1);
        lottery.withdrawAllOfAUsersTickets();

        // user1's balance should be restored to initial (100e6)
        assertEq(link.balanceOf(user1), 100e6);

        // user1 should have no tickets left
        assertEq(lottery.userStakes(user1), 0);
        // Optionally, check that user2's state is unchanged
        assertEq(lottery.userStakes(user2), 20e6);
        // aEthLink balance of the pool should be 20e6 (only user2's stake remains)
        assertEq(aEthLink.balanceOf(address(lottery)), 20e6);
    }

    function testEmergencyWithdraw() public {
        // Stake for user1 and user2
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);

        // user1's balance after staking
        uint256 user1BalanceAfterStake = link.balanceOf(user1);
        console.log("user1BalanceAfterStake", user1BalanceAfterStake);
        assertEq(user1BalanceAfterStake, 90e6);


        // contract owner pause the contract
        vm.prank(owner);
        lottery.pause();

        // Call emergencyWithdraw as user1  
        vm.prank(user1);
        lottery.emergencyWithdraw();

        uint256 user1BalanceAfterEmergencyWithdraw = link.balanceOf(user1);
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
        uint256 user1BalanceAfterStake = link.balanceOf(user1);
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
