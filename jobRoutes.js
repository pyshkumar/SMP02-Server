const express = require("express");
const router = express.Router();
const db = require("./db");
const jobDB = "EMPJOBDB";

router.get("/employee", async (req, res) => {
  try {
    const tableCheckQuery = `SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND OBJECT_NAME = '${jobDB}'`;
    const tableCheckQueryData = await db.query(tableCheckQuery);
    const tableExist = tableCheckQueryData[0]["COUNT(*)"];
    if (!tableExist) {
      try {
        const query = `CREATE TABLE ${jobDB} (
            JOBID NUMBER(30) PRIMARY KEY,
            JOBTITLE VARCHAR2(50),
            Location VARCHAR2(50),
            ExperienceLevel VARCHAR2(50),
            ContactPerson VARCHAR2(50),
            Status VARCHAR2(50)
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

router.post("/job/search", async (req, res) => {
  try {
    const { name, order } = req.body;
    const tableCheckQuery = `SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND OBJECT_NAME = '${jobDB}'`;
    const tableCheckQueryData = await db.query(tableCheckQuery);
    const tableExist = tableCheckQueryData[0]["COUNT(*)"];

    if (!tableExist) {
      try {
        const query = `CREATE TABLE ${jobDB} (
            JOBID NUMBER(30) PRIMARY KEY,
            JOBTITLE VARCHAR2(50),
            Location VARCHAR2(50),
            ExperienceLevel VARCHAR2(50),
            ContactPerson VARCHAR2(50),
            Status VARCHAR2(50)
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
      console.log(data);
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

router.post("/job", async (req, res) => {
  try {
    const newRecord = req.body;
    const query = `INSERT INTO ${jobDB} (jobId, jobTitle, location, experienceLevel, contactPerson, status) VALUES (:1, :2, :3, :4, :5, :6)`;
    const params = [
      newRecord.jobId,
      newRecord.jobTitle,
      newRecord.location,
      newRecord.experienceLevel,
      newRecord.contactPerson,
      newRecord.status,
    ];
    await db.query(query, params);
    res.status(200).send("Record added successfully");
  } catch (error) {
    console.error("Error adding data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/job/:jobId", async (req, res) => {
  try {
    const updatedData = req.body;
    const { jobId } = req.params;
    console.log(updatedData);
    const query = `UPDATE ${jobDB} SET jobTitle = :1, location = :2, experienceLevel = :3, contactPerson = :4, status = :5 WHERE jobId = :6`;
    const params = [
      updatedData.jobTitle,
      updatedData.location,
      updatedData.experienceLevel,
      updatedData.contactPerson,
      updatedData.status,
      jobId,
    ];
    await db.query(query, params);
    res.status(200).send("Record updated successfully");
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/job/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const query = `DELETE FROM ${jobDB} WHERE jobId = :1`;
    await db.query(query, [jobId]);
    res.status(200).send("Record deleted successfully");
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/checkJobId", async (req, res) => {
  try {
    const { jobId } = req.body;
    const query = `SELECT COUNT(*) AS numRecords FROM ${jobDB} WHERE JOBID = :1`;
    const result = await db.query(query, [jobId]);
    const numRecords = result[0].NUMRECORDS;
    if (numRecords === 0) res.json({ exists: false });
    else res.json({ exists: true });
  } catch (error) {
    console.error("Error checking job ID:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/sortRecords", async (req, res) => {
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

module.exports = router;
