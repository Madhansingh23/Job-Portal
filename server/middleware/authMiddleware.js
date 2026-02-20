import jwt from 'jsonwebtoken'
import Company from '../models/Company.js'
import User from '../models/User.js'

// Middleware ( Protect Company Routes )
export const protectCompany = async (req, res, next) => {

    const token = req.headers.token

    if (!token) {
        return res.json({ success: false, message: 'Not authorized, Login Again' })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.company = await Company.findById(decoded.id).select('-password')

        next()

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: 'Token expired, please login again', expired: true })
        }
        res.json({ success: false, message: error.message })
    }

}

// Middleware ( Protect User Routes )
export const protect = async (req, res, next) => {
    try {
        const token = req.headers.token

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized, Login Again' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await User.findById(decoded.id).select('-password')

        if (!req.user) {
            return res.json({ success: false, message: 'Not Authorized, User Not Found' })
        }

        next()

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: 'Token expired, please login again', expired: true })
        }
        res.json({ success: false, message: error.message })
    }
}