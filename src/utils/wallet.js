import { ethers } from "ethers";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers";

const projectId = "21d27cad2953e853a2807c749b826a5f";

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
  if (!window.ethereum) {
    throw new Error("No wallet detected");
  }
  return new ethers.BrowserProvider(window.ethereum);
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
          const walletProvider = modal.getWalletProvider();
          
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

export { getProvider, getSigner, connectWallet };