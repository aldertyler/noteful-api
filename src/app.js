require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const validateBearerToken = require("./validate-bearer-token");
const errorHandler = require("./error-handler");
// const router = require('./router')
const notesRouter = require("./notes/notes-route");
const foldersRoute = require("./folders/folders-route");
const app = express();

app.use(
  morgan(NODE_ENV === "production" ? "tiny" : "common", {
    skip: () => NODE_ENV === "test",
  })
);

app.use(cors());
app.use(helmet());
app.use(validateBearerToken);
// app.use(router)
app.use("/api/notes", notesRouter);
app.use("/api/folders", foldersRoute);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(errorHandler);

module.exports = app;
