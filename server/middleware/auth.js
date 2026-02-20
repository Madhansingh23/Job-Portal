import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    try {
        const token = req.headers.token

        if (!token) {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)

        if (token_decode) {
            // FIXED: Use req.userId instead of req.body.userId
            // req.body is undefined/empty for GET requests, which broke
            // getUserData, getUserJobApplications, getStudentNotices, etc.
            req.userId = token_decode.id
        } else {
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }

        next()

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: 'Token expired, please login again', expired: true })
        }
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authUser
