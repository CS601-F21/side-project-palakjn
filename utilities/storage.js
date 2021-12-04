require('dotenv').config();
const { BlobServiceClient } = require("@azure/storage-blob");

getContainerClient = function(containerName) {    
    // Create the BlobServiceClient object which will be used to create a container client
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_CONNECTION_STRING);

    // Get a reference to a container and return it
    return blobServiceClient.getContainerClient(containerName);
}

getBlobClient = function(containerName, blobName) {
    return getContainerClient(containerName).getBlockBlobClient(blobName);
}

getBlobUrl = function(containerName, blobName) {
    return process.env.AZURE_URL + containerName + "/" + blobName + process.env.SAS_TOKEN;
}

module.exports = {    

    createContainer: async function(containerName) {
        console.log('\nCreating container...');
        console.log('\t', containerName);   

        // Create the container
        let containerClient = getContainerClient(containerName);     
        const createContainerResponse = await containerClient.create();
        console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);
    },

    createBlob: async function(containerName, blobName, fileLocation) {
        const uploadBlobResponse =  await getBlobClient(containerName, blobName).uploadFile(fileLocation + "\\" + blobName);   
        console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);     
    },

    getBlobs: async function(containerName) {
        let containerClient = getContainerClient(containerName);

        let allBlobs = [];

        let blobs = await containerClient.listBlobsFlat();

        for await (const blob of blobs) {
            allBlobs.push({ "url": getBlobUrl(containerName, blob.name)});
        }

        return allBlobs;
    }
}