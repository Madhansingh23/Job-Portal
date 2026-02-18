import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Roles & Permissions
    role: { type: String, enum: ['student', 'coordinator', 'recruiter'], default: 'student' },

    // Personal Details
    name: { type: String, required: true }, // Full Name (Display)
    firstName: { type: String }, // For Offer Letter
    lastName: { type: String },  // For Offer Letter
    username: { type: String, unique: true, sparse: true }, // Admin Protected
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // Password for student login

    // Professional Details
    resume: { type: String },
    image: { type: String, required: true, default: "https://via.placeholder.com/150" },
    cgpa: { type: Number, default: 0 }, // Admin Protected
    skills: { type: [String], default: [] },
    experience: { type: [Object], default: [] },
    projects: { type: [Object], default: [] },

    // Campus Placement Details
    registerNumber: { type: String, unique: true, sparse: true }, // Renamed from rollNumber
    dept: { type: String },
    branch: { type: String },
    batch: { type: String },
    phone: { type: String, unique: true, sparse: true },
    gender: { type: String },
    age: { type: Number },

    // Groups (For constrained jobs)
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],

    // Location Preferences
    currentLocation: { type: String },
    preferredLocation: { type: String },

    // Placement Status
    offerDetails: {
        hasOffer: { type: Boolean, default: false },
        count: { type: Number, default: 0 },
        accepted: { type: Boolean, default: false }
    },
    jobsApplied: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }],
    acceptedOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    rejectedOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // Profile Lock (Admin only edit)
    isProfileLocked: { type: Boolean, default: true }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

export default User;