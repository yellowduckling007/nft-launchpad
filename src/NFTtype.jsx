function NFTTypeSelector({ nftType, setNftType }) {
  return (
    <div className="nft-type-section">
      <h2 className="nft-type-heading">What are you creating?</h2>
      <p className="nft-type-subtext">
        Choose the type that best matches how your NFTs will be used.
      </p>

      <div className="nft-type-cards">
        <div
          className={`nft-type-card ${nftType === "ART" ? "active" : ""}`}
          onClick={() => setNftType("ART")}
        >
          <div className="nft-type-icon"></div>
          <h3>Art NFT</h3>
          <p>Images, PFPs, collectibles</p>
        </div>

        <div
          className={`nft-type-card ${nftType === "UTILITY" ? "active" : ""}`}
          onClick={() => setNftType("UTILITY")}
        >
          <div className="nft-type-icon"></div>
          <h3>Utility NFT</h3>
          <p>Tickets, access, certificates</p>
        </div>
      </div>
    </div>
  );
}

export default NFTTypeSelector;
