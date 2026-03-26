function NFTTypeSelector({ nftType, setNftType }) {
  return (
    <div className="nft-type-section">
      <h2 className="text-gold">What are you creating?</h2>
      <p className="nft-type-subtext">
        Choose the type that best matches how your NFTs will be used.
      </p>

      <div className="nft-type-cards">
        <div
          className={`card card-hover nft-type-card ${nftType === "ART" ? "active" : ""}`}
          onClick={() => setNftType("ART")}
        >
          <h3>Art NFT</h3>
          <p>Images, PFPs, collectibles</p>
        </div>

        <div
          className={`card card-hover nft-type-card ${nftType === "UTILITY" ? "active" : ""}`}
          onClick={() => setNftType("UTILITY")}
        >
          <h3>Utility NFT</h3>
          <p>Tickets, access passes</p>
        </div>
      </div>
    </div>
  );
}

export default NFTTypeSelector;
