import { useNavigate, useSearchParams } from "react-router-dom";
import { connectWallet } from "./utils/wallet";

function ExistingContractPage({ walletAddress, setWalletAddress, theme, toggleTheme }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawURI = searchParams.get("uri");
  const metadataURI = rawURI ? decodeURIComponent(rawURI) : null;

  const handleConnectWallet = async () => {
    const address = await connectWallet();
    if (address) setWalletAddress(address);
  };

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

      <main className="main-content">
        <div className="page-header">
          <h1 className="headline text-gold">Existing Contract</h1>
          <p className="subline">Enter your deployed contract address to continue</p>
        </div>

        <div className="glass-form">
          <div className="form-layout">
            <label>Contract Address</label>
            <input
              className="input"
              type="text"
              placeholder="0x..."
              onBlur={(e) => {
                const addr = e.target.value.trim();
                if (addr) {
                  if (metadataURI) {
                    navigate(`/collection/${addr}?uri=${encodeURIComponent(metadataURI)}`);
                  } else {
                    navigate(`/collection/${addr}`);
                  }
                }
              }}
            />
          </div>
        </div>

        <button className="btn-ghost" onClick={() => {
          if (metadataURI) {
            navigate(`/start?uri=${encodeURIComponent(metadataURI)}`);
          } else {
            navigate("/start");
          }
        }}>
          ← Back
        </button>

      </main>
    </div>
  );
}

export default ExistingContractPage;