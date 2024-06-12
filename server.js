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
const jobDB = "EMPLOYEEDATA2";

//authentication apis call endpoints

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

//Gridbase apis call endpoints

app.get("/employee", async (req, res) => {
  try {
    const tableCheckQuery = `SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND OBJECT_NAME = '${jobDB}'`;
    const tableCheckQueryData = await db.query(tableCheckQuery);
    const tableExist = tableCheckQueryData[0]["COUNT(*)"];
    if (!tableExist) {
      try {
        const query = `CREATE TABLE ${jobDB} (
            employeeId NUMBER(30) PRIMARY KEY,
            firstName VARCHAR2(50) NOT NULL,
            lastName VARCHAR2(50),
            email VARCHAR2(100),
            contactNumber VARCHAR2(10),
            position VARCHAR2(100)
        )`;
        const data = await db.query(query);
        console.log(data);
      } catch (error) {
        console.log("Error is Creating DB", error);
      }
    }

    const query = `SELECT * FROM ${jobDB}`;
    const data = await db.query(query);
    res.json(data);
  } catch (error) {
    console.error("Error fetching database:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/employee/search", async (req, res) => {
  try {
    const { name, order } = req.body;
    const tableCheckQuery = `SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND OBJECT_NAME = '${jobDB}'`;
    const tableCheckQueryData = await db.query(tableCheckQuery);
    const tableExist = tableCheckQueryData[0]["COUNT(*)"];

    if (!tableExist) {
      try {
        const query = `CREATE TABLE ${jobDB} (
          employeeId NUMBER(30) PRIMARY KEY,
          firstName VARCHAR2(50) NOT NULL,
          lastName VARCHAR2(50),
          email VARCHAR2(100),
          contactNumber VARCHAR2(10),
          position VARCHAR2(100)
      )`;
        const data = await db.query(query);
        console.log(data);
      } catch (error) {
        console.log("Error is Creating DB", error);
      }
    }

    if (name === "") {
      const query = `SELECT * FROM ${jobDB}`;
      const data = await db.query(query);
      res.json(data);
    } else {
      const query = `SELECT * FROM  ${jobDB} order by ${name} ${order} `;
      const data = await db.query(query);
      res.json(data);
    }
  } catch (error) {
    console.error("Error fetching database:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/employee", async (req, res) => {
  try {
    const newRecord = req.body;
    const query = `INSERT INTO ${jobDB} (employeeId, firstName, lastName, email, contactNumber, position) VALUES (:1, :2, :3, :4, :5, :6)`;
    const params = [
      newRecord.employeeId,
      newRecord.firstName,
      newRecord.lastName,
      newRecord.email,
      newRecord.contactNumber,
      newRecord.position,
    ];
    await db.query(query, params);
    res.status(200).send("Data added successfully");
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/employee/:employeeId", async (req, res) => {
  try {
    const updatedData = req.body;
    const { employeeId } = req.params;
    const query = `UPDATE ${jobDB} SET firstName = :1, lastName = :2, email = :3, contactNumber = :4, position = :5 WHERE employeeId = :6`;
    const params = [
      updatedData.firstName,
      updatedData.lastName,
      updatedData.email,
      updatedData.contactNumber,
      updatedData.position,
      employeeId,
    ];
    await db.query(query, params);
    res.status(200).send("Data updated successfully");
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/employee/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const query = `DELETE FROM ${jobDB} WHERE employeeId = :1`;
    await db.query(query, [employeeId]);
    res.status(200).send("Data deleted successfully");
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/checkEmployeeId", async (req, res) => {
  try {
    const { employeeId } = req.body;
    const query = `SELECT COUNT(*) AS numRecords FROM ${jobDB} WHERE employeeId = :1`;
    const result = await db.query(query, [employeeId]);
    const numRecords = result[0].NUMRECORDS;
    if (numRecords === 0) res.json({ exists: false });
    else res.json({ exists: true });
  } catch (error) {
    console.error("Error checking employee ID:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/sortRecords", async (req, res) => {
  try {
    const { columnName, sortOrder } = req.body;
    if (
      !columnName ||
      !sortOrder ||
      (sortOrder !== "ASC" && sortOrder !== "DESC")
    ) {
      return res.status(400).send("Invalid column name or sort order");
    }
    const query = `SELECT * FROM ${jobDB} ORDER BY ${columnName} ${sortOrder}`;
    const data = await db.query(query);
    res.json(data);
  } catch (error) {
    console.error("Error sorting records:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
