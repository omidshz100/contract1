// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MealFunding - Enhanced Security Version
 * @dev A secure micro-investment platform for transparent meal funding
 * @notice This contract includes enhanced security features based on audit recommendations
 */
contract MealFundingSecure is ReentrancyGuard, Pausable, Ownable {
    
    // ============ State Variables ============
    
    /// @notice Daily spending limit per recipient in wei
    uint256 public dailyLimit;
    
    /// @notice Maximum daily withdrawal limit for circuit breaker (100 AVAX)
    uint256 public constant MAX_DAILY_WITHDRAWAL = 100 ether;
    
    /// @notice Blocks per day on Avalanche (approximately 24 hours)
    uint256 public constant BLOCKS_PER_DAY = 28800;
    
    /// @notice Total amount withdrawn today for circuit breaker
    uint256 public dailyWithdrawnAmount;
    
    /// @notice Last reset day for daily withdrawal tracking
    uint256 public lastResetDay;
    
    /// @notice Mapping of approved recipients
    mapping(address => bool) public approvedRecipients;
    
    /// @notice Last withdrawal block number for each recipient
    mapping(address => uint256) public lastWithdrawalBlock;
    
    /// @notice Amount withdrawn today by each recipient
    mapping(address => uint256) public todayWithdrawn;
    
    /// @notice Emergency withdrawal enabled flag
    bool public emergencyWithdrawalEnabled;
    
    // ============ Events ============
    
    /// @notice Emitted when contract receives funding
    event FundsReceived(address indexed donor, uint256 indexed amount, uint256 indexed timestamp);
    
    /// @notice Emitted when a recipient is approved
    event RecipientApproved(address indexed recipient, uint256 indexed timestamp);
    
    /// @notice Emitted when a recipient is revoked
    event RecipientRevoked(address indexed recipient, uint256 indexed timestamp);
    
    /// @notice Emitted when a meal is requested
    event MealRequested(address indexed recipient, uint256 indexed amount, uint256 indexed timestamp);
    
    /// @notice Emitted when daily limit is updated
    event DailyLimitUpdated(uint256 indexed oldLimit, uint256 indexed newLimit, uint256 indexed timestamp);
    
    /// @notice Emitted when emergency withdrawal is triggered
    event EmergencyWithdrawal(address indexed owner, uint256 indexed amount, uint256 indexed timestamp);
    
    /// @notice Emitted when circuit breaker is triggered
    event CircuitBreakerTriggered(uint256 indexed amount, uint256 indexed dailyTotal, uint256 indexed timestamp);
    
    // ============ Custom Errors ============
    
    error InvalidAmount();
    error RecipientNotApproved();
    error InsufficientContractBalance();
    error DailyLimitExceeded();
    error InvalidRecipientAddress();
    error RecipientAlreadyApproved();
    error RecipientNotCurrentlyApproved();
    error EmergencyWithdrawalNotEnabled();
    error CircuitBreakerActivated();
    error TransferFailed();
    
    // ============ Modifiers ============
    
    /// @notice Circuit breaker to prevent excessive daily withdrawals
    modifier circuitBreaker(uint256 amount) {
        // Reset daily counter if new day
        if (block.timestamp / 1 days > lastResetDay) {
            dailyWithdrawnAmount = 0;
            lastResetDay = block.timestamp / 1 days;
        }
        
        if (dailyWithdrawnAmount + amount > MAX_DAILY_WITHDRAWAL) {
            emit CircuitBreakerTriggered(amount, dailyWithdrawnAmount, block.timestamp);
            revert CircuitBreakerActivated();
        }
        
        dailyWithdrawnAmount += amount;
        _;
    }
    
    /// @notice Validates recipient address
    modifier validRecipient(address recipient) {
        if (recipient == address(0)) revert InvalidRecipientAddress();
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @dev Initializes the contract with security enhancements
     * @param _dailyLimit Initial daily spending limit in wei
     */
    constructor(uint256 _dailyLimit) {
        dailyLimit = _dailyLimit;
        lastResetDay = block.timestamp / 1 days;
        emergencyWithdrawalEnabled = false;
        
        emit DailyLimitUpdated(0, _dailyLimit, block.timestamp);
    }
    
    // ============ Funding Functions ============
    
    /**
     * @notice Allows users to fund the contract
     * @dev Enhanced with better validation and events
     */
    function fund() external payable whenNotPaused {
        if (msg.value == 0) revert InvalidAmount();
        
        emit FundsReceived(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @notice Fallback function to receive AVAX
     */
    receive() external payable {
        if (msg.value > 0) {
            emit FundsReceived(msg.sender, msg.value, block.timestamp);
        }
    }
    
    // ============ Recipient Management ============
    
    /**
     * @notice Approves a recipient for meal funding
     * @param recipient Address to approve
     */
    function approveRecipient(address recipient) 
        external 
        onlyOwner 
        validRecipient(recipient) 
    {
        if (approvedRecipients[recipient]) revert RecipientAlreadyApproved();
        
        approvedRecipients[recipient] = true;
        emit RecipientApproved(recipient, block.timestamp);
    }
    
    /**
     * @notice Batch approve multiple recipients
     * @param recipients Array of addresses to approve
     * @param startIndex Starting index for batch processing
     * @param endIndex Ending index for batch processing
     */
    function batchApproveRecipients(
        address[] calldata recipients,
        uint256 startIndex,
        uint256 endIndex
    ) external onlyOwner {
        require(endIndex <= recipients.length, "Invalid range");
        require(endIndex - startIndex <= 50, "Batch size too large");
        
        for (uint256 i = startIndex; i < endIndex; i++) {
            address recipient = recipients[i];
            if (recipient != address(0) && !approvedRecipients[recipient]) {
                approvedRecipients[recipient] = true;
                emit RecipientApproved(recipient, block.timestamp);
            }
        }
    }
    
    /**
     * @notice Revokes a recipient's approval
     * @param recipient Address to revoke
     */
    function revokeRecipient(address recipient) 
        external 
        onlyOwner 
        validRecipient(recipient) 
    {
        if (!approvedRecipients[recipient]) revert RecipientNotCurrentlyApproved();
        
        approvedRecipients[recipient] = false;
        emit RecipientRevoked(recipient, block.timestamp);
    }
    
    // ============ Meal Request Functions ============
    
    /**
     * @notice Allows approved recipients to request meal funding
     * @param amount Amount of AVAX to withdraw in wei
     * @dev Enhanced with reentrancy protection and circuit breaker
     */
    function requestMeal(uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        circuitBreaker(amount)
    {
        // Input validation
        if (amount == 0) revert InvalidAmount();
        if (!approvedRecipients[msg.sender]) revert RecipientNotApproved();
        if (address(this).balance < amount) revert InsufficientContractBalance();
        
        // Check daily allowance using block-based timing
        uint256 allowance = getDailyAllowance(msg.sender);
        if (amount > allowance) revert DailyLimitExceeded();
        
        // Effects: Update state before external calls
        lastWithdrawalBlock[msg.sender] = block.number;
        
        // Reset daily counter if new day
        if (block.timestamp / 1 days > lastResetDay) {
            todayWithdrawn[msg.sender] = 0;
        }
        todayWithdrawn[msg.sender] += amount;
        
        // Interactions: External call last
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit MealRequested(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Calculates daily allowance for a recipient using block numbers
     * @param recipient Address of the recipient
     * @return Available allowance in wei
     */
    function getDailyAllowance(address recipient) public view returns (uint256) {
        if (!approvedRecipients[recipient]) return 0;
        
        uint256 blocksSinceLastWithdrawal = block.number - lastWithdrawalBlock[recipient];
        
        // If more than a day has passed, full allowance available
        if (blocksSinceLastWithdrawal >= BLOCKS_PER_DAY) {
            return dailyLimit;
        }
        
        // Calculate remaining allowance based on time passed
        uint256 timeBasedAllowance = (dailyLimit * blocksSinceLastWithdrawal) / BLOCKS_PER_DAY;
        uint256 usedToday = (block.timestamp / 1 days == lastResetDay) ? todayWithdrawn[recipient] : 0;
        
        return timeBasedAllowance > usedToday ? timeBasedAllowance - usedToday : 0;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Updates the daily spending limit
     * @param newLimit New daily limit in wei
     */
    function updateDailyLimit(uint256 newLimit) external onlyOwner {
        uint256 oldLimit = dailyLimit;
        dailyLimit = newLimit;
        
        emit DailyLimitUpdated(oldLimit, newLimit, block.timestamp);
    }
    
    /**
     * @notice Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Enables emergency withdrawal mode
     */
    function enableEmergencyWithdrawal() external onlyOwner {
        emergencyWithdrawalEnabled = true;
    }
    
    /**
     * @notice Emergency withdrawal function with enhanced security
     * @param amount Amount to withdraw in wei
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        if (!emergencyWithdrawalEnabled) revert EmergencyWithdrawalNotEnabled();
        if (amount > address(this).balance) revert InsufficientContractBalance();
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit EmergencyWithdrawal(owner(), amount, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Returns the contract's AVAX balance
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Checks if an address is an approved recipient
     * @param recipient Address to check
     * @return True if approved, false otherwise
     */
    function isApprovedRecipient(address recipient) external view returns (bool) {
        return approvedRecipients[recipient];
    }
    
    /**
     * @notice Returns contract configuration
     * @return dailyLimit_ Current daily limit
     * @return paused_ Whether contract is paused
     * @return owner_ Contract owner address
     * @return balance_ Contract balance
     */
    function getContractInfo() external view returns (
        uint256 dailyLimit_,
        bool paused_,
        address owner_,
        uint256 balance_
    ) {
        return (
            dailyLimit,
            paused(),
            owner(),
            address(this).balance
        );
    }
    
    /**
     * @notice Returns security status information
     * @return emergencyEnabled Whether emergency withdrawal is enabled
     * @return dailyWithdrawn Amount withdrawn today
     * @return maxDaily Maximum daily withdrawal limit
     * @return lastReset Last reset day timestamp
     */
    function getSecurityStatus() external view returns (
        bool emergencyEnabled,
        uint256 dailyWithdrawn,
        uint256 maxDaily,
        uint256 lastReset
    ) {
        return (
            emergencyWithdrawalEnabled,
            dailyWithdrawnAmount,
            MAX_DAILY_WITHDRAWAL,
            lastResetDay
        );
    }
}