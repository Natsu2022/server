
const { MongoClient, ServerDescription } = require("mongodb");
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
    res.status(500).json({ error: 'Internal Server Error, err 500 Method getProject' });
  }
};

const newProject = async (req, res) => {
  try {
    const { username, width, length } = req.body;
    const db = client.db('UserDB');
    const collection = db.collection('Log');
    const user = await collection.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    } else {
      userid = user.userID;
      const dashboardCollection = db.collection('dashboard');
      const dashboard = await dashboardCollection.findOne({ userID: userid })
      if (!dashboard) {
        return res.status(400).json({ message: 'Dashboard not found.' });
      } else {

        const projectCollection = db.collection('project');
        let randomID = Math.floor(Math.random() * 10000),
          newProject = await projectCollection.insertOne({
            PID: `PID${randomID}`,
            dashboardID: dashboard.dashboardID,
            size: { width, length },
            created_at: String(new Date()),
            updated_at: String(new Date()),
            deleted_at: null
          });
        if (newProject) {
          res.status(201).json({ message: 'Project created successfully.' });
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error, err 500 Method newProject' });
  }
};

const newBox = async (req, res) => {
  try {
    const { username, BoxName, color, width, length, x, y, rotate, } = req.body;
    const db = client.db('UserDB');
    const collection = db.collection('Log');
    const user = await collection.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    } else {
      userid = user.userID;
      const dashboardCollection = db.collection('dashboard');
      const dashboard = await dashboardCollection.findOne({ userID: userid })
      if (!dashboard) {
        return res.status(400).json({ message: 'Dashboard not found.' });
      } else {
        const projectCollection = db.collection('project');
        const project = await projectCollection.findOne({ dashboardID: dashboard.dashboardID })
        if (!project) {
          return res.status(400).json({ message: 'Project not found.' });
        } else {
          const projectID = project.PID;
          if (!projectID) {
            return res.status(400).json({ message: 'Project not found.' });
          } else {
            const boxCollection = db.collection('box');
            let randomboxID = Math.floor(Math.random() * 10000),
              newBox = await boxCollection.insertOne({
                BoxID: `BID${randomboxID}`,
                PID: project.PID,
                BoxName: BoxName,
                color: color,
                size: { width, length },
                position: { x, y, rotate },
                created_at: String(new Date()),
                updated_at: String(new Date()),
                deleted_at: null
              });
            if (newBox) {
              res.status(201).json({ message: 'Box created successfully.' });
            } else {
              return res.status(400).json({
                message: 'Box not created.',
                message2: 'Please check shape value.'
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error, err 500 Method newBox' });
  }
};

const getBox = async (req, res) => {
  try {
    const db = client.db('UserDB');
    const collection = db.collection('Log');

    const { username } = req.body;

    const user = await collection.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    } else {
      userid = user.userID;
      const dashboardCollection = db.collection('dashboard');
      const dashboard = await dashboardCollection.findOne({ userID: userid })
      if (!dashboard) {
        return res.status(400).json({ message: 'Dashboard not found.' });
      } else {
        const projectCollection = db.collection('project');
        const project = await projectCollection.findOne({ dashboardID: dashboard.dashboardID })
        if (!project) {
          return res.status(400).json({ message: 'Project not found.' });
        } else {
          const projectID = project.PID;
          if (!projectID) {
            return res.status(400).json({ message: 'Project not found.' });
          } else {
            const boxCollection = db.collection('box');
            const box = await boxCollection.find({ PID: project.PID }, { BoxID: 1 }).toArray();
            if (!box) {
              return res.status(400).json({ message: 'Box not found.' });
            } else {
              res.json({ items: box });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error, err 500 Method getBox' });
  }
};

const editBox = async (req, res) => {
  try {
    const { username, BoxID, BoxName, color, width, length, x, y, rotate } = req.body;
    const db = client.db('UserDB');
    const collection = db.collection('Log');
    const user = await collection.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    } else {
      userid = user.userID;
      const dashboardCollection = db.collection('dashboard');
      const dashboard = await dashboardCollection.findOne({ userID: userid })
      if (!dashboard) {
        return res.status(400).json({ message: 'Dashboard not found.' });
      } else {
        const projectCollection = db.collection('project');
        const project = await projectCollection.findOne({ dashboardID: dashboard.dashboardID })
        if (!project) {
          return res.status(400).json({ message: 'Project not found.' });
        } else {
          const projectID = project.PID;
          if (!projectID) {
            return res.status(400).json({ message: 'Project not found.' });
          } else {
            const boxCollection = db.collection('box');
            const boxID = await boxCollection.findOne({ BoxID: BoxID });
            const boxPID = boxID.PID;
            if (projectID == boxPID) {
              if (!boxID) {
                return res.status(400).json({ message: 'Box not found.' });
              } else {
                let updateBox = await boxCollection.updateOne(
                  { BoxID },
                  {
                    $set: {
                      BoxName: BoxName,
                      color: color,
                      size: { width, length },
                      position: { x, y, rotate },
                      updated_at: String(new Date())
                    }
                  }
                );
                if (updateBox) {
                  res.status(201).json({
                    message: 'Box updated successfully.',
                    result: `BoxID Updated: ${boxID.BoxID}`
                  });
                } else {
                  return res.status(400).json({
                    message: 'Box not updated.',
                    message2: 'Please check shape value.'
                  });
                }
              }
            } else {
              return res.status(400).json({ message: "PID and BoxID not match.", result: boxID, projectID: projectID, boxCollectionPID: boxCollection.PID });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error, err 500 Method editBox' });
  }
};

const deleteBox = async (req, res) => {
  try {
    const { username, BoxID } = req.body;
    const db = client.db('UserDB');
    const collection = db.collection('Log');
    const user = await collection.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }
    const dashboardCollection = db.collection('dashboard');
    const dashboard = await dashboardCollection.findOne({ userID: user.userID });
    if (!dashboard) {
      return res.status(400).json({ message: 'Dashboard not found.' });
    }
    const projectCollection = db.collection('project');
    const project = await projectCollection.findOne({ dashboardID: dashboard.dashboardID });
    if (!project) {
      return res.status(400).json({ message: 'Project not found.' });
    }
    const projectID = project.PID;
    if (!projectID) {
      return res.status(400).json({ message: 'Project ID not found.' });
    }
    const boxCollection = db.collection('box');
    const box = await boxCollection.findOne({ BoxID });
    if (!box) {
      return res.status(400).json({ message: 'Box not found.', result: box });
    }
    const boxPID = box.PID;
    if (projectID !== boxPID) {
      return res.status(400).json({ message: "PID and BoxID do not match." });
    }
    const updatedBox = await boxCollection.updateOne(
      { BoxID },
      {
        $set: {
          BoxID: `Deleted${BoxID}`,
          BoxName: "Deleted",
          color: "Deleted",
          size: { width: "deleted", length: "deleted" },
          position: { x: "deleted", y: "deleted", rotate: "deleted" },
          updated_at: String(new Date())
        }
      }
    );
    if (updatedBox) {
      return res.status(201).json({ message: `BoxID${BoxID} delete successfully.`, result: `Change BoxID deleted to delteted${BoxID} for hold undo required.` });
    } else {
      return res.status(400).json({ message: 'Box not updated.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = { getProject, newProject, newBox, getBox, editBox, deleteBox };