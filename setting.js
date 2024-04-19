const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.SETTINGPORT; // Port number

const uri = process.env.DB_URL; // Connection URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
const corsOptions = process.env.CORSOPTION;
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    masAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const ifNotLoggedin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.status(401).json({ message: 'You are not logged in' });
    }
    next();
};

const ifLoggedin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.status(401).json({ message: 'You are already logged in' });
    }
    next();
}

async function run() {
    try {
        await client.connect(); // Connect to the MongoDB instance
        console.log('Connected to the MongoDB database');

        // Define routes
        app.get('/', ifNotLoggedin, async (req, res, next) => {
            const db = client.db('UserDB');
            const collection = db.collection('Log');
            const user = await collection.findOne({ username: req.session.username });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: `Hello, ${user.username}` });
        });

        app.post('/account', ifLoggedin, [ 
        ], async (req, res) => {
            const db = client.db('UserDB');
            const collection = db.collection('dashboard');
            const { userID, status } = req.body;
            const user = await collection.findOne({ userID, status });
            if (!user) {
                return res.status(404).json({ error: 'Account not found' });
            }
        });
    
        app.listen(port, () => {
            console.log(`Server running on port http://localhost:${port}`);
        });
        } catch (error) {
                console.error('Error:', error);
        }
}

run().catch(console.error);
