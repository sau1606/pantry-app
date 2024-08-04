// Imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require('body-parser');

const path = require('path');


const app = express();
const PORT = process.env.PORT || 4000;


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'logo')));

app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.DB_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to the database"));

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
    cookie: { secure: false }, // Set to true if using https
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// Make uploads directory static
app.use(express.static("uploads"));

app.use(express.static("logo"));

// Set template engine
app.set("view engine", "ejs");

// Router prefix
app.use("", require("./routes/routes"));

// Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
