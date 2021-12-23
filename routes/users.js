const express = require("express");
const router = express.Router();
const { getUserData, FindAddress, getUserNonce, getUser } = require("../controllers/users");
const { protect } = require("../middleware/auth");

router.route("/").get(getUserData);

router.route("/publicAddress").post(FindAddress);

router.route("/nonce").post(getUserNonce);

router.route("/wallet").post(getUserData);



module.exports = router;