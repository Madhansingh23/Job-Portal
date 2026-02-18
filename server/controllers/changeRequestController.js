import ChangeRequest from "../models/ChangeRequest.js";
import User from "../models/User.js";

// Student: Create change request
export const createChangeRequest = async (req, res) => {
    try {
        const { fieldName, requestedValue, reason } = req.body;
        const studentId = req.body.userId;

        const student = await User.findById(studentId);
        if (!student) return res.json({ success: false, message: 'Student not found' });

        // Check for existing pending request for same field
        const existing = await ChangeRequest.findOne({ studentId, fieldName, status: 'Pending' });
        if (existing) return res.json({ success: false, message: 'You already have a pending request for this field' });

        const request = await ChangeRequest.create({
            studentId,
            fieldName,
            currentValue: student[fieldName]?.toString() || '',
            requestedValue,
            reason
        });

        res.json({ success: true, message: 'Change request submitted', request });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Student: Get my change requests
export const getMyChangeRequests = async (req, res) => {
    try {
        const studentId = req.body.userId;
        const requests = await ChangeRequest.find({ studentId })
            .sort({ createdAt: -1 })
            .populate('reviewedBy', 'name');
        res.json({ success: true, requests });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Coordinator: Get all pending change requests
export const getAllChangeRequests = async (req, res) => {
    try {
        const requests = await ChangeRequest.find()
            .sort({ createdAt: -1 })
            .populate('studentId', 'name email registerNumber dept cgpa')
            .populate('reviewedBy', 'name');
        res.json({ success: true, requests });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Coordinator: Review (approve/reject) a change request
export const reviewChangeRequest = async (req, res) => {
    try {
        const { requestId, action, reviewNote } = req.body;
        const coordinatorId = req.body.userId;

        const request = await ChangeRequest.findById(requestId);
        if (!request) return res.json({ success: false, message: 'Request not found' });
        if (request.status !== 'Pending') return res.json({ success: false, message: 'Request already reviewed' });

        if (action === 'Approved') {
            // Apply the change to the student's profile
            await User.findByIdAndUpdate(request.studentId, { [request.fieldName]: request.requestedValue });
            request.status = 'Approved';
        } else {
            request.status = 'Rejected';
        }

        request.reviewedBy = coordinatorId;
        request.reviewNote = reviewNote || '';
        await request.save();

        res.json({ success: true, message: `Request ${action.toLowerCase()}` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
