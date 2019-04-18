const express = require('express');
const router = express.Router();

const AuthCtrl = require('../controllers/auth');

// User Registration
router.post('/register', AuthCtrl.CreateUser);
router.post('/login', AuthCtrl.LoginUser);

module.exports = router;
