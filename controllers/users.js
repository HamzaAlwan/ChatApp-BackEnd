const HttpStatus = require('http-status-codes');

const User = require('../models/userModel');

module.exports = {
    async GetAllUsers(req, res) {
        await User.find({})
            .populate('posts.postId')
            .then(users => {
                res.status(HttpStatus.OK).json({ message: 'All users', users });
            })
            .catch(err => {
                return res
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ message: err });
            });
    },
    FollowUser(req, res) {
        const followUser = async () => {
            // Follow User
            await User.updateOne(
                {
                    _id: req.user._id,
                    'following.followed': { $ne: req.body.userId }
                },
                {
                    $push: {
                        following: {
                            followed: req.body.userId
                        }
                    }
                }
            );
            // Update Data for the followed User
            await User.updateOne(
                {
                    _id: req.body.userId,
                    'followers.follower': { $ne: req.user._id }
                },
                {
                    $push: {
                        followers: {
                            follower: req.user._id
                        }
                    }
                }
            );
        };

        followUser()
            .then(() => {
                res.status(HttpStatus.OK).json({ message: 'User followed' });
            })
            .catch(err => {
                return res
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ message: err });
            });
    }
};
