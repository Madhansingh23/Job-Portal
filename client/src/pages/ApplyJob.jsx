import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import { assets } from '../assets/assets'
import kconvert from 'k-convert';
import moment from 'moment';
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'

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

      <div className='min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors'>

        {/* Royal Header / Hero */}
        <div className='relative bg-gradient-to-r from-blue-900 to-blue-700 h-64 md:h-80'>
          <div className='absolute inset-0 bg-black/20'></div>
          <div className='container mx-auto px-4 2xl:px-20 h-full flex flex-col justify-end pb-10 relative z-10'>
            <div className='bg-white p-6 rounded-xl shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-6 max-w-5xl mx-auto w-full -mb-20 transform md:translate-y-8'>
              <div className='w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl p-2 shadow-md border flex items-center justify-center shrink-0'>
                <img className='max-w-full max-h-full object-contain' src={JobData.companyId.image} alt="" />
              </div>
              <div className='flex-1 text-center md:text-left'>
                <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-2'>{JobData.title}</h1>
                <div className='flex flex-wrap justify-center md:justify-start gap-4 text-gray-600 font-medium'>
                  <span className='flex items-center gap-1.5'><img src={assets.suitcase_icon} className='w-4 opacity-60' alt="" /> {JobData.companyId.name}</span>
                  <span className='flex items-center gap-1.5'><img src={assets.location_icon} className='w-4 opacity-60' alt="" /> {JobData.location}</span>
                  <span className='flex items-center gap-1.5'><img src={assets.person_icon} className='w-4 opacity-60' alt="" /> {JobData.level}</span>
                  <span className='flex items-center gap-1.5'><img src={assets.money_icon} className='w-4 opacity-60' alt="" /> {kconvert.convertTo(JobData.salary)}</span>
                  <span className='px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200'>{JobData.offerType || 'Direct FTE'}</span>
                </div>
              </div>
              <div className='flex flex-col items-center gap-2 min-w-[150px]'>
                <button
                  onClick={applyHandler}
                  className={`px-8 py-3 rounded-lg font-bold shadow-lg transition transform hover:-translate-y-1 ${isAlreadyApplied ? 'bg-gray-300 dark:bg-slate-700 text-gray-600 dark:text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30'}`}
                  disabled={isAlreadyApplied}
                >
                  {isAlreadyApplied ? 'Applied' : 'Apply Now'}
                </button>
                <p className='text-xs text-gray-400 dark:text-gray-300'>Posted {moment(JobData.date).fromNow()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className='container mx-auto px-4 2xl:px-20 pt-32 pb-20'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto'>

            {/* Left Column: Description */}
            <div className='lg:col-span-2 space-y-8'>
              <div className='bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700'>
                <h2 className='text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b dark:border-slate-700 pb-2'>Job Description</h2>
                <div className='rich-text text-gray-600 dark:text-slate-300 leading-relaxed' dangerouslySetInnerHTML={{ __html: JobData.description }}></div>

                <div className='mt-8 pt-6 border-t dark:border-slate-700'>
                  <h3 className='font-semibold text-gray-800 dark:text-white mb-4'>Requirements</h3>
                  <ul className='list-disc list-inside text-gray-600 dark:text-slate-300 space-y-2'>
                    <li>CGPA: {JobData.minCGPA || 'N/A'}+</li>
                    <li>10th Marks: {JobData.minTenthMarks ? `${JobData.minTenthMarks}%+` : 'N/A'}</li>
                    <li>12th Marks: {JobData.minTwelfthMarks ? `${JobData.minTwelfthMarks}%+` : 'N/A'}</li>
                    <li>Backlogs Allowed: {JobData.maxArrears !== undefined ? JobData.maxArrears : 'No Limit'}</li>
                    <li>Batch: {JobData.targetBatch || 'Any'}</li>
                    <li>Departments: {JobData.eligibleDepts?.join(', ') || 'All'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: More Jobs */}
            <div className='space-y-6'>
              <div className='bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700'>
                <h3 className='font-bold text-lg text-gray-800 dark:text-white mb-4'>More from {JobData.companyId.name}</h3>
                <div className='space-y-4'>
                  {jobs.filter(job => job._id !== JobData._id && job.companyId._id === JobData.companyId._id)
                    .slice(0, 3)
                    .map((job, index) => <JobCard key={index} job={job} />)
                  }
                  {jobs.filter(job => job._id !== JobData._id && job.companyId._id === JobData.companyId._id).length === 0 && (
                    <p className='text-gray-400 dark:text-slate-500 text-sm'>No other jobs active.</p>
                  )}
                </div>
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