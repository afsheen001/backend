
// IMPORTS

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');

// APP SETUP

const app = express();
const PORT = 3000;


// MIDDLEWARE

app.use(cors());
app.use(express.json());