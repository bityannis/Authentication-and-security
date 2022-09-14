const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 4000;
const mongoDBClient = require("./mongoClient");
const User = require("./models/user");
const session = require("express-session");
const passport = require("passport");
// const GoogleStrategy = require("passport-google-oidc");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("https").globalAgent.options.rejectUnauthorized = false;

//Initialisation
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

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

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/secrets",
      // callbackURL: "http://localhost:4000/oauth2/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async function (accessToken, refreshToken, profile, cb) {
      const googleId = profile.id;
      const existingUser = await User.findOne({ googleId });
      console.log(existingUser);
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //   console.log(`PROFILE: ${JSON.stringify(profile)} \n ISSUER ${issuer}`);
      //   if (err) {
      //     console.log(err);
      //   }
      //   return cb(err, user);
      // });
      User.findOrCreate({ googleId }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

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

//OAUTH
app.route("/auth/google").get(
  passport.authenticate("google", {
    scope: ["profile"],
  })
);

app
  .route("/auth/google/secrets")
  .get(
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      //Successful authentication, redirect to secrets
      res.redirect("/secrets");
    }
  );

app.listen(PORT, () => {
  console.log(`Listening App on port ${PORT}`);
  mongoDBClient.init();
});
