const express = require("express");
const router = express.Router();
const {
  getUserData,
  FindAddress,
  getUserNonce,
  getUserAddress,
  updateUserAddress,
  getNonce,
} = require("../controllers/users");

router.route("/").get(getUserData);
router.route("/userAddress").post(getUserAddress);
router.route("/publicAddress").post(FindAddress);
router.route("/nonce").post(getUserNonce);
router.route("/wallet").post(getUserData);
router.route("/updateAddress").post(updateUserAddress);
router.route("/getNonce").post(getNonce);

module.exports = router;
