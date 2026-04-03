import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "./utils/supabase";
import ArtistNFT from "./abi/ArtistNFT.json";
import { connectWallet, getReadyProvider } from "./utils/wallet";

function CreatorProfilePage({ walletAddress, setWalletAddress }) {
    const { address } = useParams();
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleConnectWallet = async () => {
        const addr = await connectWallet();
        if (addr) setWalletAddress(addr);
    };

    useEffect(() => {
        fetchPublicCollections();
    }, [address]);

    const fetchPublicCollections = async () => {
        setIsLoading(true);
        try {
            // Step 1: Get PUBLIC ART collections from Supabase
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .eq('wallet_address', address.toLowerCase())
                .ilike('mint_mode', 'PUBLIC')
                .ilike('nft_type', 'ART')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Step 2: Enrich with blockchain + IPFS data
            const provider = await getReadyProvider();

            const enriched = await Promise.all(
                data.map(async (col) => {
                    try {
                        const contract = new ethers.Contract(
                            col.contract_address,
                            ArtistNFT.abi,
                            provider
                        );

                        // Blockchain data
                        const [totalMinted, maxSupply, mintPrice, baseURI] = await Promise.all([
                            contract.totalMinted(),
                            contract.maxSupply(),
                            contract.mintPrice(),
                            contract.baseURI(),
                        ]);

                        // IPFS preview image — fetch first NFT metadata
                        let previewImage = null;
                        if (baseURI) {
                            try {
                                const res = await fetch(`${baseURI}1.json`);
                                const metadata = await res.json();
                                previewImage = metadata.image;
                            } catch {
                                previewImage = null;
                            }
                        }

                        return {
                            ...col,
                            totalMinted: Number(totalMinted),
                            maxSupply: Number(maxSupply),
                            mintPrice: ethers.formatEther(mintPrice),
                            previewImage,
                        };
                    } catch {
                        return {
                            ...col,
                            totalMinted: 0,
                            maxSupply: 0,
                            mintPrice: "0",
                            previewImage: null,
                        };
                    }
                })
            );

            setCollections(enriched);
        } catch (err) {
            console.error("Failed to fetch collections:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-root">

            <div className="top-bar">
                <div className="brand-mark" onClick={() => navigate("/")}>✦ MintNFT</div>
                <div />
                <button className="wallet-pill" onClick={handleConnectWallet}>
                    {walletAddress
                        ? <><span className="wallet-dot" />{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</>
                        : "Connect Wallet"}
                </button>
            </div>

            <main className="profile-page">

                <div className="profile-header">
                    <h1 className="headline text-gold">Creator Portfolio</h1>
                    <p className="subline">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                    <div className="profile-stats">
                        <span>{collections.length} Public Collections</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="status-banner status-deploying">
                        <span className="spinner" />
                        Loading collections...
                    </div>
                ) : collections.length === 0 ? (
                    <div className="glass-form" style={{ textAlign: "center", padding: "3rem" }}>
                        <p style={{ color: "var(--silver-dim)" }}>
                            No public art collections found for this creator.
                        </p>
                    </div>
                ) : (
                    <div className="profile-grid">
                        {collections.map((col) => (
                            <div
                                key={col.id}
                                className="profile-card"
                                onClick={() => navigate(`/public/${col.contract_address}`)}
                            >
                                {/* Background image */}
                                <div
                                    className="profile-card-bg"
                                    style={{
                                        backgroundImage: col.previewImage
                                            ? `url(${col.previewImage})`
                                            : "none"
                                    }}
                                />

                                {/* Overlay with details */}
                                <div className="profile-card-overlay">
                                    <div className="profile-card-info">
                                        <h3>{col.collection_name}</h3>
                                        <div className="profile-card-meta">
                                            <span>{col.mintPrice} ETH</span>
                                            <span>{col.totalMinted} / {col.maxSupply}</span>
                                        </div>
                                    </div>
                                    <div className="profile-card-btn">
                                        Mint →
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default CreatorProfilePage;