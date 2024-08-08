// authRoutes.js
const express = require("express");
const router = express.Router();

const authRouteHandlers = require("../handlers/authRouteHandlers");

router.post("/signup", authRouteHandlers.signoutHandler);

router.post("/signin", authRouteHandlers.signinHandler);

module.exports = router;
