import { useContext, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Dashboard = () => {

    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark'
    })

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [darkMode])

    const { companyData, setCompanyData, setCompanyToken } = useContext(AppContext)

    // Function to logout for company
    const logout = () => {
        setCompanyToken(null)
        localStorage.removeItem('companyToken')
        setCompanyData(null)
        navigate('/')
    }

    useEffect(() => {
        if (companyData) {
            navigate('/dashboard/home')
        }
    }, [companyData])

    const navItems = [
        { path: '/dashboard/home', icon: assets.home_icon, label: 'Dashboard', emoji: '📊' },
        { path: '/dashboard/add-job', icon: assets.add_icon, label: 'Add Job', emoji: '➕' },
        { path: '/dashboard/manage-jobs', icon: assets.home_icon, label: 'Manage Jobs', emoji: '📋' },
        { path: '/dashboard/view-applications', icon: assets.person_tick_icon, label: 'Applications', emoji: '👥' },
        { path: '/dashboard/profile', icon: assets.person_tick_icon, label: 'Profile', emoji: '👤' },
    ]

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500'>

            {/* Top Navbar */}
            <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50'>
                <div className='px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16'>

                    {/* Left: Logo + Mobile Toggle */}
                    <div className='flex items-center gap-4'>
                        {/* Mobile Menu Toggle */}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className='lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition'>
                            <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <img onClick={() => navigate('/')} className='w-28 sm:w-32 cursor-pointer hover:opacity-80 transition-opacity' src={assets.logo} alt="Logo" />
                    </div>

                    {/* Right: Theme Toggle + Company Info */}
                    <div className='flex items-center gap-3'>
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className='w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xl active:scale-95 border border-slate-200 dark:border-slate-700'
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        {companyData && (
                            <div className='flex items-center gap-3'>
                                <div className='hidden sm:block text-right'>
                                    <p className='text-sm font-bold text-slate-700 dark:text-white'>{companyData.name}</p>
                                    <p className='text-xs text-slate-400'>Recruiter</p>
                                </div>
                                <div className='relative group'>
                                    <div className='w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-600 cursor-pointer hover:border-blue-400 transition-colors shadow-sm'>
                                        <img className='w-full h-full object-cover' src={companyData.image} alt="" />
                                    </div>
                                    <div className='absolute hidden group-hover:block top-12 right-0 z-50 min-w-[180px]'>
                                        <div className='bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-2 mt-1'>
                                            <div className='px-4 py-2 border-b border-slate-100 dark:border-slate-700 sm:hidden'>
                                                <p className='text-sm font-bold text-slate-700 dark:text-white'>{companyData.name}</p>
                                                <p className='text-xs text-slate-400'>Recruiter</p>
                                            </div>
                                            <button onClick={logout} className='w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2'>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='flex'>

                {/* Sidebar Overlay (Mobile) */}
                {sidebarOpen && (
                    <div className='fixed inset-0 bg-black/50 z-40 lg:hidden' onClick={() => setSidebarOpen(false)}></div>
                )}

                {/* Left Sidebar */}
                <div className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} w-64 lg:w-56 xl:w-64`}>
                    <nav className='py-6 px-3'>
                        <p className='px-3 mb-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest'>Menu</p>
                        <ul className='space-y-1'>
                            {navItems.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                            ${isActive
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }
                                        `}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className='text-lg'>{item.emoji}</span>
                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Sidebar Footer */}
                    <div className='absolute bottom-6 left-3 right-3'>
                        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border border-blue-100 dark:border-slate-700'>
                            <p className='text-xs font-bold text-slate-700 dark:text-slate-300 mb-1'>Need Help?</p>
                            <p className='text-[10px] text-slate-400'>Contact admin for support</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className='flex-1 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8'>
                    <Outlet />
                </div>

            </div>

        </div>
    )
}

export default Dashboard