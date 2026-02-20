import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Coordinator Register
export const coordinatorRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'coordinator',
            image: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=6366f1&color=fff',
        });

        const token = jwt.sign({ id: user._id, role: 'coordinator' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ success: true, token, user: { name: user.name, role: 'coordinator' } });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Coordinator Login
export const coordinatorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.role !== 'coordinator') {
            return res.json({ success: false, message: "Invalid Coordinator Credentials" });
        }

        if (user.password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.json({ success: false, message: "Invalid Credentials" });
        } else {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: user._id, role: 'coordinator' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ success: true, token, user: { name: user.name, role: 'coordinator' } });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get All Students
export const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json({ success: true, students });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Update Student
export const updateStudent = async (req, res) => {
    try {
        const { userId, dept, cgpa, registerNumber, batch, branch } = req.body;

        if (cgpa && (cgpa < 0 || cgpa > 10)) {
            return res.json({ success: false, message: "CGPA must be between 0 and 10" });
        }

        const student = await User.findById(userId);
        if (!student) return res.json({ success: false, message: "Student not found" });

        // Reset verification if value changed
        const updates = { dept, registerNumber };
        const verifiedUpdates = {};

        if (cgpa !== undefined && cgpa !== student.cgpa) {
            updates.cgpa = cgpa;
            verifiedUpdates['verifiedFields.cgpa'] = false;
        }
        if (batch !== undefined && batch !== student.batch) {
            updates.batch = batch;
            verifiedUpdates['verifiedFields.batch'] = false;
        }
        if (branch !== undefined && branch !== student.branch) {
            updates.branch = branch;
            verifiedUpdates['verifiedFields.branch'] = false;
        }

        await User.findByIdAndUpdate(userId, { ...updates, ...verifiedUpdates });

        res.json({ success: true, message: "Student Updated" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Verify Student Academic Field
export const verifyStudentField = async (req, res) => {
    try {
        const { userId, field, verified } = req.body;

        const allowedFields = ['cgpa', 'batch', 'branch'];
        if (!allowedFields.includes(field)) {
            return res.json({ success: false, message: "Invalid field" });
        }

        await User.findByIdAndUpdate(userId, {
            [`verifiedFields.${field}`]: verified !== false
        });

        res.json({ success: true, message: `${field} ${verified !== false ? 'verified' : 'unverified'} successfully` });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Placement Analytics (Real Data)
export const getPlacementAnalytics = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        const applications = await JobApplication.find({})
            .populate({ path: 'companyId', select: 'name' })
            .populate({ path: 'jobId', select: 'title salary' });

        const totalStudents = students.length;

        // Students with at least one "Selected" or "Offer Accepted" status
        const selectedStatuses = ['Selected', 'Offer Accepted'];
        const placedStudentIds = new Set();
        const studentOfferCounts = {};
        const companyOfferMap = {};
        const monthlyPlacements = {};
        const deptStats = {};
        const statusCounts = {};

        applications.forEach(app => {
            // Count statuses
            statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;

            // Safety check for deleted users
            if (!app.userId) return;

            if (selectedStatuses.includes(app.status)) {
                placedStudentIds.add(app.userId.toString());

                // Count offers per student
                const uid = app.userId.toString();
                studentOfferCounts[uid] = (studentOfferCounts[uid] || 0) + 1;

                // Count by company
                const companyName = app.companyId?.name || 'Unknown';
                companyOfferMap[companyName] = (companyOfferMap[companyName] || 0) + 1;

                // Monthly placement trend
                const date = new Date(app.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyPlacements[monthKey] = (monthlyPlacements[monthKey] || 0) + 1;
            }
        });

        const placedCount = placedStudentIds.size;
        const unplacedCount = totalStudents - placedCount;
        const placementRate = totalStudents > 0 ? ((placedCount / totalStudents) * 100).toFixed(1) : 0;

        // Department-wise placement
        students.forEach(s => {
            const dept = s.dept || 'Unassigned';
            if (!deptStats[dept]) deptStats[dept] = { total: 0, placed: 0 };
            deptStats[dept].total += 1;
            if (placedStudentIds.has(s._id.toString())) {
                deptStats[dept].placed += 1;
            }
        });

        const deptWise = Object.entries(deptStats).map(([dept, val]) => ({
            dept,
            total: val.total,
            placed: val.placed,
            unplaced: val.total - val.placed,
            rate: val.total > 0 ? ((val.placed / val.total) * 100).toFixed(1) : 0
        }));

        // Top companies
        const topCompanies = Object.entries(companyOfferMap)
            .map(([name, offers]) => ({ name, offers }))
            .sort((a, b) => b.offers - a.offers)
            .slice(0, 10);

        // Monthly trends (sorted)
        const monthlyTrends = Object.entries(monthlyPlacements)
            .map(([month, count]) => ({ month, placements: count }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // Offer distribution (0, 1, 2, 3+)
        const offerDist = { '0 Offers': unplacedCount, '1 Offer': 0, '2 Offers': 0, '3+ Offers': 0 };
        Object.values(studentOfferCounts).forEach(count => {
            if (count === 1) offerDist['1 Offer'] += 1;
            else if (count === 2) offerDist['2 Offers'] += 1;
            else if (count >= 3) offerDist['3+ Offers'] += 1;
        });

        const offerDistribution = Object.entries(offerDist).map(([name, value]) => ({ name, value }));

        // Application status breakdown
        const statusBreakdown = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

        res.json({
            success: true,
            analytics: {
                totalStudents,
                placedCount,
                unplacedCount,
                placementRate: parseFloat(placementRate),
                totalApplications: applications.length,
                totalOffers: placedCount,
                deptWise,
                topCompanies,
                monthlyTrends,
                offerDistribution,
                statusBreakdown,
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Placed Students (with offer details)
export const getPlacedStudents = async (req, res) => {
    try {
        const selectedStatuses = ['Selected', 'Offer Accepted'];
        const apps = await JobApplication.find({ status: { $in: selectedStatuses } })
            .populate({ path: 'userId', model: 'User', select: 'name email dept registerNumber cgpa' })
            .populate({ path: 'companyId', select: 'name' })
            .populate({ path: 'jobId', select: 'title salary' });

        // Group by student
        const studentMap = {};
        apps.forEach(app => {
            if (!app.userId) return;
            const uid = app.userId._id?.toString() || app.userId.toString();
            if (!studentMap[uid]) {
                studentMap[uid] = {
                    student: app.userId,
                    offers: []
                };
            }
            studentMap[uid].offers.push({
                company: app.companyId?.name || 'Unknown',
                role: app.jobId?.title || 'N/A',
                salary: app.jobId?.salary || 0,
                status: app.status
            });
        });

        const placedStudents = Object.values(studentMap);

        res.json({ success: true, placedStudents });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Unplaced Students
export const getUnplacedStudents = async (req, res) => {
    try {
        const selectedStatuses = ['Selected', 'Offer Accepted'];
        const placedApps = await JobApplication.find({ status: { $in: selectedStatuses } });
        const placedUserIds = [...new Set(placedApps.map(a => a.userId.toString()))];

        const unplacedStudents = await User.find({
            role: 'student',
            _id: { $nin: placedUserIds }
        }).select('-password');

        res.json({ success: true, unplacedStudents });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Coordinator Profile
export const getCoordinatorProfile = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) return res.json({ success: false, message: 'Not authorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user || user.role !== 'coordinator') {
            return res.json({ success: false, message: 'Coordinator not found' });
        }

        res.json({ success: true, coordinator: user });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Update Coordinator Profile
export const updateCoordinatorProfile = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) return res.json({ success: false, message: 'Not authorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.role !== 'coordinator') {
            return res.json({ success: false, message: 'Coordinator not found' });
        }

        const { name, phone, email, dept } = req.body;

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (email) user.email = email;
        if (dept) user.dept = dept;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            coordinator: { _id: user._id, name: user.name, email: user.email, phone: user.phone, dept: user.dept, image: user.image, role: user.role }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Change Coordinator Password
export const changeCoordinatorPassword = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) return res.json({ success: false, message: 'Not authorized' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('+password');

        if (!user || user.role !== 'coordinator') {
            return res.json({ success: false, message: 'Coordinator not found' });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.json({ success: false, message: 'Both current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
