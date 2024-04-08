const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.DASHPORT; // Port number
 
const uri = process.env.DB_URL; // Connection URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
const corsOptions = process.env.DASHCORSOPTION;

app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

async function run() {
    try {
        await client.connect(); // Connect to the MongoDB instance
        console.log('Connected to the MongoDB database');

        app.get('/dashboard', async (req, res) => {
            // Get the username and password from the request
            const { userID, status } = req.body;
            // Connect to the database and collection
            const db = client.db('UserDB'); // Connect to the database
            // Connect to the collection
            const collection = db.collection('dashboard'); 
            // Find the user in the collection
            const user = await collection.findOne({ userID, status });
            // Check if the user is found
            if (!user) { // If the user is not found, return an error
                res.status(400).json({ error: 'Dashboard is not found.' });
            } else {
                result = db.collection('wareHouse');
                const wareHouse = await result.find({}).toArray();
                res.json({ wareHouse });
            }
        }); 
        app.listen(port, () => {
            console.log(`Server running on port http://localhost:${port}`);
        });

    } catch (e) {
        console.error(e);
    }
}

run().catch(console.error);