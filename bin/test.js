const https = require('https');
const fs = require('fs');
const app = require('../app');

const privateKey = fs.readFileSync('/etc/letsencrypt/live/bgc-atlas.cs.uni-tuebingen.de/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/bgc-atlas.cs.uni-tuebingen.de/fullchain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate
};

const port = 3000; // Use a different port than 443 for local testing

const server = https.createServer(credentials, app);

server.listen(port, () => {
    console.log(`Server running locally on port ${port}`);
});