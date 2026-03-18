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
    // Desktop
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      return accounts[0];
    }

    // Mobile → open modal
    await modal.open();

    return null;

  } catch (err) {
    console.error(err);
    return null;
  }
}  

export { getProvider, getSigner, connectWallet };
