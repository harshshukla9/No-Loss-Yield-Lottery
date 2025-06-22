// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import "../../src/LotteryPool.sol";
import "forge-std/Vm.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

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

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
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

    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16
    ) external {
        require(asset == address(link), "Only link");
        link.transferFrom(msg.sender, address(this), amount);
        aEthLink.mint(onBehalfOf, amount);
    }

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256) {
        require(asset == address(link), "Only link");
        // Burn aEthLink from msg.sender
        aEthLink.burn(msg.sender, amount);
        link.transfer(to, amount);
        return amount;
    }
}

contract TestLotteryPool is Test {
    // --- Setup variables ---
    VRFCoordinatorV2_5Mock vrfCoordinator;
    ERC20Mock link;
    ERC20Mock aEthLink;
    AaveLendingPoolMock aaveLendingPool;
    LotteryPool lottery;

    uint256 subId;
    address owner = address(this);
    address user1 = address(0x1);
    address user2 = address(0x2);

    // --- Deploy and initialize all contracts and balances before each test ---
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

    // --- Test: User can stake and receive tickets ---
    function testStakeAndEnterLottery() public {
        vm.prank(user1);
        lottery.stake(10e6); // 10 link

        assertEq(lottery.getTicketCount(), 10);
        assertEq(lottery.userStakes(user1), 10e6);
    }

    // --- Test: Cannot stake zero amount ---
    function testCannotStakeZero() public {
        vm.prank(user1);
        vm.expectRevert(LotteryPool.Lottery_InvalidAmount.selector);
        lottery.stake(0);
    }

    // --- Test: Cannot stake below ticket cost ---
    function testCannotStakeBelowTicketCost() public {
        vm.prank(user1);
        vm.expectRevert(LotteryPool.Lottery_InsufficientLINK.selector);
        lottery.stake(1e5); // 0.1 link
    }

    // --- Test: Full round, winner selection, and yield distribution ---
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

        // Record logs and parse WinnerSelected event
        Vm.Log[] memory entries = vm.getRecordedLogs();
        address winner;
        uint256 amountWon;
        bytes32 eventSig = keccak256("WinnerSelected(address,uint256)");
        for (uint i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == eventSig) {
                winner = address(uint160(uint256(entries[i].topics[1])));
                amountWon = abi.decode(entries[i].data, (uint256));
                break;
            }
        }

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
    }

    // --- Test: Get ticket count after staking ---
    function testGetTicketCount() public {
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);
        assertEq(lottery.getTicketCount(), 30);
    }

    // --- Test: Get aEthLink balance after staking ---
    function testGetAaveInvestmentBalance() public {
        vm.prank(user1);
        lottery.stake(10e6); // 10 link
        uint256 aEthLinkBalance = lottery.getAaveInvestmentBalance();
        assertEq(aEthLinkBalance, 10e6);

        vm.prank(user2);
        lottery.stake(20e6); // 20 link
        aEthLinkBalance = lottery.getAaveInvestmentBalance();
        assertEq(aEthLinkBalance, 30e6);
    }

    // --- Test: Withdraw all tickets for a user ---
    function testWithdrawAllOfAUsersTickets() public {
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);

        uint256 user1BalanceAfterStake = link.balanceOf(user1);
        assertEq(user1BalanceAfterStake, 90e6);

        vm.prank(user1);
        lottery.withdrawAllOfAUsersTickets();

        assertEq(link.balanceOf(user1), 100e6);
        assertEq(lottery.userStakes(user1), 0);
        assertEq(lottery.userStakes(user2), 20e6);
        assertEq(aEthLink.balanceOf(address(lottery)), 20e6);
    }

    // --- Test: Emergency withdraw when paused ---
    function testEmergencyWithdraw() public {
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);

        uint256 user1BalanceAfterStake = link.balanceOf(user1);
        assertEq(user1BalanceAfterStake, 90e6);

        vm.prank(owner);
        lottery.pause();

        vm.prank(user1);
        lottery.emergencyWithdraw();

        uint256 user1BalanceAfterEmergencyWithdraw = link.balanceOf(user1);
        assertEq(user1BalanceAfterEmergencyWithdraw, 100e6);
    }

    // --- Test: Emergency withdraw fails if not paused ---
    function testEmergencyWithdrawFailsIfNotPaused() public {
        vm.prank(user1);
        lottery.stake(10e6);
        vm.prank(user2);
        lottery.stake(20e6);

        uint256 user1BalanceAfterStake = link.balanceOf(user1);
        assertEq(user1BalanceAfterStake, 90e6);

        vm.prank(user1);
        vm.expectRevert("Pausable: not paused");
        lottery.emergencyWithdraw();
    }

    // --- Test: Only owner can pause/unpause ---
    function testPauseAndUnpause() public {
        vm.prank(owner);
        lottery.pause();
        assertEq(lottery.paused(), true);
        lottery.unpause();
        assertEq(lottery.paused(), false);
    }

    // --- Test: Winner selection and yield distribution ---
    function testWinnerSelectionAndYield() public {
        vm.prank(user1);
        lottery.stake(40e6);
        vm.prank(user2);
        lottery.stake(1e6);

        uint256 user1BalanceBefore = link.balanceOf(user1);
        uint256 user2BalanceBefore = link.balanceOf(user2);

        aEthLink.mint(address(lottery), 3e6);
        vm.warp(block.timestamp + 2 days);
        vm.recordLogs();

        lottery.setCurrentRound(2);
        lottery.performUpkeep("");
        uint256 requestId = 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(lottery));

        Vm.Log[] memory entries = vm.getRecordedLogs();
        address winner;
        uint256 amountWon;
        bytes32 eventSig = keccak256("WinnerSelected(address,uint256)");
        for (uint i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == eventSig) {
                winner = address(uint160(uint256(entries[i].topics[1])));
                amountWon = abi.decode(entries[i].data, (uint256));
                break;
            }
        }

        uint256 winnerBalanceAfter = link.balanceOf(winner);
        uint256 winnerBalanceBefore = winner == user1 ? user1BalanceBefore : user2BalanceBefore;

        assertEq(lottery.currentRound(), 3);
        assertEq(winnerBalanceAfter, winnerBalanceBefore + amountWon);
    }

    // --- Test: Only owner can withdraw interest ---
    function testWithdrawOfIntrestOnlyOwner() public {
        vm.prank(user1);
        lottery.stake(40e6);
        vm.prank(user2);
        lottery.stake(1e6);
        aEthLink.mint(address(lottery), 3e6);
        vm.prank(owner);
        lottery.withdrawInterest(owner);

        assertEq(link.balanceOf(owner), 3e6);
    }

    // --- Test: Non-owner cannot withdraw interest ---
    function testWithdrawOfIntrestOnlyOwnerFailsIfNotOwner() public {
        vm.prank(user1);
        lottery.stake(40e6);
        vm.prank(user2);
        lottery.stake(1e6);
        vm.prank(user1);
        vm.expectRevert("Only callable by owner");
        lottery.withdrawInterest(user1);

        assertEq(link.balanceOf(owner), 0);
    }

    // --- Test: Staking after entry cutoff time makes ticket eligible for next round ---
    function testStakeAfterEntryCutoffGoesToNextRound() public {
        uint256 initialRound = lottery.currentRound();
        uint256 cutoff = lottery.lastTimeStamp() + lottery.interval() - lottery.entryCutoffTime();
        vm.warp(cutoff + 1);
        vm.prank(user1);
        lottery.stake(1e6);
        (address ticketUser, uint256 ticketAmount, uint256 startRound) = lottery.tickets(lottery.getTicketCount() - 1);
        assertEq(ticketUser, user1);
        assertEq(ticketAmount, 1e6);
        assertEq(startRound, initialRound + 1);
    }

    // --- Test: Get request status after VRF fulfillment ---
    function testGetRequestStatus() public {
        vm.prank(user1);
        lottery.stake(40e6);
        vm.prank(user2);
        lottery.stake(1e6);
        aEthLink.mint(address(lottery), 3e6);
        lottery.setCurrentRound(2);
        vm.warp(block.timestamp + 2 days);
        lottery.performUpkeep("");
        uint256 requestId = 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(lottery));
        (bool fulfilled, uint256[] memory randomWords) = lottery.getRequestStatus(requestId);
        assertEq(fulfilled, true);
        assertEq(randomWords.length, 1);
    }

    // --- Test: Get total staked after staking ---
    function testGetTotalStaked() public {
        vm.prank(user1);
        lottery.stake(40e6);
        vm.prank(user2);
        lottery.stake(1e6);
        assertEq(lottery.getTotalStaked(), 41e6);
    }

    // --- Test: Get user stakes after staking ---
    function testGetUserStakes() public {
        vm.prank(user1);
        lottery.stake(40e6);
        vm.prank(user2);
        lottery.stake(1e6);
        assertEq(lottery.getUserStakes(user1), 40e6);
        assertEq(lottery.getUserStakes(user2), 1e6);
    }

    // --- Test: Get total yield generated after one round ---
    function testGetTotalYieldGenerated() public {
        vm.prank(user1);
        lottery.stake(40e6);
        vm.prank(user2);
        lottery.stake(1e6);
        aEthLink.mint(address(lottery), 3e6);
        lottery.setCurrentRound(2);
        vm.warp(block.timestamp + 2 days);
        lottery.performUpkeep("");
        uint256 requestId = 1;
        vrfCoordinator.fulfillRandomWords(requestId, address(lottery));
        assertEq(lottery.getTotalYieldGenerated(), 3e6);
    }

    // --- Test: Get total yield generated after multiple rounds ---
    function testGetTotalYieldGenerated_MultipleRounds() public {
        vm.prank(user1);
        lottery.stake(40e6);
        vm.prank(user2);
        lottery.stake(1e6);

        // Round 1
        aEthLink.mint(address(lottery), 3e6);
        lottery.setCurrentRound(2);
        vm.warp(block.timestamp + 2 days);
        lottery.performUpkeep("");
        uint256 requestId1 = 1;
        vrfCoordinator.fulfillRandomWords(requestId1, address(lottery));
        assertEq(lottery.getTotalYieldGenerated(), 3e6);

        // Round 2
        aEthLink.mint(address(lottery), 2e6);
        lottery.setCurrentRound(3);
        vm.warp(block.timestamp + 2 days);
        lottery.performUpkeep("");
        uint256 requestId2 = 2;
        vrfCoordinator.fulfillRandomWords(requestId2, address(lottery));
        assertEq(lottery.getTotalYieldGenerated(), 5e6);

        // Round 3
        aEthLink.mint(address(lottery), 4e6);
        lottery.setCurrentRound(4);
        vm.warp(block.timestamp + 2 days);
        lottery.performUpkeep("");
        uint256 requestId3 = 3;
        vrfCoordinator.fulfillRandomWords(requestId3, address(lottery));
        assertEq(lottery.getTotalYieldGenerated(), 9e6);
    }

    // --- Test: Get time until next draw, including after time warp and upkeep ---
    function testGetTimeUntilNextDraw() public {
        vm.prank(user1);
        lottery.stake(1e6);
        assertEq(lottery.getTimeUntilNextDraw(), 1 days);
        vm.warp(block.timestamp + 1 hours);
        assertEq(lottery.getTimeUntilNextDraw(), 1 days - 1 hours);
        vm.warp(block.timestamp + (1 days - 1 hours));
        assertEq(lottery.getTimeUntilNextDraw(), 0);
        lottery.setCurrentRound(2);
        lottery.performUpkeep("");
        assertEq(lottery.getTimeUntilNextDraw(), 1 days);
    }
}
