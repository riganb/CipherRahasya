const axios = require('axios');
const fs = require('fs');

const username = process.argv[2];
const password = process.argv[3];

axios.post('http://localhost:8081/sign', { username, password })
  .then(response => {
    if (response.data.jwtValue) {
      fs.writeFileSync('.jwt.cipherrahasya', response.data.jwtValue);
      console.log('JWT token stored successfully.');
    } else {
      console.log('Error:', response.data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
