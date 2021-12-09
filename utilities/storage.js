require('dotenv').config();
const { BlobServiceClient } = require("@azure/storage-blob");
const StringBuffer  = require("./stringHandler");

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
    var buffer = new StringBuffer();
    buffer.append(process.env.AZURE_URL);
    buffer.append(containerName);
    buffer.append("/");
    buffer.append(blobName);
    buffer.append(process.env.SAS_TOKEN);

    return buffer.toString();
}

streamToBuffer = async function(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on("error", reject);
    });
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
    },

    downloadBlobToFile: async function(containerName, fileLocation, blobName) {
        let containerClient = getContainerClient(containerName);

        const uploadBlobResponse =  await getBlobClient(containerName, blobName).downloadToFile(fileLocation + "\\" + blobName);
        console.log("Blob was downloaded successfully. requestId: ", uploadBlobResponse.requestId); 
    },

    downloadBlobToBuffer: async function(containerName, blobName) {
        let containerClient = getContainerClient(containerName);

        const downloadBlockBlobResponse = await getBlobClient(containerName, blobName).download();
        return await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    },

    deleteContainer: async function(containerName) {
        let containerClient = getContainerClient(containerName);
        await containerClient.delete(); 
    }
}