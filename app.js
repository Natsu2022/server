const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT; // Port number

const uri = process.env.DB_URL; // Connection URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
const corsOptions = process.env.CORSOPTION;
app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/', (req, res) => {
    const data = {
        massage: "I am a server, server is running successfully!"
    };
    res.json(data);
});

async function run() {
    try {
        await client.connect(); // Connect to the MongoDB instance
        console.log('Connected to the MongoDB database');

        // Define routes
        app.post('/register', async (req, res) => {
            const { username, email, password } = req.body;

            // Check if the username or email already exists in the database
            const db = client.db('UserDB');
            const collection = db.collection('Log');
            const existingUser = await collection.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }

            // Insert new user into the database
            await collection.insertOne({ username,
                                         email,
                                         password,
                                         firstName:null,
                                         lastName:null,
                                         birthdath:null,
                                         country:null,
                                         city:null,
                                         deleted_at: null,
                                         created_at: String(new Date()),
                                         updated_at: String(new Date()) });

            res.status(201).json({ message: 'User registered successfully' });
        });
        
        app.listen(port, () => {
                console.log(`Server running on port http://localhost:${port}`);
        });
    }

        catch (error) {
            console.error('Error:', error);
        }

        app.get('/login', async (req, res) => {
            // Get the username and password from the request
            const { username, password } = req.body;
            // Connect to the database and collection
            const db = client.db('UserDB'); // Connect to the database
            // Connect to the collection
            const collection = db.collection('Log'); 
            // Find the user in the collection
            const user = await collection.findOne({ username, password });
            // Check if the user is found
            if (!user) { // If the user is not found, return an error
                return res.status(400).json({ error: 'Invalid username or password' });
            }
            // Return a success message
            res.status(200).json({ message: 'User logged in successfully' });
        });
}

run().catch(console.error);
