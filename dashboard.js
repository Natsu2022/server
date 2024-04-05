const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app
const app = express();
const port = 8001; // Port number

const uri = 'mongodb+srv://frontendtest:nsFj9F7YTW2BvnwZ@cluster.3nvsqiu.mongodb.net/'; // Connection URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
const corsOptions = {
    origin: 'http://localhost:????',
    credentials: true,
    methods: ['GET', 'POST']
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
