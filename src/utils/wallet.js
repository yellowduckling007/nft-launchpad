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

createWeb3Modal({
  ethersConfig,
  chains: [sepolia],
  projectId,
});

function isMobile() {
  return /iPhone|iPad|Android/i.test(navigator.userAgent);
}


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
    // Desktop: use MetaMask directly
    if (window.ethereum && !isMobile()) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      return accounts[0];
    }

    // Mobile OR fallback: use WalletConnect
    const modal = document.querySelector("w3m-modal");

    if (modal) {
      modal.open();
    } else {
      console.error("Web3Modal not initialized");
    }

    return null;

  } catch (err) {
    console.error(err);
    return null;
  }
}   

export { getProvider, getSigner, connectWallet };
