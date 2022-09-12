const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 4000;
const mongoDBClient = require("./mongoClient");
const User = require("./models/user");
const md5 = require("md5");

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");

app.route("/").get(async (req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    User.findOne({ email: email }, (err, user) => {
      if (user) {
        if (user.password === md5(password)) {
          res.render("secrets");
        } else {
          res.send("Invalid credentials");
        }
      } else {
        res.send("Unknow user, please register");
      }
    });
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    const newUser = new User({
      email: email,
      password: md5(password),
    });
    newUser.save((err, result) => {
      err ? res.send(err) : res.render("secrets");
    });
  });

app.listen(PORT, () => {
  console.log(`Listening App on port ${PORT}`);
  mongoDBClient.init();
});
