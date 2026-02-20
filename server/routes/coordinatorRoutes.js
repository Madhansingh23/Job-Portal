import express from 'express';
import { coordinatorLogin, coordinatorRegister, getAllStudents, updateStudent, verifyStudentField, getPlacementAnalytics, getPlacedStudents, getUnplacedStudents, getCoordinatorProfile, updateCoordinatorProfile, changeCoordinatorPassword } from '../controllers/coordinatorController.js';

const router = express.Router();

router.post('/login', coordinatorLogin);
router.post('/register', coordinatorRegister);
router.get('/students', getAllStudents);
router.post('/update-student', updateStudent);
router.post('/verify-field', verifyStudentField);
router.get('/analytics', getPlacementAnalytics);
router.get('/placed-students', getPlacedStudents);
router.get('/unplaced-students', getUnplacedStudents);

// Coordinator Profile
router.get('/profile', getCoordinatorProfile);
router.post('/update-profile', updateCoordinatorProfile);
router.post('/change-password', changeCoordinatorPassword);

export default router;
