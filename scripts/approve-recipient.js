const { ethers } = require("hardhat");

async function main() {
    // Get the contract
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const MealFunding = await ethers.getContractFactory("MealFunding");
    const contract = MealFunding.attach(contractAddress);
    
    // Get signers
    const [owner] = await ethers.getSigners();
    console.log("Owner address:", owner.address);
    
    // The recipient address to approve (your MetaMask account)
    const recipientAddress = "0xf6F5127B2DB69f91638d98Ff120cB2F3530236f3";
    
    console.log("Approving recipient:", recipientAddress);
    
    try {
        // Check if already approved
        const isApproved = await contract.approvedRecipients(recipientAddress);
        
        if (isApproved) {
            console.log("✅ Recipient is already approved!");
        } else {
            // Approve the recipient
            const tx = await contract.approveRecipient(recipientAddress);
            console.log("Transaction hash:", tx.hash);
            
            // Wait for confirmation
            await tx.wait();
            console.log("✅ Recipient approved successfully!");
        }
        
        // Verify approval
        const finalStatus = await contract.approvedRecipients(recipientAddress);
        console.log("Final approval status:", finalStatus);
        
        // Show daily limit
        const dailyLimit = await contract.dailyLimit();
        console.log("Daily limit:", ethers.utils.formatEther(dailyLimit), "ETH");
        
    } catch (error) {
        console.error("❌ Error approving recipient:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });