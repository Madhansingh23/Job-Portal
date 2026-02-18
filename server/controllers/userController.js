import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import { v2 as cloudinary } from "cloudinary"

// Get User Data
export const getUserData = async (req, res) => {

    const userId = req.body.userId

    try {

        const user = await User.findById(userId).populate('groups')

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}


// Apply For Job
export const applyForJob = async (req, res) => {

    const { jobId } = req.body

    const userId = req.body.userId

    try {

        const isAlreadyApplied = await JobApplication.find({ jobId, userId })

        if (isAlreadyApplied.length > 0) {
            return res.json({ success: false, message: 'Already Applied' })
        }

        const jobData = await Job.findById(jobId)

        if (!jobData) {
            return res.json({ success: false, message: 'Job Not Found' })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        // Double check eligibility (Security)
        if (user.cgpa < jobData.minCGPA) {
            return res.json({ success: false, message: 'Your CGPA is not enough for this job' })
        }

        // Add more checks here if needed (Groups, Dept)

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now(),
            status: 'Applied'
        })

        // Update user's jobsApplied
        // await User.findByIdAndUpdate(userId, { $push: { jobsApplied: ... } }) 

        res.json({ success: true, message: 'Applied Successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get User Applied Applications Data
export const getUserJobApplications = async (req, res) => {

    try {

        const userId = req.body.userId

        const applications = await JobApplication.find({ userId })
            .populate('companyId', 'name email image')
            .populate('jobId', 'title description location category level salary')
            .exec()

        if (!applications) {
            return res.json({ success: false, message: 'No job applications found for this user.' })
        }

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Update User Profile (Student allowed fields)
export const updateUserResume = async (req, res) => {
    try {

        const userId = req.body.userId

        const resumeFile = req.file

        const userData = await User.findById(userId)

        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            userData.resume = resumeUpload.secure_url
        }

        await userData.save()

        return res.json({ success: true, message: 'Resume Updated' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Update User Image
export const updateUserImage = async (req, res) => {
    try {
        const userId = req.body.userId
        const imageFile = req.file

        const userData = await User.findById(userId)

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path)
            userData.image = imageUpload.secure_url
            await userData.save()
            return res.json({ success: true, message: 'Image Updated' })
        } else {
            return res.json({ success: false, message: 'No image uploaded' })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Withdraw Application
export const withdrawApplication = async (req, res) => {
    try {
        const { applicationId } = req.body
        const userId = req.body.userId

        const application = await JobApplication.findOne({ _id: applicationId, userId })

        if (!application) {
            return res.json({ success: false, message: 'Application not found' })
        }

        if (['Selected', 'Offer Accepted', 'Rejected'].includes(application.status)) {
            return res.json({ success: false, message: 'Cannot withdraw at this stage' })
        }

        await JobApplication.findByIdAndDelete(applicationId)

        res.json({ success: true, message: 'Application withdrawn successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Update User Profile (General - Student)
export const updateUserProfile = async (req, res) => {
    try {
        const { userId, firstName, lastName, phone, currentLocation, preferredLocation, gender } = req.body

        const user = await User.findById(userId)
        if (!user) return res.json({ success: false, message: 'User not found' })

        if (firstName) user.firstName = firstName
        if (lastName) user.lastName = lastName
        if (phone) user.phone = phone
        if (currentLocation) user.currentLocation = currentLocation
        if (preferredLocation) user.preferredLocation = preferredLocation
        if (gender) user.gender = gender

        // Only update name if first/last name provided
        if (firstName || lastName) {
            user.name = (firstName || user.firstName || "") + " " + (lastName || user.lastName || "")
        }

        await user.save()
        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// Admin/Coordinator Update User Profile (Protected Fields)
export const adminUpdateUserProfile = async (req, res) => {
    try {
        const { adminPassword, targetUserId, cgpa, username, name, registerNumber, dept, branch, batch, isProfileLocked } = req.body

        // Simple Admin Password Check (In production, use roles/env)
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: 'Invalid Admin Password' })
        }

        const user = await User.findById(targetUserId)
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        if (cgpa !== undefined) user.cgpa = cgpa
        if (username) user.username = username
        if (name) user.name = name
        if (registerNumber) user.registerNumber = registerNumber
        if (dept) user.dept = dept
        if (branch) user.branch = branch
        if (batch) user.batch = batch
        if (isProfileLocked !== undefined) user.isProfileLocked = isProfileLocked

        await user.save()

        res.json({ success: true, message: 'User profile updated by Coordinator' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}