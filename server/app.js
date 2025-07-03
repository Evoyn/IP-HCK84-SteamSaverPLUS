if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const qs = require("qs");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const routes = require("./routes");

const app = express();
app.set("query parser", function (str) {
  return qs.parse(str);
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use("/", routes);

app.use(errorHandler);

module.exports = app;
