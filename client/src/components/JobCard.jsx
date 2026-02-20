import { useNavigate } from 'react-router-dom'
import moment from 'moment'

const JobCard = ({ job }) => {

  const navigate = useNavigate()

  return (
    <div className='group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between h-full'>

      {/* Top Section */}
      <div>
        <div className='flex items-start justify-between mb-4'>
          {job.companyId?.image ? (
            <img className='h-12 w-12 rounded-xl object-contain border border-gray-100 p-1 bg-white' src={job.companyId.image} alt="" />
          ) : (
            <div className='h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl'>🏢</div>
          )}
          <span className={`text-[10px] font-semibold px-3 py-1 rounded-full ${job.visible ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {job.visible ? 'Active' : 'Closed'}
          </span>
        </div>

        <h4 className='font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1'>{job.title}</h4>

        <div className='flex items-center gap-2 mb-4'>
          <p className='text-xs text-gray-500 font-medium'>{job.companyId?.name || 'Company'}</p>
          <span className='text-gray-300'>•</span>
          <p className='text-xs text-gray-400'>{moment(job.date).fromNow()}</p>
        </div>

        <div className='flex flex-wrap gap-2 mb-4'>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100'>
            {job.location}
          </span>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100'>
            {job.level}
          </span>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100'>
            {job.offerType || 'FTE'}
          </span>
        </div>

        <p className='text-gray-500 text-sm line-clamp-3 mb-4' dangerouslySetInnerHTML={{ __html: job.description?.slice(0, 150) + "..." }}></p>
      </div>

      {/* Footer Section */}
      <div className='mt-auto flex gap-3'>
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className='flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-blue-200 shadow-md'>
          Apply Now
        </button>
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className='flex-1 text-gray-600 border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition font-medium text-sm'>
          Details
        </button>
      </div>
    </div>
  )
}

export default JobCard