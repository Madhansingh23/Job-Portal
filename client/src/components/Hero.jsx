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
                    <span className='inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs font-medium mb-6 backdrop-blur-sm'>
                        🚀 No.1 Campus Recruitment Platform
                    </span>

                    <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6'>
                        Launch Your Career with <br />
                        <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200'>Top-Tier Placements</span>
                    </h1>

                    <p className='text-lg text-blue-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed'>
                        Your gateway to exclusive campus opportunities. Connect with top recruiters, track your applications in real-time, and secure your dream offer with confidence.
                    </p>

                    {/* Search Bar */}
                    <div className='bg-white p-2 rounded-full shadow-xl max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2'>
                        <div className='flex items-center flex-1 px-4 py-2 w-full'>
                            <img className='h-5 w-5 text-gray-400 opacity-60 mr-3' src={assets.search_icon} alt="" />
                            <input
                                type="text"
                                placeholder='Search for roles (e.g. SDE, Analyst)'
                                className='w-full outline-none text-gray-700 placeholder-gray-400'
                                onChange={(e) => setSearchFilter(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>

                        <div className='hidden sm:block w-px h-8 bg-gray-200'></div>

                        <div className='flex items-center flex-1 px-4 py-2 w-full'>
                            <img className='h-5 w-5 text-gray-400 opacity-60 mr-3' src={assets.location_icon} alt="" />
                            <input
                                type="text"
                                placeholder='Location (e.g. Bangalore)'
                                className='w-full outline-none text-gray-700 placeholder-gray-400'
                                onChange={(e) => setSearchFilter(prev => ({ ...prev, location: e.target.value }))}
                            />
                        </div>

                        <button
                            onClick={onSearch}
                            className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-all transform hover:scale-105 shadow-md w-full sm:w-auto start-now-btn'
                        >
                            Search Jobs
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 px-4'>
                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-center group'>
                    <h3 className='text-3xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300'>500+</h3>
                    <p className='text-gray-500 text-sm font-medium'>Students Placed</p>
                </div>
                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-center group'>
                    <h3 className='text-3xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300'>45 LPA</h3>
                    <p className='text-gray-500 text-sm font-medium'>Highest Package</p>
                </div>
                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-center group'>
                    <h3 className='text-3xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform duration-300'>100+</h3>
                    <p className='text-gray-500 text-sm font-medium'>Top Recruiters</p>
                </div>
                <div className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-center flex items-center justify-center gap-4 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 duration-300'>
                    <img className="h-6 object-contain" src={assets.microsoft_logo} alt="Microsoft" />
                    <img className="h-6 object-contain" src={assets.walmart_logo} alt="Walmart" />
                    <img className="h-6 object-contain" src={assets.accenture_logo} alt="Accenture" />
                </div>
            </div>
        </div>
    )
}

export default Hero