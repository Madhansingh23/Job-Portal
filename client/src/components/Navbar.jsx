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
        <nav className='glass-card sticky top-0 z-50 transition-all duration-300 border-none rounded-none'>
            <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center h-20'>

                {/* Left: Logo */}
                <div className='flex items-center gap-4'>
                    <img onClick={() => navigate('/')} className='cursor-pointer h-10 sm:h-14 object-contain hover:opacity-90 transition' src={assets.logo} alt="PSNA Logo" />
                </div>

                {/* Right: Theme Toggle + Auth */}
                <div className='flex items-center gap-4 sm:gap-6'>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className='w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xl active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700'
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    {isLoggedIn && activeUser ? (
                        <div className='flex items-center gap-5'>
                            {/* Desktop Links */}
                            {user?.role === 'student' && (
                                <div className='hidden md:flex gap-6'>
                                    <Link to='/' className='text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-royal-blue dark:hover:text-blue-400 transition relative group'>
                                        Home
                                        <span className={`absolute bottom-0 left-0 h-0.5 bg-royal-blue transition-all ${isHome ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                    </Link>
                                    <Link to='/applications' className='text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-royal-blue dark:hover:text-blue-400 transition relative group'>
                                        Applied Jobs
                                        <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-royal-blue transition-all group-hover:w-full'></span>
                                    </Link>
                                    <Link to='/notices' className='text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-royal-blue dark:hover:text-blue-400 transition relative group'>
                                        Notices
                                        <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-royal-blue transition-all group-hover:w-full'></span>
                                    </Link>
                                </div>
                            )}
                            {user?.role === 'coordinator' && <Link to='/dashboard/coordinator' className='hidden md:block text-sm font-semibold text-imperial-purple bg-purple-50 dark:bg-purple-900/30 px-4 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition border border-purple-100 dark:border-purple-800'>Coordinator Dashboard</Link>}
                            {companyToken && <Link to='/dashboard' className='hidden md:block text-sm font-semibold text-royal-blue bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition border border-blue-100 dark:border-blue-800'>Recruiter Dashboard</Link>}

                            {/* User Avatar + Dropdown */}
                            <div className='relative z-50'>
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className='flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group'
                                >
                                    <span className='hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate group-hover:text-royal-blue dark:group-hover:text-blue-400'>{activeUser.name}</span>
                                    {activeUser.image ? (
                                        <img className='w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-md group-hover:scale-105 transition' src={activeUser.image} alt="" />
                                    ) : (
                                        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-royal-blue to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white dark:ring-slate-700'>
                                            {activeUser.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
                                </button>

                                {/* Dropdown Menu */}
                                {menuOpen && (
                                    <>
                                        <div className='fixed inset-0 z-40' onClick={() => setMenuOpen(false)}></div>
                                        <div className='absolute right-0 top-[120%] w-64 glass-card rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-fade-in origin-top-right transform'>
                                            <div className='px-6 py-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b dark:border-slate-700 flex flex-col gap-2'>
                                                <p className='text-sm font-bold text-slate-800 dark:text-white truncate'>{activeUser.name}</p>
                                                <p className='text-xs font-medium text-slate-500 dark:text-slate-400 capitalize px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 w-fit border border-slate-200 dark:border-slate-600'>{activeUser.role || 'User'}</p>
                                            </div>

                                            <div className='py-2'>
                                                {user?.role === 'student' && (
                                                    <>
                                                        <button onClick={() => { setMenuOpen(false); navigate('/profile') }} className='w-full text-left px-6 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-royal-blue dark:hover:text-blue-400 flex items-center gap-3 transition font-medium'>
                                                            <span>👤</span> My Profile
                                                        </button>
                                                        <button onClick={() => { setMenuOpen(false); navigate('/applications') }} className='w-full text-left px-6 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-royal-blue dark:hover:text-blue-400 flex items-center gap-3 transition font-medium'>
                                                            <span>📋</span> My Applications
                                                        </button>
                                                        <button onClick={() => { setMenuOpen(false); navigate('/notices') }} className='w-full text-left px-6 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-royal-blue dark:hover:text-blue-400 flex items-center gap-3 transition font-medium'>
                                                            <span>📢</span> Notices
                                                        </button>
                                                    </>
                                                )}
                                                {user?.role === 'coordinator' && (
                                                    <>
                                                        <button onClick={() => { setMenuOpen(false); navigate('/coordinator-profile') }} className='w-full text-left px-6 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-imperial-purple flex items-center gap-3 transition font-medium'>
                                                            <span>👤</span> My Profile
                                                        </button>
                                                        <button onClick={() => { setMenuOpen(false); navigate('/dashboard/coordinator') }} className='w-full text-left px-6 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-imperial-purple flex items-center gap-3 transition font-medium'>
                                                            <span>📊</span> Dashboard
                                                        </button>
                                                    </>
                                                )}
                                                {companyToken && (
                                                    <>
                                                        <button onClick={() => { setMenuOpen(false); navigate('/dashboard/profile') }} className='w-full text-left px-6 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-royal-blue flex items-center gap-3 transition font-medium'>
                                                            <span>👤</span> My Profile
                                                        </button>
                                                        <button onClick={() => { setMenuOpen(false); navigate('/dashboard') }} className='w-full text-left px-6 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-royal-blue flex items-center gap-3 transition font-medium'>
                                                            <span>🏢</span> Dashboard
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            <div className='border-t dark:border-slate-700 py-2 bg-slate-50/50 dark:bg-slate-800/50'>
                                                <button onClick={handleLogout} className='w-full text-left px-6 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition font-semibold'>
                                                    <span>🚪</span> Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-center gap-3 sm:gap-4'>
                            <button onClick={() => navigate('/recruiter-login')} className='hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-royal-blue dark:hover:text-blue-400 transition px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg'>Recruiter Login</button>
                            <button onClick={() => navigate('/coordinator-login')} className='hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-imperial-purple dark:hover:text-purple-400 transition px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg'>Coordinator Login</button>
                            <button onClick={() => navigate('/login')} className='btn-royal px-6 py-2.5 rounded-full text-sm font-semibold shadow-blue-300/50 dark:shadow-none'>Student Login</button>

                            {/* Mobile Menu Icon for Login Options */}
                            <div className='sm:hidden relative group'>
                                <button className='p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'>☰</button>
                                <div className='absolute right-0 top-full mt-2 w-56 glass-card shadow-2xl rounded-xl border border-slate-100 dark:border-slate-700 p-2 hidden group-focus-within:block animate-slide-up origin-top-right'>
                                    <button onClick={() => navigate('/login')} className='w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg text-royal-blue dark:text-blue-400 font-bold mb-1'>Student Login</button>
                                    <button onClick={() => navigate('/recruiter-login')} className='w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg dark:text-slate-200'>Recruiter Login</button>
                                    <button onClick={() => navigate('/coordinator-login')} className='w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg dark:text-slate-200'>Coordinator Login</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar