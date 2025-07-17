# MetaMask Setup for Hardhat Local Network

## 🔧 Step-by-Step Setup Guide

### 1. Add Hardhat Network to MetaMask

1. **Open MetaMask** in your browser
2. **Click on the network dropdown** (usually shows "Ethereum Mainnet")
3. **Click "Add Network"** or "Add a network manually"
4. **Fill in the following details:**

```
Network Name: Hardhat Local
New RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
Block Explorer URL: (leave empty)
```

5. **Click "Save"**
6. **Switch to the "Hardhat Local" network**

### 2. Import Test Account

To interact with your contract, you'll need to import one of the test accounts that Hardhat provides:

1. **Copy one of these private keys** (these are test accounts with 10,000 ETH each):
   ```
   Account #0: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   Account #1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   Account #2: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
   ```

2. **In MetaMask, click on the account icon** (top right)
3. **Click "Import Account"**
4. **Paste the private key** (choose any from above)
5. **Click "Import"**

⚠️ **WARNING**: These are test private keys that are publicly known. NEVER use them on mainnet or with real funds!

### 3. Verify Connection

1. **Make sure you're on the "Hardhat Local" network**
2. **Check that your imported account shows ~10,000 ETH**
3. **Open your DApp** (frontend.html)
4. **Click "Connect Wallet"**

### 4. Troubleshooting

#### Problem: "Wrong network detected"
- **Solution**: Make sure you've switched to the "Hardhat Local" network in MetaMask

#### Problem: "Connection failed"
- **Solution**: 
  1. Make sure Hardhat node is running (`npx hardhat node`)
  2. Check that the RPC URL is exactly `http://127.0.0.1:8545`
  3. Verify Chain ID is `31337`

#### Problem: "MetaMask not detected"
- **Solution**: Install the MetaMask browser extension

#### Problem: Transactions fail
- **Solution**: 
  1. Make sure you have enough ETH in your account
  2. Try resetting your account in MetaMask (Settings > Advanced > Reset Account)

### 5. Contract Information

- **Contract Address**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Owner Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Network**: Hardhat Local (Chain ID: 31337)
- **RPC URL**: `http://127.0.0.1:8545`

### 6. Quick Commands

```bash
# Start Hardhat node
npx hardhat node

# Deploy contract (in another terminal)
npx hardhat run scripts/deploy.js --network localhost

# Open frontend
open frontend.html
```

## 🎯 Ready to Use!

Once you've completed these steps:
1. Your MetaMask should be connected to Hardhat Local network
2. You should have a test account with 10,000 ETH
3. Your DApp should show "Connected" status
4. You can start funding meals and testing the contract!