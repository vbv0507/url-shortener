require("dotenv").config();

const express = require("express");
const path = require("path");
const URL = require("./model/url.js");
const cookieParser=require('cookie-parser');
const {restrictToLoggedinUserOnly}=require('./middleware/auth.middleware.js')

const app = express();
const port = process.env.PORT || 5001;

const urlRoute = require("./routes/url.js");
const connectdb = require("./connection.js");
const useroute=require('./routes/user.js');

connectdb(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo error", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve("./public")));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

async function renderHome(req, res) {
  const allurls = await URL.find({}).sort({ createdAt: -1 }).lean();
  return res.render("home", {
    urls: allurls,
  });
}

app.get("/", renderHome);
app.get("/home", restrictToLoggedinUserOnly, renderHome);
app.use("/user",useroute);
app.use("/api/url", urlRoute);

app.listen(port, () => {
  console.log(`server start at port ${port}\n`);
});
