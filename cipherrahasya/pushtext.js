const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');

const text = process.argv[2];

if (!fs.existsSync('.jwt.cipherrahasya') || !fs.existsSync('.secret.cipherrahasya')) {
  console.log('JWT token or secret key not found.');
  process.exit(1);
}

const jwtToken = fs.readFileSync('.jwt.cipherrahasya', 'utf-8').trim();
const secretKey = fs.readFileSync('.secret.cipherrahasya', 'utf-8').trim();

const cipher = crypto.createCipher('aes-256-cbc', secretKey);
let encryptedText = cipher.update(text, 'utf8', 'hex');
encryptedText += cipher.final('hex');

axios.post('http://localhost:8081/pushtext', { jwtValue: jwtToken, text: encryptedText })
  .then(() => {
    console.log('Text pushed successfully.');
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
