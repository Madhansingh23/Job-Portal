import express from 'express';
import { coordinatorLogin, coordinatorRegister, getAllStudents, updateStudent, verifyStudentField, getPlacementAnalytics, getPlacedStudents, getUnplacedStudents, getCoordinatorProfile, updateCoordinatorProfile, changeCoordinatorPassword } from '../controllers/coordinatorController.js';
import authUser from '../middleware/auth.js';

const router = express.Router();

// Public routes (no auth needed)
router.post('/login', coordinatorLogin);
router.post('/register', coordinatorRegister);

// Protected routes (require auth token)
router.get('/students', authUser, getAllStudents);
router.post('/update-student', authUser, updateStudent);
router.post('/verify-field', authUser, verifyStudentField);
router.get('/analytics', authUser, getPlacementAnalytics);
router.get('/placed-students', authUser, getPlacedStudents);
router.get('/unplaced-students', authUser, getUnplacedStudents);

// Coordinator Profile (auth handled internally but adding middleware for consistency)
router.get('/profile', authUser, getCoordinatorProfile);
router.post('/update-profile', authUser, updateCoordinatorProfile);
router.post('/change-password', authUser, changeCoordinatorPassword);

export default router;
