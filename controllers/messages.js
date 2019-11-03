const HttpStatus = require("http-status-codes");

const Helpers = require("../helpers/helpers");

const User = require("../models/userModel");
const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");

module.exports = {
	async GetMessages(req, res) {
		const { senderId, receiverId } = req.params;

		const conversation = await Conversation.findOne({
			$or: [
				{
					$and: [
						{
							"participants.senderId": senderId
						},
						{
							"participants.receiverId": receiverId
						}
					]
				},
				{
					$and: [
						{
							"participants.senderId": receiverId
						},
						{
							"participants.receiverId": senderId
						}
					]
				}
			]
		}).select("_id");

		if (conversation) {
			await Message.findOne(
				{
					conversationId: conversation._id
				},
				(err, data) => {
					if (err) {
						return res
							.status(HttpStatus.INTERNAL_SERVER_ERROR)
							.json({ message: err });
					}
					res
						.status(HttpStatus.OK)
						.json({ message: "Messages returned", messages: data });
				}
			);
		}
	},
	async SendMessage(req, res) {
		// senderId is the id of the current user
		const { senderId, receiverId } = req.params;
		const { receiverName, message } = req.body;

		Conversation.find(
			{
				// Search in the database for a previous conversation between these two users.
				$or: [
					{ participants: { $elemMatch: { senderId, receiverId } } },
					{
						participants: {
							$elemMatch: { senderId: receiverId, receiverId: senderId }
						}
					}
				]
			},
			async (err, result) => {
				// If there is a previous conversation between the users.
				if (err) {
					return res
						.status(HttpStatus.INTERNAL_SERVER_ERROR)
						.json({ message: err });
				} else if (result.length > 0) {
					const msg = await Message.findOne({ conversationId: result[0]._id });

					Helpers.updateChatList(req, msg._id);

					await Message.updateOne(
						{
							conversationId: result[0]._id
						},
						{
							$push: {
								message: {
									senderId,
									senderName: req.user.username,
									receiverId,
									receiverName: receiverName,
									body: message
								}
							}
						}
					)
						.then(() => {
							res
								.status(HttpStatus.OK)
								.json({ message: "Message sent successfully." });
						})
						.catch(err => {
							return res
								.status(HttpStatus.INTERNAL_SERVER_ERROR)
								.json({ message: err });
						});
				}
				// If there is no previous conversation between the users.
				else {
					const newConversation = new Conversation();
					await newConversation.participants.push({
						senderId,
						receiverId
					});

					const saveConversation = await newConversation.save();
					const newMessage = new Message();

					newMessage.conversationId = saveConversation._id;
					newMessage.sender = req.user.username;
					newMessage.receiver = receiverName;

					await newMessage.message.push({
						senderId,
						senderName: req.user.username,
						receiverId,
						receiverName: receiverName,
						body: message
					});

					// Update the current user
					await User.updateOne(
						{
							_id: senderId
						},
						{
							$push: {
								chatList: {
									$each: [{ receiverId, messageId: newMessage._id }],
									$position: 0
								}
							}
						}
					);
					// Update the reseiver user
					await User.updateOne(
						{
							_id: receiverId
						},
						{
							$push: {
								chatList: {
									$each: [{ receiverId: senderId, messageId: newMessage._id }],
									$position: 0
								}
							}
						}
					);

					await newMessage
						.save()
						.then(() => {
							return res
								.status(HttpStatus.OK)
								.json({ message: "Message sent." });
						})
						.catch(err => {
							return res
								.status(HttpStatus.INTERNAL_SERVER_ERROR)
								.json({ message: err });
						});
				}
			}
		);
	},
	async MarkMessage(req, res) {
		const { sender, receiver } = req.params;
		const msg = await Message.aggregate([
			{ $unwind: "$message" },
			{
				$match: {
					$and: [
						{ "message.senderName": receiver, "message.receiverName": sender }
					]
				}
			}
		]);

		if (msg.length > 0) {
			try {
				msg.forEach(async elem => {
					await Message.updateOne(
						{
							"message._id": elem.message._id
						},
						{
							$set: {
								"message.$.isRead": true
							}
						}
					);
				});

				return res
					.status(HttpStatus.OK)
					.json({ message: "Message Marked as Read." });
			} catch (err) {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			}
		}
	},
	async MarkAllMessages(req, res) {
		const msg = await Message.aggregate([
			{
				$match: { "message.receiverName": req.user.username }
			},
			{ $unwind: "$message" },
			{
				$match: { "message.receiverName": req.user.username }
			}
		]);

		if (msg.length > 0) {
			try {
				msg.forEach(async elem => {
					await Message.updateOne(
						{
							"message._id": elem.message._id
						},
						{
							$set: {
								"message.$.isRead": true
							}
						}
					);
				});

				return res
					.status(HttpStatus.OK)
					.json({ message: "All Messages Marked as Read." });
			} catch (err) {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			}
		} else {
			return res
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.json({ message: "No messages were found." });
		}
	}
};
