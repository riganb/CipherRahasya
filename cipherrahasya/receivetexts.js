const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');

if (!fs.existsSync('.jwt.cipherrahasya') || !fs.existsSync('.secret.cipherrahasya')) {
  console.log('JWT token or secret key not found.');
  process.exit(1);
}

const jwtToken = fs.readFileSync('.jwt.cipherrahasya', 'utf-8').trim();
const secretKey = fs.readFileSync('.secret.cipherrahasya', 'utf-8').trim();

axios.post('http://localhost:8081/receivetexts', { jwtValue: jwtToken })
  .then(response => {
    const texts = response.data.texts;
    texts.forEach((encryptedText, index) => {
      const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
      let decryptedText = decipher.update(encryptedText, 'hex', 'utf8');
      decryptedText += decipher.final('utf8');
      console.log(`${index + 1} -> Encrypted text: "${encryptedText}"`);
      console.log(`Decrypted text: "${decryptedText}"`);
    });
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
