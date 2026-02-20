import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Coordinator who posted
    type: { type: String, enum: ['All', 'Group', 'Department'], default: 'All' }, // Target audience
    targetGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // If type is Group
    targetDept: { type: String } // If type is Department
});

const Notice = mongoose.model("Notice", noticeSchema);

export default Notice;
