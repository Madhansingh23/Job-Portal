import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import Job from "../models/Job.js";

// Get Placement Report
export const getPlacementReport = async (req, res) => {
    try {
        const users = await User.find({ role: 'student' })
            .populate('acceptedOffers', 'title')
            .select('-password')
            .lean();

        const reportData = users.map(user => ({
            registerNumber: user.registerNumber || 'N/A',
            name: user.name,
            email: user.email,
            dept: user.dept || 'N/A',
            batch: user.batch || 'N/A',
            cgpa: user.cgpa || 0,
            phone: user.phone || 'N/A',
            tenthMarks: user.tenthMarks || 'N/A',
            twelfthMarks: user.twelfthMarks || 'N/A',
            numberOfArrears: user.numberOfArrears ?? 0,
            offers: user.offerDetails?.count || 0,
            placed: user.offerDetails?.accepted ? 'Yes' : 'No',
            acceptedCompanies: (user.acceptedOffers || []).map(j => j.title).join(', ') || 'None'
        }));

        res.json({ success: true, reportData });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Dashboard Stats (Dynamic Graph Data)
export const getDashboardStats = async (req, res) => {
    try {
        // 1. DYNAMIC Placement Funnel — aggregated from real round data
        const totalApplied = await JobApplication.countDocuments();
        const selected = await JobApplication.countDocuments({ status: 'Selected' });
        const offersAccepted = await JobApplication.countDocuments({ offerStatus: 'Accepted' });
        const offersRejected = await JobApplication.countDocuments({ offerStatus: 'Rejected' });
        const rejected = await JobApplication.countDocuments({ status: 'Rejected' });
        const inProgress = await JobApplication.countDocuments({
            status: { $nin: ['Selected', 'Rejected', 'Pending', 'Applied'] }
        });

        // Build dynamic round counts from roundHistory across all applications
        const roundAggregation = await JobApplication.aggregate([
            { $unwind: '$roundHistory' },
            {
                $group: {
                    _id: '$roundHistory.round',
                    total: { $sum: 1 },
                    passed: { $sum: { $cond: [{ $eq: ['$roundHistory.status', 'Passed'] }, 1, 0] } },
                    failed: { $sum: { $cond: [{ $eq: ['$roundHistory.status', 'Failed'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Standard funnel (always shown)
        const funnelData = [
            { name: 'Total Applied', value: totalApplied },
        ];

        // Add dynamic rounds from actual data
        roundAggregation.forEach(round => {
            funnelData.push({
                name: round._id,
                value: round.passed,
                total: round.total,
                failed: round.failed
            });
        });

        // If no round data exists, add "In Progress" as middle step
        if (roundAggregation.length === 0 && inProgress > 0) {
            funnelData.push({ name: 'In Progress', value: inProgress });
        }

        funnelData.push(
            { name: 'Selected', value: selected },
            { name: 'Offers Accepted', value: offersAccepted }
        );

        // 2. Department-wise Placed Students
        const placedStudents = await User.find({ 'offerDetails.accepted': true }).lean();

        const deptCounts = {};
        placedStudents.forEach(student => {
            const dept = student.dept || 'Unknown';
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });

        const deptData = Object.keys(deptCounts).map(dept => ({
            name: dept,
            placements: deptCounts[dept]
        }));

        // 3. Summary stats
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalJobs = await Job.countDocuments({ visible: true });
        const totalCompaniesHired = await JobApplication.distinct('companyId', { offerStatus: 'Accepted' });

        const summaryStats = {
            totalStudents,
            totalJobs,
            totalApplied,
            selected,
            offersAccepted,
            offersRejected,
            rejected,
            companiesHired: totalCompaniesHired.length,
            placementRate: totalStudents > 0
                ? ((placedStudents.length / totalStudents) * 100).toFixed(1)
                : '0.0'
        };

        res.json({ success: true, funnelData, deptData, summaryStats });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
