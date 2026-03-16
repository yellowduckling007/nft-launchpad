import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ArtistNFT from "./abi/ArtistNFT.json";
import { connectWallet } from './utils/wallet';
import { getSigner } from "./utils/wallet";

function PublicMintPage() {

    const { address } = useParams();

    const [collectionName, setCollectionName] = useState("");
    const [mintPrice, setMintPrice] = useState("0");
    const [totalMinted, setTotalMinted] = useState(0);
    const [maxSupply, setMaxSupply] = useState(0);
    const [isMinting, setIsMinting] = useState(false);
    const [nfts, setNfts] = useState([]);
    const [collectionDescription, setCollectionDescription] = useState("");
    const [creatorAddress, setCreatorAddress] = useState("");
    const [walletAddress, setWalletAddress] = useState("");

    const handleConnectWallet = async () => {
        const address = await connectWallet();
        if (address) {
            setWalletAddress(address);
        }
    };

    useEffect(() => {

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(address, ArtistNFT.abi, provider);

        const fetchData = async () => {

            const name = await contract.name();
            const price = await contract.mintPrice();
            const minted = await contract.totalMinted();
            const max = await contract.maxSupply();
            const baseURI = await contract.baseURI();
            const owner = await contract.owner();

            setCollectionName(name);
            setMintPrice(ethers.formatEther(price));
            setTotalMinted(Number(minted));
            setMaxSupply(Number(max));
            setCreatorAddress(owner);

            const items = [];

            for (let i = 1; i <= max; i++) {

                const response = await fetch(`${baseURI}${i}.json`);
                const metadata = await response.json();

                if (i === 1) {
                    setCollectionDescription(metadata.description);
                }

                items.push({
                    tokenId: i,
                    image: metadata.image,
                    name: metadata.name,
                    minted: i <= minted
                });

            }

            setNfts(items);
            console.log("NFTs:", items);

        };

        fetchData();

        contract.on("Transfer", async (from, to, tokenId) => {
            if (from === ethers.ZeroAddress) {
                console.log("New NFT minted:", tokenId.toString());
                const minted = await contract.totalMinted();
                setTotalMinted(Number(minted));

                setNfts(prev =>
                    prev.map(nft =>
                        nft.tokenId <= minted
                            ? { ...nft, minted: true }
                            : nft
                    )
                );
            }

        });

        return () => {
            contract.removeAllListeners("Transfer");
        };

    }, [address]);

    const handleMint = async () => {
        if (!walletAddress) {
            alert("Please connect your wallet first.");
            return;
        }
        try {
            setIsMinting(true);
            const signer = await getSigner();
            if (!signer) {
                alert("Wallet connection failed.");
                setIsMinting(false);
                return;
            }
            const contract = new ethers.Contract(address, ArtistNFT.abi, signer);

            const price = await contract.mintPrice();
            const tx = await contract.publicMint({ value: price });

            await tx.wait();
            alert("NFT Minted!");

            const minted = await contract.totalMinted();
            setTotalMinted(Number(minted));

            setIsMinting(false);

        } catch (err) {
            if (err.code === "ACTION_REJECTED" || err.code === 4001) {
                console.log("User rejected transaction");
                alert("Transaction cancelled");
            } else {
                console.error("Mint error:", err);
                alert("Mint failed. Please try again.");
            }
            setIsMinting(false);
        }
    }

    return (
        <div className="app-root">
            <div className="top-bar">
                <div className="brand-mark">✦ MintX</div>
                <button className="wallet-pill" onClick={handleConnectWallet}>
                    {walletAddress
                        ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)
                        : "Connect Wallet"}
                </button>
            </div>

            <main className="mint-page">
                <div className="collection-header">
                    <h1 className="collection-name">{collectionName}</h1>
                    <p className="collection-desc">{collectionDescription}</p>

                    <div className="collection-meta">
                        <div className="meta-item">
                            <span className="meta-label">Created by</span>
                            <a
                                href={`https://sepolia.etherscan.io/address/${creatorAddress}`}
                                target="_blank"
                                className="meta-value creator-link"
                            >
                                {creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}
                            </a>
                        </div>

                        <div className="meta-item">
                            <span className="meta-label">Contract</span>
                            <a
                                href={`https://sepolia.etherscan.io/address/${address}`}
                                target="_blank"
                                className="meta-value"
                            >
                                {address.slice(0, 6)}...{address.slice(-4)} ↗
                            </a>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Mint Price</span>
                            <span className="meta-value">{mintPrice} ETH</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Minted</span>
                            <span className="meta-value">{totalMinted} / {maxSupply}</span>
                        </div>
                    </div>

                    <button
                        className="btn-deploy"
                        onClick={handleMint}
                        disabled={isMinting}
                    >
                        {isMinting ? "Minting..." : "Mint next NFT"}
                    </button>
                </div>

                {/* COLLECTION GRID */}
                <div className="collection-section">
                    <h2 className="section-heading">Items</h2>
                    <div className="nft-grid">
                        {nfts.map((nft) => (
                            <div key={nft.tokenId} className="nft-card">
                                <img src={nft.image} alt={nft.name} />
                                <p>{nft.name}</p>
                                {nft.minted && <span className="minted-label">Minted</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PublicMintPage;