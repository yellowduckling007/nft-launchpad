import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectWallet } from "./utils/wallet";
import { supabase } from "./utils/supabase";

function DashboardPage({ walletAddress, setWalletAddress, theme, toggleTheme }) {
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleConnectWallet = async () => {
        const address = await connectWallet();
        if (address) setWalletAddress(address);
    };

    useEffect(() => {
        if (walletAddress) {
            fetchCollections();
        }
    }, [walletAddress]);

    const fetchCollections = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('collections')
                .select('*')
                .eq('wallet_address', walletAddress.toLowerCase())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCollections(data);
        } catch (err) {
            console.error("Failed to fetch collections:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-root">

            <div className="top-bar">
                <div className="brand-mark">✦ MintNFT</div>
                <div />
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

            <main className="main-content">
                <div className="page-header">
                    <h1 className="headline text-gold">My Collections</h1>
                    <p className="subline">All your deployed NFT contracts</p>
                    {walletAddress && (
                        <button
                            className="btn-outline"
                            style={{ marginTop: "1rem" }}
                            onClick={() => navigate(`/creator/${walletAddress}`)}
                        >
                            View My Public Profile →
                        </button>
                    )}
                </div>

                {!walletAddress ? (
                    <div className="card glass-form" style={{ textAlign: "center", padding: "3rem" }}>
                        <p style={{ marginBottom: "1.5rem", color: "var(--silver-dim)" }}>
                            Connect your wallet to see your collections
                        </p>
                        <button className="btn-primary btn-gold" onClick={handleConnectWallet}>
                            Connect Wallet
                        </button>
                    </div>
                ) : isLoading ? (
                    <div className="status-banner status-deploying">
                        <span className="spinner" />
                        Loading your collections...
                    </div>
                ) : collections.length === 0 ? (
                    <div className="card glass-form" style={{ textAlign: "center", padding: "3rem" }}>
                        <p style={{ color: "var(--silver-dim)", marginBottom: "1.5rem" }}>
                            No collections found. Deploy your first one!
                        </p>
                        <button
                            className="btn-primary btn-deploy"
                            onClick={() => navigate("/create")}
                        >
                            Create Collection →
                        </button>
                    </div>
                ) : (
                    <div className="dashboard-grid">
                        {collections.map((col) => (
                            <div
                                key={col.id}
                                className="card card-hover dashboard-card"
                                onClick={() => navigate(`/collection/${col.contract_address}`)}
                            >
                                <div className="dashboard-card-header">
                                    <h3>{col.collection_name}</h3>
                                    <span className={`nft-type-badge ${col.nft_type.toLowerCase()}`}>
                                        {col.nft_type}
                                    </span>
                                </div>
                                <div className="dashboard-contract-row">
                                    <span className="dashboard-contract">
                                        {col.contract_address.slice(0, 10)}...{col.contract_address.slice(-6)}
                                    </span>
                                    <div className="dashboard-contract-actions">
                                        <button
                                            className="icon-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(col.contract_address);
                                            }}
                                            title="Copy address"
                                        >
                                            ⧉
                                        </button>

                                        <a href={`https://sepolia.etherscan.io/address/${col.contract_address}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="icon-btn"
                                            title="View on Etherscan"
                                        >
                                            ↗
                                        </a>
                                    </div>
                                </div>
                                <div className="dashboard-meta">
                                    <span>{col.mint_mode === "CREATOR_ONLY" ? "Creator Only" : "Public Mint"}</span>
                                    <span>{new Date(col.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default DashboardPage;