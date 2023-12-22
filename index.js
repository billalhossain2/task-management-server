const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 9000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0ak1okw.mongodb.net/?retryWrites=true&w=majority`;

//Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Task management server is running on port ${port}`);
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    //DB Operations
    const tasksCollection = client.db("taskRDB").collection("tasks");

    app.post("/tasks", async (req, res) => {
      const newTask = req.body;
      try {
        const result = await tasksCollection.insertOne(newTask);
        res
          .status(200)
          .json({ message: "Successfully added a new task", code: 200 });
      } catch (error) {
        res
          .status(500)
          .json({ error: true, message: "There was server side error" });
      }
    });

    app.get("/tasks", async(req, res)=>{
      const {email} = req.query;

      const tasks = await tasksCollection.find({email}).toArray();
      res.send(tasks)
    })

    app.get("/tasks/:taskId", async(req, res)=>{
      const {taskId} = req.params;
      const query = {_id:new ObjectId(taskId)}

      try {
        const task = await tasksCollection.findOne(query);
        res.send(task)
      } catch (error) {
        console.log("Error=======>", error)
        res.status(500).json({error:true, message:"There was server side error"})
      }
    })

    app.patch("/tasks/:taskId", async(req, res)=>{
      const {taskId} = req.params;
      const filter = {_id:new ObjectId(taskId)}
      const updateDoc = {
        $set:{completed:req.body.completed}
      }

      try {
      const result = await tasksCollection.updateOne(filter, updateDoc, {upsert:false})
      res.status(200).send({message:"Update was successful", code:200})
      } catch (error) {
        res.status(500).json({error:true, message:"There was server side error!"})
      }
    })


    app.put("/tasks/:taskId", async(req, res)=>{
      const {taskId} = req.params;
      const filter = {_id:new ObjectId(taskId)}
      const updateDoc = {
        $set:req.body
      }

      try {
      const result = await tasksCollection.updateOne(filter, updateDoc, {upsert:false})
      res.status(200).send({message:"Update was successful", code:200})
      } catch (error) {
        res.status(500).json({error:true, message:"There was server side error!"})
      }
    })



    app.delete("/tasks/:taskId", async(req, res)=>{
      const {taskId} = req.params;
      const query = {_id:new ObjectId(taskId)}

      try {
        const result = await tasksCollection.deleteOne(query);
        res.status(200).json({success:true, message:"Successfully deleted the task"});
      } catch (error) {
        res.status(500).json({error:true, message:"There was server side error!"})
      }
    })



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Task management server is listening at port ${port}`);
});
