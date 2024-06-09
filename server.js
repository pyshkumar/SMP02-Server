const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const auth = require("./auth");
const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const port = process.env.SERVER_PORT;
const userDB = "EMPUSERDB";

app.post("/signup", async (req, res) => {
  try {
    console.log(req.body);
    const newUserRecord = req.body;
    const hashedPassword = await auth.hashPassword(newUserRecord.password);
    const query = `INSERT INTO ${userDB} (USERNAME, PASSWORD, USERTYPE) VALUES (:1, :2, :3)`;
    const params = [
      newUserRecord.username,
      hashedPassword,
      newUserRecord.userType,
    ];
    await db.query(query, params);
    res.status(200).send("User added successfully");
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/signin", async (req, res) => {
  try {
    const userRecord = req.body;
    const query = `SELECT PASSWORD, USERTYPE FROM ${userDB} WHERE USERNAME = :1`;
    const result = await db.query(query, [userRecord.username]);

    if (result.length === 0) {
      res.json({ exists: false });
      return;
    }

    const storedPassword = result[0].PASSWORD;
    const isMatch = await auth.comparePassword(
      userRecord.password,
      storedPassword
    );

    if (isMatch) {
      res.json({ exists: true });
      console.log("match");
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking user credentials:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
