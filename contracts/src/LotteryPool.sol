// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title No-Loss Yield Lottery Pool
/// @author Tebbo
/// @notice This contract allows users to stake USDC into a lottery pool, where yield is generated via Aave and distributed to a randomly selected winner each round.
/// @dev Integrates Chainlink VRF for randomness and Chainlink Automation for round management. Yield is generated using Aave protocol.
contract LotteryPool is VRFConsumerBaseV2Plus, AutomationCompatibleInterface, ReentrancyGuard, Pausable {
    
    ///////////////////////////////////
    ///           ERRORS            ///
    ///////////////////////////////////

    error Lottery_InsufficientLINK();
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
    // VRFCoordinatorV2Interface public vrfCoordinator;
    bytes32 public keyHash;
    uint256 public subscriptionId;
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
    IERC20 public link;
    IERC20 public aEthLink;
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

    // Platform Fee
    address public platformFeeRecipient;
    uint256 public constant FEE_BPS = 100; // 1% = 100 basis points (BPS)
    uint256 public constant BPS_DENOMINATOR = 10000;

    struct RequestStatus {
    bool fulfilled; // whether the request has been successfully fulfilled
    bool exists; // whether a requestId exists
    uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus)
        public s_requests; /* requestId --> requestStatus */

    // Past request IDs.
    uint256 requestId;
    uint256[] public requestIds;
    uint256 public lastRequestId;

    // testing variables
    bool private forceUpkeep = false;

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

    /// @notice Emitted when a user is refunded in an emergency
    event EmergencyRefund(address indexed user, uint256 amount);

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    ///////////////////////////////////
    ///          FUNCTIONS          ///
    ///////////////////////////////////

    /// @notice Initializes the LotteryPool contract
    /// @param _keyHash The key hash for Chainlink VRF
    /// @param _subscriptionId The subscription ID for Chainlink VRF
    // / @param _usdc The address of the USDC token contract
    /// @param _link The address of the LINK token contract
    /// @param _aaveLendingPool The address of the Aave lending pool
    // / @param _aUsdc The address of the aUSDC token contract
    /// @param _aEthLink The address of the aEthLink token contract
    /// @param _interval The interval (in seconds) between lottery rounds
    /// @param _platformFeeRecipient The address of the platform fee recipient
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId,
        // address _usdc,
        address _link,
        address _aaveLendingPool,
        // address _aUsdc,
        address _aEthLink,
        uint256 _interval,
        uint256 _ticketPurchaseCost,
        address _platformFeeRecipient
    )  VRFConsumerBaseV2Plus(_vrfCoordinator) {
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        link = IERC20(_link);
        aEthLink= IERC20(_aEthLink);
        aaveLendingPool = _aaveLendingPool;
        interval = _interval;
        lastTimeStamp = block.timestamp;
        ticketPurchaseCost = _ticketPurchaseCost;
        platformFeeRecipient = _platformFeeRecipient;
    }

    /// @notice Pauses the contract, disabling staking and round execution
    /// @dev Only callable by the contract owner. Use in emergencies or for maintenance.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses the contract, enabling staking and round execution
    /// @dev Only callable by the contract owner.
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Stake USDC to enter the lottery
    /// @dev Transfers USDC from the user, deposits into Aave, and issues a lottery ticket.
    /// If purchased after the entry cutoff, the ticket is not eligible for the next round but is auto-compounded for all subsequent rounds.
    /// @param amount The amount of USDC to stake (must be >= ticketPurchaseCost)
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert Lottery_InvalidAmount();
        if (amount < ticketPurchaseCost) revert Lottery_InsufficientLINK();

        uint256 ticketStartRound;
        if (block.timestamp < lastTimeStamp + interval - entryCutoffTime) {
            ticketStartRound = currentRound; // Eligible for this round
        } else {
            ticketStartRound = currentRound + 1; // Eligible for the next round 
        }

        link.transferFrom(msg.sender, address(this), amount);
        tickets.push(Ticket(msg.sender, amount, ticketStartRound));
        userStakes[msg.sender] += amount;

        link.approve(aaveLendingPool, amount);
        (bool success, ) = aaveLendingPool.call(
            abi.encodeWithSignature("supply(address,uint256,address,uint16)", 
            address(link), amount, address(this), 0)
        );
        if (!success) revert Lottery_AaveDepositFailed();

        emit Staked(msg.sender, amount);
    }

    /// @notice Chainlink Automation: Checks if a new lottery round should start
    /// @dev Returns true if the interval has passed since the last round
    // / @param checkData Not used
    /// @return upkeepNeeded True if upkeep is needed, false otherwise
    /// @return performData Not used
    function checkUpkeep(bytes calldata /*checkData*/) external view override returns (bool upkeepNeeded, bytes memory /*performData*/) {
        if (forceUpkeep) {
            return (true, bytes(""));
        }
        upkeepNeeded = (block.timestamp - lastTimeStamp) >= interval;
        return (upkeepNeeded, bytes(""));
    }

    /// @notice Chainlink Automation: Triggers a new lottery round
    /// @dev Requests a random winner if the interval has passed
    // / @param performData Not used
    function performUpkeep(bytes calldata /*performData*/) external override whenNotPaused {
        if ((block.timestamp - lastTimeStamp) < interval) revert Lottery_IntervalNotPassed();
        if (tickets.length == 0) revert Lottery_NoTicketsInRound();
        lastTimeStamp = block.timestamp;
        requestRandomWinner();
    }

    /// @notice Requests a random winner from Chainlink VRF
    /// @dev Internal function to request random words from Chainlink VRF
    function requestRandomWinner() internal returns (uint256){
         requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
            s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    /// @notice Chainlink VRF callback: Selects the winner and distributes yield
    /// @dev Called by Chainlink VRF with random words. Only tickets eligible for the current round are considered.
    /// @param  _requestId The request ID (unused)
    /// @param _randomWords The array of random words provided by Chainlink VRF
    function fulfillRandomWords(uint256  _requestId, uint256[] calldata _randomWords) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
        // Collect indices of eligible tickets for this round
        uint256 eligibleCount = 0;
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].startRound <= currentRound) {
                eligibleCount++;
            }
        }
        // If no eligible tickets, revert
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

        uint256 winnerArrayIndex = _randomWords[0] % eligibleCount;
        uint256 winnerTicketIndex = eligibleIndices[winnerArrayIndex];
        address winner = tickets[winnerTicketIndex].user;

        // Calculate yield as aUSDC balance minus total staked
        uint256 totalStaked = getTotalStaked();
        uint256 currentBalance = aEthLink.balanceOf(address(this));
        if (currentBalance <= totalStaked) revert Lottery_NoInterestAccrued();
        uint256 yield = currentBalance - totalStaked;
        totalYieldGenerated += yield;

        // Calculate platform fee and winner amount
        uint256 fee = (yield * FEE_BPS) / BPS_DENOMINATOR;
        uint256 winnerAmount = yield - fee;

        // Withdraw fee from Aave and send to platform
        if (fee > 0) {
            (bool feeSuccess, ) = aaveLendingPool.call(
                abi.encodeWithSignature(
                    "withdraw(address,uint256,address)",
                    address(link),
                    fee,
                    platformFeeRecipient
                )
            );
            require(feeSuccess, "Aave withdraw fee failed");
        }

        // Withdraw winner amount from Aave and send to winner
        (bool winnerSuccess, ) = aaveLendingPool.call(
            abi.encodeWithSignature(
                "withdraw(address,uint256,address)",
                address(link),
                winnerAmount,
                winner
            )
        );
        if (!winnerSuccess) revert Lottery_AaveWithdrawFailed();

        emit WinnerSelected(winner, winnerAmount);
        emit AutoCompounded(totalStaked);

        currentRound++; // Move to the next round
    }


    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }


    /// @notice Withdraws only the accrued interest (yield) from Aave to a specified address
    /// @dev Calculates interest as aUSDC balance minus total staked, then withdraws that amount
    /// @param to The address to receive the withdrawn interest
    /// @dev This function is only callable by the owner and is a failsafe if anything happens to the contract and allows the contract
    /// owner to withdraw the interest to a safe address
    function withdrawInterest(address to) external onlyOwner {
        uint256 totalStaked = getTotalStaked();
        uint256 currentBalance = aEthLink.balanceOf(address(this));
        if (currentBalance <= totalStaked) revert Lottery_NoInterestAccrued();
        uint256 interest = currentBalance - totalStaked;
        (bool success, ) = aaveLendingPool.call(
            abi.encodeWithSignature(
                "withdraw(address,uint256,address)",
                address(link),
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
                address(link),
                refundAmount,
                msg.sender
            )
        );
        if (!success) revert Lottery_AaveWithdrawFailed();

    }

    /// @notice Allows a user to withdraw their principal in an emergency if the contract is paused
    /// @dev Can only be called when the contract is paused
    function emergencyWithdraw() external whenPaused nonReentrant {
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

        require(refundAmount > 0, "No tickets to withdraw");

        // Update userStakes
        userStakes[msg.sender] = 0;

        // Withdraw from Aave and transfer to user
        (bool success, ) = aaveLendingPool.call(
            abi.encodeWithSignature(
                "withdraw(address,uint256,address)",
                address(link),
                refundAmount,
                msg.sender
            )
        );
        require(success, "Aave withdraw failed");

        emit EmergencyRefund(msg.sender, refundAmount);
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

    /// @notice Returns the amount of aUSDC currently held by this contract (i.e., invested in Aave)
    /// @return The aUSDC balance of this contract
    function getAaveInvestmentBalance() external view returns (uint256) {
        return aEthLink.balanceOf(address(this));
    }

    /// @notice Returns the total staked amount for a specific user
    /// @param user The address of the user
    /// @return The total amount staked by the user
    function getUserStakes(address user) external view returns (uint256) {
        return userStakes[user];
    }

    /// @notice Returns the total yield generated by the lottery pool
    /// @return The total yield generated
    function getTotalYieldGenerated() external view returns (uint256) {
        return totalYieldGenerated;
    }

    /// @notice Returns the number of seconds until the next draw is due
    /// @return Seconds until the next draw (0 if already due)
    function getTimeUntilNextDraw() external view returns (uint256) {
        uint256 nextDrawTime = lastTimeStamp + interval;
        if (block.timestamp >= nextDrawTime) {
            return 0;
        } else {
            return nextDrawTime - block.timestamp;
        }
    }

//// testing functions

function setCurrentRound(uint256 round) external {
    currentRound = round;
}

// test function to be removed in  production
// to manually force a checkupkeep to be true
function setCheckUpkeepToTrue(bool _force) external {
    forceUpkeep = _force;
}

}