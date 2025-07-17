const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MealFunding Contract", function () {
    let MealFunding;
    let mealFunding;
    let owner;
    let alice;
    let bob;
    let charlie;

    beforeEach(async function () {
        // Get signers
        [owner, alice, bob, charlie] = await ethers.getSigners();

        // Deploy contract
        MealFunding = await ethers.getContractFactory("MealFunding");
        mealFunding = await MealFunding.deploy();
        await mealFunding.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await mealFunding.owner()).to.equal(owner.address);
        });

        it("Should set initial daily limit to 10 AVAX", async function () {
            expect(await mealFunding.dailyLimit()).to.equal(ethers.utils.parseEther("10"));
        });

        it("Should not be paused initially", async function () {
            expect(await mealFunding.paused()).to.equal(false);
        });

        it("Should have zero total funds initially", async function () {
            expect(await mealFunding.totalFunds()).to.equal(0);
        });
    });

    describe("Funding", function () {
        it("Should allow users to fund the contract", async function () {
            const fundAmount = ethers.utils.parseEther("5");
            
            await expect(mealFunding.connect(alice).fund({ value: fundAmount }))
                .to.emit(mealFunding, "FundsDeposited")
                .withArgs(alice.address, fundAmount, fundAmount);

            expect(await mealFunding.funderBalances(alice.address)).to.equal(fundAmount);
            expect(await mealFunding.totalFunds()).to.equal(fundAmount);
        });

        it("Should reject funding with zero amount", async function () {
            await expect(mealFunding.connect(alice).fund({ value: 0 }))
                .to.be.revertedWith("Must send AVAX to fund");
        });

        it("Should reject funding when contract is paused", async function () {
            await mealFunding.connect(owner).pause();
            
            await expect(mealFunding.connect(alice).fund({ value: ethers.utils.parseEther("1") }))
                .to.be.revertedWith("Contract is paused");
        });

        it("Should accumulate multiple fundings from same user", async function () {
            const fundAmount1 = ethers.utils.parseEther("3");
            const fundAmount2 = ethers.utils.parseEther("2");
            
            await mealFunding.connect(alice).fund({ value: fundAmount1 });
            await mealFunding.connect(alice).fund({ value: fundAmount2 });

            expect(await mealFunding.funderBalances(alice.address)).to.equal(fundAmount1.add(fundAmount2));
            expect(await mealFunding.totalFunds()).to.equal(fundAmount1.add(fundAmount2));
        });
    });

    describe("Recipient Management", function () {
        it("Should allow owner to approve recipients", async function () {
            await expect(mealFunding.connect(owner).approveRecipient(bob.address))
                .to.emit(mealFunding, "RecipientApproved")
                .withArgs(bob.address);

            expect(await mealFunding.approvedRecipients(bob.address)).to.equal(true);
        });

        it("Should not allow non-owner to approve recipients", async function () {
            await expect(mealFunding.connect(alice).approveRecipient(bob.address))
                .to.be.revertedWith("Only owner can call this function");
        });

        it("Should not allow approving zero address", async function () {
            await expect(mealFunding.connect(owner).approveRecipient(ethers.constants.AddressZero))
                .to.be.revertedWith("Invalid recipient address");
        });

        it("Should not allow approving already approved recipient", async function () {
            await mealFunding.connect(owner).approveRecipient(bob.address);
            
            await expect(mealFunding.connect(owner).approveRecipient(bob.address))
                .to.be.revertedWith("Recipient already approved");
        });

        it("Should allow owner to revoke recipients", async function () {
            await mealFunding.connect(owner).approveRecipient(bob.address);
            
            await expect(mealFunding.connect(owner).revokeRecipient(bob.address))
                .to.emit(mealFunding, "RecipientRevoked")
                .withArgs(bob.address);

            expect(await mealFunding.approvedRecipients(bob.address)).to.equal(false);
        });

        it("Should not allow revoking non-approved recipient", async function () {
            await expect(mealFunding.connect(owner).revokeRecipient(bob.address))
                .to.be.revertedWith("Recipient not approved");
        });
    });

    describe("Meal Requests", function () {
        beforeEach(async function () {
            // Fund the contract and approve Bob
            await mealFunding.connect(alice).fund({ value: ethers.utils.parseEther("20") });
            await mealFunding.connect(owner).approveRecipient(bob.address);
        });

        it("Should allow approved recipients to request meals", async function () {
            const requestAmount = ethers.utils.parseEther("5");
            const bobBalanceBefore = await ethers.provider.getBalance(bob.address);
            
            await expect(mealFunding.connect(bob).requestMeal(requestAmount))
                .to.emit(mealFunding, "MealRequested")
                .withArgs(bob.address, requestAmount, ethers.utils.parseEther("15"));

            const bobBalanceAfter = await ethers.provider.getBalance(bob.address);
            expect(bobBalanceAfter.sub(bobBalanceBefore)).to.be.closeTo(requestAmount, ethers.utils.parseEther("0.01"));
        });

        it("Should not allow non-approved recipients to request meals", async function () {
            await expect(mealFunding.connect(charlie).requestMeal(ethers.utils.parseEther("1")))
                .to.be.revertedWith("Not an approved recipient");
        });

        it("Should not allow requesting zero amount", async function () {
            await expect(mealFunding.connect(bob).requestMeal(0))
                .to.be.revertedWith("Amount must be greater than 0");
        });

        it("Should not allow requesting more than contract balance", async function () {
            await expect(mealFunding.connect(bob).requestMeal(ethers.utils.parseEther("25")))
                .to.be.revertedWith("Insufficient contract balance");
        });

        it("Should enforce daily spending limit", async function () {
            // Request 8 AVAX (within limit)
            await mealFunding.connect(bob).requestMeal(ethers.utils.parseEther("8"));
            
            // Try to request 3 more AVAX (should fail - exceeds 10 AVAX daily limit)
            await expect(mealFunding.connect(bob).requestMeal(ethers.utils.parseEther("3")))
                .to.be.revertedWith("Daily limit exceeded");
        });

        it("Should allow requests within daily limit", async function () {
            // Request 5 AVAX
            await mealFunding.connect(bob).requestMeal(ethers.utils.parseEther("5"));
            
            // Request 3 more AVAX (total 8, within 10 AVAX limit)
            await expect(mealFunding.connect(bob).requestMeal(ethers.utils.parseEther("3")))
                .to.not.be.reverted;
        });

        it("Should not allow requests when contract is paused", async function () {
            await mealFunding.connect(owner).pause();
            
            await expect(mealFunding.connect(bob).requestMeal(ethers.utils.parseEther("1")))
                .to.be.revertedWith("Contract is paused");
        });
    });

    describe("Daily Allowance", function () {
        beforeEach(async function () {
            await mealFunding.connect(alice).fund({ value: ethers.utils.parseEther("20") });
            await mealFunding.connect(owner).approveRecipient(bob.address);
        });

        it("Should return full daily limit for new recipient", async function () {
            const allowance = await mealFunding.getRemainingDailyAllowance(bob.address);
            expect(allowance).to.equal(ethers.utils.parseEther("10"));
        });

        it("Should return reduced allowance after spending", async function () {
            await mealFunding.connect(bob).requestMeal(ethers.utils.parseEther("3"));
            
            const allowance = await mealFunding.getRemainingDailyAllowance(bob.address);
            expect(allowance).to.equal(ethers.utils.parseEther("7"));
        });

        it("Should return zero allowance when limit is reached", async function () {
            await mealFunding.connect(bob).requestMeal(ethers.utils.parseEther("10"));
            
            const allowance = await mealFunding.getRemainingDailyAllowance(bob.address);
            expect(allowance).to.equal(0);
        });
    });

    describe("Pause/Unpause", function () {
        it("Should allow owner to pause contract", async function () {
            await expect(mealFunding.connect(owner).pause())
                .to.emit(mealFunding, "ContractPaused");

            expect(await mealFunding.paused()).to.equal(true);
        });

        it("Should allow owner to unpause contract", async function () {
            await mealFunding.connect(owner).pause();
            
            await expect(mealFunding.connect(owner).unpause())
                .to.emit(mealFunding, "ContractUnpaused");

            expect(await mealFunding.paused()).to.equal(false);
        });

        it("Should not allow non-owner to pause", async function () {
            await expect(mealFunding.connect(alice).pause())
                .to.be.revertedWith("Only owner can call this function");
        });

        it("Should not allow pausing already paused contract", async function () {
            await mealFunding.connect(owner).pause();
            
            await expect(mealFunding.connect(owner).pause())
                .to.be.revertedWith("Contract already paused");
        });

        it("Should not allow unpausing non-paused contract", async function () {
            await expect(mealFunding.connect(owner).unpause())
                .to.be.revertedWith("Contract not paused");
        });
    });

    describe("Daily Limit Management", function () {
        it("Should allow owner to update daily limit", async function () {
            const newLimit = ethers.utils.parseEther("15");
            
            await expect(mealFunding.connect(owner).updateDailyLimit(newLimit))
                .to.emit(mealFunding, "DailyLimitUpdated")
                .withArgs(newLimit);

            expect(await mealFunding.dailyLimit()).to.equal(newLimit);
        });

        it("Should not allow non-owner to update daily limit", async function () {
            await expect(mealFunding.connect(alice).updateDailyLimit(ethers.utils.parseEther("15")))
                .to.be.revertedWith("Only owner can call this function");
        });

        it("Should not allow setting zero daily limit", async function () {
            await expect(mealFunding.connect(owner).updateDailyLimit(0))
                .to.be.revertedWith("Daily limit must be greater than 0");
        });
    });

    describe("Emergency Functions", function () {
        beforeEach(async function () {
            await mealFunding.connect(alice).fund({ value: ethers.utils.parseEther("10") });
        });

        it("Should allow owner to emergency withdraw when paused", async function () {
            await mealFunding.connect(owner).pause();
            
            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
            const contractBalance = await ethers.provider.getBalance(mealFunding.address);
            
            const tx = await mealFunding.connect(owner).emergencyWithdraw();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
            
            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
            
            expect(ownerBalanceAfter.add(gasUsed).sub(ownerBalanceBefore)).to.equal(contractBalance);
            expect(await mealFunding.totalFunds()).to.equal(0);
        });

        it("Should not allow emergency withdraw when not paused", async function () {
            await expect(mealFunding.connect(owner).emergencyWithdraw())
                .to.be.revertedWith("Contract must be paused for emergency withdrawal");
        });

        it("Should not allow non-owner to emergency withdraw", async function () {
            await mealFunding.connect(owner).pause();
            
            await expect(mealFunding.connect(alice).emergencyWithdraw())
                .to.be.revertedWith("Only owner can call this function");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await mealFunding.connect(alice).fund({ value: ethers.utils.parseEther("5") });
        });

        it("Should return correct contract balance", async function () {
            const balance = await mealFunding.getContractBalance();
            expect(balance).to.equal(ethers.utils.parseEther("5"));
        });
    });
});