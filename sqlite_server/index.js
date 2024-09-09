const express = require("express");
const mongoose = require("mongoose");
const projectRouter = require("./routes/ProjectRoutes.js");

const app = express();

app.use(projectRouter);

app.listen(8081, () => {
  console.log("Server is running...");
});
