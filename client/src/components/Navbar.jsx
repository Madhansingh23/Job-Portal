import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {

    const { user, token, logout, companyToken, companyData } = useContext(AppContext)
    const navigate = useNavigate()
    const location = useLocation()
    const isHome = location.pathname === '/'
    const [menuOpen, setMenuOpen] = useState(false)
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark'
    })

    // Apply dark mode class to html element
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [darkMode])

    // Determine the active user (student/coordinator OR company/recruiter)
    const activeUser = user || (companyData ? { name: companyData.name, image: companyData.image, role: 'recruiter' } : null)
    const isLoggedIn = !!(token || companyToken)

    const handleLogout = () => {
        setMenuOpen(false)
        if (companyToken) {
            localStorage.removeItem('companyToken')
            window.location.href = '/'
        } else {
            logout()
        }
    }

    return (
        <nav className='bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 transition-colors duration-300'>
            <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center h-14'>

                {/* Left: Back + Logo */}
                <div className='flex items-center gap-2'>
                    {!isHome && (
                        <button onClick={() => navigate(-1)} className='flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition' title='Go back'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                    )}
                    <img onClick={() => navigate('/')} className='cursor-pointer h-9 max-w-[130px] object-contain' src={assets.logo} alt="2MK Jobs" />
                </div>

                {/* Right: Theme Toggle + Auth */}
                <div className='flex items-center gap-2 sm:gap-3'>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className='w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition text-lg'
                        title={darkMode ? 'Light Mode' : 'Dark Mode'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    {isLoggedIn && activeUser ? (
                        <div className='flex items-center gap-3'>
                            {/* Desktop Links */}
                            {user?.role === 'student' && <Link to='/applications' className='hidden sm:block text-sm text-gray-600 hover:text-blue-600 transition'>Applied Jobs</Link>}
                            {user?.role === 'coordinator' && <Link to='/dashboard/coordinator' className='hidden sm:block text-sm text-blue-600 font-medium hover:underline'>Dashboard</Link>}
                            {companyToken && <Link to='/dashboard' className='hidden sm:block text-sm text-blue-600 font-medium hover:underline'>Dashboard</Link>}

                            {/* User Avatar + Dropdown */}
                            <div className='relative'>
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className='flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-50 transition border border-transparent hover:border-gray-200'
                                >
                                    {activeUser.image ? (
                                        <img className='w-8 h-8 rounded-full object-cover border-2 border-gray-100' src={activeUser.image} alt="" />
                                    ) : (
                                        <div className='w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold'>
                                            {activeUser.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <span className='hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate'>{activeUser.name}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6" /></svg>
                                </button>

                                {/* Dropdown Menu */}
                                {menuOpen && (
                                    <>
                                        <div className='fixed inset-0 z-40' onClick={() => setMenuOpen(false)}></div>
                                        <div className='absolute right-0 top-12 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50'>
                                            <div className='px-4 py-3 bg-gray-50 border-b'>
                                                <p className='text-sm font-semibold text-gray-800 truncate'>{activeUser.name}</p>
                                                <p className='text-xs text-gray-400 capitalize'>{activeUser.role || 'User'}</p>
                                            </div>

                                            {user?.role === 'student' && (
                                                <>
                                                    <button onClick={() => { setMenuOpen(false); navigate('/profile') }} className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                                                        👤 My Profile
                                                    </button>
                                                    <button onClick={() => { setMenuOpen(false); navigate('/applications') }} className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                                                        📋 My Applications
                                                    </button>
                                                </>
                                            )}
                                            {user?.role === 'coordinator' && (
                                                <button onClick={() => { setMenuOpen(false); navigate('/dashboard/coordinator') }} className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                                                    📊 Dashboard
                                                </button>
                                            )}
                                            {companyToken && (
                                                <button onClick={() => { setMenuOpen(false); navigate('/dashboard') }} className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                                                    🏢 Dashboard
                                                </button>
                                            )}

                                            <div className='border-t'>
                                                <button onClick={handleLogout} className='w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2'>
                                                    🚪 Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-center gap-1.5 sm:gap-2'>
                            <button onClick={() => navigate('/recruiter-login')} className='text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition px-2 py-1.5 rounded-lg hover:bg-gray-50'>Recruiter</button>
                            <button onClick={() => navigate('/coordinator-login')} className='text-xs sm:text-sm text-gray-600 hover:text-purple-600 transition px-2 py-1.5 rounded-lg hover:bg-gray-50'>Coordinator</button>
                            <button onClick={() => navigate('/login')} className='bg-blue-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-blue-700 transition font-medium'>Login</button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar