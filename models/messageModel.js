const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = Schema({
	conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
	sender: { type: String },
	receiver: { type: String },
	message: [
		{
			senderId: { type: Schema.Types.ObjectId, ref: "User" },
			receiverId: { type: Schema.Types.ObjectId, ref: "User" },
			senderName: { type: String },
			receiverName: { type: String },
			body: { type: String, default: "" },
			isRead: { type: Boolean, default: false },
			createdAt: { type: Date, default: Date.now() }
		}
	]
});

module.exports = mongoose.model("Message", messageSchema);
