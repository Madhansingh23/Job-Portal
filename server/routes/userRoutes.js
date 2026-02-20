import express from 'express'
import { applyForJob, getUserData, getUserJobApplications, updateUserResume, updateUserProfile, adminUpdateUserProfile, withdrawApplication, updateUserImage, respondToOffer } from '../controllers/userController.js'
import upload from '../config/multer.js'
import authUser from '../middleware/auth.js'


const router = express.Router()

// Get user Data
router.get('/user', authUser, getUserData)

// Apply for a job
router.post('/apply', authUser, applyForJob)

// Withdraw Application
router.post('/withdraw', authUser, withdrawApplication)

// Get applied jobs data
router.get('/applications', authUser, getUserJobApplications)

// Update user profile (resume)
router.post('/update-resume', upload.single('resume'), authUser, updateUserResume)

// Update user profile (image)
router.post('/update-image', upload.single('image'), authUser, updateUserImage)

// Update user profile (general)
router.post('/update-profile', authUser, updateUserProfile)

// Respond to Offer
router.post('/respond-to-offer', authUser, respondToOffer)

// Admin Update (Protected) - No authUser needed as it relies on admin password, but good to have
router.post('/admin-update', adminUpdateUserProfile)


export default router;