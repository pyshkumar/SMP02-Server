const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./authRoutes");
const jobRoutes = require("./jobRoutes");

const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const port = process.env.SERVER_PORT;

//authentication apis call endpoints
// app.post("/signup", async (req, res) => {
//   try {
//     console.log(req.body);
//     const newUserRecord = req.body;
//     const hashedPassword = await auth.hashPassword(newUserRecord.password);
//     const query = `INSERT INTO ${userDB} (USERNAME, PASSWORD, USERTYPE) VALUES (:1, :2, :3)`;
//     const params = [
//       newUserRecord.username,
//       hashedPassword,
//       newUserRecord.userType,
//     ];
//     await db.query(query, params);
//     res.status(200).send("User added successfully");
//   } catch (error) {
//     console.error("Error adding data:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post("/signin", async (req, res) => {
//   try {
//     const userRecord = req.body;
//     const query = `SELECT PASSWORD, USERTYPE FROM ${userDB} WHERE USERNAME = :1`;
//     const result = await db.query(query, [userRecord.username]);

//     if (result.length === 0) {
//       res.json({ exists: false });
//       return;
//     }

//     const storedPassword = result[0].PASSWORD;
//     const isMatch = await auth.comparePassword(
//       userRecord.password,
//       storedPassword
//     );

//     if (isMatch) {
//       res.json({ exists: true, userType: result[0].USERTYPE });
//       console.log("match");
//     } else {
//       res.json({ exists: false });
//     }
//   } catch (error) {
//     console.error("Error checking user credentials:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.use(authRoutes);
app.use(jobRoutes);

//Gridbase apis call endpoints

// app.get("/employee", async (req, res) => {
//   try {
//     const tableCheckQuery = `SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND OBJECT_NAME = '${jobDB}'`;
//     const tableCheckQueryData = await db.query(tableCheckQuery);
//     const tableExist = tableCheckQueryData[0]["COUNT(*)"];
//     if (!tableExist) {
//       try {
//         const query = `CREATE TABLE ${jobDB} (
//           JOBID NUMBER(30) PRIMARY KEY,
//           JOBTITLE VARCHAR2(50),
//           Location VARCHAR2(50),
//           ExperienceLevel VARCHAR2(50),
//           ContactPerson VARCHAR2(50),
//           Status VARCHAR2(50)
//         )`;

//         const data = await db.query(query);
//         console.log(data);
//       } catch (error) {
//         console.log("Error is Creating DB", error);
//       }
//     }

//     const query = `SELECT * FROM ${jobDB}`;
//     const data = await db.query(query);
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching database:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post("/job/search", async (req, res) => {
//   try {
//     const { name, order } = req.body;
//     const tableCheckQuery = `SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND OBJECT_NAME = '${jobDB}'`;
//     const tableCheckQueryData = await db.query(tableCheckQuery);
//     const tableExist = tableCheckQueryData[0]["COUNT(*)"];

//     if (!tableExist) {
//       try {
//         const query = `CREATE TABLE ${jobDB} (
//           JOBID NUMBER(30) PRIMARY KEY,
//           JOBTITLE VARCHAR2(50),
//           Location VARCHAR2(50),
//           ExperienceLevel VARCHAR2(50),
//           ContactPerson VARCHAR2(50),
//           Status VARCHAR2(50)
//       )`;
//         const data = await db.query(query);
//         console.log(data);
//       } catch (error) {
//         console.log("Error is Creating DB", error);
//       }
//     }

//     if (name === "") {
//       const query = `SELECT * FROM ${jobDB}`;
//       const data = await db.query(query);
//       console.log(data);
//       res.json(data);
//     } else {
//       const query = `SELECT * FROM  ${jobDB} order by ${name} ${order} `;
//       const data = await db.query(query);
//       res.json(data);
//     }
//   } catch (error) {
//     console.error("Error fetching database:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post("/job", async (req, res) => {
//   try {
//     const newRecord = req.body;
//     const query = `INSERT INTO ${jobDB} (jobId, jobTitle, location, experienceLevel, contactPerson, status) VALUES (:1, :2, :3, :4, :5, :6)`;
//     const params = [
//       newRecord.jobId,
//       newRecord.jobTitle,
//       newRecord.location,
//       newRecord.experienceLevel,
//       newRecord.contactPerson,
//       newRecord.status,
//     ];
//     await db.query(query, params);
//     res.status(200).send("Record added successfully");
//   } catch (error) {
//     console.error("Error adding data:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.put("/job/:jobId", async (req, res) => {
//   try {
//     const updatedData = req.body;
//     const { jobId } = req.params;
//     console.log(updatedData);
//     const query = `UPDATE ${jobDB} SET jobTitle = :1, location = :2, experienceLevel = :3, contactPerson = :4, status = :5 WHERE jobId = :6`;
//     const params = [
//       updatedData.jobTitle,
//       updatedData.location,
//       updatedData.experienceLevel,
//       updatedData.contactPerson,
//       updatedData.status,
//       jobId,
//     ];
//     await db.query(query, params);
//     res.status(200).send("Record updated successfully");
//   } catch (error) {
//     console.error("Error updating record:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.delete("/job/:jobId", async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const query = `DELETE FROM ${jobDB} WHERE jobId = :1`;
//     await db.query(query, [jobId]);
//     res.status(200).send("Record deleted successfully");
//   } catch (error) {
//     console.error("Error deleting data:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post("/checkJobId", async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     const query = `SELECT COUNT(*) AS numRecords FROM ${jobDB} WHERE JOBID = :1`;
//     const result = await db.query(query, [jobId]);
//     const numRecords = result[0].NUMRECORDS;
//     if (numRecords === 0) res.json({ exists: false });
//     else res.json({ exists: true });
//   } catch (error) {
//     console.error("Error checking job ID:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post("/sortRecords", async (req, res) => {
//   try {
//     const { columnName, sortOrder } = req.body;
//     if (
//       !columnName ||
//       !sortOrder ||
//       (sortOrder !== "ASC" && sortOrder !== "DESC")
//     ) {
//       return res.status(400).send("Invalid column name or sort order");
//     }
//     const query = `SELECT * FROM ${jobDB} ORDER BY ${columnName} ${sortOrder}`;
//     const data = await db.query(query);
//     res.json(data);
//   } catch (error) {
//     console.error("Error sorting records:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
