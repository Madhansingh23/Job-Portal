import express from 'express'
import { ChangeJobApplicationsStatus, changeVisiblity, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany, getCompanyGroups, getCompanyStats, updateCompanyProfile, changeCompanyPassword } from '../controllers/companyController.js'
import upload from '../config/multer.js'
import { protectCompany } from '../middleware/authMiddleware.js'

const router = express.Router()

// Register a company
router.post('/register', upload.single('image'), registerCompany)

// Company login
router.post('/login', loginCompany)

// Get company data
router.get('/company', protectCompany, getCompanyData)

// Post a job
router.post('/post-job', protectCompany, postJob)

// Get Applicants Data of Company
router.get('/applicants', protectCompany, getCompanyJobApplicants)

// Get  Company Job List
router.get('/list-jobs', protectCompany, getCompanyPostedJobs)

// Change Applcations Status 
router.post('/change-status', protectCompany, upload.single('offerLetter'), ChangeJobApplicationsStatus)

// Change Applcations Visiblity 
// Change Applcations Visiblity 
router.post('/change-visiblity', protectCompany, changeVisiblity)

// Get All Groups
router.get('/groups', protectCompany, getCompanyGroups)

// Get Company Stats
router.get('/stats', protectCompany, getCompanyStats)

// Update Company Profile
router.post('/update-profile', protectCompany, upload.single('image'), updateCompanyProfile)

// Change Company Password
router.post('/change-password', protectCompany, changeCompanyPassword)

export default router