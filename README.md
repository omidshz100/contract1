# 🍽️ MealFunding Smart Contract

A blockchain-based micro-investment system for funding individual meals on Avalanche C-Chain (or local development network).

## 📋 Overview

MealFunding is a decentralized application (DApp) that allows donors to fund meals for approved recipients. The system includes daily spending limits, pause functionality, and comprehensive access controls.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask browser extension (for frontend interaction)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd contract1
   npm install
   ```

2. **Start local blockchain:**
   ```bash
   npx hardhat node
   ```
   This will start a local Hardhat network on `http://localhost:8545` with 20 test accounts, each having 10,000 ETH.

3. **Compile the contract:**
   ```bash
   npm run compile
   ```

4. **Deploy to local network:**
   ```bash
   npm run deploy:local
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

6. **Run interaction demo:**
   ```bash
   npx hardhat run scripts/interact-local.js --network localhost
   ```

7. **Run simulation:**
   ```bash
   npm run simulate
   ```

8. **Start frontend (optional):**
   ```bash
   python3 -m http.server 3000
   ```
   Then open `http://localhost:3000/frontend.html` in your browser.

## 📁 Project Structure

```
contract1/
├── contracts/
│   └── MealFunding.sol          # Main smart contract
├── scripts/
│   ├── deploy.js                # Deployment script
│   └── interact-local.js        # Local interaction demo
├── test/
│   └── MealFunding.test.js      # Comprehensive test suite
├── frontend.html                # Web interface
├── simulation.js                # Contract simulation
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🔧 Contract Features

### Core Functionality

- **Funding**: Donors can deposit AVAX to fund meals
- **Recipient Management**: Owner can approve/revoke recipients
- **Meal Requests**: Approved recipients can request meal funding
- **Daily Limits**: 10 AVAX daily spending limit per recipient
- **Pause/Unpause**: Emergency pause functionality
- **Emergency Withdrawal**: Owner can withdraw all funds when paused

### Security Features

- **Access Control**: Owner-only functions for critical operations
- **Daily Spending Limits**: Prevents abuse by limiting daily withdrawals
- **Pause Mechanism**: Emergency stop functionality
- **Input Validation**: Comprehensive validation of all inputs
- **Event Logging**: All important actions emit events

## 📊 Contract Interface

### Main Functions

```solidity
// Funding
function fund() external payable

// Recipient Management
function approveRecipient(address recipient) external onlyOwner
function revokeRecipient(address recipient) external onlyOwner

// Meal Requests
function requestMeal(uint256 amount) external

// Admin Functions
function pause() external onlyOwner
function unpause() external onlyOwner
function updateDailyLimit(uint256 newLimit) external onlyOwner
function emergencyWithdraw() external onlyOwner

// View Functions
function getContractBalance() external view returns (uint256)
function getRemainingDailyAllowance(address recipient) external view returns (uint256)
```

### Events

```solidity
event FundsDeposited(address indexed funder, uint256 amount, uint256 newBalance)
event RecipientApproved(address indexed recipient)
event RecipientRevoked(address indexed recipient)
event MealRequested(address indexed recipient, uint256 amount, uint256 remainingBalance)
event ContractPaused()
event ContractUnpaused()
event DailyLimitUpdated(uint256 newLimit)
```

## 🧪 Testing

The project includes a comprehensive test suite with 36 test cases covering:

- Contract deployment and initialization
- Funding functionality
- Recipient management
- Meal request logic
- Daily spending limits
- Pause/unpause functionality
- Emergency functions
- Access controls
- Edge cases and error conditions

Run tests with:
```bash
npm test
```

## 🌐 Frontend Interface

The project includes a beautiful web interface (`frontend.html`) that provides:

- **Funding Interface**: Easy AVAX deposits
- **Meal Request Interface**: Simple meal funding requests
- **Status Dashboard**: Real-time contract and user status
- **Owner Controls**: Admin functions for contract management
- **Real-time Updates**: Live event listening and status updates

### MetaMask Setup for Local Development

1. Add local network to MetaMask:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. Import test accounts using private keys from Hardhat node output

## 🚀 Deployment

### Local Development
```bash
npm run deploy:local
```

### Avalanche Fuji Testnet
```bash
npm run deploy:fuji
```

### Avalanche Mainnet
```bash
npm run deploy:mainnet
```

## 📈 Usage Examples

### Example Scenario

1. **Alice funds the contract** with 50 AVAX
2. **Owner approves Bob** as a recipient
3. **Bob requests 5 AVAX** for meals (succeeds)
4. **Bob tries to request 7 more AVAX** (fails - daily limit)
5. **Bob requests 3 AVAX** (succeeds - within limit)
6. **Contract is paused** for maintenance
7. **Bob tries to request funds** (fails - paused)
8. **Contract is unpaused**
9. **Next day, Bob can request up to 10 AVAX again**

### Daily Limit Reset

The daily spending limit resets automatically at midnight UTC. Recipients can withdraw up to the daily limit each day.

## 🔒 Security Considerations

- **Private Keys**: Never use the default private key for real funds
- **Access Control**: Only the contract owner can approve recipients
- **Daily Limits**: Prevent excessive withdrawals
- **Pause Mechanism**: Emergency stop for critical situations
- **Input Validation**: All inputs are validated before processing

## 🛠️ Development

### Available Scripts

- `npm run compile` - Compile contracts
- `npm run test` - Run test suite
- `npm run deploy:local` - Deploy to local network
- `npm run deploy:fuji` - Deploy to Fuji testnet
- `npm run deploy:mainnet` - Deploy to mainnet
- `npm run simulate` - Run contract simulation
- `npm run verify` - Verify contract on Snowtrace

### Environment Variables

Create a `.env` file for testnet/mainnet deployment:

```env
PRIVATE_KEY=your_private_key_without_0x
SNOWTRACE_API_KEY=your_snowtrace_api_key
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📞 Support

For questions or issues:
- Check the test files for usage examples
- Review the interaction script for implementation details
- Examine the simulation for scenario walkthroughs

---

**⚠️ Disclaimer**: This is a demonstration project. Always audit smart contracts before deploying to mainnet with real funds.