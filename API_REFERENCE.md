# 🎯 MealFunding API Reference

## 📋 Smart Contract Functions

### 🔒 Owner Functions

#### `approveRecipient(address recipient)`
**Purpose**: Approve a new recipient to withdraw meal funds
**Access**: Owner only
**Parameters**:
- `recipient`: Ethereum address to approve
**Events**: Emits `RecipientApproved(address indexed recipient)`

#### `revokeRecipient(address recipient)`
**Purpose**: Revoke recipient approval
**Access**: Owner only
**Parameters**:
- `recipient`: Ethereum address to revoke
**Events**: Emits `RecipientRevoked(address indexed recipient)`

#### `pause()`
**Purpose**: Emergency pause all contract operations
**Access**: Owner only
**Events**: Emits `ContractPaused()`

#### `unpause()`
**Purpose**: Resume contract operations
**Access**: Owner only
**Events**: Emits `ContractUnpaused()`

#### `updateDailyLimit(uint256 newLimit)`
**Purpose**: Update daily spending limit for recipients
**Access**: Owner only
**Parameters**:
- `newLimit`: New daily limit in wei (1 AVAX = 1e18 wei)
**Events**: Emits `DailyLimitUpdated(uint256 newLimit)`

#### `emergencyWithdraw()`
**Purpose**: Emergency withdrawal of all funds (only when paused)
**Access**: Owner only
**Requirements**: Contract must be paused

### 💰 Public Functions

#### `fund()`
**Purpose**: Deposit AVAX to fund meals
**Access**: Anyone
**Payable**: Yes (send AVAX with transaction)
**Requirements**: Contract must not be paused, amount > 0
**Events**: Emits `FundsDeposited(address indexed funder, uint256 amount, uint256 newBalance)`

#### `requestMeal(uint256 amount)`
**Purpose**: Request meal funding withdrawal
**Access**: Approved recipients only
**Parameters**:
- `amount`: Amount to withdraw in wei
**Requirements**: 
  - Must be approved recipient
  - Contract not paused
  - Amount > 0
  - Sufficient contract balance
  - Within daily limit
**Events**: Emits `MealRequested(address indexed recipient, uint256 amount, uint256 remainingBalance)`

### 👀 View Functions

#### `getContractBalance()`
**Returns**: Current contract balance in wei
**Access**: Anyone

#### `getRemainingDailyAllowance(address recipient)`
**Returns**: Remaining daily allowance for recipient in wei
**Parameters**:
- `recipient`: Address to check allowance for
**Access**: Anyone

#### `owner()`
**Returns**: Contract owner address
**Access**: Anyone

#### `paused()`
**Returns**: Boolean indicating if contract is paused
**Access**: Anyone

#### `dailyLimit()`
**Returns**: Current daily limit in wei
**Access**: Anyone

#### `totalFunds()`
**Returns**: Total funds deposited in wei
**Access**: Anyone

#### `approvedRecipients(address)`
**Returns**: Boolean indicating if address is approved recipient
**Access**: Anyone

#### `dailySpent(address)`
**Returns**: Amount spent today by recipient in wei
**Access**: Anyone

#### `funderBalances(address)`
**Returns**: Total amount funded by address in wei
**Access**: Anyone

## 🔔 Events

### `FundsDeposited(address indexed funder, uint256 amount, uint256 newBalance)`
Emitted when someone funds the contract

### `RecipientApproved(address indexed recipient)`
Emitted when owner approves a new recipient

### `RecipientRevoked(address indexed recipient)`
Emitted when owner revokes a recipient

### `MealRequested(address indexed recipient, uint256 amount, uint256 remainingBalance)`
Emitted when recipient withdraws meal funds

### `ContractPaused()`
Emitted when contract is paused

### `ContractUnpaused()`
Emitted when contract is unpaused

### `DailyLimitUpdated(uint256 newLimit)`
Emitted when daily limit is updated

## 💡 Usage Examples

### JavaScript/Web3 Examples

```javascript
// Connect to contract
const contract = new ethers.Contract(contractAddress, abi, signer);

// Fund the contract with 10 AVAX
await contract.fund({ value: ethers.utils.parseEther("10") });

// Approve a recipient (owner only)
await contract.approveRecipient("0x742d35Cc6634C0532925a3b8D4C9db96590c6C87");

// Request 2 AVAX for meals (approved recipient only)
await contract.requestMeal(ethers.utils.parseEther("2"));

// Check remaining daily allowance
const allowance = await contract.getRemainingDailyAllowance(userAddress);
console.log("Remaining allowance:", ethers.utils.formatEther(allowance), "AVAX");
```

## 🚨 Error Messages

- `"Only owner can call this function"` - Function restricted to contract owner
- `"Contract is paused"` - Operation not allowed while contract is paused
- `"Not an approved recipient"` - Address not approved to withdraw funds
- `"Daily limit exceeded"` - Withdrawal would exceed daily spending limit
- `"Insufficient contract balance"` - Not enough funds in contract
- `"Must send AVAX to fund"` - Funding transaction must include AVAX
- `"Amount must be greater than 0"` - Invalid zero amount
- `"Invalid recipient address"` - Cannot use zero address
- `"Recipient already approved"` - Recipient is already approved
- `"Recipient not approved"` - Trying to revoke non-approved recipient