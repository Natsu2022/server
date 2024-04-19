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
const port = process.env.PORT; // Port number

const uri = process.env.DB_URL; // Connection URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

app.use(bodyParser.json());
const corsOptions = process.env.CORSOPTION;
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 3600 * 1000 // 1 hour
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
        app.get('/', ifNotLoggedin, async (req, res) => {
            const db = client.db('UserDB');
            const collection = db.collection('Log');
            const user = await collection.findOne({ username: req.session.username });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: `Hello, ${user.username}` });
        });

        // Define routes
        app.post('/register', [
            body('username').notEmpty().trim().escape().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
            body('email').notEmpty().trim().escape().isEmail().withMessage('Invalid email address'),
            body('password').notEmpty().trim().escape().isLength({ min: 8 }).withMessage('Password must be at least 6 characters long')
        ], async (req, res) => {
            const { username, email, password } = req.body;
            
            if ( username && email && password ) {
                
                // Check if the username, email, or password is missing
                const session = req.session;
                // Set session data
                session.isRegister = true;            
                
                // Hash
                const salt = await bcrypt.genSalt(10);
                const Email = await bcrypt.hash(email, salt);
                const Password = await bcrypt.hash(password, salt);
                
                // Check if the username or email already exists in the database
                const db = client.db('UserDB');
                const collection = db.collection('Log');
                const existingUser = await collection.findOne({ $or: [{ username }, { Email }] });
                if (existingUser) {
                    return res.status(400).json({ error: 'Username or email already exists' });
                } else {
                    const random = Math.floor(Math.random() * 1000000);
                // Insert new user into the database
                    await collection.insertOne({ 
                        userID:`admin${random}`,
                        username,
                        Email,
                        Password,
                        firstName:null,
                        lastName:null,
                        birthdath:null,
                        country:null,
                        city:null,
                        deleted_at: null,
                        created_at: String(new Date()),
                        updated_at: String(new Date()) 
                    });
                }
                res.status(201).json({ message: 'User registered successfully' });
            } else {
                res.status(400).json({ error: 'Username, email, and password are required'});
            }
        });
    
        app.listen(port, () => {
            console.log(`Server running on port http://localhost:${port}`);
        });
        } catch (error) {
                console.error('Error:', error);
        }

        app.get('/login', async (req, res) => {
            // Extract username and password from the request body
            const { username, password } = req.body;
        
            try {
                // Ensure that the password is not undefined
                if (!password) {
                    return res.status(400).json({ message: 'Password is required' });
                }
        
                // Connect to the database
                const db = client.db('UserDB');
                const collection = db.collection('Log');
        
                // Find the user with the given username
                const user = await collection.findOne({ username });
        
                // If the user doesn't exist, return an error
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
        
                // Ensure that the user's hashed password is not undefined
                if (!user.Password) {
                    return res.status(500).json({ message: 'Invalid user data' });
                }
        
                const isPasswordValid = await bcrypt.compare(password, user.Password);
        
                // If passwords match, set session data and return success message
                if (isPasswordValid) {
                    req.session.isLoggedIn = true;
                    req.session.username = username;
                    return res.status(200).json({ message: 'User logged in successfully' });
                } else {
                    // If passwords don't match, return an error
                    return res.status(401).json({ message: 'Invalid username or password' });
                }
            } catch (error) {
                console.error('Error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
}

run().catch(console.error);
