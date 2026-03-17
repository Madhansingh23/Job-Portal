import { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const RecruiterLogin = () => {

    const navigate = useNavigate()

    // 'Login' | 'Sign Up' | 'Forgot' | 'Change Password'
    const [state, setState] = useState('Login')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [image, setImage] = useState(false)
    const [isTextDataSubmited, setIsTextDataSubmited] = useState(false)
    const [otp, setOtp] = useState('')
    const [isOtpSent, setIsOtpSent] = useState(false)

    // Change Password fields
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const { backendUrl, setCompanyToken, setCompanyData, companyToken } = useContext(AppContext)

    useEffect(() => {
        if (companyToken || localStorage.getItem('companyToken')) {
            navigate('/dashboard')
        }
    }, [companyToken, navigate])

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (state === "Sign Up" && !isTextDataSubmited) {
            if (!name || !email || !password) return toast.error("Please fill all details")
            return setIsTextDataSubmited(true)
        }

        if (state === "Sign Up" && isTextDataSubmited && !isOtpSent) {
            if (!image) return toast.error("Please upload a company logo")
            return onSendOtp(e)
        }

        if (state === "Sign Up" && (!image || !otp)) {
            return toast.error("Please complete the OTP verification")
        }

        setLoading(true)
        try {
            if (state === "Login") {
                const { data } = await axios.post(`${backendUrl}/api/company/login`, { email, password })
                if (data.success) {
                    setCompanyData(data.company)
                    setCompanyToken(data.token)
                    localStorage.setItem('companyToken', data.token)
                    navigate('/dashboard')
                } else {
                    toast.error(data.message)
                }
            } else if (state === "Sign Up") {
                const formData = new FormData()
                formData.append('name', name)
                formData.append('password', password)
                formData.append('email', email)
                formData.append('image', image)
                formData.append('otp', otp)

                const { data } = await axios.post(`${backendUrl}/api/company/register`, formData)
                if (data.success) {
                    setCompanyData(data.company)
                    setCompanyToken(data.token)
                    localStorage.setItem('companyToken', data.token)
                    navigate('/dashboard')
                } else {
                    toast.error(data.message)
                }
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

    const onForgotPassword = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/company/forgot-password`, { email })
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

    const onChangePassword = async (e) => {
        e.preventDefault()
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters")
            return
        }
        setLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/company/change-password-public`, { email, oldPassword, newPassword })
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
        // submit handler resolves internal sequences (text -> otp_send -> final)
        return onSubmitHandler;
    }

    const getTitle = () => {
        if (state === 'Forgot') return 'Reset Password';
        if (state === 'Change Password') return 'Change Password';
        return `Recruiter ${state}`;
    }

    const getSubtitle = () => {
        if (state === 'Login') return 'Welcome back! Please sign in to continue';
        if (state === 'Sign Up') return 'Create a company account to get started';
        if (state === 'Forgot') return 'Enter your email to receive a temporary password';
        if (state === 'Change Password') return 'Enter the temporary password and set a new one';
    }

    const getButtonText = () => {
        if (loading) return 'Processing...';
        if (state === 'Login') return 'Login';
        if (state === 'Forgot') return 'Send Temporary Password';
        if (state === 'Change Password') return 'Update Password';
        if (state === 'Sign Up') {
            if (!isTextDataSubmited) return 'Next';
            if (isTextDataSubmited && !isOtpSent) return 'Send OTP';
            if (isTextDataSubmited && isOtpSent) return 'Create Account';
        }
        return 'Submit';
    }

    return (
        <div className="relative min-h-screen bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-fixed font-inter overflow-x-hidden">
            {/* Elegant Overlay Gradients */}
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 transition-colors duration-500 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-indigo-600/10 mix-blend-overlay z-0"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <div className='flex-grow flex items-center justify-center px-4 py-16 relative z-10'>
                    {/* Animated background elements */}
                    <div className='absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float pointer-events-none'></div>
                    <div className='absolute bottom-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-float pointer-events-none' style={{animationDelay: '1s'}}></div>

                    <div className='glass-card p-8 sm:p-12 w-full max-w-md relative overflow-hidden animate-slide-up bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-[2.5rem] shadow-2xl transition-all duration-300 transform hover:scale-[1.01]'>
                        
                        {/* Decorative Elements */}
                        <div className='absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-bl-full -mr-10 -mt-10 blur-2xl pointer-events-none'></div>
                        <div className='absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-tr-full -ml-10 -mb-10 blur-2xl pointer-events-none'></div>

                        {/* Shimmering Top Bar */}
                        <div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-[length:200%_auto] animate-gradient'></div>

                        {/* Role Badge */}
                        <div className='text-center mb-6'>
                            <span className='inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 shadow-inner'>
                                💼 Recruiter Portal
                            </span>
                        </div>

                        <h1 className='text-center text-3xl font-extrabold tracking-tight mb-2 text-slate-800 dark:text-white'>{getTitle()}</h1>
                        <p className='text-sm text-center text-slate-500 dark:text-slate-400 mb-10 font-medium'>{getSubtitle()}</p>

                    <form onSubmit={getFormHandler()} className="relative z-10">

                        {/* Sign Up - Image upload & OTP step */}
                        {state === "Sign Up" && isTextDataSubmited ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className='flex flex-col items-center justify-center py-4'>
                                    <label htmlFor="image" className='cursor-pointer text-center group relative'>
                                        <div className="relative">
                                            <div className='absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-all'></div>
                                            <img className='relative w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-2xl group-hover:scale-105 transition-transform duration-300' src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <span className="text-white text-xs font-bold uppercase tracking-widest">Update</span>
                                            </div>
                                        </div>
                                        <p className='text-xs text-slate-500 dark:text-slate-400 mt-4 font-bold uppercase tracking-widest'>Company Logo</p>
                                        <input onChange={e => setImage(e.target.files[0])} type="file" id='image' hidden />
                                    </label>
                                </div>
                                {isOtpSent && (
                                    <div className='group border border-slate-200 dark:border-slate-700/50 px-4 py-3.5 flex items-center gap-3 rounded-xl bg-white/50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all'>
                                        <img src={assets.lock_icon} alt="" className="opacity-40 group-focus-within:opacity-100 dark:invert transition-opacity" />
                                        <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400' onChange={e => setOtp(e.target.value)} value={otp} type="text" placeholder='Enter 6-digit OTP' required />
                                    </div>
                                )}
                            </div>
                        ) : (state === 'Login' || (state === 'Sign Up' && !isTextDataSubmited)) ? (
                            <div className="space-y-5 animate-fade-in">
                                {state !== 'Login' && (
                                    <div className='group border border-slate-200 dark:border-slate-700/50 px-4 py-3.5 flex items-center gap-3 rounded-xl bg-white/50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all'>
                                        <img src={assets.person_icon} alt="" className="w-5 opacity-40 group-focus-within:opacity-100 dark:invert transition-opacity" />
                                        <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400' onChange={e => setName(e.target.value)} value={name} type="text" placeholder='Company Name' required />
                                    </div>
                                )}

                                <div className='group border border-slate-200 dark:border-slate-700/50 px-4 py-3.5 flex items-center gap-3 rounded-xl bg-white/50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all'>
                                    <img src={assets.email_icon} alt="" className="opacity-40 group-focus-within:opacity-100 dark:invert transition-opacity" />
                                    <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400' onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' required />
                                </div>

                                <div className='group border border-slate-200 dark:border-slate-700/50 px-4 py-3.5 flex items-center gap-3 rounded-xl bg-white/50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all'>
                                    <img src={assets.lock_icon} alt="" className="opacity-40 group-focus-within:opacity-100 dark:invert transition-opacity" />
                                    <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400' onChange={e => setPassword(e.target.value)} value={password} type="password" placeholder='Password' required />
                                </div>
                            </div>
                        ) : null}

                        {/* Forgot Password - email only */}
                        {state === 'Forgot' && (
                            <div className='group border border-slate-200 dark:border-slate-700/50 px-4 py-3.5 flex items-center gap-3 rounded-xl mt-5 bg-white/50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all'>
                                <img src={assets.email_icon} alt="" className="opacity-40 group-focus-within:opacity-100 dark:invert transition-opacity" />
                                <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400' onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' required />
                            </div>
                        )}

                        {/* Change Password fields */}
                        {state === 'Change Password' && (
                            <div className='space-y-5 mt-5 animate-fade-in'>
                                <div className='group border border-slate-200 dark:border-slate-700/50 px-4 py-3.5 flex items-center gap-3 rounded-xl bg-white/50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all'>
                                    <img src={assets.lock_icon} alt="" className="opacity-40 group-focus-within:opacity-100 dark:invert transition-opacity" />
                                    <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400' onChange={e => setOldPassword(e.target.value)} value={oldPassword} type="password" placeholder='Temporary Password' required />
                                </div>
                                <div className='group border border-slate-200 dark:border-slate-700/50 px-4 py-3.5 flex items-center gap-3 rounded-xl bg-white/50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all'>
                                    <img src={assets.lock_icon} alt="" className="opacity-40 group-focus-within:opacity-100 dark:invert transition-opacity" />
                                    <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400' onChange={e => setNewPassword(e.target.value)} value={newPassword} type="password" placeholder='New Password (min 8 chars)' required />
                                </div>
                            </div>
                        )}

                        {state === "Login" && (
                            <p className='text-sm text-royal-blue dark:text-blue-400 mt-4 cursor-pointer hover:underline font-medium text-right' onClick={() => setState('Forgot')}>
                                Forgot password?
                            </p>
                        )}

                        <button type='submit' className='w-full py-3 rounded-xl mt-8 font-semibold text-white tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none' disabled={loading}>
                            {getButtonText()}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        {state === 'Login' && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">Don't have an account? <span className="text-royal-blue dark:text-blue-400 cursor-pointer font-bold hover:underline" onClick={() => { setState("Sign Up"); setIsOtpSent(false); setIsTextDataSubmited(false); }}>Sign Up</span></p>
                        )}
                        {state === 'Sign Up' && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">Already have an account? <span className="text-royal-blue dark:text-blue-400 cursor-pointer font-bold hover:underline" onClick={() => { setState("Login"); setIsOtpSent(false); setIsTextDataSubmited(false); }}>Login</span></p>
                        )}
                        {(state === 'Forgot' || state === 'Change Password') && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">Remember your password? <span className="text-royal-blue dark:text-blue-400 cursor-pointer font-bold hover:underline" onClick={() => setState('Login')}>Back to Login</span></p>
                        )}
                    </div>

                </div>
                </div>
                <Footer />
            </div>
        </div>
    )
}

export default RecruiterLogin