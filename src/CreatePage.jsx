import CollectionForm from './CollectionForm';
import NFTtype from "./NFTtype";
import Mintmode from "./Mintmode";
import ArtistNFT from "./abi/ArtistNFT.json";
import { ethers } from 'ethers';
import { useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { connectWallet, getSigner } from './utils/wallet';

function CreatePage({ walletAddress, setWalletAddress }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawURI = searchParams.get("uri");

  let metadataURI = null;

  if (rawURI) {
    try {
      metadataURI = decodeURIComponent(rawURI);
    } catch {
      metadataURI = rawURI; // already decoded
    }
  }

  const contractABI = ArtistNFT.abi;
  const contractByteCode = ArtistNFT.bytecode;
  const NFT_TYPE = {
    ART: 0,
    UTILITY: 1,
  };
  const MINT_MODE = {
    CREATOR_ONLY: 0,
    PUBLIC: 1,
  };

  const [collection, setCollection] = useState({ name: "", symbol: "", maxSupply: "", royalty: "" });
  const [contractAddress, setContractAddress] = useState("");
  const [deployStatus, setDeployStatus] = useState("idle"); // idle | deploying | success | error | cancelled
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [nftType, setNftType] = useState(null); // "ART" | "UTILITY"
  const [mintMode, setMintMode] = useState(null); // "CREATOR_ONLY" | "PUBLIC"
  const [mintPrice, setMintPrice] = useState("");
  const [transferable, setTransferable] = useState(true);

  const isFormValid =
    collection.name &&
    collection.symbol &&
    collection.maxSupply &&
    (nftType === "UTILITY" || collection.royalty);

  const canDeploy =
    nftType &&
    isFormValid &&
    mintMode &&
    (mintMode !== "PUBLIC" || mintPrice !== "");

  const handlechange = (e) => {
    const { name, value } = e.target;
    setCollection(prev => ({ ...prev, [name]: value }));
  };

  const handleConnectWallet = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
    }
  };

  const deployContract = async () => {
    const nftTypeEnum = nftType === "ART" ? NFT_TYPE.ART : NFT_TYPE.UTILITY;
    const mintModeEnum =
      mintMode === "CREATOR_ONLY"
        ? MINT_MODE.CREATOR_ONLY
        : MINT_MODE.PUBLIC;

    const mintPriceWei =
      mintModeEnum === MINT_MODE.PUBLIC
        ? ethers.parseEther(mintPrice)
        : 0;                // must be 0 for CREATOR_ONLY


    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    try {
      setDeployStatus("deploying");
      setErrorMessage("");

      const signer = await getSigner();
      const factory = new ethers.ContractFactory(contractABI, contractByteCode, signer);

      const royaltyBps = Math.floor(Number(collection.royalty) * 100);
      const maxSupplyInt = Number(collection.maxSupply);

      const contract = await factory.deploy(
        collection.name,
        collection.symbol,
        maxSupplyInt,
        walletAddress,
        royaltyBps,
        nftTypeEnum,
        mintModeEnum,
        mintPriceWei,
        transferable
      );


      await contract.waitForDeployment();
      setContractAddress(contract.target);
      setDeployStatus("success");

    } catch (error) {
      const isUserRejected = error?.code === 4001 || error?.message?.includes("User denied");
      if (isUserRejected) {
        setDeployStatus("cancelled");
        setErrorMessage("Transaction cancelled by user.");
      } else {
        setDeployStatus("error");
        setErrorMessage("Deployment failed. Please try again.");
      }
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setCollection({ name: "", symbol: "", maxSupply: "", royalty: "" });
    setContractAddress("");
    setDeployStatus("idle");
    setErrorMessage("");
  };

  const currentStep =
    !nftType ? 1 :
      !isFormValid ? 2 :
        !mintMode ? 3 :
          4;
  
  
  return (
    <div className="app-root">

      {/* Top Bar */}
      <div className="top-bar">
        <div className="brand-mark">✦ MintNFT</div>
        {deployStatus !== "success" && (
          <div className="progress-wrapper">
            <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
              <span>Choose Type</span>
            </div>
            <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
              <span>Details</span>
            </div>
            <div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
              <span>Mint Rules</span>
            </div>
            <div className={`progress-step ${currentStep >= 4 ? "active" : ""}`}>
              <span>Deploy</span>
            </div>
          </div>
        )}

        <button
          className="wallet-pill"
          onClick={() => {
            handleConnectWallet();
          }}
        >
          {walletAddress
            ? <><span className="wallet-dot" />{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</>
            : "Connect Wallet"}
        </button>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {deployStatus !== "success" ? (
          <>
            <div className="page-header">
              <h1 className="headline text-gold">Create Collection</h1>
              <p className="subline">Deploy your NFT contract in seconds</p>
            </div>

            <NFTtype nftType={nftType} setNftType={setNftType} />

            {nftType && (
              <CollectionForm
                collection={collection}
                handlechange={handlechange}
                handleSubmit={(e) => e.preventDefault()}
                nftType={nftType}
              />
            )}

            {nftType && isFormValid && (
              <Mintmode
                mintMode={mintMode}
                setMintMode={setMintMode}
                mintPrice={mintPrice}
                setMintPrice={setMintPrice}
                transferable={transferable}
                setTransferable={setTransferable}
                nftType={nftType}
              />
            )}


            {/* Status Messages */}
            {deployStatus === "deploying" && (
              <div className="status-banner status-deploying">
                <span className="spinner" />
                Confirm transaction in MetaMask…
              </div>
            )}
            {deployStatus === "error" && (
              <div className="status-banner status-error">⚠ {errorMessage}</div>
            )}
            {deployStatus === "cancelled" && (
              <div className="status-banner status-cancelled">✕ {errorMessage}</div>
            )}

            {nftType && isFormValid && (
              <button
                className="btn-deploy btn-primary"
                onClick={deployContract}
                disabled={!canDeploy || deployStatus === "deploying"}
              >
                {deployStatus === "deploying" ? (
                  <><span className="spinner" />Deploying…</>
                ) : (
                  "Deploy Contract →"
                )}
              </button>
            )}
          </>
        ) : (
          /* Success State */
          <div className="success-wrapper">
            <div className="card success-card">
              <div className="success-icon">✦</div>
              <h2 className="success-title text-gold">Collection Live</h2>
              <p className="success-subtitle">Your contract is deployed and ready to mint.</p>

              <div className="address-block">
                <span className="address-label">Contract Address</span>
                <span className="address-value">{contractAddress}</span>
              </div>

              <div className="success-actions">
                <button className="btn-gold btn-primary" onClick={copyAddress}>
                  {copied ? "✓ Copied" : "Copy Address"}
                </button>
                <a
                  className="btn-outline"
                  href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Etherscan ↗
                </a>
              </div>

              <button className="btn-deploy btn-primary"
                onClick={() => {
                  if (metadataURI) {
                    navigate(`/collection/${contractAddress}?uri=${metadataURI}`);
                  } else {
                    navigate(`/collection/${contractAddress}`);
                  }
                }}
              >
                Proceed to Mint NFT →
              </button>

              <button className="btn-ghost" onClick={resetForm}>
                ← Create Another Collection
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CreatePage;