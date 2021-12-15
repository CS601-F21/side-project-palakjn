require('dotenv').config();
const { BlobServiceClient } = require("@azure/storage-blob");
const StringBuffer  = require("./stringHandler");

/**
 * Get the container client
 */
getContainerClient = function(containerName) {    
    // Create the BlobServiceClient object which will be used to create a container client
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_CONNECTION_STRING);

    // Get a reference to a container and return it
    return blobServiceClient.getContainerClient(containerName);
}

/**
 * Get the blob client
 */
getBlobClient = function(containerName, blobName) {
    return getContainerClient(containerName).getBlockBlobClient(blobName);
}

/**
 * Creates the entire AZURE blob URL to access the particular blob 
 */
getBlobUrl = function(containerName, blobName) {
    var buffer = new StringBuffer();
    buffer.append(process.env.AZURE_URL);
    buffer.append(containerName);
    buffer.append("/");
    buffer.append(blobName);
    buffer.append(process.env.SAS_TOKEN);

    return buffer.toString();
}

/**Convertes Stream to buffer and return the promise object */
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

    /**
     * Creates the container with the provided name
     * @param {*} containerName 
     */
    createContainer: async function(containerName) {
        console.log('\nCreating container...');
        console.log('\t', containerName);   

        // Create the container
        let containerClient = getContainerClient(containerName);     
        const createContainerResponse = await containerClient.create();
        console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);
    },

    /**
     * Creates the blob with the given name inside the given container
     * @param {*} containerName 
     * @param {*} blobName 
     * @param {*} fileLocation 
     */
    createBlob: async function(containerName, blobName, fileLocation) {
        const uploadBlobResponse =  await getBlobClient(containerName, blobName).uploadFile(fileLocation + "\\" + blobName);   
        console.log("Blob was uploaded successfully. requestId: ", uploadBlobResponse.requestId);     
    },

    /**
     * Lists all the blobs inside the given container name
     * @param {*} containerName 
     * @returns 
     */
    getBlobs: async function(containerName) {
        let containerClient = getContainerClient(containerName);

        let allBlobs = [];

        let blobs = await containerClient.listBlobsFlat();

        for await (const blob of blobs) {
            allBlobs.push({ "url": getBlobUrl(containerName, blob.name)});
        }

        return allBlobs;
    },

    /**
     * Download the given blob in the specified container to a given file location
     * @param {*} containerName 
     * @param {*} fileLocation 
     * @param {*} blobName 
     */
    downloadBlobToFile: async function(containerName, fileLocation, blobName) {
        let containerClient = getContainerClient(containerName);

        const uploadBlobResponse =  await getBlobClient(containerName, blobName).downloadToFile(fileLocation + "\\" + blobName);
        console.log("Blob was downloaded successfully. requestId: ", uploadBlobResponse.requestId); 
    },

    /**
     * Download the given blob in the specified container to a buffer
     * @param {*} containerName 
     * @param {*} blobName 
     * @returns 
     */
    downloadBlobToBuffer: async function(containerName, blobName) {
        let containerClient = getContainerClient(containerName);

        const downloadBlockBlobResponse = await getBlobClient(containerName, blobName).download();
        return await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    },

    /**
     * Delete the specified container
     * @param {*} containerName 
     */
    deleteContainer: async function(containerName) {
        let containerClient = getContainerClient(containerName);
        await containerClient.delete(); 
    }
}