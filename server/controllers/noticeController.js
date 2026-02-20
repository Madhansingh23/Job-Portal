import Notice from "../models/Notice.js";
import User from "../models/User.js";

// Create Notice
export const createNotice = async (req, res) => {
    try {
        const { title, description, type, targetGroup, targetDept } = req.body;
        const userId = req.body.userId; // From authMiddleware

        const notice = await Notice.create({
            title,
            description,
            type,
            targetGroup,
            targetDept,
            postedBy: userId,
            date: Date.now()
        });

        res.json({ success: true, message: "Notice Posted Successfully", notice });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get All Notices (For Coordinator - sees all)
export const getAllNotices = async (req, res) => {
    try {
        const notices = await Notice.find({}).sort({ date: -1 }).populate('postedBy', 'name');
        res.json({ success: true, notices });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Student Notices (Filtered by relevance)
export const getStudentNotices = async (req, res) => {
    try {
        const userId = req.body.userId; // From authMiddleware
        const user = await User.findById(userId).populate('groups');

        if (!user) return res.json({ success: false, message: "User not found" });

        // Criteria:
        // 1. Type = 'All'
        // 2. Type = 'Department' AND targetDept = user.dept
        // 3. Type = 'Group' AND targetGroup matches one of user's groups

        const userGroupIds = user.groups.map(g => g._id);

        const notices = await Notice.find({
            $or: [
                { type: 'All' },
                { type: 'Department', targetDept: user.dept },
                { type: 'Group', targetGroup: { $in: userGroupIds } }
            ]
        }).sort({ date: -1 }).populate('postedBy', 'name');

        res.json({ success: true, notices });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Delete Notice
export const deleteNotice = async (req, res) => {
    try {
        const { id } = req.body;
        await Notice.findByIdAndDelete(id);
        res.json({ success: true, message: "Notice Deleted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
