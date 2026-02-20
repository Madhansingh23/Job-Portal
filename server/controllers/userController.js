import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import { v2 as cloudinary } from "cloudinary"

// Get User Data
export const getUserData = async (req, res) => {

    const userId = req.userId

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
    const userId = req.userId

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

        // === ELIGIBILITY CHECKS (Security Gate) ===

        // 1. CGPA Check
        if (jobData.minCGPA > 0 && (user.cgpa || 0) < jobData.minCGPA) {
            return res.json({ success: false, message: `Minimum CGPA required: ${jobData.minCGPA}` })
        }

        // 2. 10th Marks Check
        if (jobData.minTenthMarks > 0 && (user.tenthMarks || 0) < jobData.minTenthMarks) {
            return res.json({ success: false, message: `Minimum 10th Marks required: ${jobData.minTenthMarks}%` })
        }

        // 3. 12th Marks Check
        if (jobData.minTwelfthMarks > 0 && (user.twelfthMarks || 0) < jobData.minTwelfthMarks) {
            return res.json({ success: false, message: `Minimum 12th Marks required: ${jobData.minTwelfthMarks}%` })
        }

        // 4. Arrears Check
        if (jobData.maxArrears !== undefined && jobData.maxArrears < 100 && (user.numberOfArrears || 0) > jobData.maxArrears) {
            return res.json({ success: false, message: `Maximum Arrears allowed: ${jobData.maxArrears}` })
        }

        // 5. Department Check
        if (jobData.eligibleDepts && jobData.eligibleDepts.length > 0) {
            if (!user.dept || !jobData.eligibleDepts.includes(user.dept)) {
                return res.json({ success: false, message: `This job is only open to: ${jobData.eligibleDepts.join(', ')}` })
            }
        }

        // 6. Batch Check
        if (jobData.targetBatch && jobData.targetBatch !== user.batch) {
            return res.json({ success: false, message: `This job is only for batch: ${jobData.targetBatch}` })
        }

        // 7. Group Check
        if (jobData.eligibleGroups && jobData.eligibleGroups.length > 0) {
            const userGroupIds = (user.groups || []).map(g => g.toString())
            const jobGroupIds = jobData.eligibleGroups.map(g => g.toString())
            const hasMatchingGroup = jobGroupIds.some(gid => userGroupIds.includes(gid))
            if (!hasMatchingGroup) {
                return res.json({ success: false, message: 'You are not in an eligible group for this job' })
            }
        }

        // 8. Resume Check
        if (!user.resume) {
            return res.json({ success: false, message: 'Please upload your resume before applying' })
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now(),
            status: 'Applied'
        })

        res.json({ success: true, message: 'Applied Successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get User Applied Applications Data
export const getUserJobApplications = async (req, res) => {

    try {

        const userId = req.userId

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

// Update User Resume
export const updateUserResume = async (req, res) => {
    try {

        const userId = req.userId

        const resumeFile = req.file

        const userData = await User.findById(userId)

        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }

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
        const userId = req.userId
        const imageFile = req.file

        const userData = await User.findById(userId)

        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }

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
        const userId = req.userId

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
        const userId = req.userId
        const { firstName, lastName, phone, currentLocation, preferredLocation, gender, dept, registerNumber, batch, branch, groups } = req.body

        const user = await User.findById(userId)
        if (!user) return res.json({ success: false, message: 'User not found' })

        if (firstName) user.firstName = firstName
        if (lastName) user.lastName = lastName
        if (phone) user.phone = phone
        if (currentLocation) user.currentLocation = currentLocation
        if (preferredLocation) user.preferredLocation = preferredLocation
        if (gender) user.gender = gender

        // Basic academic (non-protected fields)
        if (dept) user.dept = dept
        if (registerNumber) user.registerNumber = registerNumber
        if (batch) user.batch = batch
        if (branch) user.branch = branch

        // NOTE: cgpa, tenthMarks, twelfthMarks, numberOfArrears are PROTECTED.
        // Students must submit a Change Request to the coordinator to update these.
        // Direct updates are blocked here for data integrity.

        if (groups) user.groups = groups

        // Update display name
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

        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: 'Invalid Admin Password' })
        }

        const user = await User.findById(targetUserId)
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        if (cgpa !== undefined) {
            if (cgpa < 0 || cgpa > 10) return res.json({ success: false, message: 'CGPA must be between 0 and 10' })
            user.cgpa = cgpa
        }
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

// Student Respond to Offer
export const respondToOffer = async (req, res) => {
    try {
        const { applicationId, status } = req.body
        const userId = req.userId

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.json({ success: false, message: 'Invalid status' })
        }

        const application = await JobApplication.findOne({ _id: applicationId, userId })
        if (!application) {
            return res.json({ success: false, message: 'Application not found' })
        }

        if (application.status !== 'Selected') {
            return res.json({ success: false, message: 'You can only respond to selected applications' })
        }

        application.offerStatus = status
        await application.save()

        // Update User Stats
        const user = await User.findById(userId)
        if (status === 'Accepted') {
            user.offerDetails.hasOffer = true
            user.offerDetails.count = (user.offerDetails.count || 0) + 1
            user.offerDetails.accepted = true
            user.acceptedOffers.push(application.jobId)
        } else {
            user.rejectedOffers.push(application.jobId)
        }
        await user.save()

        res.json({ success: true, message: `Offer ${status} successfully` })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}