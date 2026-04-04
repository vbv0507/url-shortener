require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 5001;

const urlRoute = require("./routes/url.js");
const connectdb = require("./connection.js");

connectdb(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo error", err));

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

function renderHome(req, res) {
  return res.render("home");
}

app.get("/", renderHome);
app.get("/test", renderHome);
app.use("/url", urlRoute);

app.listen(port, () => {
  console.log(`server start at port ${port}\n`);
});
