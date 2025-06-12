// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

contract MockVRFCoordinatorV2 {
    // Store the last request parameters for inspection
    address public lastRequester;
    bytes32 public lastKeyHash;
    uint64 public lastSubId;
    uint16 public lastRequestConfirmations;
    uint32 public lastCallbackGasLimit;
    uint32 public lastNumWords;
    uint256 public lastRequestId;
    address public lotteryPool;

    event RandomWordsRequested(uint256 requestId, address requester);

    function setLotteryPool(address _lotteryPool) external {
        lotteryPool = _lotteryPool;
    }

    // Simulate Chainlink VRF requestRandomWords
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 requestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId) {
        lastRequester = msg.sender;
        lastKeyHash = keyHash;
        lastSubId = subId;
        lastRequestConfirmations = requestConfirmations;
        lastCallbackGasLimit = callbackGasLimit;
        lastNumWords = numWords;
        lastRequestId++;
        emit RandomWordsRequested(lastRequestId, msg.sender);
        return lastRequestId;
    }

    // Simulate Chainlink VRF fulfilling randomness
    function fulfillRandomWords(uint256 requestId, address target, uint256[] memory randomWords) external {
        // Call the internal callback on the LotteryPool
        (bool success, ) = target.call(
            abi.encodeWithSignature(
                "fulfillRandomWords(uint256,uint256[])",
                requestId,
                randomWords
            )
        );
        require(success, "Callback failed");
    }
}