const cors = require('cors');
const express = require('express');
const path = require('path');

function applyMiddleware(app) {
  // Enable CORS
  app.use(cors());

  // Parse JSON bodies
  app.use(express.json());

  // Serve static images folder
  app.use('/images', express.static(path.join(__dirname, 'images')));
}

module.exports = applyMiddleware;
