import Job from "../models/Job.js"


// Get All Jobs (Authenticated - returns all visible jobs)
export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ visible: true })
            .populate('companyId', 'name email image')
            .select('-__v')
            .sort({ date: -1 })
            .lean()

        res.json({ success: true, jobs })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Public Jobs (No Auth - for homepage/browse)
export const getPublicJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ visible: true })
            .populate('companyId', 'name email image')
            .select('title description location category level salary companyId date offerType minCGPA targetBatch eligibleDepts')
            .sort({ date: -1 })
            .lean()

        res.json({ success: true, jobs })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Single Job by ID
export const getJobById = async (req, res) => {
    try {
        const { id } = req.params
        const job = await Job.findById(id)
            .populate('companyId', 'name email image')
            .lean()

        if (!job) {
            return res.json({ success: false, message: 'Job not found' })
        }
        res.json({ success: true, job })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}