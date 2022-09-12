require("dotenv").config();
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
  },
  { collection: "authentication" }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
