import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Login = () => {

    const { backendUrl, login } = useContext(AppContext)
    const navigate = useNavigate()

    // 'Login' | 'Sign Up' | 'Forgot' | 'Change Password'
    const [state, setState] = useState('Login')

    // Form Data
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [otp, setOtp] = useState('')

    // Change Password fields
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')

    // UI State
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [loading, setLoading] = useState(false)

    // Password Validation
    const validatePassword = (pass) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
        return pass.length >= minLength && hasUpperCase && hasSpecialChar;
    }

    // Send OTP (For Registration)
    const onSendOtp = async (e) => {
        e.preventDefault()

        if (!validatePassword(password)) {
            toast.error("Password must be at least 8 characters, include 1 uppercase and 1 special character.")
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!")
            return;
        }

        setLoading(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/send-otp', { email })
            if (data.success) {
                toast.success(data.message)
                setIsOtpSent(true)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

    // Register User
    const onRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/register', { name, email, password, otp })
            if (data.success) {
                toast.success("Registration Successful")
                login(data.token, data.user)
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

    // Login User
    const onLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password })
            if (data.success) {
                toast.success("Login Successful")
                login(data.token, data.user)
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

    // Forgot Password
    const onForgotPassword = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/forgot-password', { email })
            if (data.success) {
                toast.success(data.message)
                setState('Change Password')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

    // Change Password
    const onChangePassword = async (e) => {
        e.preventDefault()
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters")
            return;
        }
        setLoading(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/change-password', { email, oldPassword, newPassword })
            if (data.success) {
                toast.success(data.message)
                setState('Login')
                setPassword('')
                setOldPassword('')
                setNewPassword('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

    const getFormHandler = () => {
        if (state === 'Login') return onLogin;
        if (state === 'Forgot') return onForgotPassword;
        if (state === 'Change Password') return onChangePassword;
        return isOtpSent ? onRegister : onSendOtp;
    }

    const getTitle = () => {
        if (state === 'Login') return 'Student Login';
        if (state === 'Sign Up') return 'Student Sign Up';
        if (state === 'Forgot') return 'Reset Password';
        if (state === 'Change Password') return 'Change Password';
    }

    const getSubtitle = () => {
        if (state === 'Login') return 'Welcome back! Please sign in to continue';
        if (state === 'Sign Up') return 'Create an account to get started';
        if (state === 'Forgot') return 'Enter your email to receive a temporary password';
        if (state === 'Change Password') return 'Enter the temporary password and set a new one';
    }

    const getButtonText = () => {
        if (loading) return 'Processing...';
        if (state === 'Login') return 'Login';
        if (state === 'Forgot') return 'Send Temporary Password';
        if (state === 'Change Password') return 'Update Password';
        return isOtpSent ? 'Register' : 'Send OTP';
    }

    return (
        <div>
            <Navbar />
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 px-4'>
                <div className='bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-10 w-full max-w-md border border-white/30'>

                    <h1 className='text-center text-2xl font-bold text-gray-800'>{getTitle()}</h1>
                    <p className='text-sm text-center text-gray-500 mb-6 mt-1'>{getSubtitle()}</p>

                    <form onSubmit={getFormHandler()}>

                        {/* Name field - Sign Up only */}
                        {state === 'Sign Up' && (
                            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 bg-gray-50'>
                                <img src={assets.person_icon} alt="" className="w-5" />
                                <input className='outline-none text-sm w-full bg-transparent' onChange={e => setName(e.target.value)} value={name} type="text" placeholder='Full Name' required />
                            </div>
                        )}

                        {/* Email field - all states */}
                        {state !== 'Change Password' && (
                            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 bg-gray-50'>
                                <img src={assets.email_icon} alt="" />
                                <input className='outline-none text-sm w-full bg-transparent' onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' required />
                            </div>
                        )}

                        {/* Password field - Login and Sign Up */}
                        {(state === 'Login' || state === 'Sign Up') && (
                            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 bg-gray-50'>
                                <img src={assets.lock_icon} alt="" />
                                <input className='outline-none text-sm w-full bg-transparent' onChange={e => setPassword(e.target.value)} value={password} type="password" placeholder='Password' required />
                            </div>
                        )}

                        {/* Confirm Password - Sign Up before OTP */}
                        {state === 'Sign Up' && !isOtpSent && (
                            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 bg-gray-50'>
                                <img src={assets.lock_icon} alt="" />
                                <input className='outline-none text-sm w-full bg-transparent' onChange={e => setConfirmPassword(e.target.value)} value={confirmPassword} type="password" placeholder='Confirm Password' required />
                            </div>
                        )}

                        {/* OTP field - Sign Up after OTP sent */}
                        {state === 'Sign Up' && isOtpSent && (
                            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 bg-gray-50'>
                                <img src={assets.lock_icon} alt="" />
                                <input className='outline-none text-sm w-full bg-transparent' onChange={e => setOtp(e.target.value)} value={otp} type="text" placeholder='Enter OTP' required />
                            </div>
                        )}

                        {/* Change Password fields */}
                        {state === 'Change Password' && (
                            <>
                                <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 bg-gray-50'>
                                    <img src={assets.lock_icon} alt="" />
                                    <input className='outline-none text-sm w-full bg-transparent' onChange={e => setOldPassword(e.target.value)} value={oldPassword} type="password" placeholder='Temporary Password' required />
                                </div>
                                <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 bg-gray-50'>
                                    <img src={assets.lock_icon} alt="" />
                                    <input className='outline-none text-sm w-full bg-transparent' onChange={e => setNewPassword(e.target.value)} value={newPassword} type="password" placeholder='New Password (min 8 chars)' required />
                                </div>
                            </>
                        )}

                        {/* Forgot password link */}
                        {state === 'Login' && (
                            <p className='text-sm text-blue-600 mt-4 cursor-pointer hover:underline' onClick={() => setState('Forgot')}>
                                Forgot Password?
                            </p>
                        )}

                        <button type='submit' className='bg-blue-600 w-full text-white py-2.5 rounded-full mt-6 hover:bg-blue-700 transition font-medium disabled:opacity-50' disabled={loading}>
                            {getButtonText()}
                        </button>
                    </form>

                    {/* Toggle links */}
                    <div className="mt-5 text-center">
                        {state === 'Login' && (
                            <p className="text-sm">Don't have an account? <span className="text-blue-600 cursor-pointer font-medium hover:underline" onClick={() => { setState('Sign Up'); setIsOtpSent(false); }}>Sign Up</span></p>
                        )}
                        {state === 'Sign Up' && (
                            <p className="text-sm">Already have an account? <span className="text-blue-600 cursor-pointer font-medium hover:underline" onClick={() => { setState('Login'); setIsOtpSent(false); }}>Login</span></p>
                        )}
                        {(state === 'Forgot' || state === 'Change Password') && (
                            <p className="text-sm">Remember your password? <span className="text-blue-600 cursor-pointer font-medium hover:underline" onClick={() => setState('Login')}>Back to Login</span></p>
                        )}
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Login
