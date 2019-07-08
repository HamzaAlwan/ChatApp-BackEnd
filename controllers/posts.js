const Joi = require("joi");
const HttpStatus = require("http-status-codes");

const Post = require("../models/postModel");
const User = require("../models/userModel");

module.exports = {
	CreatePost(req, res) {
		const schema = Joi.object().keys({
			post: Joi.string().required()
		});
		const { error } = Joi.validate(req.body, schema);
		if (error && error.details) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.json({ messageJoi: error.details });
		}
		const body = {
			user: req.user._id,
			username: req.user.username,
			post: req.body.post,
			created: new Date()
		};

		Post.create(body)
			.then(async post => {
				await User.updateOne(
					{ _id: req.user._id },
					{
						$push: {
							posts: {
								postId: post._id,
								post: req.body.post,
								created: new Date()
							}
						}
					}
				);

				res.status(HttpStatus.OK).json({
					message: "Post created successfully",
					post
				});
			})
			.catch(err => {
				return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
					message: err
				});
			});
	},
	async LikePost(req, res) {
		const username = req.user.username;
		const postId = req.body._id;

		await Post.updateOne(
			{ _id: postId, "likes.username": { $ne: username } },
			{
				$push: { likes: { username } }
			}
		)
			.then(() => {
				res.status(HttpStatus.OK).json({ message: "Post liked" });
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	},
	async UnLikePost(req, res) {
		const username = req.user.username;
		const postId = req.body._id;

		await Post.updateOne(
			{ _id: postId },
			{
				$pull: { likes: { username } }
			}
		)
			.then(() => {
				res.status(HttpStatus.OK).json({ message: "Post unliked" });
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	},
	async CommentPost(req, res) {
		const user = req.user;
		const postId = req.body.postId;
		const comment = req.body.comment;

		await Post.updateOne(
			{ _id: postId },
			{
				$push: {
					comments: {
						userId: user._id,
						username: user.username,
						comment: comment,
						createdAt: new Date()
					}
				}
			}
		)
			.then(() => {
				res.status(HttpStatus.OK).json({
					message: "Comment added successfully"
				});
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: err });
			});
	},
	async GetPosts(req, res) {
		try {
			const posts = await Post.find({})
				.populate("user")
				.sort({ created: -1 });
			return res.status(HttpStatus.OK).json({ message: "All posts", posts });
		} catch (err) {
			return res
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.json({ message: err });
		}
	},
	async GetPost(req, res) {
		await Post.findOne({ _id: req.params.id })
			.populate("user")
			.populate("comments.userId")
			.then(post => {
				res.status(HttpStatus.OK).json({ message: "Post found", post });
			})
			.catch(err => {
				return res
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json({ message: "Post not found" });
			});
	}
};
