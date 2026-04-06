import { useParams, useSearchParams,useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ArtistNFT from "./abi/ArtistNFT.json";
import { PinataSDK } from "pinata-web3";
import { getSigner, connectWallet, getReadyProvider } from "./utils/wallet";
import { uploadFileToIPFS, uploadMetadata, uploadMetadataFolder } from "./utils/pinata";
import CreatorMint from "./CreatorMint";

function CollectionPage({ walletAddress, setWalletAddress }) {
    const navigate = useNavigate();
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
    const [isCollectionPrepared, setIsCollectionPrepared] = useState(false);
    const [mintModeUI, setMintModeUI] = useState("manual");
    const [isMintingCreator, setIsMintingCreator] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [utilityImage, setUtilityImage] = useState(null);
    const [previewData, setPreviewData] = useState(null);

    const [mintSuccess, setMintSuccess] = useState(false);
    const [mintedTokenId, setMintedTokenId] = useState(null);

    useEffect(() => {
        const fetchContractDetails = async () => {
            try {
                setIsLoading(true);
                const provider = await getReadyProvider();
                const contract = new ethers.Contract(address, ArtistNFT.abi, provider);

                const name = await contract.name();
                const owner = await contract.owner();
                const mintMode = await contract.mintMode();
                const mintPrice = await contract.mintPrice();
                const nftType = await contract.nftType();
                const totalMinted = await contract.totalMinted();
                const maxSupply = await contract.maxSupply();
                const baseURI = await contract.baseURI();

                setContractOwner(owner);
                setContractMintMode(Number(mintMode));
                setContractMintPrice(ethers.formatEther(mintPrice));
                setContractNftType(Number(nftType));
                setTotalMinted(Number(totalMinted));
                setMaxSupply(Number(maxSupply));
                setCollectionName(name);

                if (baseURI && baseURI !== "") {
                    setMetadataURI(`${baseURI}1.json`);
                    setIsCollectionPrepared(true);
                }

            }
            catch (error) {
                console.error("Error fetching contract details:", error);
                alert("Failed to load collection details. Please try again.");
            }
            finally {
                setIsLoading(false);
            }
        };

        fetchContractDetails();

        const uri = searchParams.get("uri");
        if (uri) {
            try {
                const decoded = decodeURIComponent(uri);
                setMetadataURI(decoded);
                setMintModeUI("auto");
            } catch {
                setMetadataURI(uri);
                setMintModeUI("auto");
            }
        }
    }, [address, searchParams]);





    useEffect(() => {
        const loadPreview = async () => {
            setPreviewData(null);
            if (!metadataURI) {

                return;
            }

            try {
                const res = await fetch(metadataURI);
                const data = await res.json();
                setPreviewData(data);
            } catch (err) {
                console.error("Preview load failed");
            }
        };

        loadPreview();
    }, [metadataURI]);





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
            /*Upload Images*/
            const imageCIDs = [];
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
            /*Create Metadata Files*/
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

            /*upload Metadata Folder*/
            const pinata = new PinataSDK({
                pinataJwt: import.meta.env.VITE_PINATA_JWT
            });
            const result = await pinata.upload.fileArray(metadataFiles);
            const folderCID = result.IpfsHash;

            /* Set baseURI */
            const baseURI = `https://rose-mad-hawk-257.mypinata.cloud/ipfs/${folderCID}/`;

            const signer = await getSigner();

            const contract = new ethers.Contract(address, ArtistNFT.abi, signer);
            const tx = await contract.setBaseURI(baseURI);
            await tx.wait();

            setIsPreparing(false);
            alert("Collection prepared successfully!");
            setBaseCID(folderCID);
            setIsCollectionPrepared(true);


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

        try {
            setIsMintingCreator(true);

            const signer = await getSigner();
            const contract = new ethers.Contract(address, ArtistNFT.abi, signer);
            const alreadyUsed = await contract.usedMetadata(metadataURI);

            if (alreadyUsed) {
                alert("This NFT is already minted. Use a different metadata.");
                setIsMintingCreator(false);
                return;
            }


            const tx = await contract.creatorMint(
                await signer.getAddress(),
                metadataURI
            );

            const receipt = await tx.wait();

            // Extract tokenId from Transfer event
            const event = receipt.logs.find(
                log => log.fragment && log.fragment.name === "Transfer"
            );

            const tokenId = event?.args?.tokenId?.toString();

            // fallback (safe)
            const finalTokenId = tokenId || (await contract.totalMinted()).toString();

            setMintedTokenId(finalTokenId);
            setMintSuccess(true);


            const minted = await contract.totalMinted();
            setTotalMinted(Number(minted));

            setMetadataURI("");

        } catch (error) {
            const isUserRejected =
                error?.code === 4001 ||
                error?.code === "ACTION_REJECTED" ||
                error?.message?.toLowerCase().includes("user denied");

            if (isUserRejected) {
                alert("Transaction cancelled by user.");
            } else {
                console.error("Mint error:", error);
                alert("Mint failed. Please try again.");
            }
        } finally {
            setIsMintingCreator(false);
        }
    };




    const generateMetadataURI = async () => {
        if (!collectionDescription) {
            alert("Please add description");
            return;
        }
        try {
            setIsMintingCreator(true);

            // Upload image
            let imageURL = "";
            if (utilityImage) {
                imageURL = await uploadFileToIPFS(utilityImage);
            }

            // Create metadata
            const metadata = {
                name: collectionName || "Utility NFT",
                description: collectionDescription,
                image: imageURL,
            };

            const metadataFile = new File(
                [JSON.stringify(metadata)],
                "metadata.json",
                { type: "application/json" }
            );

            // Upload metadata
            const metadataURI = await uploadMetadata(metadataFile);
            setMetadataURI(metadataURI);
            setMintModeUI("auto");
            setCollectionDescription("");
            setUtilityImage(null);

        } catch (err) {
            console.error(err);
            alert("upload failed");
        } finally {
            setIsMintingCreator(false);
        }
    };





    const prepareUtilityCollection = async () => {
        if (!collectionDescription) {
            alert("Please add description");
            return;
        }

        try {
            setIsPreparing(true);

            let imageURL = "";

            // Upload image
            if (utilityImage) {
                imageURL = await uploadFileToIPFS(utilityImage);
            }

            //Create metadata
            const metadata = {
                name: collectionName || "Utility NFT",
                description: collectionDescription,
                image: imageURL,
            };

            const metadataFile = new File(
                [JSON.stringify(metadata)],
                "1.json",
                { type: "application/json" }
            );

            const folderCID = await uploadMetadataFolder([metadataFile]);
            const baseURI = `https://rose-mad-hawk-257.mypinata.cloud/ipfs/${folderCID}/`;

            // SET BASE URI
            const signer = await getSigner();
            const contract = new ethers.Contract(address, ArtistNFT.abi, signer);

            const tx = await contract.setBaseURI(baseURI);
            await tx.wait();

            setMetadataURI(`${baseURI}1.json`);

            setIsCollectionPrepared(true);
            setIsPreparing(false);

            alert("Utility collection ready!");

        } catch (err) {
            console.error(err);
            setIsPreparing(false);
            alert("Preparation failed");
        }
    };


    if (isLoading) {
        return (
            <div className="main-content">
                <div className="status-banner status-deploying">
                    <span className="spinner" />
                    Loading your collection...
                </div>
            </div>
        );
    }


    return (
        <div className="main-content">

            <div className="top-bar">
                <div className="brand-mark" onClick={() => navigate("/")}>✦ MintNFT</div>
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

                    <p><span>Contract</span>{address.slice(0, 10)}...{address.slice(-4)}</p>
                    <p><span>Name</span>{collectionName}</p>
                    <p><span>Mint Mode</span>{contractMintMode === 0 ? "CREATOR ONLY" : "PUBLIC"}</p>
                    <p><span>NFT Type</span>{contractNftType === 0 ? "ART" : "UTILITY"}</p>
                    <p><span>Total Minted</span>{totalMinted}</p>
                    <p><span>Max Supply</span>{maxSupply}</p>
                    {contractMintMode === 0 ? (
                        <p><span>Mint Mode</span>Creator Only (No Price)</p>
                    ) : (
                        <p><span>Mint Price</span>{contractMintPrice} ETH</p>
                    )}

                </div>

                {contractMintMode === 1 && contractNftType === 0 && !isCollectionPrepared && (
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
                    </div>
                )}

                {contractMintMode === 1 && contractNftType === 0 && isCollectionPrepared && (
                    <div className="card creator-mint">
                        <p>Collection prepared</p>

                        <a href={`/public/${address}`} className="btn-deploy btn-primary">
                            Open Public Mint Page →
                        </a>
                    </div>
                )}



                {contractMintMode === 0 && contractNftType === 0 && (
                    mintSuccess ? (

                        // SUCCESS CARD 
                        <div className="card card-hover success-card">

                            <h3 className="text-gold">NFT Minted Successfully!</h3>

                            <p><span>Token ID</span> #{mintedTokenId}</p>

                            <p>
                                <span>Contract</span>
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </p>

                            <div className="success-actions">

                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        setMintSuccess(false);
                                        setMetadataURI("");
                                        setMintModeUI("manual");
                                    }}
                                >
                                    Mint Again?
                                </button>
                            </div>

                            <div className="hint-box">
                                <p>Can't see your NFT in your wallet ?</p>
                                <small>
                                    Import using contract address + token ID in MetaMask
                                </small>
                            </div>

                        </div>

                    ) : (

                        <CreatorMint
                            mintModeUI={mintModeUI}
                            metadataURI={metadataURI}
                            previewData={previewData}
                            setMetadataURI={setMetadataURI}
                            setMintModeUI={setMintModeUI}
                            mintCreatorNFT={mintCreatorNFT}
                            generateMetadataURI={generateMetadataURI}
                            isMintingCreator={isMintingCreator}
                            collectionDescription={collectionDescription}
                            setCollectionDescription={setCollectionDescription}
                            setUtilityImage={setUtilityImage}
                        />
                    )
                )}



                {contractMintMode === 1 && contractNftType === 1 && !isCollectionPrepared && (
                    <div className="card card-hover collection-upload">
                        <h3>Setup Utility NFT</h3>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                placeholder="Describe what this NFT gives access to"
                                value={collectionDescription}
                                onChange={(e) => setCollectionDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Upload Image (optional)</label>
                            <input
                                className="input"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setUtilityImage(e.target.files[0])}
                            />
                        </div>

                        <button
                            className="btn-primary prepare-btn"
                            onClick={prepareUtilityCollection}
                            disabled={isPreparing}
                        >
                            {isPreparing ? "Preparing..." : "Create Collection"}
                        </button>
                    </div>
                )}

                {contractMintMode === 1 && contractNftType === 1 && isCollectionPrepared && (
                    <div className="card creator-mint">
                        <p>Your NFT collection is ready!</p>

                        <a href={`/utility/${address}?uri=${encodeURIComponent(metadataURI)}`} className="btn-deploy btn-primary">
                            Open Public Mint Page →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CollectionPage;
