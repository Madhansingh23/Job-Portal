// Sentry disabled: import removed to avoid compatibility issues
// import * as Sentry from "@sentry/node";
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import connectDB from './config/db.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import coordinatorRoutes from './routes/coordinatorRoutes.js'
import changeRequestRoutes from './routes/changeRequestRoutes.js'
import User from './models/User.js'


// Sentry initialization disabled
// Sentry.init({
//   dsn: process.env.SENTRY_DSN || 'https://40dc79eacab0415b112a320613fe6de8@o4508103285538816.ingest.us.sentry.io/4510890581032960',
//   tracesSampleRate: 1.0,
//   environment: process.env.NODE_ENV || 'development',
// });

// Initialize Express
const app = express()

// Connect to database
const startServer = async () => {
  await connectDB()
  await connectCloudinary()

  // Sentry request handler disabled
  // app.use(Sentry.handlers.requestHandler())

  // Test route to check MongoDB and Sentry integration
  app.get('/api/test-user/:id', async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id)
      if (!user) {
        // This error will be captured by Sentry
        const err = new Error('User not found in MongoDB')
        err.status = 404
        throw err
      }
      res.json({ success: true, user })
    } catch (error) {
      next(error)
    }
  })

  // ...existing middleware and routes...

  // Sentry error handler disabled
  // app.use(Sentry.handlers.errorHandler())

  // server will be started after middleware setup (single listener at bottom)
}

startServer()

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://job-portal-client-one-omega.vercel.app',
  'https://job-portal-client-deymmhizs-madhansingh23s-projects.vercel.app'
]

const corsOptions = {
  // allow requests from any origin but echo back the request origin
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, server-to-server)
    if (!origin) return callback(null, true)
    // allow known local/dev origins or any vercel deployment origin
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true)
    }
    // fallback: allow but log for visibility
    console.warn('CORS allowing unknown origin:', origin)
    return callback(null, true)
  },
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
// Ensure preflight requests are handled before other middleware that may redirect
app.options('*', cors(corsOptions))
app.use(express.json())
// Safety middleware: explicitly set CORS headers and respond to preflight
app.use((req, res, next) => {
  const origin = req.headers.origin || '*'
  res.header('Access-Control-Allow-Origin', origin)
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, token')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})
// Skip auth middleware for OPTIONS preflight
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next()
  next()
})

// Routes
// Security Middleware
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })) // Allow images from Cloudinary

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api', limiter)

app.get('/', (req, res) => res.send("API Working"))
// Debug Sentry route disabled
// app.get("/debug-sentry", function mainHandler(req, res) {
//   throw new Error("My first Sentry error!");
// });
// app.post('/webhooks', clerkWebhooks) // REMOVED
app.use('/api/auth', authRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/company', companyRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api/coordinator', coordinatorRoutes) // Register Coordinator Routes
app.use('/api/change-requests', changeRequestRoutes) // Student change requests

// Sentry error handler disabled
// app.use(Sentry.Handlers.errorHandler())

// Port
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})