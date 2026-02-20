import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    salary: { type: Number, required: true },
    date: { type: Number, required: true },
    visible: { type: Boolean, default: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    offerType: { type: String, default: 'Direct FTE' }, // Direct FTE, Intern + FTE, Trainee + Intern + FTE, Trainee + FTE

    // Job Description Details
    roleDescription: { type: String },
    requirements: { type: String },

    // Visibility Constraints
    minCGPA: { type: Number, default: 0 },
    minTenthMarks: { type: Number, default: 0 },
    minTwelfthMarks: { type: Number, default: 0 },
    maxArrears: { type: Number, default: 100 }, // Number of allowed standing arrears
    eligibleDepts: { type: [String], default: [] }, // Empty = All Departments
    eligibleGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }], // Empty = No Group Restriction
    targetBatch: { type: String }, // e.g. "2024", "2025"

    // Recruitment Rounds (e.g. ["Aptitude", "Technical", "HR"])
    rounds: { type: [String], default: [] }
})

const Job = mongoose.model('Job', jobSchema)

export default Job