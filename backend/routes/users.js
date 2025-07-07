const express = require('express');
const router = express.Router();
const authController = require('../controllers/userAuthController');

router.post('/signup', authController.signup);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/user/:id', authController.getUserById);
router.put('/user/update/:id', authController.updateProfile);
// router.post('/update-password', authController.updatePassword);
// router.post('/request-reset', authController.requestReset);
// router.post('/forgot-password', authController.resetPassword);
router.post('/check-session', authController.checkSession);
router.delete('/delete/:id', authController.deleteUser);





//forgot password route
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.renderResetPassword);
router.post('/reset-password/:token', authController.resetPassword);
module.exports = router;