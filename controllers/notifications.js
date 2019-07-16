const HttpStatus = require("http-status-codes");

const User = require("../models/userModel");

module.exports = {
	async MarkRead(req, res) {
		await User.updateOne(
			{ _id: req.user._id, "notifications._id": req.body.id },
			{
				$set: { "notifications.$.read": true }
			}
		)
			.then(() => {
				res
					.status(HttpStatus.OK)
					.json({ message: "Notification marked as read" });
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	},
	async MarkAllRead(req, res) {
		await User.updateOne(
			{ _id: req.user._id },
			{
				$set: { "notifications.$[elem].read": true }
			},
			// This will change every elem.read that is false to true
			{ arrayFilters: [{ "elem.read": false }], multi: true }
		)
			.then(() => {
				res
					.status(HttpStatus.OK)
					.json({ message: "All notifications marked as read" });
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	},
	async DeleteNoti(req, res) {
		await User.updateOne(
			{ _id: req.user._id, "notifications._id": req.body.id },
			{
				$pull: { notifications: { _id: req.body.id } }
			}
		)
			.then(() => {
				res.status(HttpStatus.OK).json({ message: "Notification deleted" });
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	}
};
