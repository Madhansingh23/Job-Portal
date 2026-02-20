import React from 'react'
import { assets } from '../assets/assets'

const AppDownload = () => {
    return (
        <div className='container mx-auto my-20 px-4 lg:px-20'>
            <div className='relative bg-gradient-to-br from-gray-900 to-blue-900 p-12 sm:p-24 rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-2xl'>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

                <div className='relative z-10 text-center md:text-left max-w-lg'>
                    <h1 className='text-3xl sm:text-4xl font-bold mb-4 text-white leading-tight'>
                        Get the <span className='text-blue-400'>Placement App</span>
                    </h1>
                    <p className='text-blue-100 mb-8 text-lg font-light'>
                        Stay 10x ahead. Real-time offer alerts, interview scheduling, and application tracking—right in your pocket.
                    </p>

                    <div className='flex gap-4 justify-center md:justify-start'>
                        <a href="#" className="hover:scale-105 transition duration-300 transform">
                            <img className='h-12 w-auto' src={assets.play_store} alt="Play Store" />
                        </a>
                        <a href="#" className="hover:scale-105 transition duration-300 transform">
                            <img className='h-12 w-auto' src={assets.app_store} alt="App Store" />
                        </a>
                    </div>
                </div>

                <div className='relative z-10 mt-10 md:mt-0'>
                    <img className='w-64 md:w-80 drop-shadow-2xl animate-float' src={assets.app_main_img} alt="Phone App" />
                </div>

            </div>
        </div>
    )
}

export default AppDownload