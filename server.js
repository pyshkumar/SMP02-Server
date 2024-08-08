const express = require("express");
const cors = require("cors");
require("dotenv").config();
const appRoutes = require("./routes/appRoutes");

const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const port = process.env.SERVER_PORT;

app.use(appRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
