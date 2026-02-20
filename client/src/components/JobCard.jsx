import { useNavigate } from 'react-router-dom'
import moment from 'moment'

// Format salary to LPA (Indian standard)
const formatSalary = (salary) => {
  if (!salary || salary <= 0) return 'Not Disclosed'
  if (salary >= 10000000) return `${(salary / 10000000).toFixed(1)} Cr/yr`
  if (salary >= 100000) return `${(salary / 100000).toFixed(1)} LPA`
  if (salary >= 1000) return `₹${(salary / 1000).toFixed(0)}K/yr`
  return `₹${salary}/yr`
}

const JobCard = ({ job }) => {

  const navigate = useNavigate()

  return (
    <div className='group bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between h-full'>

      {/* Top Section */}
      <div>
        <div className='flex items-start justify-between mb-4'>
          {job.companyId?.image ? (
            <img className='h-12 w-12 rounded-xl object-contain border border-gray-100 dark:border-slate-600 p-1 bg-white dark:bg-slate-700' src={job.companyId.image} alt="" />
          ) : (
            <div className='h-12 w-12 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-xl'>🏢</div>
          )}
          <span className={`text-[10px] font-semibold px-3 py-1 rounded-full ${job.visible ? 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
            {job.visible ? 'Active' : 'Closed'}
          </span>
        </div>

        <h4 className='font-bold text-lg text-gray-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1'>{job.title}</h4>

        <div className='flex items-center gap-2 mb-4'>
          <p className='text-xs text-gray-500 dark:text-slate-400 font-medium'>{job.companyId?.name || 'Company'}</p>
          <span className='text-gray-300 dark:text-slate-600'>•</span>
          <p className='text-xs text-gray-400 dark:text-slate-500'>{moment(job.date).fromNow()}</p>
        </div>

        <div className='flex flex-wrap gap-2 mb-4'>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'>
            📍 {job.location}
          </span>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'>
            {job.level}
          </span>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'>
            {job.offerType || 'FTE'}
          </span>
        </div>

        {/* Salary in LPA */}
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-800/30 rounded-lg px-3 py-2 mb-4'>
          <span className='text-green-700 dark:text-green-400 font-bold text-sm'>💰 {formatSalary(job.salary)}</span>
        </div>

        <p className='text-gray-500 dark:text-slate-400 text-sm line-clamp-2 mb-4' dangerouslySetInnerHTML={{ __html: job.description?.slice(0, 120) + "..." }}></p>

        {/* Quick eligibility tags */}
        {(job.minCGPA > 0 || job.targetBatch) && (
          <div className='flex flex-wrap gap-1.5 mb-3'>
            {job.minCGPA > 0 && (
              <span className='text-[10px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'>
                CGPA ≥ {job.minCGPA}
              </span>
            )}
            {job.targetBatch && (
              <span className='text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800'>
                Batch: {job.targetBatch}
              </span>
            )}
            {job.eligibleDepts?.length > 0 && (
              <span className='text-[10px] font-medium bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded border border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800'>
                {job.eligibleDepts.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className='mt-auto flex gap-3'>
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className='flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-blue-200 shadow-md dark:shadow-none'>
          Apply Now
        </button>
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className='flex-1 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium text-sm'>
          Details
        </button>
      </div>
    </div>
  )
}

export default JobCard