function CollectionForm({collection, handlechange, handleSubmit, nftType}) {
    return (
        <form onSubmit={handleSubmit} className="glass-form">
        <div className="form-layout">

        <label>Collection Name</label>
        <input className="input"
        type="text" 
        value={collection.name} 
        name="name"
        onChange={handlechange} 
        placeholder="e.g. Cosmic Apes, Pixel Punks" 
        />
        <small className="field-hint">The name of your NFT collection</small>

        <label>Symbol</label>
        <input className="input"
        type="text"
        value={collection.symbol}
        name="symbol"
        onChange={handlechange}
        placeholder="e.g. CAPE, PPNK"
        />
        <small className="field-hint">A short ticker for your collection — like a stock symbol. Usually 3-5 letters.</small>

        <label>Max Supply</label>
        <input className="input"
        type="number"
        value={collection.maxSupply}
        name="maxSupply"
        onChange={handlechange}
        placeholder="e.g. 100"
        min="1"
        />
        <small className="field-hint">Total number of NFTs that can ever exist in this collection.</small>

        {nftType === "ART" && (
        <>
        <label>Royalty (%)</label>
        <input className="input"
        type="number"
          value={collection.royalty}
        name="royalty"
        onChange={handlechange}
        placeholder="e.g. 5"
        step="0.01"
        min="0"
        max="10"
        />
        <small className="field-hint">% you earn every time your NFT is resold on a marketplace. Max 10%.</small>
      </>
    )}

        </div>
      </form>
    );
}

export default CollectionForm;