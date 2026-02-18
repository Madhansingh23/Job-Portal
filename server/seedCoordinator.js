import mongoose from "mongoose";
import User from "./models/User.js"; // Adjust path as needed
import 'dotenv/config';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected");
    } catch (error) {
        console.error("DB Connection Error:", error);
        process.exit(1);
    }
};

const seedCoordinator = async () => {
    await connectDB();

    const email = "coordinator@college.edu"; // Change as needed

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        console.log("Coordinator already exists, updating role...");
        existingUser.role = 'coordinator';
        await existingUser.save();
    } else {
        console.log("Creating new Coordinator...");
        await User.create({
            name: "Placement Coordinator",
            email: email,
            role: "coordinator",
            image: `https://ui-avatars.com/api/?name=Coordinator&background=random`
        });
    }

    console.log("Done!");
    process.exit(0);
};

seedCoordinator();
