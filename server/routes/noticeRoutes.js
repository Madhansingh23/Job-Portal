import express from 'express';
import { createNotice, deleteNotice, getAllNotices, getStudentNotices } from '../controllers/noticeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Coordinator routes
router.post('/create', protect, createNotice);
router.post('/delete', protect, deleteNotice);
router.get('/all', protect, getAllNotices);

// Student routes
router.get('/student', protect, getStudentNotices);

export default router;
