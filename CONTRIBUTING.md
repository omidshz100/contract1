# 🤝 Contributing to MealFunding

## 🎯 Welcome Contributors!

Thank you for your interest in contributing to MealFunding! This project aims to revolutionize meal funding through blockchain technology, and we welcome contributions from developers, designers, and blockchain enthusiasts.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Git
- MetaMask browser extension
- Basic understanding of Solidity and JavaScript

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/mealfunding.git`
3. Install dependencies: `npm install`
4. Start local blockchain: `npx hardhat node`
5. Deploy contract: `npm run deploy:local`
6. Run tests: `npm test`

## 📋 How to Contribute

### 🐛 Bug Reports
- Use GitHub Issues to report bugs
- Include detailed steps to reproduce
- Provide error messages and screenshots
- Specify your environment (OS, browser, MetaMask version)

### 💡 Feature Requests
- Open a GitHub Issue with the "enhancement" label
- Describe the feature and its benefits
- Explain how it aligns with the project's mission
- Provide mockups or examples if applicable

### 🔧 Code Contributions

#### Types of Contributions Welcome:
- **Smart Contract Improvements**: Gas optimization, security enhancements
- **Frontend Enhancements**: UI/UX improvements, accessibility features
- **Testing**: Additional test cases, integration tests
- **Documentation**: Code comments, user guides, tutorials
- **Deployment Scripts**: Network-specific configurations

#### Development Workflow:
1. **Create a branch**: `git checkout -b feature/your-feature-name`
2. **Make changes**: Follow coding standards below
3. **Test thoroughly**: Run all tests and add new ones
4. **Commit**: Use conventional commit messages
5. **Push**: `git push origin feature/your-feature-name`
6. **Pull Request**: Create PR with detailed description

## 📝 Coding Standards

### Solidity Code
```solidity
// Use clear, descriptive function names
function approveRecipient(address recipient) external onlyOwner {
    require(recipient != address(0), "Invalid recipient address");
    // Implementation...
}

// Add comprehensive comments
/**
 * @dev Allows approved recipients to request meal funding
 * @param amount Amount of AVAX to withdraw in wei
 */
function requestMeal(uint256 amount) external {
    // Implementation...
}
```

### JavaScript Code
```javascript
// Use async/await for blockchain interactions
async function fundContract(amount) {
    try {
        const tx = await contract.fund({ 
            value: ethers.utils.parseEther(amount.toString()) 
        });
        await tx.wait();
        console.log("Funding successful");
    } catch (error) {
        console.error("Funding failed:", error.message);
    }
}

// Use descriptive variable names
const dailyLimitInAVAX = 10;
const contractBalance = await contract.getContractBalance();
```

### Commit Message Format
```
type(scope): description

feat(contract): add emergency pause functionality
fix(frontend): resolve MetaMask connection issue
docs(readme): update installation instructions
test(contract): add daily limit test cases
```

## 🧪 Testing Guidelines

### Smart Contract Tests
- Test all functions with valid inputs
- Test edge cases and error conditions
- Test access controls and modifiers
- Aim for >95% code coverage

### Frontend Tests
- Test user interactions
- Test error handling
- Test different wallet states
- Test responsive design

### Example Test Structure
```javascript
describe("MealFunding Contract", function () {
    describe("Funding", function () {
        it("Should allow users to fund the contract", async function () {
            // Test implementation
        });
        
        it("Should reject funding with zero amount", async function () {
            // Test implementation
        });
    });
});
```

## 🔒 Security Guidelines

### Smart Contract Security
- Follow OpenZeppelin patterns
- Use reentrancy guards where needed
- Validate all inputs
- Implement proper access controls
- Avoid floating pragma versions

### Frontend Security
- Never expose private keys
- Validate user inputs
- Use HTTPS for all connections
- Implement proper error handling

## 📚 Documentation Standards

### Code Documentation
- Document all public functions
- Explain complex logic
- Include usage examples
- Keep documentation up-to-date

### User Documentation
- Write clear, step-by-step guides
- Include screenshots where helpful
- Provide troubleshooting sections
- Test instructions with new users

## 🎨 Design Guidelines

### UI/UX Principles
- **Accessibility**: Support screen readers, keyboard navigation
- **Simplicity**: Keep interfaces clean and intuitive
- **Responsiveness**: Work on all device sizes
- **Feedback**: Provide clear success/error messages

### Visual Design
- Use consistent color scheme
- Maintain proper contrast ratios
- Follow modern design patterns
- Ensure fast loading times

## 🌍 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Help newcomers learn
- Provide constructive feedback
- Focus on the project's mission

### Communication
- Use GitHub Issues for technical discussions
- Be clear and concise in communications
- Provide context for your contributions
- Ask questions when unsure

## 🏆 Recognition

### Contributors
All contributors will be:
- Listed in the project README
- Credited in release notes
- Invited to project discussions
- Recognized for their specific contributions

### Contribution Types
- 💻 Code contributions
- 📖 Documentation improvements
- 🐛 Bug reports and fixes
- 💡 Feature suggestions
- 🎨 Design contributions
- 🧪 Testing and QA

## 📞 Getting Help

### Resources
- **Documentation**: Check existing docs first
- **GitHub Issues**: Search existing issues
- **Code Examples**: Review test files and scripts
- **Community**: Engage with other contributors

### Contact
- Open a GitHub Issue for technical questions
- Use Discussions for general questions
- Tag maintainers for urgent issues

## 🚀 Future Roadmap

### Planned Features
- Multi-token support (USDC, USDT)
- Mobile app development
- Integration with food delivery services
- Advanced analytics dashboard
- Multi-signature wallet support

### How to Get Involved
- Review the roadmap in GitHub Projects
- Comment on feature discussions
- Propose new features
- Help prioritize development

---

**Thank you for contributing to MealFunding! Together, we're building a more transparent and efficient way to fund meals for those in need.** 🍽️❤️