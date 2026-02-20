import { useContext, useState } from 'react'
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
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [image, setImage] = useState(false)
    const [isTextDataSubmited, setIsTextDataSubmited] = useState(false)

    // Change Password fields
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const { backendUrl, setCompanyToken, setCompanyData } = useContext(AppContext)

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (state == "Sign Up" && !isTextDataSubmited) {
            return setIsTextDataSubmited(true)
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

    const onForgotPassword = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/forgot-password`, { email })
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
            const { data } = await axios.post(`${backendUrl}/api/auth/change-password`, { email, oldPassword, newPassword })
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
        return isTextDataSubmited ? 'Create Account' : 'Next';
    }

    return (
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>

            <Navbar />

            <div className='relative min-h-screen flex items-center justify-center px-4'>
                <div className='glass-card rounded-2xl p-8 sm:p-10 w-full max-w-md relative overflow-hidden animate-fade-in'>

                    {/* Decorative Elements */}
                    <div className='absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-bl-full -mr-10 -mt-10 blur-xl pointer-events-none'></div>
                    <div className='absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/20 rounded-tr-full -ml-10 -mb-10 blur-xl pointer-events-none'></div>

                    {/* Role Badge */}
                    <div className='text-center mb-4'>
                        <span className='inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider'>
                            💼 Recruiter Portal
                        </span>
                    </div>

                    <h1 className='text-center text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-2'>{getTitle()}</h1>
                    <p className='text-sm text-center text-slate-500 dark:text-slate-300 mb-8'>{getSubtitle()}</p>

                    <form onSubmit={getFormHandler()} className="relative z-10">

                        {/* Sign Up - Image upload step */}
                        {state === "Sign Up" && isTextDataSubmited ? (
                            <div className='flex items-center gap-4 my-10 justify-center'>
                                <label htmlFor="image" className='cursor-pointer text-center group'>
                                    <div className="relative inline-block">
                                        <img className='w-20 h-20 rounded-full object-cover border-4 border-slate-100 dark:border-slate-600 group-hover:border-royal-blue transition shadow-lg' src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition">
                                            <span className="text-white text-xs font-medium">Upload</span>
                                        </div>
                                    </div>
                                    <p className='text-sm text-slate-500 dark:text-slate-300 mt-2 font-medium'>Company Logo</p>
                                    <input onChange={e => setImage(e.target.files[0])} type="file" id='image' hidden />
                                </label>
                            </div>
                        ) : (state === 'Login' || (state === 'Sign Up' && !isTextDataSubmited)) ? (
                            <>
                                {state !== 'Login' && (
                                    <div className='border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center gap-3 rounded-xl mt-4 bg-white/50 dark:bg-slate-800/50 hover:border-royal-blue focus-within:border-royal-blue transition'>
                                        <img src={assets.person_icon} alt="" className="w-5 opacity-60 dark:invert" />
                                        <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400' onChange={e => setName(e.target.value)} value={name} type="text" placeholder='Company Name' required />
                                    </div>
                                )}

                                <div className='border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center gap-3 rounded-xl mt-4 bg-white/50 dark:bg-slate-800/50 hover:border-royal-blue focus-within:border-royal-blue transition'>
                                    <img src={assets.email_icon} alt="" className="opacity-60 dark:invert" />
                                    <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400' onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' required />
                                </div>

                                <div className='border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center gap-3 rounded-xl mt-4 bg-white/50 dark:bg-slate-800/50 hover:border-royal-blue focus-within:border-royal-blue transition'>
                                    <img src={assets.lock_icon} alt="" className="opacity-60 dark:invert" />
                                    <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400' onChange={e => setPassword(e.target.value)} value={password} type="password" placeholder='Password' required />
                                </div>
                            </>
                        ) : null}

                        {/* Forgot Password - email only */}
                        {state === 'Forgot' && (
                            <div className='border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center gap-3 rounded-xl mt-4 bg-white/50 dark:bg-slate-800/50 hover:border-royal-blue focus-within:border-royal-blue transition'>
                                <img src={assets.email_icon} alt="" className="opacity-60 dark:invert" />
                                <input className='outline-none text-sm w-full bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-400' onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' required />
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
                                Forgot password?
                            </p>
                        )}

                        <button type='submit' className='btn-royal w-full py-3 rounded-xl mt-8 font-semibold text-white tracking-wide disabled:opacity-50 disabled:cursor-not-allowed shadow-blue-500/30' disabled={loading}>
                            {getButtonText()}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        {state === 'Login' && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">Don't have an account? <span className="text-royal-blue dark:text-blue-400 cursor-pointer font-bold hover:underline" onClick={() => setState("Sign Up")}>Sign Up</span></p>
                        )}
                        {state === 'Sign Up' && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">Already have an account? <span className="text-royal-blue dark:text-blue-400 cursor-pointer font-bold hover:underline" onClick={() => { setState("Login"); setIsTextDataSubmited(false); }}>Login</span></p>
                        )}
                        {(state === 'Forgot' || state === 'Change Password') && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">Remember your password? <span className="text-royal-blue dark:text-blue-400 cursor-pointer font-bold hover:underline" onClick={() => setState('Login')}>Back to Login</span></p>
                        )}
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    )
}

export default RecruiterLogin