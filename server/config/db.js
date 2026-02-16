import mongoose from "mongoose";

// Function to connect to the MongoDB database
const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log('Database Connected'))
    mongoose.connection.on('error', (err) => console.error('Database connection error:', err))

    const raw = process.env.MONGODB_URI || ''
    const uri = raw.replace(/^['\"]|['\"]$/g, '').trim().replace(/\/+$/, '')
    if (!uri) {
        console.error('MONGODB_URI is not set')
        process.exit(1)
    }

    const dbName = process.env.MONGODB_DB || 'job-portal'
    const fullUri = `${uri}/${dbName}`

    try {
        await mongoose.connect(fullUri)
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error)
        process.exit(1)
    }
}

export default connectDB