// Init MongoDB
const { MongoClient } = require("mongodb");
// Load environment variables
require("dotenv").config();

const uri = process.env.DB_URL; // Connection URI
const client = new MongoClient(uri);

const account = async (req, res) => {
    const db = await client.db("UserDB");
    const collection = db.collection("Log");
    const {
        username,
        newFirstName,
        newLastName,
        newBirthdath,
        newCountry,
        newCity,
    } = req.body;
    const user = await collection.findOne({ username });
    if (!user) {
        return res.status(404).json({ error: "Account not found" });
    } else {
        if (username) {
            const result = await collection.updateOne(
                { username },
                {
                    $set: {
                        firstName: newFirstName,
                        lastName: newLastName,
                        birthdath: newBirthdath,
                        country: newCountry,
                        city: newCity,
                        updated_at: String(new Date()),
                    },
                }
            );
            return res.json({ message: "Account updated successfully" });
        } else {
            return res.status(401).json({ error: "Invalid password" });
        }
        res.json({ massage: "Welcome to Account setting." });
    }
}

const resetpassword = async (req, res) => {
    const db = client.db("UserDB");
    const collection = db.collection("Log");
    const { username, oldPassword, newPassword } = req.body;
    const user = await collection.findOne({ username });
    if (!user) {
        return res.status(404).json({ error: "Account not found" });
    } else {
        const validPassword = await bcrypt.compare(oldPassword, user.Password);
        if (validPassword) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
            const result = await collection.updateOne(
                { username },
                {
                    $set: {
                        Password: hash,
                        updated_at: String(new Date()),
                    },
                }
            );
            return res.json({ message: "Password updated successfully" });
        } else {
            return res.status(401).json({ error: "Invalid password" });
        }
    }
}

module.exports = { account, resetpassword };