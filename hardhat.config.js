require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

// Default private key for local development (don't use this for real funds!)
const DEFAULT_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Get private key from env or use default
const getPrivateKey = () => {
  const envKey = process.env.PRIVATE_KEY;
  if (!envKey || envKey === "your_actual_private_key_without_0x" || envKey.length < 64) {
    console.log("⚠️  Using default private key for local development");
    return DEFAULT_PRIVATE_KEY;
  }
  return envKey.startsWith("0x") ? envKey : "0x" + envKey;
};

// Avalanche C-Chain configuration
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337
    },
    
    // Local node
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    
    // Avalanche Fuji Testnet
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [getPrivateKey()],
      gasPrice: 25000000000, // 25 gwei
    },
    
    // Avalanche Mainnet
    mainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: [getPrivateKey()],
      gasPrice: 25000000000, // 25 gwei
    }
  },
  
  // Snowtrace API key for contract verification
  etherscan: {
    apiKey: {
      avalanche: process.env.SNOWTRACE_API_KEY || "",
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY || ""
    }
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};