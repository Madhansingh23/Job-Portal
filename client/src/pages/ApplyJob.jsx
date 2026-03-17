import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import { assets } from '../assets/assets'
import moment from 'moment';
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'

// Format salary to LPA (Indian standard)
const formatSalary = (salary) => {
  if (!salary || salary <= 0) return 'Not Disclosed'
  if (salary >= 10000000) return `${(salary / 10000000).toFixed(1)} Cr/yr`
  if (salary >= 100000) return `${(salary / 100000).toFixed(1)} LPA`
  if (salary >= 1000) return `₹${(salary / 1000).toFixed(0)}K/yr`
  return `₹${salary}/yr`
}

const ApplyJob = () => {

  const { id } = useParams()
  const navigate = useNavigate()

  const { jobs, backendUrl, userData, userApplications, fetchUserApplications, token } = useContext(AppContext)

  const [JobData, setJobData] = useState(null)
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false)

  const fetchJob = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs/${id}`)
      if (data.success) {
        setJobData(data.job)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const applyHandler = async () => {
    try {
      if (!userData) return toast.error('Login to apply for jobs')
      if (!userData.resume) {
        navigate('/applications')
        return toast.error('Upload resume to apply')
      }

      const { data } = await axios.post(`${backendUrl}/api/users/apply`,
        { jobId: JobData._id },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchUserApplications()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const checkAlreadyApplied = () => {
    const hasApplied = userApplications.some(item => item.jobId._id === JobData._id)
    setIsAlreadyApplied(hasApplied)
  }

  useEffect(() => {
    fetchJob()
  }, [id])

  useEffect(() => {
    if (userApplications.length > 0 && JobData) {
      checkAlreadyApplied()
    }
  }, [JobData, userApplications, id]) // Include id to re-check on nav

  return JobData ? (
    <>
      <Navbar />

      <div className='min-h-screen bg-white dark:bg-slate-950 transition-colors selection:bg-blue-500/30'>

        {/* Dynamic Hero Section */}
        <div className='relative h-[40vh] md:h-[45vh] overflow-hidden'>
            <div className='absolute inset-0 bg-slate-900'>
                <img className='w-full h-full object-cover opacity-40 blur-sm scale-105' src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" alt="" />
                <div className='absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-slate-950/40 to-transparent'></div>
                <div className='absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 mix-blend-overlay'></div>
            </div>
            
            <div className='container mx-auto px-4 2xl:px-20 h-full flex flex-col justify-end pb-24 md:pb-32 relative z-10'>
                <div className='animate-slide-up'>
                    <span className='inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-4'>
                        Opportunity Details
                    </span>
                    <h1 className='text-4xl md:text-6xl font-black text-white tracking-tight leading-none'>
                        {JobData.title}
                    </h1>
                </div>
            </div>
        </div>

        {/* Glassmorphic Job Detail Card */}
        <div className='container mx-auto px-4 2xl:px-20 -mt-20 relative z-20'>
            <div className='glass-card p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 animate-slide-up shadow-2xl shadow-blue-500/5'>
                <div className='w-28 h-28 md:w-36 md:h-36 glass-card p-3 flex items-center justify-center shrink-0 group relative overflow-hidden'>
                    <div className='absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity'></div>
                    <img className='max-w-[80%] max-h-[80%] object-contain relative z-10 transform group-hover:scale-110 transition duration-500' src={JobData.companyId.image} alt="" />
                </div>
                
                <div className='flex-1 text-center md:text-left mt-2'>
                    <div className='flex flex-wrap justify-center md:justify-start gap-3 items-center mb-6'>
                        <span className='text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400'>{JobData.companyId.name}</span>
                        <div className='w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden md:block'></div>
                        <span className='px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20'>
                            {JobData.offerType || 'Direct FTE'}
                        </span>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-600 dark:text-slate-400 font-bold'>
                        <div className='flex flex-col gap-1 hover:text-blue-500 transition-colors cursor-default group'>
                            <span className='text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500'>Location</span>
                            <div className='flex items-center gap-2'>
                                <img src={assets.location_icon} className='w-3.5 opacity-50 dark:invert group-hover:opacity-100 transition' alt="" />
                                <span className='text-sm dark:text-slate-200'>{JobData.location}</span>
                            </div>
                        </div>
                        <div className='flex flex-col gap-1 hover:text-blue-500 transition-colors cursor-default group'>
                            <span className='text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500'>Level</span>
                            <div className='flex items-center gap-2'>
                                <img src={assets.person_icon} className='w-3.5 opacity-50 dark:invert group-hover:opacity-100 transition' alt="" />
                                <span className='text-sm dark:text-slate-200'>{JobData.level}</span>
                            </div>
                        </div>
                        <div className='flex flex-col gap-1 hover:text-blue-500 transition-colors cursor-default group'>
                            <span className='text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500'>Compensation</span>
                            <div className='flex items-center gap-2'>
                                <img src={assets.money_icon} className='w-3.5 opacity-50 dark:invert group-hover:opacity-100 transition' alt="" />
                                <span className='text-sm dark:text-slate-200'>{formatSalary(JobData.salary)}</span>
                            </div>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <span className='text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500'>Job Status</span>
                            <div className='flex items-center gap-2'>
                                <span className='relative flex h-2 w-2'>
                                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                                  <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-500'></span>
                                </span>
                                <span className='text-sm text-emerald-600 dark:text-emerald-400'>Accepting Applications</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col items-center md:items-end gap-3 min-w-[180px]'>
                    <button
                        onClick={applyHandler}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all transform active:scale-95 ${isAlreadyApplied 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed shadow-none' 
                            : 'bg-slate-900 dark:bg-blue-600 text-white hover:bg-black dark:hover:bg-blue-500 shadow-xl shadow-blue-500/20'}`}
                        disabled={isAlreadyApplied}
                    >
                        {isAlreadyApplied ? (
                            <div className='flex items-center justify-center gap-2'>
                                <span>✓</span> Already Applied
                            </div>
                        ) : 'Submit Application'}
                    </button>
                    <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600'>
                        Posted {moment(JobData.date).fromNow()}
                    </p>
                </div>
            </div>
        </div>

        {/* Content Section */}
        <div className='container mx-auto px-4 2xl:px-20 pt-20 pb-20'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto'>

            {/* Left Column: Description */}
            <div className='lg:col-span-2 space-y-8 px-px'>
              <div className='glass-card p-8 md:p-12 animate-slide-up' style={{animationDelay: '100ms'}}>
                <h2 className='text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-3'>
                    <span className='w-8 h-[1px] bg-slate-200 dark:bg-slate-800'></span>
                    Role Description
                </h2>
                <div className='rich-text text-slate-600 dark:text-slate-300 leading-relaxed text-lg' dangerouslySetInnerHTML={{ __html: JobData.description }}></div>

                <div className='mt-12 pt-12 border-t border-slate-100 dark:border-slate-800/50'>
                  <h3 className='text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-3'>
                        <span className='w-8 h-[1px] bg-slate-200 dark:bg-slate-800'></span>
                        Eligibility Requirements
                  </h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6'>
                    <div className='flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800/30'>
                        <span className='text-xs font-bold text-slate-500 uppercase tracking-widest'>Min. CGPA</span>
                        <span className='font-black dark:text-white'>{JobData.minCGPA || '7.5'}+</span>
                    </div>
                    <div className='flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800/30'>
                        <span className='text-xs font-bold text-slate-500 uppercase tracking-widest'>Batch</span>
                        <span className='font-black dark:text-white'>{JobData.targetBatch || '2026'}</span>
                    </div>
                    <div className='flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800/30'>
                        <span className='text-xs font-bold text-slate-500 uppercase tracking-widest'>10th / 12th %</span>
                        <span className='font-black dark:text-white'>{JobData.minTenthMarks || '75'}% / {JobData.minTwelfthMarks || '75'}%</span>
                    </div>
                    <div className='flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800/30'>
                        <span className='text-xs font-bold text-slate-500 uppercase tracking-widest'>Max Arrears</span>
                        <span className='font-black dark:text-white'>{JobData.maxArrears !== undefined ? JobData.maxArrears : '0'}</span>
                    </div>
                  </div>
                  <div className='mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50'>
                     <span className='text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2'>Eligible Departments</span>
                     <p className='text-sm font-bold text-slate-700 dark:text-slate-200'>{JobData.eligibleDepts?.join(' • ') || 'Computer Science • Information Technology • Allied Branches'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className='space-y-6 animate-slide-up' style={{animationDelay: '200ms'}}>
              <div className='glass-card p-6 border-none dark:bg-slate-900/40'>
                <h3 className='text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6'>Similar Roles at {JobData.companyId.name}</h3>
                <div className='space-y-4'>
                  {jobs.filter(job => job._id !== JobData._id && job.companyId._id === JobData.companyId._id)
                    .slice(0, 3)
                    .map((job, index) => (
                        <div key={index} className='hover:scale-[1.02] transition-transform'>
                            <JobCard job={job} />
                        </div>
                    ))
                  }
                  {jobs.filter(job => job._id !== JobData._id && job.companyId._id === JobData.companyId._id).length === 0 && (
                    <div className='py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl'>
                        <p className='text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest'>No Other Openings</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Actions / Share */}
              <div className='glass-card p-6 bg-gradient-to-br from-blue-600 to-indigo-700 border-none group overflow-hidden relative'>
                <div className='absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700'></div>
                <h4 className='text-white font-black text-sm uppercase tracking-widest mb-2 relative z-10'>Need Help?</h4>
                <p className='text-blue-100 text-xs font-medium mb-4 relative z-10 opacity-80'>Contact the placement coordinator for clarification regarding this drive.</p>
                <button className='w-full py-3 bg-white text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] relative z-10 hover:bg-blue-50 transition-colors'>
                    Contact Support
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  )
}

export default ApplyJob