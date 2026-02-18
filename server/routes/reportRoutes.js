import express from 'express';
import { getPlacementReport, getDashboardStats } from '../controllers/reportController.js';
import authUser from '../middleware/auth.js';

const router = express.Router();

router.get('/placement', authUser, getPlacementReport);
router.get('/stats', authUser, getDashboardStats);

export default router;
