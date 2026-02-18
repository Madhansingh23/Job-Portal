import Group from "../models/Group.js";
import User from "../models/User.js";

// Create Group
export const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const coordinatorId = req.body.userId; // From auth middleware

        const existingGroup = await Group.findOne({ name });
        if (existingGroup) {
            return res.json({ success: false, message: 'Group name already exists' });
        }

        const group = await Group.create({
            name,
            description,
            createdBy: coordinatorId
        });

        res.json({ success: true, message: 'Group created successfully', group });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get All Groups
export const getGroups = async (req, res) => {
    try {
        const groups = await Group.find().populate('members', 'name email registerNumber');
        res.json({ success: true, groups });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Add Member to Group
export const addMemberToGroup = async (req, res) => {
    try {
        const { groupId, studentId } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.json({ success: false, message: 'Group not found' });
        }

        if (group.members.includes(studentId)) {
            return res.json({ success: false, message: 'Student already in group' });
        }

        group.members.push(studentId);
        await group.save();

        // Also update User model
        await User.findByIdAndUpdate(studentId, { $push: { groups: groupId } });

        res.json({ success: true, message: 'Student added to group' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Remove Member from Group
export const removeMemberFromGroup = async (req, res) => {
    try {
        const { groupId, studentId } = req.body;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.json({ success: false, message: 'Group not found' });
        }

        group.members = group.members.filter(id => id.toString() !== studentId);
        await group.save();

        // Also update User model
        await User.findByIdAndUpdate(studentId, { $pull: { groups: groupId } });

        res.json({ success: true, message: 'Student removed from group' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
