import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ArtistNFT from "./abi/ArtistNFT.json";
import { connectWallet, getSigner, getReadyProvider } from './utils/wallet';
import { useRef } from "react";
import MediaRenderer from "./MediaRenderer";

async function safeFetch(url) {
    for (let i = 0; i < 3; i++) {
        try {
            const res = await fetch(url);
            if (res.ok) return res;
        } catch { }

        await new Promise(r => setTimeout(r, 1000));
    }
    throw new Error("Fetch failed");
}

function PublicMintPage({ walletAddress, setWalletAddress, theme, toggleTheme }) {

    const { address } = useParams();

    const [collectionName, setCollectionName] = useState("");
    const [mintPrice, setMintPrice] = useState("0");
    const [totalMinted, setTotalMinted] = useState(0);
    const [maxSupply, setMaxSupply] = useState(0);
    const [isMinting, setIsMinting] = useState(false);
    const [nfts, setNfts] = useState([]);
    const [collectionDescription, setCollectionDescription] = useState("");
    const [creatorAddress, setCreatorAddress] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [baseURI, setBaseURI] = useState("");
    const selectedNFTRef = useRef(null);
    const [isShared, setIsShared] = useState(false);

    useEffect(() => {
        selectedNFTRef.current = selectedNFT;
    }, [selectedNFT]);

    const handleConnectWallet = async () => {
        const address = await connectWallet();
        if (address) {
            setWalletAddress(address);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const provider = await getReadyProvider();
                const contract = new ethers.Contract(address, ArtistNFT.abi, provider);

                const fetchData = async () => {

                    setIsLoading(true);

                    let name, price, minted, max, baseURI, owner;

                    // Contract reads
                    try {
                        name = await contract.name();
                        price = await contract.mintPrice();
                        minted = await contract.totalMinted();
                        max = await contract.maxSupply();
                        baseURI = await contract.baseURI();
                        owner = await contract.owner();
                    } catch (err) {
                        console.error("Contract read failed", err);
                        setIsLoading(false);
                        return;
                    }

                    setCollectionName(name);
                    setMintPrice(ethers.formatEther(price));
                    setTotalMinted(Number(minted));
                    setMaxSupply(Number(max));
                    setCreatorAddress(owner);
                    setBaseURI(baseURI);

                    const items = [];

                    // Load NFTs
                    for (let i = 1; i <= max; i++) {
                        try {
                            const uri = `${baseURI}${i}.json`;

                            const response = await safeFetch(uri);
                            const metadata = await response.json();

                            let isMinted = false;

                            try {
                                isMinted = await contract.usedMetadata(uri);
                            } catch { }

                            items.push({
                                tokenId: i,
                                image: metadata.image,
                                name: metadata.name,
                                uri: uri,
                                minted: isMinted
                            });

                        } catch (err) {
                            console.warn("Skipping NFT", i);
                        }
                    }

                    setNfts(items);
                    setIsLoading(false);
                };

                await fetchData();

                // Event listener
                contract.on("Transfer", async (from) => {
                    if (from === ethers.ZeroAddress) {
                        const minted = await contract.totalMinted();
                        setTotalMinted(Number(minted));

                        if (selectedNFTRef.current) {
                            setNfts(prev =>
                                prev.map(nft =>
                                    nft.uri === selectedNFTRef.current.uri
                                        ? { ...nft, minted: true }
                                        : nft
                                )
                            );
                        }
                    }
                });

            } catch (err) {
                console.error("Init failed:", err);
            }
        };

        init();

    }, [address]);

    const handleMint = async () => {
        if (!selectedNFT) {
            alert("Please select an NFT first");
            return;
        }

        console.log("Minting URI:", selectedNFT.uri);
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
            console.log("Minting URI:", selectedNFT.uri);
            console.log("Selected NFT:", selectedNFT);
            const tx = await contract.publicMintSelected(selectedNFT.uri, {
                value: price
            });

            await tx.wait();
            alert("NFT Minted!");

            // update the minted state of the selected NFT immediately
            setNfts(prev =>
                prev.map(nft =>
                    nft.uri === selectedNFT.uri
                        ? { ...nft, minted: true }
                        : nft
                )
            );
            setSelectedNFT(null);  // deselect after mint
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
    const handleShare = async () => {
        const mintingPageUrl = `${window.location.origin}/public/${address}`;
        const deepLink = `https://metamask.app.link/dapp/${mintingPageUrl.replace('https://', '')}`;
        const previewImage = nfts.length > 0 ? nfts[0].image : "";
        try {
            const res = await fetch('https://hexahydrated-vonnie-heathiest.ngrok-free.dev/api/receive-mint-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' , 'x-api-key': 'unicart@' },
                body: JSON.stringify({ link: deepLink , title: collectionName , image: previewImage })
            });

            if (res.ok) {
                alert('Sent to marketing team!');
                setIsShared(true);
            } else {
                alert('Failed to notify marketing team.');
            }
        } catch (err) {
            console.error('Share error:', err);
            alert('Could not reach marketing system.');
        }
    };


    if (isLoading) {
        return (
            <div className="main-content">
                <div className="status-banner status-deploying">
                    <span className="spinner" />
                    Loading your collection...
                </div>
            </div>
        );
    }

    return (
        <div className="app-root">
            <div className="top-bar">
                <div className="brand-mark" onClick={() => navigate("/")}>✦ MintNFT</div>
                <div className="top-bar-right">
                    <div className="theme-toggle" onClick={toggleTheme}>
                        <span className="theme-icon">{theme === "dark" ? "☀" : "☾"}</span>
                    </div>
                    <button className="wallet-pill" onClick={handleConnectWallet}>
                        {walletAddress
                            ? <><span className="wallet-dot" />{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</>
                            : "Connect Wallet"}
                    </button>
                </div>
            </div>

            <main className="mint-page">
                <div className="collection-header">
                    <h1 className="collection-name text-gold">{collectionName}</h1>
                    <p className="collection-desc">{collectionDescription}</p>

                    <div className="collection-meta">
                        <div className="meta-item">
                            <span className="meta-label text-gold">Created by</span>
                            <a
                                href={`https://sepolia.etherscan.io/address/${creatorAddress}`}
                                target="_blank"
                                className="meta-value creator-link"
                            >
                                {creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}↗
                            </a>
                        </div>

                        <div className="meta-item">
                            <span className="meta-label text-gold">Contract</span>
                            <a
                                href={`https://sepolia.etherscan.io/address/${address}`}
                                target="_blank"
                                className="meta-value creator-link"
                            >
                                {address.slice(0, 6)}...{address.slice(-4)} ↗
                            </a>
                        </div>
                        <div className="meta-item text-gold ">
                            <span className="meta-label">Mint Price</span>
                            <span className="meta-value">{mintPrice} ETH</span>
                        </div>
                        <div className="meta-item text-gold">
                            <span className="meta-label">Minted</span>
                            <span className="meta-value">{totalMinted} / {maxSupply}</span>
                        </div>
                    </div>

                    <button
                        className="btn-primary btn-deploy"
                        onClick={handleMint}
                        disabled={isMinting || !selectedNFT}
                    >
                        {isMinting
                            ? "Minting..."
                            : selectedNFT
                                ? `Mint ${selectedNFT.name}`
                                : "Select an NFT to mint"}
                    </button>

                    {/* ADD THIS BELOW */}
                    {walletAddress?.toLowerCase() === creatorAddress?.toLowerCase() && (
                        <button
                            className="btn-outline"
                            onClick={handleShare}
                            style={{ marginTop: '0.75rem' }}
                            disabled={isShared}
                        >
                            {isShared ? "Already Shared ✓" : "Share to Marketing Team ↗"}
                        </button>
                    )}
                </div>

                {/* COLLECTION GRID */}
                <div className="collection-section">
                    <h2 className="section-heading">Items</h2>
                    <div className="nft-grid">
                        {nfts.map((nft) => (
                            <div
                                key={nft.tokenId}
                                className={`card card-hover nft-card ${selectedNFT?.tokenId === nft.tokenId ? "selected" : ""}`}
                                onClick={() => {
                                    console.log("Clicked NFT:", nft);
                                    if (!nft.minted) {
                                        setSelectedNFT(nft);
                                    }
                                }}
                            >
                                <MediaRenderer src={nft.image} alt={nft.name} />
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