import { useContext, useEffect, useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'

const ManageJobs = () => {

  const navigate = useNavigate()

  const [jobs, setJobs] = useState(false)

  const { backendUrl, companyToken } = useContext(AppContext)

  // Function to fetch company Job Applications data 
  const fetchCompanyJobs = async () => {

    try {

      const { data } = await axios.get(`${backendUrl}/api/company/list-jobs`,
        { headers: { token: companyToken } }
      )

      if (data.success) {
        setJobs(data.jobsData.reverse())
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  // Function to change Job Visibility 
  const changeJobVisiblity = async (id) => {

    try {

      const { data } = await axios.post(`${backendUrl}/api/company/change-visiblity`,
        { id },
        { headers: { token: companyToken } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchCompanyJobs()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  // Function to delete Job
  const deleteJob = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this job?")) {
        const { data } = await axios.post(`${backendUrl}/api/company/delete-job`, { id }, { headers: { token: companyToken } })
        if (data.success) {
          toast.success(data.message)
          fetchCompanyJobs()
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobs()
    }
  }, [companyToken])

  return jobs ? jobs.length === 0 ? (
    <div className='flex flex-col items-center justify-center h-[60vh] gap-4 animate-fade-in'>
      <div className='w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl'>📋</div>
      <p className='text-xl font-bold text-slate-700 dark:text-slate-300'>No Jobs Posted Yet</p>
      <p className='text-sm text-slate-400'>Post your first job listing to get started</p>
      <button onClick={() => navigate('/dashboard/add-job')} className='mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95'>
        + Add New Job
      </button>
    </div>
  ) : (
    <div className='max-w-6xl animate-fade-in'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3'>
            <span className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-blue-200 dark:shadow-none'>📋</span>
            Manage Jobs
          </h1>
          <p className='text-sm text-slate-500 mt-1'>{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
        </div>
        <button onClick={() => navigate('/dashboard/add-job')} className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-none hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 w-fit'>
          <span>+</span> Add New Job
        </button>
      </div>

      {/* Desktop Table */}
      <div className='hidden md:block bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm'>
        <table className='w-full'>
          <thead>
            <tr className='bg-slate-50 dark:bg-slate-800'>
              <th className='py-3.5 px-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>#</th>
              <th className='py-3.5 px-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>Job Title</th>
              <th className='py-3.5 px-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>Date</th>
              <th className='py-3.5 px-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>Location</th>
              <th className='py-3.5 px-5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>Applicants</th>
              <th className='py-3.5 px-5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>Visible</th>
              <th className='py-3.5 px-5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 dark:divide-slate-700'>
            {jobs.map((job, index) => (
              <tr key={index} className='hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors'>
                <td className='py-3.5 px-5 text-sm text-slate-400 font-medium'>{index + 1}</td>
                <td className='py-3.5 px-5'>
                  <span className='text-sm font-bold text-slate-700 dark:text-white'>{job.title}</span>
                </td>
                <td className='py-3.5 px-5 text-sm text-slate-500 dark:text-slate-400'>{moment(job.date).format('ll')}</td>
                <td className='py-3.5 px-5'>
                  <span className='text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg'>{job.location}</span>
                </td>
                <td className='py-3.5 px-5 text-center'>
                  <span className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold'>{job.applicants}</span>
                </td>
                <td className='py-3.5 px-5 text-center'>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input onChange={() => changeJobVisiblity(job._id)} type="checkbox" checked={job.visible} className='sr-only peer' />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-600 peer-checked:bg-green-500 rounded-full peer transition-all after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full shadow-inner"></div>
                  </label>
                </td>
                <td className='py-3.5 px-5 text-center'>
                  <button onClick={() => deleteJob(job._id)} className='text-red-400 hover:text-white hover:bg-red-500 w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto' title='Delete Job'>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className='md:hidden space-y-3'>
        {jobs.map((job, index) => (
          <div key={index} className='bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex-1'>
                <h3 className='text-sm font-bold text-slate-800 dark:text-white'>{job.title}</h3>
                <div className='flex items-center gap-3 mt-2'>
                  <span className='text-xs text-slate-400'>{moment(job.date).format('ll')}</span>
                  <span className='text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded'>{job.location}</span>
                </div>
              </div>
              <span className='text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg'>{job.applicants} apps</span>
            </div>
            <div className='flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700'>
              <div className='flex items-center gap-2'>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input onChange={() => changeJobVisiblity(job._id)} type="checkbox" checked={job.visible} className='sr-only peer' />
                  <div className="w-9 h-5 bg-slate-200 peer-checked:bg-green-500 rounded-full peer transition-all after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full shadow-inner"></div>
                </label>
                <span className='text-xs text-slate-400'>{job.visible ? 'Visible' : 'Hidden'}</span>
              </div>
              <button onClick={() => deleteJob(job._id)} className='text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1'>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : <Loading />
}

export default ManageJobs