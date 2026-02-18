import express from 'express';
import { sendOtp, register, login, forgotPassword, changePassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', changePassword);

export default router;
