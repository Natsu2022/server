const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app
const app = express();
const port = 8000; // Port number

const uri = 'mongodb+srv://frontendtest:nsFj9F7YTW2BvnwZ@cluster.3nvsqiu.mongodb.net/'; // Connection URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
const corsOptions = {
    origin: 'http://localhost:5173/register',
    credentials: true,
    methods: ['GET', 'POST']
};
app.use(cors(corsOptions));

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
            const db = client.db('testAPI');
            const collection = db.collection('Log');
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
