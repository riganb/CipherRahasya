const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 8081;

app.use(cors())

// MySQL Connection
const db = mysql.createConnection({
  host: '<enter-your-host>',
  user: '<enter-your-username>',
  password: '<enter-your-password>',
  database: '<enter-your-database>',
  port: 4000,
  ssl: true
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL');
});

// Middleware
app.use(express.json());

// JWT Secret Key
const secretKey = 'CipherRahasya789'; // You can generate a secure key using a library like crypto

// Endpoint: /sign
app.post('/sign', (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists
  db.query('SELECT * FROM users WHERE username = ?', username, (err, result) => {
    if (err) {
      throw err;
    }
    
    // If user doesn't exist, create a new user
    if (result.length === 0) {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          throw err;
        }
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err) => {
          if (err) {
            throw err;
          }
          // Create JWT
          const token = jwt.sign({ username, password }, secretKey);
          res.json({ jwtValue: token });
        });
      });
    } else {
      // If user exists, check password
      bcrypt.compare(password, result[0].password, (err, match) => {
        if (err) {
          throw err;
        }
        if (match) {
          // Correct password, create JWT
          const token = jwt.sign({ username, password }, secretKey);
          res.json({ jwtValue: token });
        } else {
          // Incorrect password
          res.status(401).json({ error: 'Could not log in, credentials incorrect' });
        }
      });
    }
  });
});

// Endpoint: /pushtext
app.post('/pushtext', (req, res) => {
  const { jwtValue, text } = req.body;

  // Verify JWT
  jwt.verify(jwtValue, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { username } = decoded;

    // Insert text into messages table
    db.query('INSERT INTO messages (username, text) VALUES (?, ?)', [username, text], (err) => {
      if (err) {
        throw err;
      }
      res.json({ message: 'Text pushed successfully' });
    });
  });
});

// Endpoint: /receivetexts
app.post('/receivetexts', (req, res) => {
  const { jwtValue } = req.body;

  // Verify JWT
  jwt.verify(jwtValue, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { username } = decoded;

    // Retrieve texts from messages table
    db.query('SELECT * FROM messages WHERE username = ? ORDER BY id DESC', username, (err, result) => {
      if (err) {
        throw err;
      }
      const texts = result.map(item => item.text);
      res.json({ texts: texts });
    });
  });
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
