Easy Share
============

### Project Description:
***
Memories are timeless treasures of the heart. Happy times come and go, but the memories stay forever. A photograph keeps a moment from running away. 
Currently the photographers share photos in a Traditional ways due to which they face a lot of challenges <br/>
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;* Photographer clicks more than 1k photos and those photos are RAW and not edited. <br/>
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;* It will take a lot of time for the photographer to edit such a huge number of photos when the client only wants a subset of them in an album.<br/>
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;* Best case is when photographer share raw photos with the customer and customer will select the photos they like<br/>
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;* In such case, the photographer will edit only the photos which customers like to be in an album<br/>
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;* Usually, photographer and customer lives far away from one another. So, a normal issue comes up how the photographer will share photos with the customer.<br/>
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;* One traditional approach is to use pendrive<br/>
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; Two problems with the traditional approach is <br/>
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;- Have to send Pendrive physically which involves delay<br/>
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;- Uneasy for customers to select photos as they have to note down the photo filenames. <br/>                               
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;* Some people use Cloud storage directly like google drive to share photos with the customer.<br/>
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; One problem with this <br/>
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;- Uneasy for the customer to select photos<br/>
<br/>
Our application EasyShare provides an easy and simple solution to photographers to share photos with the customer and gives customers an easy approach to view and select photos.<br/>

### Features of the web application:
***

| Feature         | Description |
| ------- |-------------| 
| Login With Username and password | Authenticating users with provided username and password. Ensuring that passwords are not stored as a String in a database. Instead, using Salting and hashing technique to encrypt the password. |
| Authentication with Google |	Authenticating users to authenticate themselves through third party i.e. Google |
| View Clients | Displaying details of all the clients which a user has. |
| Create Client | Creating new client by entering all appropriate detail. |
| Delete Client | Deleting client information from database and the container assigned for the client. |
| Add photos (per client) | Adding photos to the client folder with whom the user wants to share with.  |
| View photos per client | Displaying all the photos for the client |
| Send photos to the client | Creating a form which will display all the photos which user has uploaded for the client and sharing the link of the form with the client via mail.  |
| Viewing and selecting the photos by Client | <ul><li>Client will receive the link from photographer (user of our application).</li><li>The form will allow the client to select any number of photos</li><li>The form will be submitted only once by that shared link. Multiple attempts are prohibited.</li><li> If client wants to select photos again then the client has to request photographer to send the new link again</li> </ul> |
| Viewing all the messages	| Displaying all the messages stating that response received from the clients. |
| Viewing all the photos being selected by client | Once received the message that client XYZ has submitted form then, displaying the photos which are being selected/chosen by client XYZ.  [There can be zero photos] |
| Download the photos chosen by client | Allowing user to download the photos which are being selected by client. | 
| View profile | Allowing user to view personal account information |
| Update profile | Allowing user to update personal account information |
| Change password | Allowing user to change the password if the user is not being authenticated by google user. |


### How to run
***

Pre-requisite: Below services need to be up and running in order for the application to run

    1) [node.js](https://nodejs.org/en/)
    2) [MongoDB](https://www.mongodb.com/try/download/community)

Steps:
  
    1)	Download the zip.
    2)	Open command prompt and cd to the location where you have downloaded the project
    3)	type “npm install” --> It will download the dependencies
    4)  Create one file with the exact name as ".env" with below attributes. keep the left side of = as intact, change the value of the right side of = sign
        SECRET= <ANY RANDOM LONG STRING>
        DB_HOST= <URL OF THE DB SERVER>
        PORT= PORT NUMBER WHICH YOUR SERVER RUNNING ON

        CLIENT_ID= <GOOGLE CLIENT ID>
        CLIENT_SECRET= <GOOGLE SECRET KEY>

        AZURE_CONNECTION_STRING= <AZURE CONNECTION STRING>
        SAS_TOKEN= <AZURE SAS TOKEN>

        AZURE_URL= <AZURE URL OF THE STORAGE>

        GMAIL_USERNAME= <PHOTOGRAPHER EMAIL ID>
        GMAIL_PASSWORD= <PHOTOGRAPHER PASSWORD>

    5)	then, type “node server.js” --> It will start the server
    6)	Go to browser and type http://localhost:<PORT NUMBER YOU MENTIONED IN .env FILE>/

### Time Taken for the project to be complete
***

| Functionality | Time took |
| ------------- | :-------: |
| Learning phase: <br /> >> I took “The complete web development course” in Udemy which was 55 total hours long. <br /> But I watched only the subset of videos which I needed for side project |	40 hours |
| To design the whole project – rough planning |1 hours |
| Design home page | 2 hours |
| Design login page | 30 minutes |
| Design register page | 30 minutes |
| Design dashboard navigation page | 30 minutes |
| Authentication using username and password	| 2 hours |
| Authentication (Using sign in/up option with google): | 1 hour |
| Authentication: handling errors <br /> >> [To figure out proper approach via passport.js to find out if user is authorized or not in order to render <br /> login page with the error message. Found the answer in this link good](https://github.com/jaredhanson/passport-local/issues/4) | 1 hour |
| Authentication: Refactoring codebase | 30 minutes |
| Authentication: using environment file to keep secret: | 15 minutes |
| Displaying user name in dashboard page | 15 minutes |
| Option for user to create folders for each client | 1 hour |
| Designing a page which will display all client folders | 1 hour |
| Creating Azure blob containers whenever new client folder is created | 30 minutes |
| Exploring an option to receive file content from Azure blob | 1.5 hours |
| Per client, showing an option to upload photos | 10 minutes |
| Uploading photos to azure blob | 3 hours |
| Displaying all the photos uploaded to azure blob | 2 hours |
| Send page: Coming up with the logic | 20 minutes |
| Send page: Sending mail via nodemailer | 1 hour |
| Send page: Displaying all the photos to client when the client clicks on the shared link | 3 hours |
| Send page: Creating a file having file names which user selected and then uploading it to Azure | 1 hour |
| Designing Message page | 1 hour |
| Displaying all the messages: "read" mails in "read" section and "unread" in "unread" section: | 2 hours |
| Designing page which will display selected photos with download: | 1 hour |
| Integrating the design with the project: | 15 minutes |
| Downloading the images: | 2 hours |

