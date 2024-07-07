const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const PORT = process.env.PORT || 4500;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(express.static(path.resolve(__dirname, "frontend/build")));

MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error("Failed to connect to the database. Error:", err);
    process.exit(1);
  }

  console.log("Connected to MongoDB");
  const db = client.db('hall');
  const collection = db.collection('booking'); 

  app.get("/getData", async (req, res) => {
    try {
      const data = await collection.find({}).toArray();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).send("Error fetching data");
    }
  });

  app.post("/postData", async (req, res) => {
    try {
      await collection.insertOne(req.body);
      res.status(200).send("real data inserted");
    } catch (error) {
      res.status(500).send("Error inserting data");
    }
  });

  app.get("/getHistory", (req, res) => {
    require("./getHistory")(req, res, collection);
  });

  if (process.env.NODE_ENV === "production") {
    app.use(express.static("frontend/build/"));
    app.get("*", (req, res) => {
      console.log(__dirname);
      res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
    });
  } else {
    app.get("/", (req, res) => {
      res.send("Tamizh Hall Booking Server running");
    });
  }

  app.listen(PORT, () => {
    console.log("Server is listening to port " + PORT);
  });
});
