const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema({
	fullname: { type: String },
	username: { type: String },
	birthday: { type: Date },
	sex: { type: String },
	country: { type: String },
	email: { type: String },
	phoneNumber: { type: String },
	password: { type: String },
	posts: [
		{
			postId: { type: Schema.Types.ObjectId, ref: "Post" },
			post: { type: String },
			created: { type: Date, default: Date.now() }
		}
	],
	// Array of the people that are followed by the current user
	following: [{ followed: { type: Schema.Types.ObjectId, ref: "User" } }],
	// Array of the people that are following the current user
	followers: [{ follower: { type: Schema.Types.ObjectId, ref: "User" } }],
	notifications: [
		{
			followerId: { type: Schema.Types.ObjectId, ref: "User" },
			message: { type: String },
			viewProfile: { type: Boolean, default: false },
			created: { type: Date, default: Date.now() },
			read: { type: Boolean, default: false },
			date: { type: String, default: "" }
		}
	]
});

module.exports = mongoose.model("User", userSchema);
