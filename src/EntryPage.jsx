import { useNavigate, useSearchParams } from "react-router-dom";
import { connectWallet } from "./utils/wallet";

function EntryPage({ walletAddress, setWalletAddress }) {
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
        <div />
        <button className="wallet-pill" onClick={handleConnectWallet}>
          {walletAddress
            ? <><span className="wallet-dot" />{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</>
            : "Connect Wallet"}
        </button>
      </div>

      <main className="main-content entry-content">
        <div className="page-header">
          <h1 className="headline text-gold">Get Started</h1>
          <p className="subline">Create a new collection or use an existing contract ?</p>
        </div>

        <div className="nft-type-cards">

          <div
            className="card card-hover nft-type-card"
            onClick={() => {
              if (metadataURI) {
                navigate(`/create?uri=${encodeURIComponent(metadataURI)}`);
              } else {
                navigate("/create");
              }
            }}
          >
            <h3>New Collection</h3>
            <p>Deploy a fresh NFT smart contract with your own rules</p>
          </div>

          <div
            className="card card-hover nft-type-card"
            onClick={() => {
              if (metadataURI) {
                navigate(`/existing?uri=${encodeURIComponent(metadataURI)}`);
              } else {
                navigate("/existing");
              }
            }}
          >
            <h3>Existing Contract</h3>
            <p>Mint into a contract you've already deployed</p>
          </div>

        </div>
      </main>

    </div>
  );
}

export default EntryPage;