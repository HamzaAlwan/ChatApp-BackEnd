const HttpStatus = require("http-status-codes");

const User = require("../models/userModel");

module.exports = {
	async GetAllUsers(req, res) {
		await User.find({})
			.populate("posts.postId")
			.populate("following.followed")
			.populate("followers.follower")
			.populate("chatList.receiverId")
			.populate("chatList.messageId")
			.then(users => {
				res.status(HttpStatus.OK).json({ message: "All users", users });
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	},
	async GetUserById(req, res) {
		await User.findOne({ _id: req.params.id })
			.populate("posts.postId")
			.populate("following.followed")
			.populate("followers.follower")
			.populate("chatList.receiverId")
			.populate("chatList.messageId")
			.populate("notifications.followerId")
			.then(user => {
				res.status(HttpStatus.OK).json({ message: "User by id", user });
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	},
	async GetUserByName(req, res) {
		await User.findOne({ username: req.params.username })
			.populate("posts.postId")
			.populate("following.followed")
			.populate("followers.follower")
			.populate("chatList.receiverId")
			.populate("chatList.messageId")
			.populate("notifications.followerId")
			.then(user => {
				res.status(HttpStatus.OK).json({ message: "User by username", user });
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	},
	FollowUser(req, res) {
		const followUser = async () => {
			// Update the current user data
			await User.updateOne(
				{
					_id: req.user._id,
					"following.followed": { $ne: req.body.userId }
				},
				{
					$push: {
						following: {
							followed: req.body.userId
						}
					}
				}
			);
			// Update Data for the user which is getting followed
			await User.updateOne(
				{
					_id: req.body.userId,
					"followers.follower": { $ne: req.user._id }
				},
				{
					$push: {
						followers: {
							follower: req.user._id
						},
						notifications: {
							followerId: req.user._id,
							message: `${req.user.username} is now following you.`,
							created: new Date(),
							viewProfile: false
						}
					}
				}
			);
		};

		followUser()
			.then(() => {
				res.status(HttpStatus.OK).json({ message: "User followed" });
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	},
	UnFollowUser(req, res) {
		const unFollowUser = async () => {
			// Unfollow User
			await User.updateOne(
				{
					_id: req.user._id
				},
				{
					$pull: {
						following: {
							followed: req.body.userId
						}
					}
				}
			);
			// Update Data for the followed User
			await User.updateOne(
				{
					_id: req.body.userId
				},
				{
					$pull: {
						followers: {
							follower: req.user._id
						}
					}
				}
			);
		};

		unFollowUser()
			.then(() => {
				res.status(HttpStatus.OK).json({ message: "User unfollowed" });
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	}
};
