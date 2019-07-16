const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = Schema({
	participants: [
		{
			senderId: { type: Schema.Types.ObjectId, ref: "User" },
			receiverId: { type: Schema.Types.ObjectId, ref: "User" }
		}
	]
});

module.exports = mongoose.model("Conversation", conversationSchema);
