import User from "../models/User.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from 'bcrypt';

// Configure SMTP transporter using env vars
const smtpHost = process.env.SMTP_HOST || 'smtp.ethereal.email';
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const smtpUser = process.env.SMTP_USER || undefined;
const smtpPass = process.env.SMTP_PASS || undefined;
const smtpSecure = (process.env.SMTP_SECURE === 'true') || smtpPort === 465;

const transporterOptions = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure
};
if (smtpUser && smtpPass) transporterOptions.auth = { user: smtpUser, pass: smtpPass };

const transporter = nodemailer.createTransport(transporterOptions);

// Verify transporter at startup so SMTP issues are visible early
transporter.verify()
    .then(() => console.log(`SMTP transporter verified (host=${smtpHost}, port=${smtpPort})`))
    .catch(err => console.warn('SMTP transporter verification failed:', err && err.message ? err.message : err));

// Send OTP
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.json({ success: false, message: "Email is required" });

        // Check if user already exists for registration flow check? 
        // Actually, we might want to allow checking if email exists before sending OTP for registration vs login
        // But for now, let's just send OTP. Verification handles the rest.


        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB
        await Otp.create({ email, otp });

        // Log to console for Development
        console.log(`[DEV ONLY] OTP for ${email}: ${otp}`);

        // Send Email
        let mailSent = false;
        try {
            await transporter.sendMail({
                from: '"Campus Placement" <no-reply@campus.com>',
                to: email,
                subject: "Your Login OTP",
                text: `Your OTP is ${otp}. It expires in 5 minutes.`
            });
            mailSent = true;
        } catch (mailError) {
            console.warn("Failed to send email:", mailError.message);
            mailSent = false;
        }

        // In non-production, include the OTP in the response to aid debugging
        if (process.env.NODE_ENV !== 'production') {
            return res.json({ success: true, message: "OTP sent successfully", otp, mailSent });
        }

        // In production, report based on actual mail send result
        if (!mailSent) {
            return res.json({ success: false, message: "Failed to send OTP email" });
        }

        return res.json({ success: true, message: "OTP sent successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Register User (Verify OTP & Create Account)
export const register = async (req, res) => {
    try {
        const { name, email, password, otp, image } = req.body;

        if (!name || !email || !password || !otp) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Verify OTP first
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) {
            return res.json({ success: false, message: "Invalid or Expired OTP" });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.json({ success: false, message: "User already registered" });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            image: image || `https://ui-avatars.com/api/?name=${name}&background=random`,
            role: 'student'
        });

        // Delete used OTP
        await Otp.deleteMany({ email });

        // Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, image: user.image } });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Login User (Email & Password)
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: "Email and Password are required" });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        // Safety check: If user exists but has no password (e.g., old OTP-only user)
        if (!user.password) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        // Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, image: user.image } });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Forgot Password - Send Temporary Password via Email
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.json({ success: false, message: "Email is required" });

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.json({ success: false, message: "No account found with this email" });
        }

        // Generate random 8-char temporary password
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
        let tempPassword = '';
        for (let i = 0; i < 8; i++) {
            tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Hash and save
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);
        user.password = hashedPassword;
        await user.save();

        // Send email
        let mailSent = false;
        try {
            await transporter.sendMail({
                from: '"PSNA Jobs" <no-reply@campus.com>',
                to: email,
                subject: "Your Temporary Password - PSNA Jobs",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #2563eb;">Password Reset</h2>
                        <p>Hi <strong>${user.name}</strong>,</p>
                        <p>Your temporary password is:</p>
                        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 16px 0;">
                            <code style="font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #1e40af;">${tempPassword}</code>
                        </div>
                        <p style="color: #ef4444; font-size: 14px;">⚠️ Please login and change your password immediately.</p>
                        <p style="color: #64748b; font-size: 12px;">If you didn't request this, please contact support.</p>
                    </div>
                `
            });
            mailSent = true;
        } catch (mailError) {
            console.warn("Failed to send password reset email:", mailError.message);
        }

        // In dev mode, include temp password in response
        if (process.env.NODE_ENV !== 'production') {
            return res.json({ success: true, message: "Temporary password sent to your email", tempPassword, mailSent });
        }

        if (!mailSent) {
            return res.json({ success: false, message: "Failed to send reset email. Try again." });
        }

        res.json({ success: true, message: "Temporary password sent to your email" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Change Password
export const changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        if (!email || !oldPassword || !newPassword) {
            return res.json({ success: false, message: "All fields are required" });
        }

        if (newPassword.length < 8) {
            return res.json({ success: false, message: "New password must be at least 8 characters" });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Verify old/temp password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Current password is incorrect" });
        }

        // Hash new password and save
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: "Password changed successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
