import express from 'express';
import { coordinatorLogin, coordinatorRegister, getAllStudents, updateStudent, getPlacementAnalytics, getPlacedStudents, getUnplacedStudents } from '../controllers/coordinatorController.js';

const router = express.Router();

router.post('/login', coordinatorLogin);
router.post('/register', coordinatorRegister);
router.get('/students', getAllStudents);
router.post('/update-student', updateStudent);
router.get('/analytics', getPlacementAnalytics);
router.get('/placed-students', getPlacedStudents);
router.get('/unplaced-students', getUnplacedStudents);

export default router;
