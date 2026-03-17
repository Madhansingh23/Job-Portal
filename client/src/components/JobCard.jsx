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
    <div className='glass-card p-6 flex flex-col justify-between h-full group animate-fade-in'>
      {/* Top Section */}
      <div>
        <div className='flex items-start justify-between mb-5'>
          {job.companyId?.image ? (
            <div className='relative'>
              <div className='absolute inset-0 bg-blue-400/20 blur-md rounded-xl group-hover:bg-blue-400/30 transition-all'></div>
              <img className='relative h-14 w-14 rounded-xl object-contain border border-white/40 p-2 bg-white/80 dark:bg-slate-700/80 shadow-sm' src={job.companyId.image} alt="" />
            </div>
          ) : (
            <div className='h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-2xl shadow-inner border border-white/20'>🏢</div>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm ${job.visible ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' : 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50'}`}>
            {job.visible ? 'Active' : 'Closed'}
          </span>
        </div>

        <h4 className='font-extrabold text-xl text-slate-800 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 tracking-tight'>{job.title}</h4>

        <div className='flex items-center gap-2 mb-5'>
          <p className='text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider'>{job.companyId?.name || 'Company'}</p>
          <span className='w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600'></span>
          <p className='text-xs text-slate-400 dark:text-slate-500 font-medium'>{moment(job.date).fromNow()}</p>
        </div>

        <div className='flex flex-wrap gap-2 mb-5'>
          <span className='inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-50/50 text-blue-700 border border-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/50 backdrop-blur-sm'>
            📍 {job.location}
          </span>
          <span className='inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100/50 text-slate-700 border border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/50 backdrop-blur-sm'>
            {job.level}
          </span>
        </div>

        {/* Salary Pill */}
        <div className='bg-gradient-to-r from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/10 border border-emerald-500/20 dark:border-emerald-400/20 rounded-xl px-4 py-2.5 mb-5 group-hover:border-emerald-500/40 transition-all'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest'>Package</span>
            <span className='text-emerald-700 dark:text-emerald-400 font-black text-sm tracking-tight'>{formatSalary(job.salary)}</span>
          </div>
        </div>

        <p className='text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6 font-medium leading-relaxed' dangerouslySetInnerHTML={{ __html: job.description?.slice(0, 110) + "..." }}></p>

        {/* Quick eligibility tags */}
        {(job.minCGPA > 0 || job.targetBatch || job.eligibleDepts?.length > 0) && (
          <div className='flex flex-wrap gap-1.5 mb-6 animate-fade-in'>
            {job.minCGPA > 0 && (
              <span className='text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md border border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400'>
                CGPA ≥ {job.minCGPA}
              </span>
            )}
            {job.targetBatch && (
              <span className='text-[10px] font-bold bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400'>
                {job.targetBatch} Batch
              </span>
            )}
            {job.eligibleDepts?.length > 0 && (
              <span className='text-[10px] font-bold bg-cyan-500/10 text-cyan-600 px-2 py-0.5 rounded-md border border-cyan-500/20 dark:bg-cyan-500/20 dark:text-cyan-400'>
                {job.eligibleDepts.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='mt-auto flex gap-3'>
        <button 
          onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} 
          className='flex-[2] bg-slate-900 dark:bg-blue-600 text-white px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 dark:hover:bg-blue-500 transition-all font-bold text-xs uppercase tracking-widest active:scale-[0.98]'
        >
          Apply Now
        </button>
        <button 
          onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} 
          className='flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all font-bold text-xs uppercase tracking-widest active:scale-[0.98]'
        >
          Info
        </button>
      </div>
    </div>
  )
}

export default JobCard