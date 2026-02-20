import Notice from "../models/Notice.js";
import User from "../models/User.js";

// Create Notice (Coordinator)
export const createNotice = async (req, res) => {
    try {
        const { title, description, type, targetGroup, targetDept } = req.body;
        const userId = req.user ? req.user._id : req.userId;

        if (!title || !description) {
            return res.json({ success: false, message: 'Title and description are required' });
        }

        const notice = await Notice.create({
            title,
            description,
            type: type || 'All',
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
        // `protect` middleware sets req.user, not req.userId
        const userId = req.user ? req.user._id : req.userId;
        const user = await User.findById(userId).populate('groups');

        if (!user) return res.json({ success: false, message: "User not found" });

        const userGroupIds = (user.groups || []).map(g => g._id);

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

        if (!id) {
            return res.json({ success: false, message: 'Notice ID is required' });
        }

        const notice = await Notice.findById(id);
        if (!notice) {
            return res.json({ success: false, message: 'Notice not found' });
        }

        await Notice.findByIdAndDelete(id);
        res.json({ success: true, message: "Notice Deleted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
