import mongoose from "mongoose";

const changeRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fieldName: { type: String, required: true }, // e.g. 'name', 'dept', 'cgpa', 'registerNumber', 'email', 'phone'
    currentValue: { type: String },
    requestedValue: { type: String, required: true },
    reason: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Coordinator ID
    reviewNote: { type: String }
}, { timestamps: true })

const ChangeRequest = mongoose.model('ChangeRequest', changeRequestSchema)

export default ChangeRequest
