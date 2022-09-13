const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 4000;
const mongoDBClient = require("./mongoClient");
const User = require("./models/user");
const session = require("express-session");
const passport = require("passport");

//Initialisation
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//HOME
app.route("/").get(async (req, res) => {
  res.render("home");
});

//LOGIN
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    req.login(user, (err) => {
      err
        ? console.error(err)
        : passport.authenticate("local")(req, res, function () {
            res.redirect("/secrets");
          });
    });
  });

//REGISTER
app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    User.register(
      {
        username: req.body.username,
      },
      req.body.password,
      (err, user) => {
        if (user) {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/secrets");
          });
        } else if (err) {
          console.error(err);
          res.redirect("/register");
        }
      }
    );
  });

//SECRETS
app.route("/secrets").get((req, res) => {
  req.isAuthenticated() ? res.render("secrets") : res.redirect("/login");
});

//LOGOUT
app.route("/logout").post((req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Listening App on port ${PORT}`);
  mongoDBClient.init();
});
