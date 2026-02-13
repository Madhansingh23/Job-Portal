import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const raw = process.env.MONGODB_URI || ''
const uri = raw.replace(/^['\"]|['\"]$/g, '').trim().replace(/\/+$/, '')
const dbName = process.env.MONGODB_DB || 'job-portal'
const fullUri = `${uri}/${dbName}`

console.log('Connecting to:', fullUri.replace(/:[^:@]+@/, ':<REDACTED>@'))

;(async () => {
  try {
    await mongoose.connect(fullUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    })
    console.log('OK: connected to MongoDB')
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('ERR:', err.message || err)
    process.exit(1)
  }
})();
