const express = require("express");
const router = express.Router();

const PostCtrl = require("../controllers/posts");
const AuthHelpers = require("../helpers/authHelpers");

router.post("/post/create", AuthHelpers.VerifyToken, PostCtrl.CreatePost);
router.post("/post/like", AuthHelpers.VerifyToken, PostCtrl.LikePost);
router.post("/post/unlike", AuthHelpers.VerifyToken, PostCtrl.UnLikePost);
router.post("/post/comment", AuthHelpers.VerifyToken, PostCtrl.CommentPost);

router.get("/post/getAll", AuthHelpers.VerifyToken, PostCtrl.GetPosts);
router.get("/post/getPost/:id", AuthHelpers.VerifyToken, PostCtrl.GetPost);

module.exports = router;
