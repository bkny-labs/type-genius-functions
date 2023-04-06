// Add Express
const express = require('express');

// Initialize Express
const app = express();

// Create GET request
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Initialize server
const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`Running on port ${port}.`);
});
