import { ethers } from "ethers";

function getProvider() {
    if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask to use this app.");
        return null;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
}

async function getSigner() {
    const provider = getProvider();
    if (!provider) {
        return null;
    }
    const signer = await provider.getSigner();
    return signer;
}

async function connectWallet() {
    const provider = getProvider();
    if (!provider){  
        return null;  
    }  
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0];
}   

export { getProvider, getSigner, connectWallet };
