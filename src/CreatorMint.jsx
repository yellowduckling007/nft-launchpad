function CreatorMint({
    mintModeUI,
    metadataURI,
    previewData,
    setMetadataURI,
    setMintModeUI,
    mintCreatorNFT,
    generateMetadataURI,
    isMintingCreator,
    collectionDescription,
    setCollectionDescription,
    setUtilityImage
}) {
    return (
        <div className="card card-hover creator-mint">

            <h3>Creator Mint</h3>

            {/* Preview (common) */}
            {previewData && (
                <div className="preview-box">
                    <img
                        src={previewData.image}
                        alt="NFT Preview"
                        className="preview-img"
                    />
                </div>
            )}

            {/* AUTO */}
            {mintModeUI === "auto" && metadataURI && (
                <>
                    <input className="input" value={metadataURI} readOnly />

                    <button
                        className="btn-gold btn-primary"
                        onClick={mintCreatorNFT}
                        disabled={isMintingCreator}
                    >
                        {isMintingCreator ? "Minting..." : "Mint NFT"}
                    </button>

                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setMetadataURI("");
                            setMintModeUI("manual");
                        }}
                    >
                        Start Over
                    </button>
                </>
            )}

            {/* MANUAL */}
            {mintModeUI === "manual" && (
                <>
                    <div className="form-group">
                        <label>Add your asset Metadata URI</label>

                        <input
                            className="input"
                            type="text"
                            placeholder="Paste metadata URI"
                            value={metadataURI}
                            onChange={(e) => setMetadataURI(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn-gold btn-primary"
                        onClick={mintCreatorNFT}
                        disabled={isMintingCreator}
                    >
                        {isMintingCreator ? "Minting..." : "Mint NFT"}
                    </button>

                    <button
                        className="btn-secondary"
                        onClick={() => setMintModeUI("generate")}
                    >
                        don't have metadata ? Generate it here
                    </button>
                </>
            )}

            {/* GENERATE */}
            {mintModeUI === "generate" && (
                <>
                    <div className="form-group">
                        <label>Upload Image</label>
                        <input
                            className="input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setUtilityImage(e.target.files[0])}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Describe your NFT"
                            value={collectionDescription}
                            onChange={(e) => setCollectionDescription(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn-primary"
                        onClick={generateMetadataURI}
                        disabled={isMintingCreator}
                    >
                        {isMintingCreator ? "Processing..." : "Generate Metadata"}
                    </button>

                    <button
                        className="btn-secondary"
                        onClick={() => setMintModeUI("manual")}
                    >
                        Back
                    </button>
                </>
            )}

        </div>
    );
}

export default CreatorMint;