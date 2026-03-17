import { useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { ethers } from "ethers";
import ArtistNFT from "./abi/ArtistNFT.json";
import { PinataSDK } from "pinata-web3";
import { getSigner } from "./utils/wallet";
import { connectWallet } from './utils/wallet';

function CollectionPage({ walletAddress, setWalletAddress }) {
    const { address } = useParams();

    const [searchParams] = useSearchParams();


    const [contractOwner, setContractOwner] = useState("");
    const [contractMintMode, setContractMintMode] = useState("");
    const [contractMintPrice, setContractMintPrice] = useState("");
    const [contractNftType, setContractNftType] = useState("");
    const [totalMinted, setTotalMinted] = useState(0);
    const [maxSupply, setMaxSupply] = useState(0);
    const [images, setImages] = useState([]);
    const [baseCID, setBaseCID] = useState("");
    const [isPreparing, setIsPreparing] = useState(false);
    const [collectionDescription, setCollectionDescription] = useState("");
    const [collectionName, setCollectionName] = useState("");
    const [metadataURI, setMetadataURI] = useState("");
    const [isMintingCreator, setIsMintingCreator] = useState(false);


    useEffect(() => {
        const fetchContractDetails = async () => {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(address, ArtistNFT.abi, provider);

            const name = await contract.name();
            console.log("Collection Name:", name);
            const owner = await contract.owner();
            console.log("Contract Owner:", owner);
            const mintMode = await contract.mintMode();
            console.log("Mint Mode:", mintMode);
            const mintPrice = await contract.mintPrice();
            console.log("Mint Price:", mintPrice);
            const nftType = await contract.nftType();
            console.log("NFT Type:", nftType);
            const totalMinted = await contract.totalMinted();
            console.log("Total Minted:", totalMinted);
            const maxSupply = await contract.maxSupply();
            console.log("Max Supply:", maxSupply);

            setContractOwner(owner);
            setContractMintMode(Number(mintMode));
            setContractMintPrice(ethers.formatEther(mintPrice));
            setContractNftType(Number(nftType));
            setTotalMinted(Number(totalMinted));
            setMaxSupply(Number(maxSupply));
            setCollectionName(name);

            console.log("Mint Mode:", mintMode);
            console.log("NFT Type:", nftType);

        };

        fetchContractDetails();

        const uri = searchParams.get("uri");
        if (uri) {
            setMetadataURI(uri);
        }
    }, [address, searchParams]);


    const handleMultipleUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
    };

    const handleConnectWallet = async () => {
        const address = await connectWallet();
        if (address) {
            setWalletAddress(address);
        }
    };

    const prepareCollection = async () => {
        if (images.length === 0) {
            alert("Upload images first");
            return;
        }
        if (images.length > maxSupply) {
            alert(`You uploaded ${images.length} images but max supply is ${maxSupply}`);
            return;
        }
        if (!collectionDescription) {
            alert("Please add a collection description");
            return;
        }
        setIsPreparing(true);
        try {
            /* ----------Upload Images ---------- */
            const imageCIDs = [];
            images.forEach(img => console.log(img, img instanceof File));
            for (const file of images) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch(
                    "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
                        },
                        body: formData,
                    }
                );
                const data = await response.json();
                imageCIDs.push(data.IpfsHash);
            }
            console.log("Image CIDs:", imageCIDs);
            /* ----------Create Metadata Files ---------- */
            const metadataFiles = imageCIDs.map((cid, index) => {

                const metadata = {
                    name: `${collectionName} #${index + 1}`,
                    description: collectionDescription,
                    image: `https://rose-mad-hawk-257.mypinata.cloud/ipfs/${cid}`,
                    attributes: []
                };

                return new File(
                    [JSON.stringify(metadata)],
                    `${index + 1}.json`,
                    { type: "application/json" }
                );

            });

            /* ----------upload Metadata Folder ---------- */
            const pinata = new PinataSDK({
                pinataJwt: import.meta.env.VITE_PINATA_JWT
            });
            const result = await pinata.upload.fileArray(metadataFiles);
            const folderCID = result.IpfsHash;
            setBaseCID(folderCID);
            console.log("Metadata Folder CID:", folderCID);
            /* ----------Set baseURI ---------- */
            const baseURI = `https://rose-mad-hawk-257.mypinata.cloud/ipfs/${folderCID}/`;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(address, ArtistNFT.abi, signer);
            const tx = await contract.setBaseURI(baseURI);
            await tx.wait();

            setIsPreparing(false);
            alert("Collection prepared successfully!");

        } catch (error) {
            console.error(error);
            setIsPreparing(false);
            alert("Error preparing collection");
        }
    };




    const mintCreatorNFT = async () => {
        if (!metadataURI) {
            alert("Please enter metadata URI");
            return;
        }

        setIsMintingCreator(true);
        const signer = await getSigner();
        const contract = new ethers.Contract(address, ArtistNFT.abi, signer);
        const tx = await contract.creatorMint(await signer.getAddress(), metadataURI);
        await tx.wait();
        alert("NFT minted successfully!");
        const minted = await contract.totalMinted();
        setTotalMinted(Number(minted));
        setIsMintingCreator(false);
        setMetadataURI("");
    };



    return (
        <div className="main-content">

            <div className="top-bar">
                <div className="brand-mark">✦ MintNFT</div>
                <div></div>
                <button className="wallet-pill" onClick={handleConnectWallet}>
                    {walletAddress
                        ? <><span className="wallet-dot" />{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</>
                        : "Connect Wallet"}
                </button>
            </div>

            <div className="page-header">
                <h1 className="headline text-gold">Collection Manager</h1>
                <p className="subline">Prepare and manage your NFT collection</p>
            </div>
            {/* Main Layout */}
            <div className="collection-layout">
                <div className="card card-hover collection-info">

                    <h3>Collection Info</h3>

                    <p><span>Contract</span>{address.slice(0, 6)}...{address.slice(-4)}</p>
                    <p><span>Name</span>{collectionName}</p>
                    <p><span>Mint Mode</span>{contractMintMode === 0 ? "CREATOR ONLY" : "PUBLIC"}</p>
                    <p><span>NFT Type</span>{contractNftType === 0 ? "ART" : "UTILITY"}</p>
                    <p><span>Total Minted</span>{totalMinted}</p>
                    <p><span>Max Supply</span>{maxSupply}</p>
                    <p><span>Mint Price</span>{contractMintPrice} ETH</p>

                </div>

                {contractMintMode === 1 && contractNftType === 0 && (
                    <div className="card card-hover collection-upload">
                        <h3>Prepare Collection</h3>
                        <div className="form-group">
                            <label>Collection Description</label>

                            <textarea
                                id="collectionDescription"
                                placeholder="Describe your NFT collection"
                                value={collectionDescription}
                                onChange={(e) => setCollectionDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Upload Images</label>

                            <input class="input"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleMultipleUpload}
                            />

                            <div className="upload-stats">
                                <span>Images: {images.length}</span>
                                <span>Edition size: {maxSupply}</span>
                            </div>

                        </div>

                        <button
                            className="btn-primary prepare-btn"
                            onClick={prepareCollection}
                            disabled={isPreparing}
                        >
                            {isPreparing ? "Preparing..." : "Prepare Collection"}
                        </button>

                        {baseCID && (
                            <div className="collection-ready">
                                <p>Collection prepared successfully</p>

                                <a href={`/public/${address}`}>
                                    Open Public Mint Page →
                                </a>
                            </div>
                        )}


                    </div>

                )}

            

            {contractMintMode === 0 && contractNftType === 0 && (

                <div className="card card-hover creator-mint">

                    <h3>Creator Mint</h3>

                    <div className="form-group">
                        <label>Metadata URI</label>

                        <input className="input"
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

                </div>

            )}


            {contractMintMode === 1 && contractNftType === 1 && (
                <p>Public Utility Mode</p>
            )}
        </div>

        </div>
    );
}


export default CollectionPage;
