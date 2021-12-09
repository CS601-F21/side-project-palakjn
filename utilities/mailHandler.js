require('dotenv').config();
const nodemailer = require("nodemailer");

getSubject = function() { 
    return "Your photos are ready!"
}

getMailBody = function(userName, clientName, link) {
    var message = "Hello " + clientName + ",\n\n";
    message = message.concat("We hope you are having a productive day.\n\n");
    message = message.concat(userName);
    message = message.concat(" has shared photos with you. Click on the link below. It will re-direct you to the page where you will see all the photos. Select the photos which you want to be printed on the album and then click on the 'Submit' button.\n\n");
    message = message.concat(link);
    message = message.concat("\n\n");
    message = message.concat("Best Regards,\n");
    message = message.concat("Easy Share\n");
    message = message.concat(process.env.GMAIL_USERNAME);
    
    return message;
}

module.exports = {
    //Reference: https://dev.to/sudarshansb143/send-mail-using-node-js-and-gmail-in-few-simple-steps-4n79

    sendMail: async function (email, userName, clientName, link) {
        let mailTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: process.env.GMAIL_USERNAME,
                pass: process.env.GMAIL_PASSWORD,
            },
        });        

        let mailDetails = {
            from: process.env.GMAIL_USERNAME,
            to: email,
            subject: getSubject(),
            text: getMailBody(userName, clientName, link),
        };

        return await mailTransporter.sendMail(mailDetails);
    }    
};