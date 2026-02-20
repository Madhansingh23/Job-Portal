import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import connectDB from './config/db.js'
import connectCloudinary from './config/cloudinary.js'

// Route imports
import companyRoutes from './routes/companyRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import noticeRoutes from './routes/noticeRoutes.js'
import coordinatorRoutes from './routes/coordinatorRoutes.js'
import changeRequestRoutes from './routes/changeRequestRoutes.js'

// Initialize Express
const app = express()

const startServer = async () => {
  // 1. Connect to DB and Cloudinary FIRST (before accepting requests)
  await connectDB()
  await connectCloudinary()

  // 2. Security Middleware
  app.use(helmet())
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))

  // 3. CORS Configuration (single, clean setup)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://job-portal-client-one-omega.vercel.app',
    'https://job-portal-client-deymmhizs-madhansingh23s-projects.vercel.app'
  ]

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true)
      }
      console.warn('CORS allowing unknown origin:', origin)
      return callback(null, true)
    },
    credentials: true,
    optionsSuccessStatus: 200
  }))
  app.options('*', cors()) // Handle preflight

  // 4. Body parsing
  app.use(express.json())

  // 5. Rate Limiting (300 requests per 15 min window)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'Too many requests from this IP, please try again later.'
  })
  app.use('/api', limiter)

  // 6. Health check
  app.get('/', (req, res) => res.send("API Working"))

  // 7. API Routes
  app.use('/api/auth', authRoutes)
  app.use('/api/groups', groupRoutes)
  app.use('/api/reports', reportRoutes)
  app.use('/api/company', companyRoutes)
  app.use('/api/jobs', jobRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/coordinator', coordinatorRoutes)
  app.use('/api/change-requests', changeRequestRoutes)
  app.use('/api/notices', noticeRoutes)

  // 8. Global error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  })

  // 9. Start listening AFTER everything is ready
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

startServer().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})