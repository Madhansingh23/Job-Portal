import express from 'express';
import { createChangeRequest, getMyChangeRequests, getAllChangeRequests, reviewChangeRequest } from '../controllers/changeRequestController.js';
import authUser from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.post('/create', authUser, createChangeRequest);
router.get('/my-requests', authUser, getMyChangeRequests);

// Coordinator routes
router.get('/all', authUser, getAllChangeRequests);
router.post('/review', authUser, reviewChangeRequest);

export default router;
