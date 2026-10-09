const express = require("express");
const app = express();

const config = require("./config.json");

//== connect to database
const mongoURI =
  config.MONGODB_URI || "mongodb://localhost:27017" + "/newsFeed";

let mongoose = require("mongoose");
const newsArticleModel = require("./model");

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (err) => console.log(err));
db.once("open", () => console.log("connected to database"));

const onePageArticleCount = 10;

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("hello world!");
});

app.get("/newsFeeds", async (req, res) => {
  const limitParam = Number(req.query.limit);
  const offsetParam = Number(req.query.offset);

  const limit =
    Number.isInteger(limitParam) && limitParam > 0
      ? limitParam
      : onePageArticleCount; // default 10
  const offset =
    Number.isInteger(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

  try {
    const articles = await newsArticleModel.find({}).skip(offset).limit(limit);
    res.status(200).json(articles);
  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
});

// ==end==

module.exports = { app, db };
