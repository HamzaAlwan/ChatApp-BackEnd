const express = require('express');
const router = express.Router();

const UsersCtrl = require('../controllers/users');
const AuthHelpers = require('../helpers/authHelpers');

router.get('/user/getAll', AuthHelpers.VerifyToken, UsersCtrl.GetAllUsers);
router.post('/user/follow', AuthHelpers.VerifyToken, UsersCtrl.FollowUser);

module.exports = router;
