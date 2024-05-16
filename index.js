const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.guksi.mongodb.net/furrever-pawfect?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const userCollection = client.db("furrever-pawfect").collection("user");

    // user post
     app.post("/user", async (req, res) => {
       const { name, email, password, role } = req.body;
       const hashedPassword = await bcrypt.hash(password, 10);
       const user = { name, email, password: hashedPassword, role };
       const result = await userCollection.insertOne(user);

       if (result.insertedCount === 1) {
         res.status(201).json({ message: "User added successfully" });
       } else {
         res.status(500).json({ message: "Failed to add user" });
       }
     });

    //user get
    app.get("/user", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
