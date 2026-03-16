import { useNavigate } from "react-router-dom";

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="app-root">

            <div className="top-bar">
                <div className="brand-mark">✦ MintNFT</div>
                <div></div>
                <button className="wallet-pill">Connect Wallet</button>
            </div>

            <main className="landing">

                {/* HERO */}
                <section className="hero">
                    <h1>MintNFT</h1>
                    <p>
                        Deploy powerful NFT smart contracts with custom mint rules,
                        royalties and supply control — in minutes.
                    </p>
                    <button onClick={() => navigate("/create")}>
                        Launch Collection →
                    </button>
                </section>

                {/* FEATURES */}
                <section className="features">
                    <div className="feature-card">
                        <h3>No Coding <br/>Required</h3>
                        <p>
                            Create your own NFT smart contract without writing a single line of code.
                            We handle the technical complexity for you.
                        </p>
                    </div>

                    <div className="feature-card">
                        <h3>Your Rules, Your Collection</h3>
                        <p>
                            Decide how your NFTs are minted, priced, and distributed —
                            all through simple guided steps.
                        </p>
                    </div>

                    <div className="feature-card">
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