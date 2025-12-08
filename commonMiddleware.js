// IMPORTS
const express = require('express');
const cors = require('cors');
const path = require('path');

// EXPORT MIDDLEWARE FUNCTION
module.exports = function (app) {

  // Enable CORS
  app.use(cors());

  // Parse JSON bodies
  app.use(express.json());

  // Serve static images
  app.use(
    '/images',
    express.static(path.join(__dirname, '../images'))
  );
};
