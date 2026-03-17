import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const CoordinatorLogin = () => {

    const navigate = useNavigate()
    const { backendUrl, setUser, setToken } = useContext(AppContext)

    // 'Login' | 'Sign Up' | 'Forgot' | 'Change Password'
    const [state, setState] = useState('Login')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [isOtpSent, setIsOtpSent] = useState(false)

    // Change Password fields
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard/coordinator')
        }
    }, [navigate])

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (state === 'Login') {
                const { data } = await axios.post(backendUrl + '/api/coordinator/login', { email, password })
                if (data.success) {
                    toast.success("Coordinator Login Successful")
                    localStorage.setItem('token', data.token)
                    setToken(data.token)
                    setUser(data.user)
                    navigate('/dashboard/coordinator')
                } else {
                    toast.error(data.message)
                }
            } else if (state === 'Sign Up') {
                const { data } = await axios.post(backendUrl + '/api/coordinator/register', { name, email, password, otp })
                if (data.success) {
                    toast.success("Coordinator Account Created")
                    localStorage.setItem('token', data.token)
                    setToken(data.token)
                    setUser(data.user)
                    navigate('/dashboard/coordinator')
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

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

    const onSendOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/send-otp', { email })
            if (data.success) {
                toast.success("OTP Sent to Email")
                setIsOtpSent(true)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

    const onChangePassword = async (e) => {
        e.preventDefault()
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters")
            return
        }
        setLoading(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/auth/change-password', { email, oldPassword, newPassword })
            if (data.success) {
                toast.success(data.message)
                setState('Login')
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
        if (state === 'Forgot') return onForgotPassword;
        if (state === 'Change Password') return onChangePassword;
        if (state === 'Sign Up' && !isOtpSent) return onSendOtp;
        return onSubmitHandler;
    }

    const getTitle = () => {
        if (state === 'Forgot') return 'Reset Password';
        if (state === 'Change Password') return 'Change Password';
        return `Coordinator ${state}`;
    }

    const getSubtitle = () => {
        if (state === 'Login') return 'Placement Coordinator Access';
        if (state === 'Sign Up') return 'Create a Coordinator Account';
        if (state === 'Forgot') return 'Enter your email to receive a temporary password';
        if (state === 'Change Password') return 'Enter the temporary password and set a new one';
    }

    const getButtonText = () => {
        if (loading) return 'Processing...';
        if (state === 'Login') return 'Login';
        if (state === 'Sign Up') return isOtpSent ? 'Create Account' : 'Send OTP';
        if (state === 'Forgot') return 'Send Temporary Password';
        if (state === 'Change Password') return 'Update Password';
    }

    return (
        <div className="relative min-h-screen bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-fixed font-inter">
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-0"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <div className='flex-grow flex items-center justify-center px-4 py-12'>
                    <div className='glass-card p-8 sm:p-12 w-full max-w-md relative overflow-hidden animate-slide-up bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-[2.5rem] shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>

                    {/* Decorative Elements */}
                    <div className='absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-bl-full -mr-10 -mt-10 blur-2xl pointer-events-none'></div>
                    <div className='absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-tr-full -ml-10 -mb-10 blur-2xl pointer-events-none'></div>

                    {/* Shimmering Top Bar */}
                    <div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-[length:200%_auto] animate-gradient'></div>

                    {/* Role Badge */}
                    <div className='text-center mb-6'>
                        <span className='inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-purple-500/20 shadow-inner'>
                            🛡️ Coordinator Portal
                        </span>
                    </div>

                    <h1 className='text-center text-3xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'>{getTitle()}</h1>
                    <p className='text-sm text-center text-slate-500 dark:text-slate-400 mb-10 font-medium'>{getSubtitle()}</p>

                    <form onSubmit={getFormHandler()} className="relative z-10">

                        {/* Name - Sign Up only */}
                        {state === 'Sign Up' && !isOtpSent && (
                            <div className='border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center gap-3 rounded-xl mt-4 bg-white/50 dark:bg-slate-800/50 hover:border-royal-blue focus-within:border-royal-blue transition'>
                                <img src={assets.person_icon} alt="" className="w-5 opacity-60 dark:invert" />
                                <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400' onChange={e => setName(e.target.value)} value={name} type="text" placeholder='Full Name' required />
                            </div>
                        )}

                        {/* Email - Login, Sign Up, Forgot */}
                        {(state === 'Login' || state === 'Sign Up' || state === 'Forgot') && (
                            <div className='border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center gap-3 rounded-xl mt-4 bg-white/50 dark:bg-slate-800/50 hover:border-royal-blue focus-within:border-royal-blue transition'>
                                <img src={assets.email_icon} alt="" className="opacity-60 dark:invert" />
                                <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400' onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Official Email' required />
                            </div>
                        )}

                        {/* Password - Login, Sign Up */}
                        {(state === 'Login' || (state === 'Sign Up' && !isOtpSent)) && (
                            <div className='border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center gap-3 rounded-xl mt-4 bg-white/50 dark:bg-slate-800/50 hover:border-royal-blue focus-within:border-royal-blue transition'>
                                <img src={assets.lock_icon} alt="" className="opacity-60 dark:invert" />
                                <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400' onChange={e => setPassword(e.target.value)} value={password} type="password" placeholder='Password' required />
                            </div>
                        )}

                        {/* OTP Input - Sign Up (after OTP sent) */}
                        {state === 'Sign Up' && isOtpSent && (
                            <div className='border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center gap-3 rounded-xl mt-4 bg-white/50 dark:bg-slate-800/50 hover:border-royal-blue focus-within:border-royal-blue transition'>
                                <img src={assets.lock_icon} alt="" className="opacity-60 dark:invert" />
                                <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400' onChange={e => setOtp(e.target.value)} value={otp} type="text" placeholder='Enter OTP' required />
                            </div>
                        )}

                        {/* Change Password fields */}
                        {state === 'Change Password' && (
                            <>
                                <div className='border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center gap-3 rounded-xl mt-4 bg-white/50 dark:bg-slate-800/50 hover:border-royal-blue focus-within:border-royal-blue transition'>
                                    <img src={assets.lock_icon} alt="" className="opacity-60 dark:invert" />
                                    <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400' onChange={e => setOldPassword(e.target.value)} value={oldPassword} type="password" placeholder='Temporary Password' required />
                                </div>
                                <div className='border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center gap-3 rounded-xl mt-4 bg-white/50 dark:bg-slate-800/50 hover:border-royal-blue focus-within:border-royal-blue transition'>
                                    <img src={assets.lock_icon} alt="" className="opacity-60 dark:invert" />
                                    <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400' onChange={e => setNewPassword(e.target.value)} value={newPassword} type="password" placeholder='New Password (min 8 chars)' required />
                                </div>
                            </>
                        )}

                        {state === "Login" && (
                            <p className='text-sm text-royal-blue dark:text-blue-400 mt-4 cursor-pointer hover:underline font-medium text-right' onClick={() => setState('Forgot')}>
                                Forgot Password?
                            </p>
                        )}

                        <button type='submit' className='w-full py-3 rounded-xl mt-8 font-semibold text-white tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none' disabled={loading}>
                            {getButtonText()}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        {state === 'Login' && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">Don't have an account? <span className="text-royal-blue dark:text-blue-400 cursor-pointer font-bold hover:underline" onClick={() => { setState("Sign Up"); setIsOtpSent(false); }}>Sign Up</span></p>
                        )}
                        {state === 'Sign Up' && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">Already have an account? <span className="text-royal-blue dark:text-blue-400 cursor-pointer font-bold hover:underline" onClick={() => { setState("Login"); setIsOtpSent(false); }}>Login</span></p>
                        )}
                        {(state === 'Forgot' || state === 'Change Password') && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">Remember your password? <span className="text-royal-blue dark:text-blue-400 cursor-pointer font-bold hover:underline" onClick={() => setState('Login')}>Back to Login</span></p>
                        )}
                    </div>

                    <div className='mt-4 text-center text-xs text-slate-400 dark:text-slate-500'>
                        🔒 Authorized Personnel Only
                    </div>
                </div>
                </div>
                <Footer />
            </div>
        </div>
    )
}

export default CoordinatorLogin
