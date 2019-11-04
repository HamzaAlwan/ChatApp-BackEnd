const express = require("express");
const router = express.Router();

const AuthCtrl = require("../controllers/auth");

// User Registration
router.post("/register", AuthCtrl.CreateUser);
router.post("/login", AuthCtrl.LoginUser);
router.post("/update-profile", AuthCtrl.UpdateProfile);
router.post("/update-password", AuthCtrl.UpdatePassword);

module.exports = router;
