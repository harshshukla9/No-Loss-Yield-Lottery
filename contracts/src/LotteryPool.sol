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
    // Chainlink VRF
    VRFCoordinatorV2Interface public vrfCoordinator;
    bytes32 public keyHash;
    uint64 public subscriptionId;
    uint32 public callbackGasLimit = 100000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;

    // Chainlink Automation
    uint256 public lastTimeStamp;
    uint256 public interval;

    // Yield Protocol (Aave)
    IERC20 public usdc;
    address public aaveLendingPool;

    // Lottery State
    struct Ticket {
        address user;
        uint256 amount;
    }
    Ticket[] public tickets;
    mapping(address => uint256) public userStakes;
    uint256 public currentRound;
    uint256 public totalYieldGenerated;

    // Events
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

    /// @notice Initializes the LotteryPool contract
    /// @param _vrfCoordinator The address of the Chainlink VRF Coordinator
    /// @param _keyHash The key hash for Chainlink VRF
    /// @param _subscriptionId The subscription ID for Chainlink VRF
    /// @param _usdc The address of the USDC token contract
    /// @param _aaveLendingPool The address of the Aave lending pool
    /// @param _interval The interval (in seconds) between lottery rounds
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        address _usdc,
        address _aaveLendingPool,
        uint256 _interval
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        usdc = IERC20(_usdc);
        aaveLendingPool = _aaveLendingPool;
        interval = _interval;
        lastTimeStamp = block.timestamp;
    }

    /// @notice Stake USDC to enter the lottery
    /// @dev Transfers USDC from the user, deposits into Aave, and issues a lottery ticket
    /// @param amount The amount of USDC to stake
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        usdc.transferFrom(msg.sender, address(this), amount);
        tickets.push(Ticket(msg.sender, amount));
        userStakes[msg.sender] += amount;

        // Deposit into Aave for yield
        usdc.approve(aaveLendingPool, amount);
        (bool success, ) = aaveLendingPool.call(
            abi.encodeWithSignature("deposit(address,uint256,address,uint16)", 
            address(usdc), amount, address(this), 0)
        );
        require(success, "Aave deposit failed");

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
        if ((block.timestamp - lastTimeStamp) < interval) revert();
        lastTimeStamp = block.timestamp;
        requestRandomWinner();
    }

    /// @notice Requests a random winner from Chainlink VRF
    /// @dev Internal function to request random words
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
    /// @dev Called by Chainlink VRF with random words
    /// @param requestId The request ID (unused)
    /// @param randomWords The array of random words provided by Chainlink VRF
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 winnerIndex = randomWords[0] % tickets.length;
        address winner = tickets[winnerIndex].user;

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
    }

    /// @notice Returns the total amount of USDC staked in the current round
    /// @return total The total staked USDC
    function getTotalStaked() public view returns (uint256 total) {
        for (uint256 i = 0; i < tickets.length; i++) {
            total += tickets[i].amount;
        }
    }
}