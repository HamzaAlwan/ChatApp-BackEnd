const mongoose = require('mongoose');
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
            postId: { type: Schema.Types.ObjectId, ref: 'Post' },
            post: { type: String },
            created: { type: Date, default: Date.now() }
        }
    ],
    following: [
        { followed: { type: Schema.Types.ObjectId, ref: 'User' } }
    ],
    followers: [
        { follower: { type: Schema.Types.ObjectId, ref: 'User' } }
    ]
});

module.exports = mongoose.model('User', userSchema);
