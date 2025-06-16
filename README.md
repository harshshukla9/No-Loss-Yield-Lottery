# No-Loss Yield Lottery Pool

A decentralized, no-loss lottery smart contract built on Ethereum. Users stake LINK tokens, which are deposited into Aave to earn yield. At the end of each round, the yield generated is awarded to a randomly selected winner, while all users retain their original staked amount. The process is automated and uses Chainlink VRF for randomness and Chainlink Automation for round management.

---

## Features

- **No-Loss Lottery:** Users never lose their principal; only the yield is distributed as a prize.
- **Automated Rounds:** Chainlink Automation (Keepers) automatically triggers new lottery rounds at set intervals.
- **Provable Randomness:** Chainlink VRF ensures the winner is selected fairly and verifiably at random.
- **Yield Generation:** All staked LINK is supplied to Aave, generating yield for the pool.
- **Emergency Withdrawals:** Users can withdraw their principal in emergencies if the contract is paused.
- **Platform Fee:** A small fee is taken from the yield to support platform operations.

---

## How It Works

1. **Staking**
   - Users call the `stake` function to deposit LINK tokens.
   - Each stake issues a lottery ticket, making the user eligible for the next draw.
   - The more tickets a user has, the higher their chance of winning.

2. **Yield Generation**
   - All LINK tokens are supplied to Aave, earning interest (yield) over time.

3. **Automated Draws (Chainlink Automation)**
   - Chainlink Automation (Keepers) monitors the contract and calls `performUpkeep` when it's time for a new round.
   - The interval between rounds is configurable.

4. **Random Winner Selection (Chainlink VRF)**
   - When a new round is triggered, the contract requests a random number from Chainlink VRF.
   - The random number is used to select a winner from all eligible tickets.
   - The winner receives the yield generated during the round (minus a platform fee).

5. **Withdrawals**
   - Users can withdraw their principal at any time, removing their tickets from future rounds.
   - In emergencies, users can withdraw even if the contract is paused.

---

## Chainlink Integration

### Chainlink Automation (Keepers)
- **Where:**  
  - [`checkUpkeep`](https://github.com/leetebbs/No-Loss-Yield-Lottery/blob/main/contracts/src/LotteryPool.sol#L196) and [`performUpkeep`](https://github.com/leetebbs/No-Loss-Yield-Lottery/blob/main/contracts/src/LotteryPool.sol#L207) functions in the contract.
- **What:**  
  - Automates the process of starting new rounds and requesting randomness for winner selection.
- **How:**  
  - Chainlink nodes call `checkUpkeep` off-chain to see if a new round should start.
  - If true, they call `performUpkeep` on-chain to trigger the next round.

### Chainlink VRF
- **Where:**  
  - [`requestRandomWinner`](https://github.com/leetebbs/No-Loss-Yield-Lottery/blob/main/contracts/src/LotteryPool.sol#L218) and [`fulfillRandomWords`](https://github.com/leetebbs/No-Loss-Yield-Lottery/blob/main/contracts/src/LotteryPool.sol#L246) functions in the contract.
- **What:**  
  - Provides a secure, verifiable random number to select the lottery winner.
- **How:**  
  - The contract requests randomness from Chainlink VRF.
  - When the random number is ready, Chainlink VRF calls `fulfillRandomWords` to select and reward the winner.

---

## Contract Overview

- **Staking:** `stake(uint256 amount)`
- **Automated Rounds:** `checkUpkeep`, `performUpkeep`
- **Randomness:** `requestRandomWinner`, `fulfillRandomWords`
- **Withdrawals:** `withdrawAllOfAUsersTickets`, `emergencyWithdraw`
- **Yield Tracking:** `getTotalYieldGenerated`, `getAaveInvestmentBalance`

---

## Security

- Uses OpenZeppelin's `ReentrancyGuard` and `Pausable` for safety.
- Only the contract owner can pause/unpause or withdraw accrued interest in emergencies.
- All major actions emit events for transparency.

---

## Getting Started

1. **Clone the repository**
2. **Install dependencies**
3. **Deploy the contract using Foundry/Hardhat**
4. **Configure Chainlink Automation and VRF subscriptions**
5. **Stake LINK and participate!**

---

## License

MIT

---

**Questions or contributions welcome!**  
Feel free to open an issue or pull request.
