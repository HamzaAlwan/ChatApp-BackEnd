const express = require("express");
const router = express.Router();

const MessagesCtrl = require("../controllers/messages");
const AuthHelpers = require("../helpers/authHelpers");

router.post(
	"/message/send/:senderId/:receiverId",
	AuthHelpers.VerifyToken,
	MessagesCtrl.SendMessage
);

router.get(
	"/message/get/:senderId/:receiverId",
	AuthHelpers.VerifyToken,
	MessagesCtrl.GetMessages
);

router.get(
	"/message/mark/:sender/:receiver",
	AuthHelpers.VerifyToken,
	MessagesCtrl.MarkMessage
);

router.get(
	"/message/mark-all",
	AuthHelpers.VerifyToken,
	MessagesCtrl.MarkAllMessages
);

module.exports = router;
