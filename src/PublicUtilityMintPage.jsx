import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ArtistNFT from "./abi/ArtistNFT.json";
import { connectWallet, getSigner } from "./utils/wallet";

function PublicUtilityMintPage({ walletAddress, setWalletAddress }) {

    const { address } = useParams();
    const [searchParams] = useSearchParams();

    const [collectionName, setCollectionName] = useState("");
    const [mintPrice, setMintPrice] = useState("0");
    const [totalMinted, setTotalMinted] = useState(0);
    const [maxSupply, setMaxSupply] = useState(0);
    const [isMinting, setIsMinting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [metadata, setMetadata] = useState(null);

    const metadataURI = searchParams.get("uri");

    const handleConnectWallet = async () => {
        const addr = await connectWallet();
        if (addr) setWalletAddress(addr);
    };

    useEffect(() => {

        const fetchData = async () => {
            try{

            setIsLoading(true);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(address, ArtistNFT.abi, provider);

            const name = await contract.name();
            const price = await contract.mintPrice();
            const minted = await contract.totalMinted();
            const max = await contract.maxSupply();

            setCollectionName(name);
            setMintPrice(ethers.formatEther(price));
            setTotalMinted(Number(minted));
            setMaxSupply(Number(max));

            //FETCH SINGLE METADATA
            if (metadataURI) {
                const res = await fetch(metadataURI);
                const data = await res.json();
                setMetadata(data);
            }
            } catch (err) {
                console.error("Error fetching contract data:", err);
                alert("Failed to load collection data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, [address, metadataURI]);

    const handleMint = async () => {

        if (!walletAddress) {
            alert("Connect wallet first");
            return;
        }

        try {
            setIsMinting(true);

            const signer = await getSigner();
            const contract = new ethers.Contract(address, ArtistNFT.abi, signer);

            const price = await contract.mintPrice();

            const tx = await contract.publicMint({ value: price });
            await tx.wait();

            alert("NFT Minted!");

            const minted = await contract.totalMinted();
            setTotalMinted(Number(minted));

        } catch (err) {
            console.error(err);
            alert("Mint failed");
        } finally {
            setIsMinting(false);
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
                <div className="brand-mark">✦ MintNFT</div>
                <button className="wallet-pill" onClick={handleConnectWallet}>
                    {walletAddress
                        ? <><span className="wallet-dot" />{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</>
                        : "Connect Wallet"}
                </button>
            </div>

            <main className="mint-page">

                <div className="utility-header">
                    <h1 className="text-gold utility-title">{collectionName}</h1>
                    <p className="utility-desc">{metadata?.description}</p>
                </div>

                    <div className="utility-wrapper">

                        <div className="card utility-card">
                            {metadata?.image && (
                                <div className="image-container">
                                    <img src={metadata.image} alt="NFT" />
                                </div>
                            )}

                            <div className="meta-row">
                                <span>{mintPrice} ETH</span>
                                <span>{totalMinted} / {maxSupply}</span>
                            </div>

                            <button
                                className="btn-gold btn-primary utility-btn"
                                onClick={handleMint}
                                disabled={isMinting}
                            >
                                {isMinting ? "Minting..." : "Get Your NFT"}
                            </button>

                        </div>

                    </div>
            </main>
        </div>
    );
}

export default PublicUtilityMintPage;