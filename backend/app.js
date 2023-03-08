const express = require("express");
const mongoose = require("mongoose");
const app = express();
const BookRouter = require("./routes/books");
const UserRouter = require("./routes/users");
const User = require("./models/User");
const cors = require("cors");
const path = require("path");

mongoose
  .connect(
    "mongodb+srv://Fernandouz:Vaval62hu6@cluster0.jrafbl3.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/api/auth", UserRouter);

app.use("/api/books", BookRouter);

app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
