const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const Quote = require('inspirational-quotes');

// Initialize Express app
const app = express();
const port = 8000; // Port number

const uri = 'mongodb://localhost:27017/mydb'; // Connection URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/', (req, res) => {
    const data = {
        massage: "I am a server, hear me roar!"
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
            const db = client.db('user');
            const collection = db.collection('users');
            const existingUser = await collection.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }

            // Insert new user into the database
            await collection.insertOne({ username, email, password });
            res.status(201).json({ message: 'User registered successfully' });
        });
        
        app.listen(port, () => {
            console.log(`Server running on port http://localhost:${port}`);
        });
        }

        catch (error) {
            console.error('Error:', error);
        }
}

run().catch(console.error);