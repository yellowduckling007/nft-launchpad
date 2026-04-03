import { useNavigate } from "react-router-dom";
import { connectWallet } from "./utils/wallet";

function LandingPage({ walletAddress, setWalletAddress }) {
    const navigate = useNavigate();

    const handleConnectWallet = async () => {
        const address = await connectWallet();
        if (address) {
            setWalletAddress(address);
        }
    };

    return (
        <div className="app-root">

            <div className="top-bar">
                <div className="brand-mark">✦ MintNFT</div>
                <div className="top-bar-right">
                    {walletAddress && (
                        <button
                            className="btn-ghost top-bar-link"
                            onClick={() => navigate("/dashboard")}
                        >
                            My Collections
                        </button>
                    )}
                    <button className="wallet-pill" onClick={handleConnectWallet}>
                        {walletAddress
                            ? <><span className="wallet-dot" />{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</>
                            : "Connect Wallet"}
                    </button>
                </div>
            </div>

            <main className="landing">

                {/* HERO */}
                <section className="hero">
                    <h1>MintNFT</h1>
                    <p>
                        Deploy powerful NFT smart contracts with custom mint rules,
                        royalties and supply control — in minutes.
                    </p>
                    <button className="btn-primary" onClick={() => navigate("/create")}>
                        Launch Collection →
                    </button>
                    <a href="/existing" className="btn-secondary">
                        Already Have a Collection ?
                    </a>

                </section>

                {/* FEATURES */}
                <section className="features">
                    <div className="card card-hover feature-card">
                        <h3>No Coding <br />Required</h3>
                        <p>
                            Create your own NFT smart contract without writing a single line of code.
                            We handle the technical complexity for you.
                        </p>
                    </div>

                    <div className="card card-hover feature-card">
                        <h3>Your Rules, Your Collection</h3>
                        <p>
                            Decide how your NFTs are minted, priced, and distributed —
                            all through simple guided steps.
                        </p>
                    </div>

                    <div className="card card-hover feature-card">
                        <h3>Launch With Confidence</h3>
                        <p>
                            Your contract is deployed directly from your wallet,
                            securely on the Ethereum blockchain.
                        </p>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="footer">
                    <p>© 2026 MintNFT — Built on Sepolia test net</p>
                </footer>

            </main>
        </div>
    );
}

export default LandingPage;