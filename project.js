
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
// Load environment variables
require("dotenv").config();

const uri = process.env.DB_URL; // Connection URI
const client = new MongoClient(uri);

const getProject = async (req, res) => {
    try {
      const db = client.db('UserDB');
      const collection = db.collection('Log');
  
      const { username } = req.body;
  
      const user = await collection.findOne({ username });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      } else {
        const projectCollection = db.collection("project"); 

        // Find items and project only the required fields
        const project = await projectCollection.find({}, { PID: 1 }).toArray();
        const tfProject = project.map(project => ({
          length: project.length, 
          width: project.width,
          update_at: project.create_at
        }));
        res.json({ items: tfProject });
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

const newProject = async (req, res) => {
    try {
        const { username, width, length } = req.body;
        const db = client.db('UserDB');
        const collection = db.collection('Log');
        const user = await collection.findOne({ username });
        if ( !user ) {
            return res.status(400).json({ message: 'User not found.' });
        } else {
                userid = user.userID;
                const dashboardCollection = db.collection('dashboard');
                const dashboard = await dashboardCollection.findOne({ userID: userid })
                if ( !dashboard ) {
                    return res.status(400).json({ message: 'Dashboard not found.' });
                } else {

                  const projectCollection = db.collection('project');
                  let randomID = Math.floor(Math.random() * 10000) ,
                  newProject = await projectCollection.insertOne({
                    PID: `PID${randomID}`           ,
                    dashboardID: dashboard.dashboardID,
                    size: { width, length }         ,
                    created_at: String(new Date())  ,
                    updated_at: String(new Date())  ,
                    deleted_at: null                  });
                    if ( newProject ) {
                      res.status(201).json({ message: 'Project created successfully.' });
                    }
                  }
              }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getProject, newProject };