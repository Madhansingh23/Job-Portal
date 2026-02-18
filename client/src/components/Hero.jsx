import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Hero = () => {

    const { setSearchFilter, setIsSearched } = useContext(AppContext)

    const onSearch = () => {
        setIsSearched(true)
    }

    return (
        <div className='container 2xl:px-20 mx-auto my-10'>
            <div className='bg-gradient-to-r from-blue-800 to-blue-950 text-white py-16 text-center mx-2 rounded-xl shadow-xl overflow-hidden relative'>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>

                <h2 className='text-2xl md:text-3xl lg:text-4xl font-medium mb-4 relative z-10'>Launch Your Career with <br /> Campus Placements</h2>

                <p className='mb-8 max-w-xl mx-auto text-sm font-light px-5 relative z-10 text-blue-100'>Your gateway to top-tier opportunities. Connect with recruiters, manage your applications, and secure your dream offer.</p>

                <div className='flex flex-col sm:flex-row items-center justify-between bg-white rounded-full text-gray-600 max-w-xl pl-4 mx-4 sm:mx-auto relative z-10 shadow-lg sm:p-0 p-2 gap-2 sm:gap-0'>
                    <div className='flex items-center w-full sm:w-auto p-2 sm:p-0'>
                        <img className='h-4 sm:h-5' src={assets.search_icon} alt="" />
                        <input type="text"
                            placeholder='Search for roles'
                            className='text-sm p-2 rounded outline-none w-full sm:w-auto'
                            onChange={(e) => setSearchFilter(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>
                    <div className='flex items-center w-full sm:w-auto p-2 sm:p-0 border-t sm:border-t-0 sm:border-l border-gray-200'>
                        <img className='h-4 sm:h-5 ml-0 sm:ml-2' src={assets.location_icon} alt="" />
                        <input type="text"
                            placeholder='Location'
                            className='text-sm p-2 rounded outline-none w-full sm:w-auto'
                            onChange={(e) => setSearchFilter(prev => ({ ...prev, location: e.target.value }))}
                        />
                    </div>
                    <button onClick={onSearch} className='bg-blue-600 hover:bg-blue-700 rounded-full text-white m-1 h-10 px-6 sm:h-12 sm:px-10 transition font-medium w-full sm:w-auto'>Search</button>
                </div>
            </div>

            <div className='border border-gray-100 shadow-md mx-2 mt-5 p-6 rounded-md flex overflow-x-auto gap-10 md:gap-16 justify-center items-center bg-white'>
                <div className="text-center min-w-max">
                    <p className="font-bold text-2xl text-blue-600">500+</p>
                    <p className="text-gray-500 text-sm">Students Placed</p>
                </div>
                <div className='h-10 border-r border-gray-300'></div>
                <div className="text-center min-w-max">
                    <p className="font-bold text-2xl text-blue-600">45 LPA</p>
                    <p className="text-gray-500 text-sm">Highest Package</p>
                </div>
                <div className='h-10 border-r border-gray-300'></div>
                <div className="text-center min-w-max">
                    <p className="font-bold text-2xl text-blue-600">100+</p>
                    <p className="text-gray-500 text-sm">Top Recruiters</p>
                </div>
                {/* Marquee placeholders or simple logos */}
                <div className='hidden md:flex gap-4 opacity-50 grayscale'>
                    <img className="h-6" src={assets.microsoft_logo} alt="" />
                    <img className="h-6" src={assets.walmart_logo} alt="" />
                    <img className="h-6" src={assets.accenture_logo} alt="" />
                </div>
            </div>
        </div>
    )
}

export default Hero