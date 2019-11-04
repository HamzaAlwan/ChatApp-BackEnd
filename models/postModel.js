const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = Schema({
	user: { type: Schema.Types.ObjectId, ref: "User" },
	username: { type: String, default: "" },
	post: { type: String, default: "" },
	comments: [
		{
			userId: { type: Schema.Types.ObjectId, ref: "User" },
			username: { type: String, default: "" },
			comment: { type: String, default: "" },
			createdAt: { type: Date, default: Date.now() }
		}
	],
	likes: [
		{
			username: { type: String, default: "" }
		}
	],
	created: { type: Date, default: Date.now() },
	image: {
		id: { type: String, default: undefined },
		version: { type: String, default: undefined }
	}
});

module.exports = mongoose.model("Post", postSchema);
