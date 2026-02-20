import express from 'express'
import { getJobById, getJobs, getPublicJobs } from '../controllers/jobController.js';
import authUser from '../middleware/auth.js';

const router = express.Router()

// Route to get all jobs data (authenticated)
router.get('/all', authUser, getJobs)

// Route to get all jobs publicly (no auth required - for home page)
router.get('/public', getPublicJobs)

// Route to get a single job by ID
router.get('/:id', getJobById)


export default router;