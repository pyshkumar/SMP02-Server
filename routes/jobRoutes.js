const express = require("express");
const router = express.Router();

const jobRouteHandlers = require("../handlers/jobRouteHandlers");

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

router.post("/job/search", jobRouteHandlers.jobSearch);

router.post("/job", jobRouteHandlers.jobGet);

router.put("/job/:jobId", jobRouteHandlers.updateJob);

router.delete("/job/:jobId", jobRouteHandlers.deleteJob);

router.post("/checkJobId", jobRouteHandlers.checkJobId);

router.post("/job/apply", jobRouteHandlers.applyJob);

router.post("/job/revoke", jobRouteHandlers.revokeJob);

module.exports = router;
