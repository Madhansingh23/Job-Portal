import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Hero = () => {

    const { setSearchFilter, setIsSearched } = useContext(AppContext)

    const onSearch = () => {
        setIsSearched(true)
    }

    return (
        <div className='container mx-auto my-10 px-4 lg:px-20'>
            {/* Main Hero Card */}
            <div className='bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-900 text-white py-20 px-6 md:px-16 rounded-3xl shadow-2xl relative overflow-hidden'>

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className='relative z-10 text-center max-w-4xl mx-auto'>
                    <span className='inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs font-semibold mb-6 backdrop-blur-md animate-fade-in shadow-inner'>
                        ✨ No.1 Campus Recruitment Platform
                    </span>

                    <h1 className='text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 animate-slide-up tracking-tight'>
                        Launch Your Career with <br />
                        <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-200 drop-shadow-sm'>Top-Tier Placements</span>
                    </h1>

                    <p className='text-lg md:text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto font-medium leading-relaxed animate-slide-up' style={{animationDelay: '150ms'}}>
                        Your gateway to exclusive campus opportunities. Connect with top recruiters, track your applications in real-time, and secure your dream offer with confidence.
                    </p>

                    {/* Search Bar */}
                    <div className='bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl md:rounded-full shadow-2xl max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2 animate-slide-up border border-white/20' style={{animationDelay: '300ms'}}>
                        <div className='flex items-center flex-1 px-5 py-3 w-full group'>
                            <img className='h-5 w-5 text-gray-400 opacity-60 mr-3 group-focus-within:text-blue-500 transition-colors' src={assets.search_icon} alt="" />
                            <input
                                type="text"
                                placeholder='Search for roles (e.g. SDE, Analyst)'
                                className='w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent placeholder-gray-400 font-medium'
                                onChange={(e) => setSearchFilter(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>

                        <div className='hidden sm:block w-px h-10 bg-gray-200 dark:bg-slate-700'></div>

                        <div className='flex items-center flex-1 px-5 py-3 w-full group'>
                            <img className='h-5 w-5 text-gray-400 opacity-60 mr-3 group-focus-within:text-blue-500 transition-colors' src={assets.location_icon} alt="" />
                            <input
                                type="text"
                                placeholder='Location (e.g. Bangalore)'
                                className='w-full outline-none text-gray-700 dark:text-gray-200 bg-transparent placeholder-gray-400 font-medium'
                                onChange={(e) => setSearchFilter(prev => ({ ...prev, location: e.target.value }))}
                            />
                        </div>

                        <button
                            onClick={onSearch}
                            className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-3.5 rounded-xl md:rounded-full font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20 w-full sm:w-auto'
                        >
                            Find Jobs
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 px-4 animate-fade-in' style={{animationDelay: '600ms'}}>
                <div className='glass-card p-6 rounded-2xl text-center group'>
                    <h3 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-1 group-hover:scale-110 transition-transform duration-300'>500+</h3>
                    <p className='text-gray-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider'>Placed</p>
                </div>
                <div className='glass-card p-6 rounded-2xl text-center group'>
                    <h3 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-1 group-hover:scale-110 transition-transform duration-300'>45 LPA</h3>
                    <p className='text-gray-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider'>Highest</p>
                </div>
                <div className='glass-card p-6 rounded-2xl text-center group'>
                    <h3 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-1 group-hover:scale-110 transition-transform duration-300'>100+</h3>
                    <p className='text-gray-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider'>Recruiters</p>
                </div>
                <div className='glass-card p-6 rounded-2xl flex items-center justify-center gap-4 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500'>
                    <img className="h-6 object-contain dark:invert" src={assets.microsoft_logo} alt="Microsoft" />
                    <img className="h-6 object-contain dark:invert" src={assets.accenture_logo} alt="Accenture" />
                </div>
            </div>
        </div>
    )
}

export default Hero