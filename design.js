// Chat generate the server API code for the following:
// start coding

const { body } = require('express-validator');
const bcrypt = require('bcrypt');
const express = require('express');
const session = require('express-session');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const port = 3000;
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(session
({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

async function run() {
    try {
        await client.connect();
        console.log('Connected to the database');

        app.post('/newBox', async (req, res) => {
            const { username } = req.body;
            const db = client.db('testAPI');
            const collection = db.collection('User');
            const user = await collection.findOne({ username });
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await collection.insertOne({ username, email, password: hashedPassword });
            res.json({ message: 'User registered' });
        });
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });

    }
    catch (error) {
        console.error('Error:', error);
    }
}

run().catch(console.error);
// end coding