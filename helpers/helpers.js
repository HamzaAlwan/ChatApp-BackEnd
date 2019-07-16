const User = require("../models/userModel");

module.exports = {
	lowerCase: str => {
		return str.toLowerCase();
	},

	updateChatList: async (req, msgId) => {
		await User.updateOne(
			{
				_id: req.user._id
			},
			{
				$pull: {
					chatList: {
						receiverId: req.params.receiverId
					}
				}
			}
		);

		await User.updateOne(
			{
				_id: req.params.receiverId
			},
			{
				$pull: {
					chatList: {
						receiverId: req.user._id
					}
				}
			}
		);

		await User.updateOne(
			{
				_id: req.params.receiverId
			},
			{
				$pull: {
					chatList: {
						receiverId: req.user._id
					}
				}
			}
		);

		// Update the current user
		await User.updateOne(
			{
				_id: req.user._id
			},
			{
				$push: {
					chatList: {
						$each: [{ receiverId: req.params.receiverId, messageId: msgId }],
						$position: 0
					}
				}
			}
		);
		// Update the reseiver user
		await User.updateOne(
			{
				_id: req.params.receiverId
			},
			{
				$push: {
					chatList: {
						$each: [{ receiverId: req.user._id, messageId: msgId }],
						$position: 0
					}
				}
			}
		);
	}
};
