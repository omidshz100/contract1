// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MealFunding
 * @dev A smart contract for micro-investment system to fund individual meals
 * @notice This contract allows donors to fund meals and approved recipients to withdraw funds
 */
contract MealFunding {
    // State variables
    address public owner;
    bool public paused;
    uint256 public dailyLimit = 10 * 1e18; // 10 AVAX daily limit per recipient
    uint256 public totalFunds;
    
    // Mappings
    mapping(address => uint256) public funderBalances;
    mapping(address => bool) public approvedRecipients;
    mapping(address => uint256) public dailySpent;
    mapping(address => uint256) public lastWithdrawalDay;
    
    // Events
    event FundsDeposited(address indexed funder, uint256 amount, uint256 newBalance);
    event RecipientApproved(address indexed recipient);
    event RecipientRevoked(address indexed recipient);
    event MealRequested(address indexed recipient, uint256 amount, uint256 remainingBalance);
    event ContractPaused();
    event ContractUnpaused();
    event DailyLimitUpdated(uint256 newLimit);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier onlyApprovedRecipient() {
        require(approvedRecipients[msg.sender], "Not an approved recipient");
        _;
    }
    
    /**
     * @dev Constructor sets the contract owner
     */
    constructor() {
        owner = msg.sender;
        paused = false;
    }
    
    /**
     * @dev Allows donors to deposit AVAX to fund meals
     */
    function fund() external payable whenNotPaused {
        require(msg.value > 0, "Must send AVAX to fund");
        
        funderBalances[msg.sender] += msg.value;
        totalFunds += msg.value;
        
        emit FundsDeposited(msg.sender, msg.value, funderBalances[msg.sender]);
    }
    
    /**
     * @dev Owner can approve recipients to withdraw funds
     * @param recipient Address to approve
     */
    function approveRecipient(address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        require(!approvedRecipients[recipient], "Recipient already approved");
        
        approvedRecipients[recipient] = true;
        emit RecipientApproved(recipient);
    }
    
    /**
     * @dev Owner can revoke recipient approval
     * @param recipient Address to revoke
     */
    function revokeRecipient(address recipient) external onlyOwner {
        require(approvedRecipients[recipient], "Recipient not approved");
        
        approvedRecipients[recipient] = false;
        emit RecipientRevoked(recipient);
    }
    
    /**
     * @dev Approved recipients can request meal funding
     * @param amount Amount of AVAX to withdraw
     */
    function requestMeal(uint256 amount) external whenNotPaused onlyApprovedRecipient {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient contract balance");
        require(totalFunds >= amount, "Insufficient total funds");
        
        uint256 currentDay = block.timestamp / 1 days;
        
        // Reset daily spending if it's a new day
        if (lastWithdrawalDay[msg.sender] < currentDay) {
            dailySpent[msg.sender] = 0;
            lastWithdrawalDay[msg.sender] = currentDay;
        }
        
        // Check daily limit
        require(dailySpent[msg.sender] + amount <= dailyLimit, "Daily limit exceeded");
        
        // Update state
        dailySpent[msg.sender] += amount;
        totalFunds -= amount;
        
        // Transfer funds
        payable(msg.sender).transfer(amount);
        
        emit MealRequested(msg.sender, amount, totalFunds);
    }
    
    /**
     * @dev Owner can pause the contract in emergencies
     */
    function pause() external onlyOwner {
        require(!paused, "Contract already paused");
        paused = true;
        emit ContractPaused();
    }
    
    /**
     * @dev Owner can unpause the contract
     */
    function unpause() external onlyOwner {
        require(paused, "Contract not paused");
        paused = false;
        emit ContractUnpaused();
    }
    
    /**
     * @dev Owner can update the daily spending limit
     * @param newLimit New daily limit in wei
     */
    function updateDailyLimit(uint256 newLimit) external onlyOwner {
        require(newLimit > 0, "Daily limit must be greater than 0");
        dailyLimit = newLimit;
        emit DailyLimitUpdated(newLimit);
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get remaining daily allowance for a recipient
     * @param recipient Address to check
     */
    function getRemainingDailyAllowance(address recipient) external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        
        if (lastWithdrawalDay[recipient] < currentDay) {
            return dailyLimit;
        }
        
        if (dailySpent[recipient] >= dailyLimit) {
            return 0;
        }
        
        return dailyLimit - dailySpent[recipient];
    }
    
    /**
     * @dev Emergency withdrawal function for owner (only in extreme cases)
     */
    function emergencyWithdraw() external onlyOwner {
        require(paused, "Contract must be paused for emergency withdrawal");
        uint256 balance = address(this).balance;
        totalFunds = 0;
        payable(owner).transfer(balance);
    }
}