const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema({
	fullname: { type: String },
	username: { type: String },
	birthday: { type: Date },
	sex: { type: String },
	country: { type: String },
	username_lower: { type: String },
	email: { type: String },
	phone_number: { type: String },
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
	],
	chatList: [
		{
			// The person which is going to receive the messages
			receiverId: { type: Schema.Types.ObjectId, ref: "User" },
			messageId: { type: Schema.Types.ObjectId, ref: "Message" }
		}
	],
	image: {
		id: { type: String, default: "user_lzhgun.svg" },
		version: { type: String, default: "1569674029" }
	}
});

module.exports = mongoose.model("User", userSchema);
