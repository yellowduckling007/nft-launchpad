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
  url: "https://nft-launchpad-one.vercel.app",
  icons: []
};

const ethersConfig = defaultConfig({ metadata });

createWeb3Modal({
  ethersConfig,
  chains: [sepolia],
  projectId,
});

const web3Modal = new web3modal({
    cacheProvider: true,
});

function isMobile() {
  return /iPhone|iPad|Android/i.test(navigator.userAgent);
}


async function getProvider() {
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
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();

  } catch (err) {
    console.error(err);
    return null;
  }
}   

export { getProvider, getSigner, connectWallet };
