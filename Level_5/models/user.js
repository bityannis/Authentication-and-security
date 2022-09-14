require("dotenv").config();
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const userSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
    googleId: String,
  },
  { collection: "authentication" }
);

userSchema.plugin(passportLocalMongoose, { usernameField: "googleId" });
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

module.exports = User;
