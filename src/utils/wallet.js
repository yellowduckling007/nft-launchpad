import { ethers } from "ethers";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers";

const projectId = "21d27cad2953e853a2807c749b826a5f";

let walletProvider = null;

const sepolia = {
  chainId: 11155111,
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io",
  rpcUrl: "https://rpc.sepolia.org"
};

const metadata = {
  name: "NFT Launchpad",
  description: "NFT Minting dApp",
  url: window.location.origin,
  icons: []
};

const ethersConfig = defaultConfig({ metadata });

// Create modal - ONLY show MetaMask
const modal = createWeb3Modal({
  ethersConfig,
  chains: [sepolia],
  projectId,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96' // MetaMask ID
  ],
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96' // Show ONLY MetaMask
  ],
  enableAnalytics: false
});

// Get provider
async function getProvider() {
  if (walletProvider) {
    return new ethers.BrowserProvider(walletProvider);
  }

  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }

  throw new Error("No wallet connected");
}

// Get signer
async function getSigner() {
  const provider = await getProvider();
  return await provider.getSigner();
}

// Connect wallet 
async function connectWallet() {
  try {
    // Desktop: If MetaMask extension is installed, use it directly
    if (window.ethereum && window.ethereum.isMetaMask) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      return accounts[0];
    }

    // Mobile: Open WalletConnect modal
    await modal.open();
    
    // Wait for connection
    return new Promise((resolve, reject) => {
      
      // Listen to modal state changes
      const unsubscribe = modal.subscribeState((state) => {
        
        // Modal closed = user finished connecting (or cancelled)
        if (state.open === false) {
          
          // Get the wallet provider from modal
          walletProvider = modal.getWalletProvider();
          
          if (walletProvider) {
            // Convert to ethers provider
            const ethersProvider = new ethers.BrowserProvider(walletProvider);
            
            // Get address
            ethersProvider.getSigner().then(async (signer) => {
              const address = await signer.getAddress();
              unsubscribe(); // Stop listening
              resolve(address); // Return address
            }).catch((err) => {
              unsubscribe();
              reject(err);
            });
          } else {
            // No provider = user cancelled
            unsubscribe();
            reject(new Error("Connection cancelled"));
          }
        }
      });
      
      // Timeout after 60 seconds
      setTimeout(() => {
        unsubscribe();
        reject(new Error("Connection timeout"));
      }, 60000);
    });

  } catch (err) {
    console.error("Wallet connection error:", err);
    return null;
  }
}

// ✅ New: Fully ready provider (MetaMask safe)
async function getReadyProvider() {

  // 1. Wait for MetaMask injection
  if (!window.ethereum) {
    await new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(() => {
        if (window.ethereum) {
          clearInterval(interval);
          resolve();
        }
        attempts++;
        if (attempts > 20) {
          clearInterval(interval);
          reject("MetaMask not found");
        }
      }, 300);
    });
  }

  // 2. Ensure wallet is connected
  const accounts = await window.ethereum.request({
    method: "eth_accounts"
  });

  if (accounts.length === 0) {
    await window.ethereum.request({
      method: "eth_requestAccounts"
    });
  }

  // 3. Ensure correct network (Sepolia)
  const sepoliaChainId = "0xaa36a7";

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: sepoliaChainId }]
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: sepoliaChainId,
          chainName: "Sepolia Testnet",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18
          },
          rpcUrls: ["https://rpc.sepolia.org"],
          blockExplorerUrls: ["https://sepolia.etherscan.io"]
        }]
      });
    } else {
      throw err;
    }
  }

  // 4. Small delay (important for mobile)
  await new Promise(res => setTimeout(res, 800));

  // 5. Return provider
  return new ethers.BrowserProvider(window.ethereum);
}

export { getProvider, getSigner, connectWallet , getReadyProvider };