import User from "../models/User.js";
import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from 'bcrypt';

// Strong password validation
const validatePassword = (password) => {
    if (!password || password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*...)';
    return null;
}

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

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB
        await Otp.create({ email, otp });

        // Log to console for Development
        console.log(`[DEV ONLY] OTP for ${email}: ${otp}`);

        // Email Template
        const mailOptions = {
            from: '"Campus Placement" <no-reply@campus.com>',
            to: email,
            subject: "Verification Code - Campus Placement",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                    <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Campus Placement</h1>
                    </div>
                    <div style="padding: 30px 20px; text-align: center;">
                        <p style="color: #64748b; font-size: 16px; margin-bottom: 20px;">Use the following verification code to complete your registration.</p>
                        <div style="background-color: #f8fafc; display: inline-block; padding: 15px 30px; border-radius: 8px; border: 1px dashed #cbd5e1; margin-bottom: 20px;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; display: block;">${otp}</span>
                        </div>
                        <p style="color: #94a3b8; font-size: 14px;">This code is valid for 5 minutes.</p>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
                        &copy; ${new Date().getFullYear()} Campus Placement Portal. All rights reserved.
                    </div>
                </div>
            `
        };

        // Send Email
        let mailSent = false;
        try {
            await transporter.sendMail(mailOptions);
            mailSent = true;
            console.log(`OTP sent to ${email} via SMTP.`);
        } catch (mailError) {
            console.error(`Failed to send OTP to ${email}:`, mailError.message);
            mailSent = false;
        }

        // Response
        if (process.env.NODE_ENV !== 'production' && !mailSent) {
            return res.json({ success: true, message: "OTP generated (Email failed)", otp }); // Fallback for dev without SMTP
        }

        if (!mailSent) {
            return res.json({ success: false, message: "Failed to send OTP email. Please check the email address." });
        }

        return res.json({ success: true, message: "Verification code sent to your email" });

    } catch (error) {
        console.error("OTP Error:", error);
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

        // Validate password strength
        const pwError = validatePassword(password);
        if (pwError) return res.json({ success: false, message: pwError });

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

        // Also check Company and Coordinator if not found in User (for shared Auth flow)
        // NOTE: Currently User model handles 'student' and 'coordinator' roles. 
        // 'Company' is a separate model. We need to check Company model if not found in User.

        let targetUser = user;
        let isCompany = false;

        if (!targetUser) {
            // Dynamic import to avoid circular dependency issues if any, or just import at top if clean.
            // For now assuming we might need to handle Company reset here too since frontend calls this for all.
            const Company = (await import("../models/Company.js")).default;
            targetUser = await Company.findOne({ email });
            if (targetUser) isCompany = true;
        }

        if (!targetUser) {
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
        targetUser.password = hashedPassword;
        await targetUser.save();

        // Email Template
        const mailOptions = {
            from: '"Campus Placement" <no-reply@campus.com>',
            to: email,
            subject: "Password Reset Request",
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #ef4444; padding: 20px; text-align: center;">
                        <h2 style="color: white; margin: 0;">Password Reset</h2>
                    </div>
                    <div style="padding: 30px 20px;">
                        <p style="color: #334155; margin-bottom: 20px;">Hello <strong>${targetUser.name}</strong>,</p>
                        <p style="color: #64748b;">We received a request to reset your password. Use the temporary password below to login:</p>
                        
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px dashed #cbd5e1;">
                            <code style="font-size: 24px; font-weight: bold; color: #1e293b; letter-spacing: 2px;">${tempPassword}</code>
                        </div>

                        <div style="background-color: #fff1f2; border-left: 4px solid #ef4444; padding: 10px 15px; margin-bottom: 20px;">
                            <p style="color: #991b1b; font-size: 13px; margin: 0;"><strong>Security Alert:</strong> Please login and change this password immediately.</p>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">If you didn't request this, please contact support immediately.</p>
                    </div>
                </div>
            `
        };

        // Send email
        let mailSent = false;
        try {
            await transporter.sendMail(mailOptions);
            mailSent = true;
            console.log(`Password reset email sent to ${email}`);
        } catch (mailError) {
            console.error("Failed to send password reset email:", mailError.message);
        }

        // In dev mode, include temp password in response
        if (process.env.NODE_ENV !== 'production') {
            return res.json({ success: true, message: "Temporary password sent to your email", tempPassword, mailSent });
        }

        if (!mailSent) {
            return res.json({ success: false, message: "Failed to send reset email. Service may be down." });
        }

        res.json({ success: true, message: "Temporary password sent to your email" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
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

        const pwError = validatePassword(newPassword);
        if (pwError) {
            return res.json({ success: false, message: pwError });
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
