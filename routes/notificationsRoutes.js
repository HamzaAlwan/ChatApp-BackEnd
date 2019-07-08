const express = require("express");
const router = express.Router();

const NotificaionsCtrl = require("../controllers/notifications");
const AuthHelpers = require("../helpers/authHelpers");

router.post(
	"/notifications/mark",
	AuthHelpers.VerifyToken,
	NotificaionsCtrl.MarkRead
);
router.post(
	"/notifications/delete",
	AuthHelpers.VerifyToken,
	NotificaionsCtrl.DeleteNoti
);
router.post(
	"/notifications/mark-all",
	AuthHelpers.VerifyToken,
	NotificaionsCtrl.MarkAllRead
);

module.exports = router;
