import React, { useContext, useState } from 'react'
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

    // Change Password fields
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)

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
                const { data } = await axios.post(backendUrl + '/api/coordinator/register', { name, email, password })
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
        if (state === 'Sign Up') return 'Create Account';
        if (state === 'Forgot') return 'Send Temporary Password';
        if (state === 'Change Password') return 'Update Password';
    }

    return (
        <div>
            <Navbar />
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 px-4'>
                <div className='bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-10 w-full max-w-md border border-white/30'>
                    <h1 className='text-center text-2xl font-bold text-gray-800'>{getTitle()}</h1>
                    <p className='text-sm text-center text-gray-500 mb-6 mt-1'>{getSubtitle()}</p>

                    <form onSubmit={getFormHandler()}>

                        {/* Name - Sign Up only */}
                        {state === 'Sign Up' && (
                            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 bg-gray-50'>
                                <img src={assets.person_icon} alt="" className="w-5" />
                                <input className='outline-none text-sm w-full bg-transparent' onChange={e => setName(e.target.value)} value={name} type="text" placeholder='Full Name' required />
                            </div>
                        )}

                        {/* Email - Login, Sign Up, Forgot */}
                        {(state === 'Login' || state === 'Sign Up' || state === 'Forgot') && (
                            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 bg-gray-50'>
                                <img src={assets.email_icon} alt="" />
                                <input className='outline-none text-sm w-full bg-transparent' onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Official Email' required />
                            </div>
                        )}

                        {/* Password - Login, Sign Up */}
                        {(state === 'Login' || state === 'Sign Up') && (
                            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 bg-gray-50'>
                                <img src={assets.lock_icon} alt="" />
                                <input className='outline-none text-sm w-full bg-transparent' onChange={e => setPassword(e.target.value)} value={password} type="password" placeholder='Password' required />
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

                        {state === "Login" && (
                            <p className='text-sm text-blue-600 mt-4 cursor-pointer hover:underline' onClick={() => setState('Forgot')}>
                                Forgot Password?
                            </p>
                        )}

                        <button type='submit' className='bg-blue-600 w-full text-white py-2.5 rounded-full mt-6 hover:bg-blue-700 transition font-medium disabled:opacity-50' disabled={loading}>
                            {getButtonText()}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        {state === 'Login' && (
                            <p className="text-sm">Don't have an account? <span className="text-blue-600 cursor-pointer font-medium hover:underline" onClick={() => setState("Sign Up")}>Sign Up</span></p>
                        )}
                        {state === 'Sign Up' && (
                            <p className="text-sm">Already have an account? <span className="text-blue-600 cursor-pointer font-medium hover:underline" onClick={() => setState("Login")}>Login</span></p>
                        )}
                        {(state === 'Forgot' || state === 'Change Password') && (
                            <p className="text-sm">Remember your password? <span className="text-blue-600 cursor-pointer font-medium hover:underline" onClick={() => setState('Login')}>Back to Login</span></p>
                        )}
                    </div>

                    <div className='mt-4 text-center text-xs text-gray-400'>
                        Authorized Personnel Only
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default CoordinatorLogin
