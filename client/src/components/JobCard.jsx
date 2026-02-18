import { useNavigate } from 'react-router-dom'
import moment from 'moment'

const JobCard = ({ job }) => {

  const navigate = useNavigate()

  return (
    <div className='group border border-gray-200 rounded-xl p-6 bg-white hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between'>
      {/* Header */}
      <div>
        <div className='flex items-center gap-3 mb-3'>
          {job.companyId?.image && (
            <img className='h-10 w-10 rounded-lg object-cover border border-gray-100' src={job.companyId.image} alt="" />
          )}
          <div>
            <p className='text-xs text-gray-400 font-medium'>{job.companyId?.name || 'Company'}</p>
            <p className='text-[10px] text-gray-300'>{moment(job.date).fromNow()}</p>
          </div>
        </div>

        <h4 className='font-semibold text-lg text-gray-800 group-hover:text-blue-700 transition-colors'>{job.title}</h4>

        <div className='flex flex-wrap items-center gap-2 mt-2'>
          <span className='bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-xs font-medium'>{job.location}</span>
          <span className='bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-full text-xs font-medium'>{job.level}</span>
          {job.category && <span className='bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-xs font-medium'>{job.category}</span>}
        </div>

        <p className='text-gray-500 text-sm mt-3 line-clamp-3' dangerouslySetInnerHTML={{ __html: job.description?.slice(0, 150) }}></p>
      </div>

      {/* Footer */}
      <div className='mt-4 flex gap-3 text-sm'>
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className='bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium'>
          Apply Now
        </button>
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className='text-blue-600 border border-blue-200 rounded-lg px-5 py-2 hover:bg-blue-50 transition font-medium'>
          Details
        </button>
      </div>
    </div>
  )
}

export default JobCard