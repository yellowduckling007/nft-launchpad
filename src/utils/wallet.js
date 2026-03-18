import { ethers } from "ethers";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers";

const projectId="21d27cad2953e853a2807c749b826a5f";

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

const modal = createWeb3Modal({
  ethersConfig,
  chains: [sepolia],
  projectId,
});

async function getProvider() {
   if (!window.ethereum) {
    throw new Error("Wallet not connected");
  }
  return new ethers.BrowserProvider(window.ethereum);
}

async function getSigner() {
  const provider = await getProvider();
  return await provider.getSigner();
}

async function connectWallet() {
  try {
    await modal.open();

    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        if (window.ethereum) {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();

            if (accounts.length > 0) {
              clearInterval(interval);
              resolve(accounts[0].address);
            }
          } catch (e) {}
        }
      }, 300);
    });

  } catch (err) {
    console.error("Wallet connection error:", err);
    return null;
  }
}

export { getProvider, getSigner, connectWallet };
