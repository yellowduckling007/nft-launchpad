
function CollectionForm({collection, handlechange, handleSubmit, nftType}) {
    return (
        <form onSubmit={handleSubmit} className="glass-form">
        <div className="form-layout">
        <label>Collection Name:</label> 
        <input className="input"
        type="text" 
        value={collection.name} 
        name="name"
        onChange={handlechange} 
        placeholder="Enter your collection name" 
        />
        <br />

        <label>Symbol:</label>
        <input className="input"
        type="text"
        value={collection.symbol}
        name="symbol"
        onChange={handlechange}
        placeholder="Enter your collection symbol"
        />
        <br />

        <label>Max Supply:</label>
        <input className="input"
        type="number"
        value={collection.maxSupply}
        name="maxSupply"
        onChange={handlechange}
        placeholder="Enter your collection max supply"
        />
        <br />

        {nftType === "ART" && (
        <>
        <label>Royalty (%):</label>
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
      </>
    )}
        <br />

        </div>
      </form>

    );
}

export default CollectionForm;