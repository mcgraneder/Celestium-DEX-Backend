const express = require("express");
const router = express.Router();
const { getPrivateData } = require("../controllers/private");
const { protect } = require("../middleware/auth");

router.route("/").get(protect, getPrivateData);
router.route("/wallet").get(protect, getPrivateData);
router.route("/tokeninfo").get(protect, getPrivateData);
router.route("/profile").get(protect, getPrivateData);



module.exports = router;