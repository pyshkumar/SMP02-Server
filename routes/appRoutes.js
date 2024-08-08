const express = require("express");
const authRoutes = require("./authRoutes");
const jobRoutes = require("./jobRoutes");

const router = express.Router();

router.use(authRoutes);
router.use(jobRoutes);

module.exports = router;
