import ChangeRequest from "../models/ChangeRequest.js";
import User from "../models/User.js";

// Numeric fields that need type coercion when approved
const numericFields = ['cgpa', 'tenthMarks', 'twelfthMarks', 'numberOfArrears', 'age'];

// Student: Create change request
export const createChangeRequest = async (req, res) => {
    try {
        const { fieldName, requestedValue, reason } = req.body;
        const studentId = req.userId;

        if (!fieldName || !requestedValue) {
            return res.json({ success: false, message: 'Field name and requested value are required' });
        }

        const student = await User.findById(studentId);
        if (!student) return res.json({ success: false, message: 'Student not found' });

        // Check for existing pending request for same field
        const existing = await ChangeRequest.findOne({ studentId, fieldName, status: 'Pending' });
        if (existing) return res.json({ success: false, message: 'You already have a pending request for this field' });

        // Validate numeric fields
        if (numericFields.includes(fieldName)) {
            const numVal = Number(requestedValue);
            if (isNaN(numVal)) {
                return res.json({ success: false, message: `${fieldName} must be a valid number` });
            }
            if (fieldName === 'cgpa' && (numVal < 0 || numVal > 10)) {
                return res.json({ success: false, message: 'CGPA must be between 0 and 10' });
            }
            if (['tenthMarks', 'twelfthMarks'].includes(fieldName) && (numVal < 0 || numVal > 100)) {
                return res.json({ success: false, message: 'Marks must be between 0 and 100' });
            }
            if (fieldName === 'numberOfArrears' && numVal < 0) {
                return res.json({ success: false, message: 'Arrears cannot be negative' });
            }
        }

        const request = await ChangeRequest.create({
            studentId,
            fieldName,
            currentValue: student[fieldName]?.toString() || 'Not Set',
            requestedValue: requestedValue.toString(),
            reason: reason || ''
        });

        res.json({ success: true, message: 'Change request submitted successfully', request });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Student: Get my change requests
export const getMyChangeRequests = async (req, res) => {
    try {
        const studentId = req.userId;
        const requests = await ChangeRequest.find({ studentId })
            .sort({ createdAt: -1 })
            .populate('reviewedBy', 'name')
            .lean();
        res.json({ success: true, requests });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Coordinator: Get all change requests (with filters)
export const getAllChangeRequests = async (req, res) => {
    try {
        const { status } = req.query; // Optional filter: ?status=Pending
        const filter = status ? { status } : {};

        const requests = await ChangeRequest.find(filter)
            .sort({ createdAt: -1 })
            .populate('studentId', 'name email registerNumber dept cgpa tenthMarks twelfthMarks numberOfArrears')
            .populate('reviewedBy', 'name')
            .lean();
        res.json({ success: true, requests });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Coordinator: Review (approve/reject) a change request
export const reviewChangeRequest = async (req, res) => {
    try {
        const { requestId, action, reviewNote } = req.body;
        const coordinatorId = req.userId;

        if (!requestId || !action) {
            return res.json({ success: false, message: 'Request ID and action are required' });
        }

        if (!['Approved', 'Rejected'].includes(action)) {
            return res.json({ success: false, message: 'Action must be Approved or Rejected' });
        }

        const request = await ChangeRequest.findById(requestId);
        if (!request) return res.json({ success: false, message: 'Request not found' });
        if (request.status !== 'Pending') return res.json({ success: false, message: 'Request already reviewed' });

        if (action === 'Approved') {
            // Coerce numeric fields to Number before saving to User
            let valueToSave = request.requestedValue;
            if (numericFields.includes(request.fieldName)) {
                valueToSave = Number(request.requestedValue);
                if (isNaN(valueToSave)) {
                    return res.json({ success: false, message: `Invalid numeric value for ${request.fieldName}` });
                }
            }

            // Apply the change to the student's profile with correct type
            const updateObj = { [request.fieldName]: valueToSave };

            // Also mark the field as verified since coordinator is approving it
            if (['cgpa', 'batch', 'branch', 'tenthMarks', 'twelfthMarks', 'numberOfArrears'].includes(request.fieldName)) {
                updateObj[`verifiedFields.${request.fieldName}`] = true;
            }

            await User.findByIdAndUpdate(request.studentId, updateObj);
            request.status = 'Approved';
        } else {
            request.status = 'Rejected';
        }

        request.reviewedBy = coordinatorId;
        request.reviewNote = reviewNote || '';
        await request.save();

        res.json({ success: true, message: `Request ${action.toLowerCase()} successfully` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
