// Deployment script for MealFunding contract on Avalanche C-Chain
// This script can be used with Hardhat or similar deployment tools

const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying MealFunding contract to Avalanche C-Chain...");
    
    // Get the contract factory
    const MealFunding = await ethers.getContractFactory("MealFunding");
    
    // Deploy the contract
    const mealFunding = await MealFunding.deploy();
    
    // Wait for deployment to complete
    await mealFunding.deployed();
    
    console.log("✅ MealFunding contract deployed to:", mealFunding.address);
    console.log("📋 Contract details:");
    console.log("   - Owner:", await mealFunding.owner());
    console.log("   - Daily Limit:", ethers.utils.formatEther(await mealFunding.dailyLimit()), "AVAX");
    console.log("   - Paused:", await mealFunding.paused());
    
    // Verify contract on snowtrace (optional)
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("⏳ Waiting for block confirmations...");
        await mealFunding.deployTransaction.wait(6);
        
        console.log("🔍 Verifying contract on Snowtrace...");
        try {
            await hre.run("verify:verify", {
                address: mealFunding.address,
                constructorArguments: [],
            });
            console.log("✅ Contract verified on Snowtrace");
        } catch (error) {
            console.log("❌ Verification failed:", error.message);
        }
    }
    
    return mealFunding.address;
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });