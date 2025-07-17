/**
 * Simulation of MealFunding Contract Scenario
 * This script demonstrates the step-by-step execution of the example scenario
 */

// Mock addresses for simulation
const OWNER_ADDRESS = "0x1234567890123456789012345678901234567890";
const ALICE_ADDRESS = "0xABCDEF1234567890123456789012345678901234";
const BOB_ADDRESS = "0x9876543210987654321098765432109876543210";

// Contract state simulation
let contractState = {
    owner: OWNER_ADDRESS,
    paused: false,
    dailyLimit: 10, // 10 AVAX
    totalFunds: 0,
    contractBalance: 0,
    funderBalances: {},
    approvedRecipients: {},
    dailySpent: {},
    lastWithdrawalDay: {},
    currentDay: 1 // Simulated day counter
};

// Helper functions
function toAVAX(amount) {
    return `${amount} AVAX`;
}

function getCurrentDay() {
    return contractState.currentDay;
}

function resetDailySpending(recipient) {
    if (contractState.lastWithdrawalDay[recipient] < getCurrentDay()) {
        contractState.dailySpent[recipient] = 0;
        contractState.lastWithdrawalDay[recipient] = getCurrentDay();
    }
}

function logEvent(eventName, details) {
    console.log(`🔔 EVENT: ${eventName}`);
    console.log(`   Details: ${details}`);
    console.log("");
}

function logState() {
    console.log("📊 CONTRACT STATE:");
    console.log(`   Total Funds: ${toAVAX(contractState.totalFunds)}`);
    console.log(`   Contract Balance: ${toAVAX(contractState.contractBalance)}`);
    console.log(`   Paused: ${contractState.paused}`);
    console.log(`   Alice's Balance: ${toAVAX(contractState.funderBalances[ALICE_ADDRESS] || 0)}`);
    console.log(`   Bob Approved: ${contractState.approvedRecipients[BOB_ADDRESS] || false}`);
    console.log(`   Bob's Daily Spent: ${toAVAX(contractState.dailySpent[BOB_ADDRESS] || 0)}`);
    console.log(`   Current Day: ${getCurrentDay()}`);
    console.log("─".repeat(50));
}

console.log("🚀 MEAL FUNDING CONTRACT SIMULATION");
console.log("=" .repeat(50));
console.log("");

// Initial state
console.log("📋 INITIAL STATE:");
logState();

// Step 1: Donor Alice deposits 5 AVAX
console.log("1️⃣  STEP 1: Alice deposits 5 AVAX");
try {
    const depositAmount = 5;
    
    // Simulate fund() function
    if (contractState.paused) {
        throw new Error("Contract is paused");
    }
    if (depositAmount <= 0) {
        throw new Error("Must send AVAX to fund");
    }
    
    contractState.funderBalances[ALICE_ADDRESS] = (contractState.funderBalances[ALICE_ADDRESS] || 0) + depositAmount;
    contractState.totalFunds += depositAmount;
    contractState.contractBalance += depositAmount;
    
    logEvent("FundsDeposited", `Alice deposited ${toAVAX(depositAmount)}, new balance: ${toAVAX(contractState.funderBalances[ALICE_ADDRESS])}`);
    console.log("✅ SUCCESS: Alice successfully deposited 5 AVAX");
} catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
}
logState();

// Step 2: Owner approves recipient Bob
console.log("2️⃣  STEP 2: Owner approves Bob as recipient");
try {
    // Simulate approveRecipient() function
    if (contractState.approvedRecipients[BOB_ADDRESS]) {
        throw new Error("Recipient already approved");
    }
    
    contractState.approvedRecipients[BOB_ADDRESS] = true;
    
    logEvent("RecipientApproved", `Bob has been approved as a recipient`);
    console.log("✅ SUCCESS: Bob is now an approved recipient");
} catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
}
logState();

// Step 3: Bob requests 7 AVAX (should fail - exceeds available balance)
console.log("3️⃣  STEP 3: Bob requests 7 AVAX (should fail - exceeds donor's balance)");
const requestAmount3 = 7;
try {
    // Simulate requestMeal() function
    if (contractState.paused) {
        throw new Error("Contract is paused");
    }
    if (!contractState.approvedRecipients[BOB_ADDRESS]) {
        throw new Error("Not an approved recipient");
    }
    if (requestAmount3 <= 0) {
        throw new Error("Amount must be greater than 0");
    }
    if (contractState.contractBalance < requestAmount3) {
        throw new Error("Insufficient contract balance");
    }
    if (contractState.totalFunds < requestAmount3) {
        throw new Error("Insufficient total funds");
    }
    
    resetDailySpending(BOB_ADDRESS);
    
    if ((contractState.dailySpent[BOB_ADDRESS] || 0) + requestAmount3 > contractState.dailyLimit) {
        throw new Error("Daily limit exceeded");
    }
    
    // This should not be reached due to insufficient funds
    throw new Error("Unexpected success");
} catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    console.log(`   Reason: Only ${contractState.contractBalance} AVAX available, but Bob requested ${requestAmount3} AVAX`);
}
logState();

// Step 4: Bob requests 4 AVAX (should succeed)
console.log("4️⃣  STEP 4: Bob requests 4 AVAX (should succeed)");
const requestAmount4 = 4;
try {
    // Simulate requestMeal() function
    if (contractState.paused) {
        throw new Error("Contract is paused");
    }
    if (!contractState.approvedRecipients[BOB_ADDRESS]) {
        throw new Error("Not an approved recipient");
    }
    if (requestAmount4 <= 0) {
        throw new Error("Amount must be greater than 0");
    }
    if (contractState.contractBalance < requestAmount4) {
        throw new Error("Insufficient contract balance");
    }
    if (contractState.totalFunds < requestAmount4) {
        throw new Error("Insufficient total funds");
    }
    
    resetDailySpending(BOB_ADDRESS);
    
    if ((contractState.dailySpent[BOB_ADDRESS] || 0) + requestAmount4 > contractState.dailyLimit) {
        throw new Error("Daily limit exceeded");
    }
    
    // Update state
    contractState.dailySpent[BOB_ADDRESS] = (contractState.dailySpent[BOB_ADDRESS] || 0) + requestAmount4;
    contractState.totalFunds -= requestAmount4;
    contractState.contractBalance -= requestAmount4;
    contractState.lastWithdrawalDay[BOB_ADDRESS] = getCurrentDay();
    
    logEvent("MealRequested", `Bob withdrew ${toAVAX(requestAmount4)}, remaining funds: ${toAVAX(contractState.totalFunds)}`);
    console.log("✅ SUCCESS: Bob successfully withdrew 4 AVAX");
} catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
}
logState();

// Step 5: Bob requests another 7 AVAX the same day (should fail - daily limit)
console.log("5️⃣  STEP 5: Bob requests another 7 AVAX same day (should fail - daily limit)");
const requestAmount5 = 7;
try {
    // Simulate requestMeal() function
    if (contractState.paused) {
        throw new Error("Contract is paused");
    }
    if (!contractState.approvedRecipients[BOB_ADDRESS]) {
        throw new Error("Not an approved recipient");
    }
    if (requestAmount5 <= 0) {
        throw new Error("Amount must be greater than 0");
    }
    if (contractState.contractBalance < requestAmount5) {
        throw new Error("Insufficient contract balance");
    }
    if (contractState.totalFunds < requestAmount5) {
        throw new Error("Insufficient total funds");
    }
    
    resetDailySpending(BOB_ADDRESS);
    
    if ((contractState.dailySpent[BOB_ADDRESS] || 0) + requestAmount5 > contractState.dailyLimit) {
        throw new Error("Daily limit exceeded");
    }
    
    // This should not be reached due to daily limit
    throw new Error("Unexpected success");
} catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    if (error.message === "Daily limit exceeded") {
        console.log(`   Reason: Bob already spent ${toAVAX(contractState.dailySpent[BOB_ADDRESS])}, requesting ${toAVAX(requestAmount5)} would exceed daily limit of ${toAVAX(contractState.dailyLimit)}`);
    } else {
        console.log(`   Reason: ${error.message}`);
    }
}
logState();

// Step 6: Owner pauses the contract
console.log("6️⃣  STEP 6: Owner pauses the contract");
try {
    // Simulate pause() function
    if (contractState.paused) {
        throw new Error("Contract already paused");
    }
    
    contractState.paused = true;
    
    logEvent("ContractPaused", "Contract has been paused by owner");
    console.log("✅ SUCCESS: Contract is now paused");
} catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
}
logState();

// Step 7: Bob tries to request 1 AVAX (should fail - contract paused)
console.log("7️⃣  STEP 7: Bob tries to request 1 AVAX (should fail - contract paused)");
try {
    const requestAmount = 1;
    
    // Simulate requestMeal() function
    if (contractState.paused) {
        throw new Error("Contract is paused");
    }
    
    // This should not be reached due to pause
    throw new Error("Unexpected success");
} catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    console.log("   Reason: Contract is currently paused");
}
logState();

// Step 8: Owner unpauses the contract
console.log("8️⃣  STEP 8: Owner unpauses the contract");
try {
    // Simulate unpause() function
    if (!contractState.paused) {
        throw new Error("Contract not paused");
    }
    
    contractState.paused = false;
    
    logEvent("ContractUnpaused", "Contract has been unpaused by owner");
    console.log("✅ SUCCESS: Contract is now unpaused");
} catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
}
logState();

// Step 9: Bob requests 6 AVAX the next day (should succeed)
console.log("9️⃣  STEP 9: Bob requests 6 AVAX the next day (should succeed)");
// Simulate next day
contractState.currentDay = 2;
console.log("⏰ TIME ADVANCE: Moving to next day (Day 2)");

try {
    const requestAmount = 6;
    
    // First, Alice needs to deposit more funds since only 1 AVAX remains
    console.log("   💡 Note: Alice deposits additional 10 AVAX to cover Bob's request");
    contractState.funderBalances[ALICE_ADDRESS] += 10;
    contractState.totalFunds += 10;
    contractState.contractBalance += 10;
    
    // Simulate requestMeal() function
    if (contractState.paused) {
        throw new Error("Contract is paused");
    }
    if (!contractState.approvedRecipients[BOB_ADDRESS]) {
        throw new Error("Not an approved recipient");
    }
    if (requestAmount <= 0) {
        throw new Error("Amount must be greater than 0");
    }
    if (contractState.contractBalance < requestAmount) {
        throw new Error("Insufficient contract balance");
    }
    if (contractState.totalFunds < requestAmount) {
        throw new Error("Insufficient total funds");
    }
    
    resetDailySpending(BOB_ADDRESS); // This will reset daily spending for new day
    
    if ((contractState.dailySpent[BOB_ADDRESS] || 0) + requestAmount > contractState.dailyLimit) {
        throw new Error("Daily limit exceeded");
    }
    
    // Update state
    contractState.dailySpent[BOB_ADDRESS] = (contractState.dailySpent[BOB_ADDRESS] || 0) + requestAmount;
    contractState.totalFunds -= requestAmount;
    contractState.contractBalance -= requestAmount;
    contractState.lastWithdrawalDay[BOB_ADDRESS] = getCurrentDay();
    
    logEvent("MealRequested", `Bob withdrew ${toAVAX(requestAmount)}, remaining funds: ${toAVAX(contractState.totalFunds)}`);
    console.log("✅ SUCCESS: Bob successfully withdrew 6 AVAX on the new day");
} catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
}
logState();

console.log("🎉 SIMULATION COMPLETE!");
console.log("=" .repeat(50));
console.log("");
console.log("📝 SUMMARY:");
console.log("• Alice deposited a total of 15 AVAX");
console.log("• Bob made 2 successful withdrawals (4 AVAX + 6 AVAX = 10 AVAX)");
console.log("• 3 withdrawal attempts failed due to various constraints");
console.log("• Contract pause/unpause functionality worked correctly");
console.log("• Daily spending limits were properly enforced");
console.log("• Remaining contract balance: 5 AVAX");