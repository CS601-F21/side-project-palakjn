require('dotenv').config();
const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = {

    createContainer: async function(name) {
        // Create the BlobServiceClient object which will be used to create a container client
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_CONNECTION_STRING);

        // Create a unique name for the container
        const containerName = name;

        console.log('\nCreating container...');
        console.log('\t', containerName);

        // Get a reference to a container
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Create the container
        const createContainerResponse = await containerClient.create();
        console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);
    }

}