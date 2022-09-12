require("dotenv").config();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const userSchema = new mongoose.Schema(
  {
    email: String,
    password: String,
  },
  { collection: "authentication" }
);

//Use ENV Variable as encryption secret string.
const secret = process.env.DB_SECRET;

//ENCRYPTE LE PASSWORD. A CHAQUE CREATION DE DOCUMENT ON .save() LE PASSWORD SERA CRYPTE DANS LA BDD
userSchema.plugin(encrypt, {
  secret: secret,
  encryptedFields: ["password"],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
