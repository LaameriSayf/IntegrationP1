const express = require('express');
const { forgotPassword, resetPassword } = require('../controllers/PasswordController');
const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:userId/:token', resetPassword);

module.exports = router;