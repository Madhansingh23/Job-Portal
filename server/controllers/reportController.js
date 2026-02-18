import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

// Get Placement Report
export const getPlacementReport = async (req, res) => {
    try {
        const users = await User.find({ role: 'student' })
            .populate('jobsApplied')
            .populate('acceptedOffers')
            .select('-password');

        const reportData = users.map(user => ({
            registerNumber: user.registerNumber,
            name: user.name,
            email: user.email,
            dept: user.dept,
            batch: user.batch,
            cgpa: user.cgpa,
            phone: user.phone,
            offers: user.offerDetails.count,
            placed: user.offerDetails.accepted ? 'Yes' : 'No',
        }));

        res.json({ success: true, reportData });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Dashboard Stats (Graph Data)
export const getDashboardStats = async (req, res) => {
    try {
        // 1. Placement Funnel Data
        const totalApplied = await JobApplication.countDocuments();
        const round1 = await JobApplication.countDocuments({ status: 'Round 1' });
        const round2 = await JobApplication.countDocuments({ status: 'Round 2' });
        const selected = await JobApplication.countDocuments({ status: 'Selected' });
        const offersAccepted = await JobApplication.countDocuments({ status: 'Offer Accepted' });

        const funnelData = [
            { name: 'Applied', value: totalApplied },
            { name: 'Round 1', value: round1 },
            { name: 'Round 2', value: round2 },
            { name: 'Selected', value: selected },
            { name: 'Accepted', value: offersAccepted },
        ];

        // 2. Department-wise Placed Students
        // Find all students who have accepted an offer
        const placedStudents = await User.find({ 'offerDetails.accepted': true });

        const deptCounts = {};
        placedStudents.forEach(student => {
            const dept = student.dept || 'Unknown';
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });

        const deptData = Object.keys(deptCounts).map(dept => ({
            name: dept,
            placements: deptCounts[dept]
        }));

        res.json({ success: true, funnelData, deptData });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
