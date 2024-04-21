const { MongoClient } = require("mongodb");

// Load environment variables
require("dotenv").config();

const port = process.env.PORT; // Port number

const uri = process.env.DB_URL; // Connection URI
const client = new MongoClient(uri);


const secret = "mysecret"; // Secret key for JWT
// const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

const dashboard = async (req, res) => {
  try {
    const db = client.db('UserDB');
    const collection = db.collection('Log');

    const { username } = req.body;

    const user = await collection.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    else {
      req.session.status = true;
      console.log('User is found');
      // console.log('Session:', req.session);
      res.json({ user: user.username });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const cicleChart = async (req, res) => {
  try {
      const db = client.db('UserDB');
      const collection1 = db.collection('Log');

      const { username } = req.body;

      const user = await collection1.findOne({ username });

      if (!user) {
        return res.status(404).json({ error: 'Cicle chart not found' });
      }

      const wareHouseCollection = db.collection('wareHouse');

      // Find data from warehouse collection
      const resultArray = await wareHouseCollection.find({}, { wareHouseID: 1, inStock: 1 }).toArray();

      // Extract specific data fields
      const extractedData = resultArray.map(({ wareHouseID, inStock }) => ({ wareHouseID, inStock }));

      res.json({ result: extractedData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

}


const lineChart = async (req, res) => {
  try {
    const db = client.db("UserDB");
    const collection = db.collection("item");

    // Find data from warehouse collection
    const result = await collection.find().toArray();

    // Check if data is empty
    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    // Sort data by inDate field
    result.sort((a, b) => new Date(a.inDate) - new Date(b.inDate));

    // Group data by date and calculate total quantity of items for each date
    const sortedData = {};
    result.forEach(item => {
      const date = new Date(item.inDate).toLocaleDateString(); // Extract date part only

      // Initialize total quantity for the date if not already present
      if (!sortedData[date]) {
        sortedData[date] = 0;
      }

      // Increment total quantity for the date
      sortedData[date] += 1; // Assuming each item has a quantity of 1
    });

    // Log sorted data for debugging
    //console.log("Sorted Data:", sortedData);

    // Send sorted data in response
    res.json({ result: sortedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const list = async (req, res) => {
  try {
    const db = client.db('UserDB');
    const collection = db.collection('Log');

    const { username } = req.body;

    const user = await collection.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'Dashboard not found' });
    } else {
      const itemCollection = db.collection("item");

      // Find items and project only the required fields
      const items = await itemCollection.find({}, { itemName: 1, country: 1, inDate: 1 }).toArray();
      const transformedItems = items.map(item => ({
        itemName: item.itemName,
        country: item.country,
        inDate: item.inDate
      }));
      res.json({ items: transformedItems });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { dashboard, cicleChart, lineChart, list};