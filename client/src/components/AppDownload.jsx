import React from 'react'
import { assets } from '../assets/assets'

const AppDownload = () => {
    return (
        <div className='container px-4 2xl:px-20 mx-auto my-20'>
            <div className='relative bg-gradient-to-r from-violet-50 to-purple-50 p-12 sm:p-24 rounded-lg overflow-hidden flex flex-col items-center justify-center text-center'>

                {/* Background Pattern */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-violet-100 opacity-50 blur-3xl"></div>

                <h1 className='text-3xl sm:text-4xl font-bold mb-4 text-gray-800 relative z-10'>Get the Placement App</h1>
                <p className='text-gray-500 mb-8 max-w-lg mx-auto relative z-10'>Stay updated with real-time notifications on job postings, interview schedules, and offer letters. Download now.</p>

                <div className='flex gap-4 relative z-10'>
                    <a href="#" className="hover:scale-105 transition duration-300 shadow-lg inline-block">
                        <img className='h-12' src={assets.play_store} alt="Play Store" />
                    </a>
                    <a href="#" className="hover:scale-105 transition duration-300 shadow-lg inline-block">
                        <img className='h-12' src={assets.app_store} alt="App Store" />
                    </a>
                </div>

                <img className='absolute bottom-0 right-0 w-64 md:w-80 opacity-10 pointer-events-none' src={assets.app_main_img} alt="Phone App" />
            </div>
        </div>
    )
}

export default AppDownload