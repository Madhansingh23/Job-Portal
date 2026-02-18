import express from 'express';
import { createGroup, getGroups, addMemberToGroup, removeMemberFromGroup } from '../controllers/groupController.js';
import authUser from '../middleware/auth.js';

const router = express.Router();

router.post('/create', authUser, createGroup);
router.get('/all', authUser, getGroups);
router.post('/add-member', authUser, addMemberToGroup);
router.post('/remove-member', authUser, removeMemberFromGroup);

export default router;
