import { use, useEffect } from "react";

function Mintmode({ mintMode, setMintMode, mintPrice, setMintPrice, transferable, setTransferable, nftType }) {

  useEffect(() => {
    if (nftType === "UTILITY") {
      setMintMode("PUBLIC");
    }
  }, [nftType]);

  return (
    <div className="mint-card card card-hover nft-type-card">
      <h4>Minting</h4>
      <p className="field-hint" style={{ marginBottom: "0.5rem" }}>
        Minting = creating an NFT on the blockchain. Choose who can mint from your collection.
      </p>

      {nftType === "UTILITY" && (
        <p className="mint-desc text-gold" style={{ marginBottom: "30px" }}>
          Utility NFTs are always publicly mintable by users.
        </p>
      )}

      {nftType !== "UTILITY" && (
        <label className="mint-row">
          <input
            type="radio"
            name="mintMode"
            checked={mintMode === "CREATOR_ONLY"}
            onChange={() => {
              setMintMode("CREATOR_ONLY");
              setMintPrice("0");
            }}
          />
          <div>
            <div className="mint-title">Creator Only</div>
            <div className="mint-desc">Only you can mint NFTs</div>
          </div>
        </label>
      )}

      <label className="mint-row">
        <input
          type="radio"
          name="mintMode"
          checked={mintMode === "PUBLIC" || nftType === "UTILITY"}
          onChange={() => setMintMode("PUBLIC")}
        />
        <div>
          <div className="mint-title">Public Mint</div>
          <div className="mint-desc">Anyone can mint by paying ETH</div>
        </div>
      </label>

      {(mintMode === "PUBLIC" || nftType === "UTILITY") && (
        <div className="mint-price">
          <label className="mint-price-label">Mint Price (ETH)</label>
          <input class="input"
            type="number"
            placeholder="eg: 0.01"
            value={mintPrice}
            min="0"
            step="0.0001"
            onChange={(e) => setMintPrice(e.target.value)}
          />
          {/*<small className="mint-price-hint">
            {Number(mintPrice) === 0
            ? "This will be a free public mint"
            : "Users will pay this amount to mint one NFT"}
        </small>*/}
        </div>
      )}
      <br />

      <h4>Transfer</h4>

      <label className="mint-row">
        <input
          type="checkbox"
          checked={transferable}
          onChange={(e) => setTransferable(e.target.checked)}
        />
        <div>
          <div className="mint-title">Transferable NFTs</div>
          <div className="mint-desc">Owners can transfer NFTs after mint</div>
        </div>
      </label>
    </div>
  );
}

export default Mintmode;