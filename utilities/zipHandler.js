require('dotenv').config();
const AdmZip = require("adm-zip");
const storage = require("./storage");
const StringBuffer  = require("./stringHandler");

module.exports = {
    createZip: async function(filePath, containerName, photoUrls) {
        var zip = new AdmZip();

        for(let index = 0; index < photoUrls.length; index++) {
            let photoUrl = photoUrls[index];

            var buffer = new StringBuffer();
            buffer.append(process.env.AZURE_URL);
            buffer.append(containerName);
            buffer.append("/");

            photoUrl = photoUrl.replace(buffer.toString(), "");
            let blobName = photoUrl.replace(process.env.SAS_TOKEN, "");

            let buff = await storage.downloadBlobToBuffer(containerName, blobName);
            if(buff) {
                zip.addFile(blobName + ".png", buff);
            }    

            zip.writeZip(filePath);
        }
    }
}