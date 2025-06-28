# NoLo Lotto - No-Loss Yield Lottery Pool

A decentralized, no-loss lottery smart contract built on Ethereum that combines DeFi yield farming with lottery mechanics. Users stake LINK tokens, which are deposited into Aave to earn yield. At the end of each round, the yield generated is awarded to a randomly selected winner, while all users retain their original staked amount. The lottery is fully automated using Chainlink VRF for randomness and Chainlink Automation for round management.

---

## 🎯 Key Features

- **🛡️ No-Loss Guarantee:** Users never lose their principal; only the yield is distributed as prizes
- **🤖 Fully Automated:** Chainlink Automation triggers new lottery rounds at set intervals
- **🎲 Provably Fair:** Chainlink VRF ensures winners are selected with verifiable randomness
- **💰 Yield Generation:** All staked LINK is supplied to Aave, continuously generating yield
- **🎟️ Multiple Tickets:** Purchase multiple tickets to increase your winning probability
- **⏰ Entry Cutoff:** Late entries are automatically enrolled in the next round
- **🚨 Emergency Safety:** Users can withdraw their principal if the contract is paused
- **💼 Platform Sustainability:** Small 1% fee from yield supports platform operations

---

## 🎰 How the Lottery Works

### 1. **Ticket Purchase & Staking**
   - Call `stake(uint256 amount)` to deposit LINK tokens
   - Minimum stake: 5 LINK = 1 ticket
   - Multiple tickets increase your winning probability
   - Stakes made after entry cutoff time are eligible for the next round

### 2. **Automated Yield Generation**
   - All LINK tokens are automatically supplied to Aave
   - Earns aEthLINK interest tokens over time
   - Yield accumulates until the next draw

### 3. **Round Management (Chainlink Automation)**
   - Chainlink Keepers monitor the contract continuously
   - Automatically triggers new rounds based on time intervals
   - Calls `performUpkeep()` when conditions are met

### 4. **Fair Winner Selection (Chainlink VRF)**
   - Random number requested from Chainlink VRF when round ends
   - Winner selected from all eligible tickets in current round
   - Only tickets eligible for the current round participate

### 5. **Prize Distribution**
   - Winner receives: Total Yield - 1% Platform Fee
   - Platform fee goes to contract owner
   - All participants keep their original stake
   - Stakes automatically carry over to the next round

### 6. **Flexible Withdrawals**
   - `withdrawAllOfAUsersTickets()`: Withdraw anytime, removes future tickets
   - `emergencyWithdraw()`: Available when contract is paused

---

## 🔗 Chainlink Integration

### Chainlink Automation (Keepers)
- **Functions:** [`checkUpkeep`](contracts/src/LotteryPool.sol#L218) and [`performUpkeep`](contracts/src/LotteryPool.sol#L236)
- **Purpose:** Automates round progression and winner selection triggers
- **Process:** 
  - Monitors time intervals and ticket availability
  - Automatically requests randomness when round ends
  - Processes winner selection when randomness is fulfilled

### Chainlink VRF (Verifiable Random Function)
- **Functions:** [`requestRandomWords`](contracts/src/LotteryPool.sol#L269) and [`fulfillRandomWords`](contracts/src/LotteryPool.sol#L297)
- **Purpose:** Provides cryptographically secure randomness for fair winner selection
- **Process:**
  - Requests random words when round ends
  - Callback receives random number and selects winner
  - Ensures transparency and prevents manipulation

---

## 📊 Contract Functions

### Core Functions
- `stake(uint256 amount)` - Enter lottery by staking LINK
- `withdrawAllOfAUsersTickets()` - Withdraw your stake and exit
- `emergencyWithdraw()` - Emergency withdrawal when paused

### View Functions
- `getTotalStaked()` - Total LINK staked in the pool
- `getTicketCount()` - Total number of tickets issued
- `getUserStakes(address)` - User's total stake amount
- `getUsersTicketsInCurrentRound(address)` - User's tickets eligible for current round
- `getUsersTicketsForNextRound(address)` - User's tickets for next round
- `getTotalYieldGenerated()` - Lifetime yield distributed
- `getTimeUntilNextDraw()` - Seconds until next round
- `getAaveInvestmentBalance()` - Current aEthLINK balance

### Winner History
- `getPastWinnersCount()` - Total number of past winners
- `getLatestWinner()` - Most recent winner details
- `getAllPastWinners()` - Complete winner history
- `getWinnersByRoundRange(from, to)` - Winners within specific rounds

### Admin Functions (Owner Only)
- `pause()/unpause()` - Emergency controls
- `withdrawInterest(address)` - Emergency yield withdrawal

---

## 🏗️ Project Structure

```
lotto/
├── contracts/                 # Smart contracts
│   ├── src/
│   │   └── LotteryPool.sol   # Main lottery contract
│   ├── test/
│   │   └── unit/
│   │       └── TestLotteryPool.sol  # Comprehensive tests
│   ├── script/
│   │   └── DeployLotteryPool.s.sol  # Deployment script
│   └── foundry.toml          # Foundry configuration
├── frontend/                 # Next.js web interface
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   └── contexts/             # React contexts
├── tests/                    # Integration tests
└── lib/                      # External libraries
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Foundry](https://getfoundry.sh/) for smart contract development
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/leetebbs/No-Loss-Yield-Lottery
   cd No-Loss-Yield-Lottery
   ```

2. **Install contract dependencies**
   ```bash
   cd contracts
   forge install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Testing

Run the comprehensive test suite:
```bash
cd contracts
forge test -vvv
```

### Deployment

1. **Configure environment variables**
   ```bash
   # .env file
   PRIVATE_KEY=your_private_key
   RPC_URL=your_ethereum_rpc_url
   ETHERSCAN_API_KEY=your_etherscan_key
   ```

2. **Deploy to testnet**
   ```bash
   forge script script/DeployLotteryPool.s.sol --rpc-url $RPC_URL --broadcast --verify
   ```

3. **Set up Chainlink subscriptions**
   - Create VRF subscription at [vrf.chain.link](https://vrf.chain.link)
   - Create Automation upkeep at [automation.chain.link](https://automation.chain.link)
   - Fund both subscriptions with LINK tokens

### Frontend Development

```bash
cd frontend
npm run dev
```

---

## 🔒 Security Features

- **OpenZeppelin Integration:** Uses battle-tested `ReentrancyGuard` and `Pausable` contracts
- **Access Controls:** Owner-only functions for emergency situations
- **Emergency Mechanisms:** Pause functionality and emergency withdrawals
- **Transparent Operations:** All critical actions emit events for monitoring
- **Comprehensive Testing:** Extensive test suite covering edge cases

---

## 📈 Economics

### Ticket Pricing
- **Cost:** 5 LINK = 1 Ticket
- **Multiple Tickets:** Allowed for increased win probability
- **Entry Cutoff:** 10 seconds before round end (configurable)

### Fee Structure
- **Platform Fee:** 1% of yield (100 basis points)
- **Winner Receives:** 99% of generated yield
- **Principal:** Always returned in full

### Yield Source
- **Aave Protocol:** LINK tokens earn interest as aEthLINK
- **Compounding:** Yield accumulates automatically
- **Transparency:** All balances visible on-chain

---

## 🛠️ Configuration

The contract includes several configurable parameters:

- `interval`: Time between lottery rounds
- `ticketPurchaseCost`: Cost per ticket (5 LINK)
- `entryCutoffTime`: Seconds before round end to stop entries
- `FEE_BPS`: Platform fee in basis points (100 = 1%)

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
- Follow Solidity best practices
- Write comprehensive tests for new features
- Update documentation for any API changes
- Use conventional commit messages

---

## 📞 Support & Community

- **Issues:** [GitHub Issues](../../issues)
- **Discussions:** [GitHub Discussions](../../discussions)
- **Documentation:** This README and inline code comments

---

**Ready to play? Stake your LINK and may the odds be in your favor! 🍀**
