const { ethers } = require("hardhat");

async function main() {
    console.log("🔗 Connecting to local Hardhat network...");
    
    // Get signers (accounts from local network)
    const [owner, alice, bob, charlie] = await ethers.getSigners();
    
    console.log("👥 Available accounts:");
    console.log("   Owner (Contract deployer):", owner.address);
    console.log("   Alice (Funder):", alice.address);
    console.log("   Bob (Recipient):", bob.address);
    console.log("   Charlie (Another user):", charlie.address);
    
    // Deploy a new contract for testing
    console.log("\n🚀 Deploying MealFunding contract for local testing...");
    const MealFunding = await ethers.getContractFactory("MealFunding");
    const mealFunding = await MealFunding.deploy();
    await mealFunding.deployed();
    
    console.log("✅ Contract deployed at:", mealFunding.address);
    console.log("   Owner:", await mealFunding.owner());
    console.log("   Daily Limit:", ethers.utils.formatEther(await mealFunding.dailyLimit()), "AVAX");
    
    // Step 1: Alice funds the contract
    console.log("\n💰 Step 1: Alice funds the contract with 50 AVAX");
    const fundAmount = ethers.utils.parseEther("50");
    const fundTx = await mealFunding.connect(alice).fund({ value: fundAmount });
    await fundTx.wait();
    
    const contractBalance = await ethers.provider.getBalance(mealFunding.address);
    console.log("   ✅ Contract balance:", ethers.utils.formatEther(contractBalance), "AVAX");
    
    // Step 2: Owner approves Bob as recipient
    console.log("\n👤 Step 2: Owner approves Bob as recipient");
    const approveTx = await mealFunding.connect(owner).approveRecipient(bob.address);
    await approveTx.wait();
    console.log("   ✅ Bob approved as recipient");
    
    // Step 3: Bob requests 5 AVAX for meals
    console.log("\n🍽️ Step 3: Bob requests 5 AVAX for meals");
    const requestAmount1 = ethers.utils.parseEther("5");
    const bobBalanceBefore = await ethers.provider.getBalance(bob.address);
    
    const requestTx1 = await mealFunding.connect(bob).requestMeal(requestAmount1);
    await requestTx1.wait();
    
    const bobBalanceAfter = await ethers.provider.getBalance(bob.address);
    console.log("   ✅ Bob received:", ethers.utils.formatEther(requestAmount1), "AVAX");
    console.log("   📊 Bob's balance change:", ethers.utils.formatEther(bobBalanceAfter.sub(bobBalanceBefore)), "AVAX");
    
    // Step 4: Bob tries to request another 7 AVAX (should fail - daily limit)
    console.log("\n❌ Step 4: Bob tries to request another 7 AVAX (should fail - daily limit)");
    const requestAmount2 = ethers.utils.parseEther("7");
    try {
        const requestTx2 = await mealFunding.connect(bob).requestMeal(requestAmount2);
        await requestTx2.wait();
        console.log("   ❌ This should not have succeeded!");
    } catch (error) {
        console.log("   ✅ Request failed as expected:", error.reason || "Daily limit exceeded");
    }
    
    // Step 5: Bob requests 3 AVAX (should succeed - within daily limit)
    console.log("\n✅ Step 5: Bob requests 3 AVAX (should succeed - within daily limit)");
    const requestAmount3 = ethers.utils.parseEther("3");
    const bobBalanceBefore2 = await ethers.provider.getBalance(bob.address);
    
    const requestTx3 = await mealFunding.connect(bob).requestMeal(requestAmount3);
    await requestTx3.wait();
    
    const bobBalanceAfter2 = await ethers.provider.getBalance(bob.address);
    console.log("   ✅ Bob received:", ethers.utils.formatEther(requestAmount3), "AVAX");
    console.log("   📊 Bob's total daily usage: 8 AVAX (5 + 3)");
    
    // Step 6: Check remaining daily allowance
    console.log("\n📊 Step 6: Check Bob's remaining daily allowance");
    const remainingAllowance = await mealFunding.getRemainingDailyAllowance(bob.address);
    console.log("   📈 Remaining allowance:", ethers.utils.formatEther(remainingAllowance), "AVAX");
    
    // Step 7: Owner pauses the contract
    console.log("\n⏸️ Step 7: Owner pauses the contract");
    const pauseTx = await mealFunding.connect(owner).pause();
    await pauseTx.wait();
    console.log("   ✅ Contract paused");
    
    // Step 8: Bob tries to request funds while paused (should fail)
    console.log("\n❌ Step 8: Bob tries to request funds while paused (should fail)");
    try {
        const requestTx4 = await mealFunding.connect(bob).requestMeal(ethers.utils.parseEther("1"));
        await requestTx4.wait();
        console.log("   ❌ This should not have succeeded!");
    } catch (error) {
        console.log("   ✅ Request failed as expected:", error.reason || "Contract is paused");
    }
    
    // Step 9: Owner unpauses the contract
    console.log("\n▶️ Step 9: Owner unpauses the contract");
    const unpauseTx = await mealFunding.connect(owner).unpause();
    await unpauseTx.wait();
    console.log("   ✅ Contract unpaused");
    
    // Step 10: Charlie tries to request without approval (should fail)
    console.log("\n❌ Step 10: Charlie tries to request without approval (should fail)");
    try {
        const requestTx5 = await mealFunding.connect(charlie).requestMeal(ethers.utils.parseEther("1"));
        await requestTx5.wait();
        console.log("   ❌ This should not have succeeded!");
    } catch (error) {
        console.log("   ✅ Request failed as expected:", error.reason || "Not an approved recipient");
    }
    
    // Final status
    console.log("\n📊 Final Status:");
    const finalBalance = await ethers.provider.getBalance(mealFunding.address);
    const totalFunds = await mealFunding.totalFunds();
    console.log("   Contract balance:", ethers.utils.formatEther(finalBalance), "AVAX");
    console.log("   Total funds:", ethers.utils.formatEther(totalFunds), "AVAX");
    console.log("   Bob is approved:", await mealFunding.approvedRecipients(bob.address));
    console.log("   Charlie is approved:", await mealFunding.approvedRecipients(charlie.address));
    console.log("   Contract paused:", await mealFunding.paused());
    console.log("   Daily limit:", ethers.utils.formatEther(await mealFunding.dailyLimit()), "AVAX");
    
    console.log("\n🎉 Local interaction complete!");
    console.log("💡 The MealFunding contract is now running on your local Avalanche-like blockchain!");
    console.log("🔗 Contract address:", mealFunding.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Interaction failed:", error);
        process.exit(1);
    });