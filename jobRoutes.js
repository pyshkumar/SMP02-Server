const express = require("express");
const router = express.Router();
const db = require("./db");
const jobDB = "EMPJOBDB";
const appliedJobDB = "EMPUSAPPJOBDB";

// router.get("/employee", async (req, res) => {
//   try {
//     const tableCheckQuery = `SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND OBJECT_NAME = '${jobDB}'`;
//     const tableCheckQueryData = await db.query(tableCheckQuery);
//     const tableExist = tableCheckQueryData[0]["COUNT(*)"];
//     if (!tableExist) {
//       try {
//         const query = `CREATE TABLE ${jobDB} (
//           JOBID VARCHAR2(50) PRIMARY KEY,
//           JOBTITLE  VARCHAR2(50),
//           LOCATION  VARCHAR2(50),
//           EXPERIENCELEVEL VARCHAR2(50),
//           CONTACTPERSON  VARCHAR2(50),
//           STATUS  VARCHAR2(50),
//           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         )`;

//         const data = await db.query(query);
//         console.log(data);
//       } catch (error) {
//         console.log("Error is Creating DB", error);
//       }
//     }

//     const query = `SELECT * FROM ${jobDB} ORDER BY created_at DESC`;
//     const data = await db.query(query);
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching database:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

router.post("/job/search", async (req, res) => {
  try {
    const { name, order, userType, userId, status } = req.body;

    const tableCheckQuery = `SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND OBJECT_NAME = '${jobDB}'`;
    const tableCheckQueryData = await db.query(tableCheckQuery);
    const tableExist = tableCheckQueryData[0]["COUNT(*)"];

    if (!tableExist) {
      try {
        const query = `CREATE TABLE ${jobDB} (
          JOBID VARCHAR2(50) PRIMARY KEY,
          JOBTITLE  VARCHAR2(50),
          LOCATION  VARCHAR2(50),
          EXPERIENCELEVEL VARCHAR2(50),
          CONTACTPERSON  VARCHAR2(50),
          STATUS  VARCHAR2(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        const data = await db.query(query);
      } catch (error) {
        console.log("Error is Creating DB", error);
      }
    }

    let statusCondition = "";
    if (status === "open") {
      statusCondition = "WHERE STATUS = 'Open'";
    } else if (status === "closed") {
      statusCondition = "WHERE STATUS = 'Closed'";
    }

    if (userType === "admin") {
      if (name === "") {
        const query = `SELECT * FROM ${jobDB} ${statusCondition} ORDER BY created_at DESC `;
        const data = await db.query(query);
        res.json(data);
      } else {
        const query = `SELECT * FROM  ${jobDB} ${statusCondition} order by ${name} ${order} `;
        const data = await db.query(query);
        res.json(data);
      }
    } else {
      const tableCheckQuery = `SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND OBJECT_NAME = '${appliedJobDB}'`;
      const tableCheckQueryData = await db.query(tableCheckQuery);
      const tableExist = tableCheckQueryData[0]["COUNT(*)"];

      if (!tableExist) {
        try {
          const query = `CREATE TABLE ${appliedJobDB} (
            USERID NUMBER,
            JOBID VARCHAR2(50),
            PRIMARY KEY (USERID, JOBID),
            FOREIGN KEY (USERID) REFERENCES EMPUSERDB(USERID),
            FOREIGN KEY (JOBID) REFERENCES EMPJOBDB(JOBID)
          )`;
          const data = await db.query(query);
        } catch (error) {
          console.log("Error is Creating DB", error);
        }
      }
      if (name === "") {
        const query = `SELECT 
        j.JOBID,
        j.JOBTITLE,
        j.LOCATION,
        j.EXPERIENCELEVEL,
        j.CONTACTPERSON,
        CASE
          WHEN a.USERID IS NOT NULL THEN 'REVOKE'
          ELSE 'APPLY'
        END AS STATUS
      FROM ${jobDB} j
      LEFT JOIN ${appliedJobDB} a ON j.JOBID = a.JOBID AND a.USERID = ${userId}
      WHERE j.STATUS = 'Open'`;
        const data = await db.query(query);
        res.json(data);
      } else {
        const query = `SELECT 
        j.JOBID,
        j.JOBTITLE,
        j.LOCATION,
        j.EXPERIENCELEVEL,
        j.CONTACTPERSON,
        CASE
          WHEN a.USERID IS NOT NULL THEN 'APPLIED'
          ELSE 'APPLY'
        END AS STATUS
      FROM ${jobDB} j
      LEFT JOIN ${appliedJobDB} a ON j.JOBID = a.JOBID AND a.USERID = ${userId}
      WHERE j.STATUS = 'Open' order by ${name} ${order} `;
        const data = await db.query(query);
        res.json(data);
      }
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
    const queryForApplyDB = `DELETE FROM ${appliedJobDB} WHERE jobId = :1`;
    await db.query(queryForApplyDB, [jobId]);
    const queryForJobDB = `DELETE FROM ${jobDB} WHERE jobId = :1`;
    await db.query(queryForJobDB, [jobId]);
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

router.post("/job/apply", async (req, res) => {
  const { userid, jobid } = req.body;
  try {
    const tableCheckQuery = `SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND OBJECT_NAME = '${appliedJobDB}'`;
    const tableCheckQueryData = await db.query(tableCheckQuery);
    const tableExist = tableCheckQueryData[0]["COUNT(*)"];

    if (!tableExist) {
      try {
        const query = `CREATE TABLE ${appliedJobDB} (
          USERID NUMBER,
          JOBID VARCHAR2(50),
          PRIMARY KEY (USERID, JOBID),
          FOREIGN KEY (USERID) REFERENCES EMPUSERDB(USERID),
          FOREIGN KEY (JOBID) REFERENCES EMPJOBDB(JOBID)
        )`;
        const data = await db.query(query);
      } catch (error) {
        console.log("Error is Creating DB", error);
      }
    }
    const query = `INSERT INTO ${appliedJobDB} (USERID, JOBID) VALUES (:userid, :jobid)`;
    await db.query(query, [userid, jobid]);
    res
      .status(200)
      .json({ success: true, message: "Job application successful" });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/job/revoke", async (req, res) => {
  const { userid, jobid } = req.body;
  try {
    // const tableCheckQuery = `SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE = 'TABLE' AND OBJECT_NAME = '${appliedJobDB}'`;
    // const tableCheckQueryData = await db.query(tableCheckQuery);
    // const tableExist = tableCheckQueryData[0]["COUNT(*)"];

    // if (!tableExist) {
    //   try {
    //     const query = `CREATE TABLE ${appliedJobDB} (
    //       USERID NUMBER,
    //       JOBID VARCHAR2(50),
    //       PRIMARY KEY (USERID, JOBID),
    //       FOREIGN KEY (USERID) REFERENCES EMPUSERDB(USERID),
    //       FOREIGN KEY (JOBID) REFERENCES EMPJOBDB(JOBID)
    //     )`;
    //     const data = await db.query(query);
    //   } catch (error) {
    //     console.log("Error is Creating DB", error);
    //   }
    // }
    const query = `DELETE FROM ${appliedJobDB} WHERE USERID = :userid AND JOBID = :jobid`;
    await db.query(query, [userid, jobid]);
    res
      .status(200)
      .json({ success: true, message: "Job application revoked successful" });
  } catch (error) {
    console.error("Error reevoking job application:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
