import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
        type: String,
        default: 'Pending'
    },
    currentRound: { type: Number, default: -1 }, // -1 = not started, 0 = round 1, etc.
    roundHistory: [{
        round: String,
        status: { type: String, enum: ['Passed', 'Failed', 'In Progress'], default: 'In Progress' },
        date: { type: Number, default: Date.now }
    }],
    offerLetter: { type: String }, // URL to offer letter
    offerStatus: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    date: { type: Number, required: true }
})

const JobApplication = mongoose.model('JobApplication', JobApplicationSchema)

export default JobApplication