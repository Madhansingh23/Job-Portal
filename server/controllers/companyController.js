import Company from "../models/Company.js";
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import Group from "../models/Group.js";

// Register a new company
export const registerCompany = async (req, res) => {

    const { name, email, password } = req.body

    const imageFile = req.file;

    if (!name || !email || !password || !imageFile) {
        return res.json({ success: false, message: "Missing Details" })
    }

    try {

        const companyExists = await Company.findOne({ email })

        if (companyExists) {
            return res.json({ success: false, message: 'Company already registered' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        const company = await Company.create({
            name,
            email,
            password: hashPassword,
            image: imageUpload.secure_url
        })

        res.json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            },
            token: generateToken(company._id)
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Login Company
export const loginCompany = async (req, res) => {

    const { email, password } = req.body

    try {

        const company = await Company.findOne({ email })

        if (await bcrypt.compare(password, company.password)) {

            res.json({
                success: true,
                company: {
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: generateToken(company._id)
            })

        }
        else {
            res.json({ success: false, message: 'Invalid email or password' })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get Company Data
export const getCompanyData = async (req, res) => {

    try {

        const company = req.company

        res.json({ success: true, company })

    } catch (error) {
        res.json({
            success: false, message: error.message
        })
    }

}

// Post New Job
export const postJob = async (req, res) => {

    try {
        const { title, description, location, salary, category, level, minCGPA, minTenthMarks, minTwelfthMarks, maxArrears, targetBatch, eligibleDepts, eligibleGroups, rounds, offerType } = req.body

        const newJob = new Job({
            title,
            description,
            location,
            salary,
            companyId: req.company._id,
            date: Date.now(),
            category,
            level,
            minCGPA: Number(minCGPA),
            minTenthMarks: Number(minTenthMarks) || 0,
            minTwelfthMarks: Number(minTwelfthMarks) || 0,
            maxArrears: maxArrears !== undefined ? Number(maxArrears) : 100, // Default to 100 (lenient) if not specified
            targetBatch,
            eligibleDepts,
            eligibleGroups,
            rounds,
            offerType
        })

        await newJob.save()

        res.json({ success: true, newJob })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Get Company Job Applicants
export const getCompanyJobApplicants = async (req, res) => {
    try {

        const companyId = req.company._id

        // Find job applications for the user and populate related data
        const applications = await JobApplication.find({ companyId })
            .populate('userId', 'name image resume registerNumber dept cgpa email phone')
            .populate('jobId', 'title location category level salary rounds')
            .exec()

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Company Posted Jobs
export const getCompanyPostedJobs = async (req, res) => {
    try {

        const companyId = req.company._id

        const jobs = await Job.find({ companyId })

        // Adding No. of applicants info in data
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicants = await JobApplication.find({ jobId: job._id });
            return { ...job.toObject(), applicants: applicants.length }
        }))

        res.json({ success: true, jobsData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Change Job Application Status
export const ChangeJobApplicationsStatus = async (req, res) => {
    try {
        const { id, status } = req.body
        const imageFile = req.file

        const application = await JobApplication.findById(id).populate('jobId', 'rounds')
        if (!application) {
            return res.json({ success: false, message: 'Application not found' })
        }

        // Handle Offer Letter Upload
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path)
            application.offerLetter = imageUpload.secure_url
            application.offerStatus = 'Pending' // Reset offer status on new upload
        }

        const rounds = application.jobId?.rounds || []
        const roundIndex = rounds.indexOf(status)

        // If status matches a round name, track round progression
        if (roundIndex !== -1) {
            // Mark previous round as Passed
            if (application.roundHistory && application.roundHistory.length > 0) {
                const lastEntry = application.roundHistory[application.roundHistory.length - 1]
                if (lastEntry.status === 'In Progress') lastEntry.status = 'Passed'
            }
            application.roundHistory.push({ round: status, status: 'In Progress', date: Date.now() })
            application.currentRound = roundIndex
            application.status = status
        } else if (status === 'Selected') {
            if (application.roundHistory && application.roundHistory.length > 0) {
                const lastEntry = application.roundHistory[application.roundHistory.length - 1]
                if (lastEntry.status === 'In Progress') lastEntry.status = 'Passed'
            }
            application.status = 'Selected'
            application.currentRound = rounds.length
        } else if (status === 'Rejected') {
            if (application.roundHistory && application.roundHistory.length > 0) {
                const lastEntry = application.roundHistory[application.roundHistory.length - 1]
                if (lastEntry.status === 'In Progress') lastEntry.status = 'Failed'
            }
            application.status = 'Rejected'
        } else {
            application.status = status
        }

        await application.save()
        res.json({ success: true, message: 'Status Changed' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Change Job Visiblity
export const changeVisiblity = async (req, res) => {
    try {

        const { id } = req.body

        const companyId = req.company._id

        const job = await Job.findById(id)

        if (companyId.toString() === job.companyId.toString()) {
            job.visible = !job.visible
        }

        await job.save()

        res.json({ success: true, job })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Delete Job
export const deleteJob = async (req, res) => {
    try {
        const { id } = req.body
        const companyId = req.company._id

        const job = await Job.findById(id)

        if (!job) {
            return res.json({ success: false, message: 'Job not found' })
        }

        if (job.companyId.toString() !== companyId.toString()) {
            return res.json({ success: false, message: 'Not authorized to delete this job' })
        }

        await Job.findByIdAndDelete(id)

        await JobApplication.deleteMany({ jobId: id })

        res.json({ success: true, message: 'Job deleted successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get All Groups for Company
export const getCompanyGroups = async (req, res) => {
    try {
        const groups = await Group.find({ companyId: req.company._id }); // Filter by company ideally, or all if shared? 
        // Original code was Group.find() which returns ALL groups. 
        // Assuming groups are shared or checking schema...
        // For now sticking to original logic but adding getCompanyStats below.
        const allGroups = await Group.find();
        res.json({ success: true, groups: allGroups });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Company Stats
export const getCompanyStats = async (req, res) => {
    try {
        const companyId = req.company._id

        // Fetch counts in parallel for performance
        const [totalJobs, activeJobs, totalApplicants, selectedApplicants] = await Promise.all([
            Job.countDocuments({ companyId }),
            Job.countDocuments({ companyId, visible: true }),
            JobApplication.countDocuments({ companyId }),
            JobApplication.countDocuments({ companyId, status: 'Selected' })
        ])

        res.json({
            success: true,
            stats: {
                totalJobs,
                activeJobs,
                totalApplicants,
                selectedApplicants
            }
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Update Company Profile
export const updateCompanyProfile = async (req, res) => {
    try {
        const { name, email } = req.body
        const imageFile = req.file
        const company = await Company.findById(req.company._id)

        if (!company) {
            return res.json({ success: false, message: 'Company not found' })
        }

        if (name) company.name = name
        if (email) company.email = email

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path)
            company.image = imageUpload.secure_url
        }

        await company.save()

        res.json({
            success: true,
            message: 'Profile updated successfully',
            company: { _id: company._id, name: company.name, email: company.email, image: company.image }
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Change Company Password
export const changeCompanyPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.json({ success: false, message: 'Both current and new password are required' })
        }

        if (newPassword.length < 6) {
            return res.json({ success: false, message: 'New password must be at least 6 characters' })
        }

        const company = await Company.findById(req.company._id)
        if (!company) {
            return res.json({ success: false, message: 'Company not found' })
        }

        const isMatch = await bcrypt.compare(currentPassword, company.password)
        if (!isMatch) {
            return res.json({ success: false, message: 'Current password is incorrect' })
        }

        const salt = await bcrypt.genSalt(10)
        company.password = await bcrypt.hash(newPassword, salt)
        await company.save()

        res.json({ success: true, message: 'Password changed successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}