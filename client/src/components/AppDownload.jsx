import React from 'react'
import { assets } from '../assets/assets'

const AppDownload = () => {
    return (
        <div className='container mx-auto my-20 px-4 lg:px-20'>
            <div className='relative bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-12 sm:p-20 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center'>

                {/* Abstract Decorative Shapes */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>

                <div className='relative z-10 max-w-3xl'>
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold tracking-wider mb-6">
                        ELEVATE YOUR CAREER TRAJECTORY
                    </span>
                    <h1 className='text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-white leading-tight'>
                        Access Exclusive <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300'>Campus Drives</span>
                    </h1>
                    <p className='text-blue-100/80 mb-10 text-lg md:text-xl font-light mx-auto max-w-2xl leading-relaxed'>
                        Real-time offer alerts, dedicated interview scheduling, and integrated application tracking mapped specifically for our university students.
                    </p>

                    <div className='flex flex-col sm:flex-row gap-5 justify-center items-center'>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-blue-900/50 transform hover:-translate-y-1 transition duration-300 flex items-center gap-2">
                            <span>Browse Companies</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-4 px-8 rounded-xl transition duration-300 flex items-center gap-2">
                            <span className="text-xl">📊</span>
                            <span>View Placement Stats</span>
                        </button>
                    </div>

                    {/* Stats overlay */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8pt-8 border-t border-white/10">
                        <div>
                            <p className="text-3xl font-bold text-white">500+</p>
                            <p className="text-blue-200/60 text-sm mt-1">Recruiting Partners</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">₹42LPA</p>
                            <p className="text-blue-200/60 text-sm mt-1">Highest Package</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">95%</p>
                            <p className="text-blue-200/60 text-sm mt-1">Placement Rate</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">2.5k+</p>
                            <p className="text-blue-200/60 text-sm mt-1">Offers Made</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AppDownload