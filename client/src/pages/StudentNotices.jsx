import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

import { useNavigate } from 'react-router-dom'

const StudentNotices = () => {

    const { backendUrl, userData } = useContext(AppContext)
    const navigate = useNavigate()
    const [notices, setNotices] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    navigate('/login')
                    return
                }

                const { data } = await axios.get(backendUrl + '/api/notices/student', { headers: { token } })
                if (data.success) {
                    setNotices(data.notices)
                } else {
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            } finally {
                setLoading(false)
            }
        }
        fetchNotices()
    }, [backendUrl, userData])

    return (
        <div className='min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors'>
            <Navbar />
            <div className='flex-grow container mx-auto px-4 py-8 max-w-5xl'>
                <div className='flex justify-between items-center mb-8'>
                    <div className='flex items-center gap-3'>
                        <span className='w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-200 dark:shadow-none'>📢</span>
                        <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Campus Notices</h1>
                    </div>
                </div>

                {loading ? (
                    <div className='text-center py-20'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
                    </div>
                ) : notices.length > 0 ? (
                    <div className='grid gap-6'>
                        {notices.map((notice, index) => (
                            <div key={index} className='bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition card-hover group'>
                                <div className='flex justify-between items-start mb-4'>
                                    <h3 className='text-xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition'>{notice.title}</h3>
                                    <span className='text-xs font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full border dark:border-slate-600'>{new Date(notice.date).toLocaleDateString()}</span>
                                </div>
                                <div className='prose dark:prose-invert max-w-none'>
                                    <p className='text-gray-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed'>{notice.description}</p>
                                </div>
                                <div className='mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md'>
                                        {notice.postedBy?.name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <p className='text-xs font-bold text-gray-700 dark:text-slate-300'>{notice.postedBy?.name || 'Coordinator'}</p>
                                        <p className='text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider'>Posted By</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700'>
                        <div className='w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl'>📭</div>
                        <p className='text-gray-500 dark:text-slate-400 text-lg font-medium'>No notices available at the moment.</p>
                        <p className='text-gray-400 dark:text-slate-500 text-sm'>Check back later for updates.</p>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default StudentNotices
