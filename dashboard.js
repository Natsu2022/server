const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const { message } = require('statuses');

require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.DASHPORT; // Port number

const uri = process.env.DB_URL; // Connection URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(cors());

async function run() {
  try {
    await client.connect(); // Connect to the MongoDB instance
    console.log('Connected to the MongoDB database');

    app.get('/dashboard', async (req,res)=>{
        try{
            const db = client.db('UserDB');
            const collection = db.collection('dashboard');
         
            const { userID, status } = req.body;
         
            const user = await collection.findOne({ userID, status });
        
            if (!user) {
                return res.status(404).json({ error: 'Dashboard not found' });
            }
            else{
                res.json({message:"Dashboard is found"});
            }
        }   catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/dashboard/cicleChart', async (req, res) => {
        try {
         const db = client.db('UserDB');
         const collection = db.collection('dashboard');
         
         const { userID, status } = req.body;
         
         const user = await collection.findOne({ userID, status });
        
         if (!user) {
          return res.status(404).json({ error: 'Dashboard not found' });
         }
        
         const wareHouseCollection = db.collection('wareHouse');
         
         // Find data from warehouse collection
         const resultArray= await wareHouseCollection.find({}, { type: 1, inStock: 1 }).toArray();
        
          // Extract specific data fields
          const extractedData = resultArray.map(({ type, inStock }) => ({ type, inStock }));
          
          res.json({ result: extractedData });
       
        } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
        }
       });

    app.get('/dashboard/lineChart', async (req,res)=>{
      try{
      	const db=client.db("UserDB");
      	const collection=db.collection("dashboard");
      	
      	const {userID,status}=req.body;
      	
      	const user=await collection.findOne({userID,status});
      
      	if (!user){
      		return res.status(404).json({error:"Dashboard not found"});
      	}
      
      	const wareHouse=db.collection("wareHouse");
      
	      const result=await wareHouse.find({},{"type":1,"inStock":1}).toArray({}); // Find data from warehouse collection
      	
      	res.json({result});
      } catch (error){
      	console.error(error);
      	res.status(500).json({error:"Internal Server Error"});
      }
    });

    app.get('/dashboard/item', async (req, res) => {
      try {
        const db = client.db('UserDB');
        const collection = db.collection('dashboard');

        const { userID } = req.body;

        const user = await collection.findOne({ userID });

        if (!user) {
          return res.status(404).json({ error: 'Dashboard not found' });
        }

        const itemCollection = db.collection("item");
        
        const items=await itemCollection.find({"itemName": "body"}).toArray();
        
         res.json({ items });
       
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Internal Server Error' });
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
