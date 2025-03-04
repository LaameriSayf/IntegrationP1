const express = require('express');
const { registerUser , signInUser , verifyEmail , resendVerificationEmail , fetchUsersByFilters } = require('../controllers/userController');
const upload = require('../middlewares/uploadImage');
const router = express.Router();

router.post('/sign-up', upload.single('image'), registerUser);
router.post('/sign-in', signInUser);
router.get('/verify-email/:verificationToken', verifyEmail);
router.post('/resend-verification-email', resendVerificationEmail);
router.get('/view-users', fetchUsersByFilters); 


module.exports = router;
