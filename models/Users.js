const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  nonce: {
    allowNull: false,
    type: Number, // SQLITE will use INTEGER
    defaultValue: Math.floor(Math.random() * 10000), // Initialize with a random nonce
  },
  publicAddress: {
    allowNull: false,
    type: Array,
    unique: true,
  },

  username: {
    type: String,
    minLength: 4,
    required: [true, "please provide a username"],
    unique: true,
  },

  email: {
    type: String,
    required: [true, "please provide an email"],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "please add a password"],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.getSignedToken = function () {
  return jwt.sign(
    { id: this._id },
    "944da8ff79d32f486326346bd4542fb4955cda922b679bd66cb7959f0601cdc8081c77"
  );
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.requestPasswordExpire = Date.now() + 10 * (60 * 1000);

  return resetToken;
};

const Users = mongoose.model("User", UserSchema);

module.exports = Users;
