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

      // Check if all required fields are present
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = { name, email, password: hashedPassword, role };
        const result = await userCollection.insertOne(user);
        if (result.insertedCount === 1) {
          res.status(201).json({ message: "User added successfully" });
        } else {
          res.status(500).json({ message: "Failed to add user" });
        }
      } catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).json({ message: "Error hashing password" });
      }
    });

    // User login endpoint
    app.post("/login", async (req, res) => {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      try {
        const user = await userCollection.findOne({ email, role });

        if (user && (await bcrypt.compare(password, user.password))) {
          res.status(200).json({ message: "Login successful" });
        } else {
          res.status(401).json({ message: "Invalid email, password, or role" });
        }
      } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Get all users
    app.get("/user", async (req, res) => {
      const users = await userCollection.find({}).toArray();
      res.send(users);
    });
  } finally {
    // Ensure client will close when you finish/error
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
