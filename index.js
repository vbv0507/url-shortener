require("dotenv").config();

const express = require("express");
const path = require("path");
const URL = require("./model/url.js");
const cookieParser = require("cookie-parser");
const { restrictToLoggedinUserOnly } = require("./middleware/auth.middleware.js");

const app = express();
app.set("trust proxy", 1);

const port = process.env.PORT || 5001;

const urlRoute = require("./routes/url.js");
const connectdb = require("./connection.js");
const useroute = require("./routes/user.js");

//  NEW IMPORT
const { redirecturl } = require("./controller/url");

// DB
connectdb(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo error", err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve("./public")));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Home
async function renderHome(req, res) {
  const allurls = await URL.find({}).sort({ createdAt: -1 }).lean();
  return res.render("home", { urls: allurls });
}

// Routes
app.use("/api/url", urlRoute);
app.use("/user", useroute);

app.get("/", renderHome);
app.get("/home", restrictToLoggedinUserOnly, renderHome);

//  IMPORTANT (LAST LINE ROUTE)
app.get("/:shortId", redirecturl);

// Start
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
