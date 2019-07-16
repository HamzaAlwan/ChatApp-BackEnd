const express = require("express");
const router = express.Router();

const UsersCtrl = require("../controllers/users");
const AuthHelpers = require("../helpers/authHelpers");

router.get("/user/getAll", AuthHelpers.VerifyToken, UsersCtrl.GetAllUsers);
router.get("/user/getById/:id", AuthHelpers.VerifyToken, UsersCtrl.GetUserById);
router.get(
	"/user/getByName/:username",
	AuthHelpers.VerifyToken,
	UsersCtrl.GetUserByName
);

router.post("/user/follow", AuthHelpers.VerifyToken, UsersCtrl.FollowUser);
router.post("/user/unfollow", AuthHelpers.VerifyToken, UsersCtrl.UnFollowUser);

module.exports = router;
