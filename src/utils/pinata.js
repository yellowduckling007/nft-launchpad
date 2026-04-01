import { PinataSDK } from "pinata-web3";

// Upload single file (image)
export async function uploadFileToIPFS(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
        },
        body: formData,
    });

    const data = await res.json();

    return `https://rose-mad-hawk-257.mypinata.cloud/ipfs/${data.IpfsHash}`;
}


// Upload single metadata file
export async function uploadMetadata(metadataFile) {
    const pinata = new PinataSDK({
        pinataJwt: import.meta.env.VITE_PINATA_JWT,
    });

    const result = await pinata.upload.file(metadataFile);

    return `https://rose-mad-hawk-257.mypinata.cloud/ipfs/${result.IpfsHash}`;
}


// Upload folder (for collection)
export async function uploadMetadataFolder(files) {
    const pinata = new PinataSDK({
        pinataJwt: import.meta.env.VITE_PINATA_JWT,
    });

    const result = await pinata.upload.fileArray(files);

    return result.IpfsHash;
}