const express = require("express");
const https = require("https");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const { body, validationResult } = require("express-validator");

const main = require ("./main");
const dashboard = require ("./dashboard");
const settings = require ("./setting");

// Load environment variables
require("dotenv").config();

// Initialize Express app
const app = express();
const port = process.env.PORT; // Port number

const uri = process.env.DB_URL; // Connection URI
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const secret = "mysecret"; // Secret key for JWT
// const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

const sslServer = https.createServer({
  key: "",
  cert: ""
}, app);

app.use(bodyParser.json());
const corsOptions = process.env.CORSOPTION;
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", main.main);
app.get("/test", main.test);

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});

async function run() {
  try {
    await client.connect(); // Connect to the MongoDB instance
    console.log("Connected to the MongoDB database");

    // Define routes
    app.post(
      "/register",
      [
        body("username")
          .notEmpty()
          .trim()
          .escape()
          .isLength({ min: 3 })
          .withMessage("Username must be at least 3 characters long"),
        body("email")
          .notEmpty()
          .trim()
          .escape()
          .isEmail()
          .withMessage("Invalid email address"),
        body("password")
          .notEmpty()
          .trim()
          .escape()
          .isLength({ min: 8 })
          .withMessage("Password must be at least 6 characters long"),
      ],
      async (req, res) => {
        const { username, email, password } = req.body;

        // Check if the username, email, or password is missing
        if (username && email && password) {
          // Token
          const token = jwt.sign({ username, role: "registered " }, secret, {
            expiresIn: "1day",
          });

          if (!token) {
            return res.status(500).json({ message: "Token not generated" });
          }

          // Hash
          const salt = await bcrypt.genSalt(10);
          const Email = await bcrypt.hash(email, salt);
          const Password = await bcrypt.hash(password, salt);

          // Check if the username or email already exists in the database
          const db = client.db("UserDB");
          const collection = db.collection("Log");
          const existingUser = await collection.findOne({
            $or: [{ username }, { Email }],
          });
          
          if (existingUser) {
            return res
              .status(400)
              .json({ error: "Username or email already exists" });
          } 
            const random = Math.floor(Math.random() * 1000000);
            
            // Insert new user into the database
            await collection.insertOne({
              userID: `admin${random}`,
              username,
              Email,
              Password,
              firstName: null,
              lastName: null,
              birthdath: null,
              country: null,
              city: null,
              deleted_at: null,
              created_at: String(new Date()),
              updated_at: String(new Date()),
            });
          
          res.status(201).json({ message: "User registered successfully" });
        } else {
          res
            .status(400)
            .json({ error: "Username, email, and password are required" });
        }
      }
    );

    app.post("/login", async (req, res) => {
      // Extract username and password from the request body
      const { username, password } = req.body;

      try {
        // Ensure that the password is not undefined
        if (!password) {
          return res.status(400).json({ message: "Password is required" });
        }

        // Connect to the database
        const db = client.db("UserDB");
        const collection = db.collection("Log");
        // Find the user with the given username
        const user = await collection.findOne({ username });
        const userID = user.userID;
        const token = jwt.sign({ userID, role: "admin" }, secret, {
          expiresIn: "1day",
        });


        // If the user doesn't exist, return an error
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Ensure that the user's hashed password is not undefined
        if (!user.Password) {
          return res.status(500).json({ message: "Invalid user data" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.Password);

        // If passwords match, set session data and return success message
        if (isPasswordValid) {
          req.session.isLoggedIn = true;
          req.session.username = username;
          res.cookie("token", token, {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            secure: true,
            httpOnly: true,
            sameSite: "none",
          });
          return res
            .status(200)
            .json({ message: "User logged in successfully", token: token });
        } else {
          // If passwords don't match, return an error
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }
      } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    app.get("/dashboard", dashboard.dashboard);
    app.get("/cicleChart", dashboard.cicleChart);
    app.get("/lineChart", dashboard.lineChart);
    app.get("/list", dashboard.list);
    app.put("/update", settings.account);
    app.put("/resetpassword", settings.resetpassword);
  } catch (error) {
    console.error("Error:", error);
  }
}

run().catch(console.error);
