const router = require('express').Router();
const { signup, login, verifyEmail, forgotPassword, resetPassword, getMe } = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { signupValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } = require('../utils/validators');

router.get('/me', auth, getMe);
router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

module.exports = router;
