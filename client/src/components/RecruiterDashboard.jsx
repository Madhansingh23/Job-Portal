import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const RecruiterDashboard = () => {

    const { backendUrl, companyToken, companyData } = useContext(AppContext)
    const [stats, setStats] = useState(null)
    const navigate = useNavigate()

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/company/stats', { headers: { token: companyToken } })
            if (data.success) {
                setStats(data.stats)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (companyToken) fetchStats()
    }, [companyToken])

    if (!companyData || !stats) return (
        <div className='flex items-center justify-center h-[60vh]'>
            <div className='animate-pulse flex flex-col items-center gap-3'>
                <div className='w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700'></div>
                <div className='h-4 w-40 rounded bg-slate-200 dark:bg-slate-700'></div>
            </div>
        </div>
    )

    const statCards = [
        { label: 'Total Jobs', value: stats.totalJobs, icon: '📋', color: 'blue' },
        { label: 'Total Applicants', value: stats.totalApplicants, icon: '👥', color: 'purple' },
        { label: 'Active Jobs', value: stats.activeJobs, icon: '⚡', color: 'green' },
        { label: 'Hired Candidates', value: stats.selectedApplicants, icon: '🏆', color: 'amber' },
    ]

    const colorMap = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' },
        purple: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-800' },
        green: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-800' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800' },
    }

    return (
        <div className='animate-fade-in'>
            {/* Welcome Header */}
            <div className='mb-8'>
                <h1 className='text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3'>
                    <span className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-blue-200 dark:shadow-none'>🏠</span>
                    Welcome back, {companyData.name} 👋
                </h1>
                <p className='text-sm text-slate-500 dark:text-slate-400 mt-2'>Here's what's happening with your job postings.</p>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                {statCards.map((card, i) => {
                    const c = colorMap[card.color]
                    return (
                        <div key={i} className={`bg-white dark:bg-slate-800/50 p-5 rounded-2xl border ${c.border} shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}>
                            <div className='flex justify-between items-start'>
                                <div>
                                    <p className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>{card.label}</p>
                                    <h3 className='text-3xl font-bold text-slate-800 dark:text-white mt-2'>{card.value}</h3>
                                </div>
                                <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center text-lg`}>
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div className='mb-6'>
                <h2 className='text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2'>
                    <span className='w-1 h-5 bg-blue-600 rounded-full'></span>
                    Quick Actions
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <button onClick={() => navigate('/dashboard/add-job')} className='flex items-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none hover:from-blue-500 hover:to-indigo-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]'>
                        <div className='bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm'>➕</div>
                        <div className='text-left'>
                            <h3 className='font-bold text-base'>Post a New Job</h3>
                            <p className='text-blue-100 text-xs mt-0.5'>Find the best talent</p>
                        </div>
                    </button>

                    <button onClick={() => navigate('/dashboard/view-applications')} className='flex items-center gap-4 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] group'>
                        <div className='bg-purple-50 dark:bg-purple-900/30 w-12 h-12 rounded-xl flex items-center justify-center text-xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition'>👥</div>
                        <div className='text-left'>
                            <h3 className='font-bold text-slate-800 dark:text-white text-base'>Review Applicants</h3>
                            <p className='text-slate-500 dark:text-slate-400 text-xs mt-0.5'>Check new applications</p>
                        </div>
                    </button>

                    <button onClick={() => navigate('/dashboard/manage-jobs')} className='flex items-center gap-4 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] group'>
                        <div className='bg-slate-50 dark:bg-slate-700/50 w-12 h-12 rounded-xl flex items-center justify-center text-xl group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition'>📋</div>
                        <div className='text-left'>
                            <h3 className='font-bold text-slate-800 dark:text-white text-base'>Manage Listings</h3>
                            <p className='text-slate-500 dark:text-slate-400 text-xs mt-0.5'>Edit or close jobs</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RecruiterDashboard
