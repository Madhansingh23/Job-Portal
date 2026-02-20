// fix_db.js - Database cleanup script
// Run with: node --experimental-modules server/fix_db.js
// Or from project root: node server/fix_db.js

import mongoose from 'mongoose';
import 'dotenv/config';

const fixDb = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI not found in environment variables.');
            console.log('Make sure you have a .env file in the server directory.');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to DB successfully.');

        // Get the raw collection to bypass Mongoose schema validation
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Find all users with string _id (non-ObjectId)
        const allUsers = await usersCollection.find({}).toArray();
        console.log(`Total users in collection: ${allUsers.length}`);

        let deletedCount = 0;

        for (const user of allUsers) {
            // Check if _id is a string (not ObjectId)
            if (typeof user._id === 'string') {
                console.log(`Found user with string _id: ${user._id} (email: ${user.email || 'N/A'})`);
                const result = await usersCollection.deleteOne({ _id: user._id });
                if (result.deletedCount > 0) {
                    console.log(`  -> Deleted successfully.`);
                    deletedCount++;
                }
            }
        }

        // Also specifically target the known problem ID
        const problemId = "user_39iAziwVzr8ItI1fRNpvDZJD0CA";
        try {
            const result = await usersCollection.deleteOne({ _id: problemId });
            if (result.deletedCount > 0) {
                console.log(`Deleted specific problem user: ${problemId}`);
                deletedCount++;
            }
        } catch (e) {
            console.log(`Could not delete ${problemId}: ${e.message}`);
        }

        // Clean up any orphaned applications with invalid user IDs
        const applicationsCollection = db.collection('jobapplications');
        if (applicationsCollection) {
            const apps = await applicationsCollection.find({}).toArray();
            let orphanedApps = 0;
            for (const app of apps) {
                try {
                    if (typeof app.userId === 'string' && !mongoose.Types.ObjectId.isValid(app.userId)) {
                        await applicationsCollection.deleteOne({ _id: app._id });
                        orphanedApps++;
                    }
                } catch (e) { /* skip */ }
            }
            if (orphanedApps > 0) {
                console.log(`Cleaned up ${orphanedApps} orphaned job applications.`);
            }
        }

        console.log(`\nDatabase fix complete. Deleted ${deletedCount} problem user(s).`);
        process.exit(0);
    } catch (error) {
        console.error('Error fixing DB:', error.message);
        process.exit(1);
    }
};

fixDb();
