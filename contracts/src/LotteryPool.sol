// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// internal & private view & pure functions
// external & public view & pure functions

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import { VRFConsumerBaseV2 } from "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title No-Loss Yield Lottery Pool
/// @author Tebbo
/// @notice This contract allows users to stake USDC into a lottery pool, where yield is generated via Aave and distributed to a randomly selected winner each round.
/// @dev Integrates Chainlink VRF for randomness and Chainlink Automation for round management. Yield is generated using Aave protocol.
contract LotteryPool is VRFConsumerBaseV2, AutomationCompatibleInterface, ReentrancyGuard {

    ///////////////////////////////////
    ///           ERRORS            ///
    ///////////////////////////////////

    error Lottery_InsufficientUSDC();
    error Lottery_AaveDepositFailed();
    error Lottery_InvalidAmount();
    error Lottery_IntervalNotPassed();
    error Lottery_NoEligibleTickets();
    error Lottery_NoTicketsInRound();
    error Lottery_AaveWithdrawFailed();
    error Lottery_NoTicketsToWithdraw();
    error Lottery_NoInterestAccrued();

    ////////////////////////////////////
    ///        STATE VARIABLES       ///
    ////////////////////////////////////

    // Chainlink VRF
    VRFCoordinatorV2Interface public vrfCoordinator;
    bytes32 public keyHash;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit = 100000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    uint256 public ticketPurchaseCost;
    uint256 public entryCutoffTime = 1 days; // Time before the next round starts when no new tickets can be purchased for the current round but will be auto-compounded for the next round

    // Chainlink Automation
    uint256 public lastTimeStamp;
    uint256 public interval;

    // Yield Protocol (Aave)
    IERC20 public usdc;
    IERC20 public aUsdc;
    address public aaveLendingPool;

    // Lottery State
    struct Ticket {
        address user;
        uint256 amount;
        uint256 startRound; // The first round this ticket is eligible for
    }
    Ticket[] public tickets;
    mapping(address => uint256) public userStakes;
    uint256 public currentRound;
    uint256 public totalYieldGenerated;

    ///////////////////////////////////
    ///           EVENTS            ///
    ///////////////////////////////////

    /// @notice Emitted when a user stakes USDC into the lottery pool
    /// @param user The address of the user who staked
    /// @param amount The amount of USDC staked
    event Staked(address indexed user, uint256 amount);

    /// @notice Emitted when a winner is selected and yield is distributed
    /// @param winner The address of the winner
    /// @param amount The amount of yield distributed
    event WinnerSelected(address indexed winner, uint256 amount);

    /// @notice Emitted when the losers' stakes are auto-compounded for the next round
    /// @param amount The total amount auto-compounded
    event AutoCompounded(uint256 amount);


    ///////////////////////////////////
    ///          FUNCTIONS          ///
    ///////////////////////////////////

    /// @notice Initializes the LotteryPool contract
    /// @param _vrfCoordinator The address of the Chainlink VRF Coordinator
    /// @param _keyHash The key hash for Chainlink VRF
    /// @param _subscriptionId The subscription ID for Chainlink VRF
    /// @param _usdc The address of the USDC token contract
    /// @param _aaveLendingPool The address of the Aave lending pool
    /// @param _aUsdc The address of the aUSDC token contract
    /// @param _interval The interval (in seconds) between lottery rounds
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        address _usdc,
        address _aaveLendingPool,
        address _aUsdc,
        uint256 _interval,
        uint256 _ticketPurchaseCost
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        usdc = IERC20(_usdc);
        aUsdc = IERC20(_aUsdc);
        aaveLendingPool = _aaveLendingPool;
        interval = _interval;
        lastTimeStamp = block.timestamp;
        ticketPurchaseCost = _ticketPurchaseCost;
    }

    /// @notice Stake USDC to enter the lottery
    /// @dev Transfers USDC from the user, deposits into Aave, and issues a lottery ticket.
    /// If purchased after the entry cutoff, the ticket is not eligible for the next round but is auto-compounded for all subsequent rounds.
    /// @param amount The amount of USDC to stake (must be >= ticketPurchaseCost)
    function stake(uint256 amount) external payable nonReentrant {
        if (amount == 0) revert Lottery_InvalidAmount();
        if (amount < ticketPurchaseCost) revert Lottery_InsufficientUSDC();

        uint256 ticketStartRound;
        if (block.timestamp < lastTimeStamp + interval - entryCutoffTime) {
            ticketStartRound = currentRound + 1; // Eligible for next round
        } else {
            ticketStartRound = currentRound + 2; // Eligible for the round after next
        }

        usdc.transferFrom(msg.sender, address(this), amount);
        tickets.push(Ticket(msg.sender, amount, ticketStartRound));
        userStakes[msg.sender] += amount;

        usdc.approve(aaveLendingPool, amount);
        (bool success, ) = aaveLendingPool.call(
            abi.encodeWithSignature("supply(address,uint256,address,uint16)", 
            address(usdc), amount, address(this), 0)
        );
        if (!success) revert Lottery_AaveDepositFailed();

        emit Staked(msg.sender, amount);
    }

    /// @notice Chainlink Automation: Checks if a new lottery round should start
    /// @dev Returns true if the interval has passed since the last round
    /// @param checkData Not used
    /// @return upkeepNeeded True if upkeep is needed, false otherwise
    /// @return performData Not used
    function checkUpkeep(bytes calldata checkData) external view override returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = (block.timestamp - lastTimeStamp) >= interval;
    }

    /// @notice Chainlink Automation: Triggers a new lottery round
    /// @dev Requests a random winner if the interval has passed
    /// @param performData Not used
    function performUpkeep(bytes calldata performData) external override {
        if ((block.timestamp - lastTimeStamp) < interval) revert Lottery_IntervalNotPassed();
        if (tickets.length == 0) revert Lottery_NoTicketsInRound();
        lastTimeStamp = block.timestamp;
        requestRandomWinner();
    }

    /// @notice Requests a random winner from Chainlink VRF
    /// @dev Internal function to request random words from Chainlink VRF
    function requestRandomWinner() internal {
        vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    /// @notice Chainlink VRF callback: Selects the winner and distributes yield
    /// @dev Called by Chainlink VRF with random words. Only tickets eligible for the current round are considered.
    /// @param requestId The request ID (unused)
    /// @param randomWords The array of random words provided by Chainlink VRF
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        // Collect indices of eligible tickets for this round
        uint256 eligibleCount = 0;
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].startRound <= currentRound) {
                eligibleCount++;
            }
        }
        // If no eligible tickets, revert
        // This ensures that we only select a winner if there are eligible tickets
        if (eligibleCount == 0) revert Lottery_NoEligibleTickets();

        // Build array of eligible ticket indices
        uint256[] memory eligibleIndices = new uint256[](eligibleCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].startRound <= currentRound) {
                eligibleIndices[idx] = i;
                idx++;
            }
        }

        uint256 winnerArrayIndex = randomWords[0] % eligibleCount;
        uint256 winnerTicketIndex = eligibleIndices[winnerArrayIndex];
        address winner = tickets[winnerTicketIndex].user;

        // Calculate yield (simplified: assumes Aave yield accrues to contract)
        uint256 currentBalance = usdc.balanceOf(address(this));
        uint256 totalStaked = getTotalStaked();
        uint256 yield = currentBalance - totalStaked;
        totalYieldGenerated += yield;

        // Send yield to winner
        usdc.transfer(winner, yield);
        emit WinnerSelected(winner, yield);

        // Auto-compound losers (re-stake in next round)
        emit AutoCompounded(totalStaked);

        currentRound++; // Move to the next round
    }


    /// @notice Withdraws only the accrued interest (yield) from Aave to a specified address
    /// @dev Calculates interest as aUSDC balance minus total staked, then withdraws that amount
    /// @param to The address to receive the withdrawn interest
    function withdrawInterest(address to) external {
        uint256 totalStaked = getTotalStaked();
        uint256 currentBalance = aUsdc.balanceOf(address(this));
        if (currentBalance <= totalStaked) revert Lottery_NoInterestAccrued();
        uint256 interest = currentBalance - totalStaked;
        (bool success, ) = aaveLendingPool.call(
            abi.encodeWithSignature(
                "withdraw(address,uint256,address)",
                address(usdc),
                interest,
                to
            )
        );
        if (!success) revert Lottery_AaveWithdrawFailed();
    }

    /// @notice Allows a user to withdraw all their tickets and receive their staked USDC back
    /// @dev Removes all tickets for msg.sender, updates userStakes, and withdraws from Aave
    /// @dev This function is non-reentrant to prevent re-entrancy attacks
    /// @dev Requires that the user has tickets to withdraw
    /// @dev Transfers the total amount of tickets staked back to the user
    function withdrawAllOfAUsersTickets() external nonReentrant {
        uint256 refundAmount = 0;
        uint256 i = 0;

        // Remove all tickets for msg.sender and sum their amounts
        while (i < tickets.length) {
            if (tickets[i].user == msg.sender) {
                refundAmount += tickets[i].amount;

                // Remove ticket by swapping with the last and popping
                tickets[i] = tickets[tickets.length - 1];
                tickets.pop();
            } else {
                i++;
            }
        }

        if (refundAmount == 0) revert Lottery_NoTicketsToWithdraw();

        // Update userStakes
        userStakes[msg.sender] = 0;

        // Withdraw from Aave and transfer to user
        (bool success, ) = aaveLendingPool.call(
            abi.encodeWithSignature(
                "withdraw(address,uint256,address)",
                address(usdc),
                refundAmount,
                msg.sender
            )
        );
        if (!success) revert Lottery_AaveWithdrawFailed();

    }


    ///////////////////////////////////
    ///           GETTERS           ///
    ///////////////////////////////////

    /// @notice Returns the total amount of USDC staked in the lottery pool
    /// @return The total amount of USDC staked
    function getTotalStaked() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < tickets.length; i++) {
            total += tickets[i].amount;
        }
        return total;
    }

    /// @notice Returns the number of tickets currently in the lottery pool
    /// @return The number of tickets
    function getTicketCount() external view returns (uint256) {
        return tickets.length;
    }

}