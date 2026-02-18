import Job from "../models/Job.js"
import User from "../models/User.js"


// Get All Jobs (Filtered by User Eligibility)
export const getJobs = async (req, res) => {
    try {

        const userId = req.body.userId // Added by auth middleware
        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        // Fetch all visible jobs
        const jobs = await Job.find({ visible: true })
            .populate({ path: 'companyId', select: '-password' })

        // ---------------------------------------------------------
        // JOB VISIBILITY ENGINE
        // ---------------------------------------------------------
        const eligibleJobs = jobs.filter(job => {

            // 1. CGPA Check
            if (job.minCGPA > 0 && user.cgpa < job.minCGPA) {
                return false;
            }

            // 2. Department Check (If job has eligibleDepts)
            if (job.eligibleDepts && job.eligibleDepts.length > 0) {
                if (!user.dept || !job.eligibleDepts.includes(user.dept)) {
                    return false;
                }
            }

            // 3. Group Check (If job has eligibleGroups)
            // If job specifies groups, user MUST be in at least one of them
            if (job.eligibleGroups && job.eligibleGroups.length > 0) {
                const userGroupIds = user.groups.map(g => g.toString());
                const jobGroupIds = job.eligibleGroups.map(g => g.toString());

                const hasMatchingGroup = jobGroupIds.some(groupId => userGroupIds.includes(groupId));
                if (!hasMatchingGroup) {
                    return false;
                }
            }

            // 4. Batch Check (Optional - if job.targetBatch exists)
            if (job.targetBatch && job.targetBatch !== user.batch) {
                return false;
            }

            return true;
        })

        res.json({ success: true, jobs: eligibleJobs })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Single Job Using JobID
export const getJobById = async (req, res) => {
    try {

        const { id } = req.params

        const job = await Job.findById(id)
            .populate({
                path: 'companyId',
                select: '-password'
            })

        if (!job) {
            return res.json({
                success: false,
                message: 'Job not found'
            })
        }

        res.json({
            success: true,
            job
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get All Jobs Publicly (No Auth Required)
export const getPublicJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ visible: true })
            .populate({ path: 'companyId', select: '-password' })

        res.json({ success: true, jobs })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}