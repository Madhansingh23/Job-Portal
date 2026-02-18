import { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'

const ViewApplications = () => {

  const { backendUrl, companyToken } = useContext(AppContext)

  const [applicants, setApplicants] = useState(false)
  const [filterJob, setFilterJob] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchCompanyJobApplications = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/company/applicants`,
        { headers: { token: companyToken } }
      )
      if (data.success) {
        setApplicants(data.applications.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const changeJobApplicationStatus = async (id, status) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/company/change-status`,
        { id, status },
        { headers: { token: companyToken } }
      )
      if (data.success) {
        toast.success(`Status updated to: ${status}`)
        fetchCompanyJobApplications()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobApplications()
    }
  }, [companyToken])

  // Get unique job titles for filter
  const jobTitles = applicants ? [...new Set(applicants.filter(a => a.jobId).map(a => a.jobId.title))] : []

  // Filter applicants
  const filteredApplicants = applicants
    ? applicants.filter(item => {
      if (!item.jobId || !item.userId) return false
      const matchesJob = filterJob === 'all' || item.jobId.title === filterJob
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      return matchesJob && matchesStatus
    })
    : []

  // Status color helper
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Selected': return 'bg-green-100 text-green-700'
      case 'Rejected': return 'bg-red-100 text-red-600'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  // Get next available round for promotion
  const getNextRound = (applicant) => {
    const rounds = applicant.jobId?.rounds || []
    if (rounds.length === 0) return null
    const currentIdx = applicant.currentRound ?? -1
    if (currentIdx + 1 < rounds.length) {
      return { index: currentIdx + 1, name: rounds[currentIdx + 1] }
    }
    return null
  }

  return applicants ? applicants.length === 0 ? (
    <div>
      <Navbar />
      <div className='flex flex-col items-center justify-center h-[70vh] text-gray-400'>
        <div className='text-6xl mb-4'>📭</div>
        <p className='text-xl font-medium'>No Applications Yet</p>
        <p className='text-sm mt-1'>Applications will appear here once students apply</p>
      </div>
    </div>
  ) : (
    <div className='min-h-screen bg-gray-50'>
      <Navbar />

      {/* Header */}
      <div className='bg-gradient-to-r from-blue-800 to-indigo-900 text-white px-6 lg:px-10 py-4'>
        <h1 className='text-xl font-bold'>Applicant Management</h1>
        <p className='text-blue-200 text-xs mt-0.5'>{applicants.length} total application{applicants.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className='bg-white border-b px-6 lg:px-10 py-3 flex flex-wrap gap-3 items-center'>
        <div className='flex items-center gap-2'>
          <label className='text-xs text-gray-500 font-medium'>Job:</label>
          <select value={filterJob} onChange={e => setFilterJob(e.target.value)} className='border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100'>
            <option value='all'>All Jobs</option>
            {jobTitles.map((title, i) => <option key={i} value={title}>{title}</option>)}
          </select>
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-xs text-gray-500 font-medium'>Status:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className='border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100'>
            <option value='all'>All Status</option>
            <option value='Pending'>Pending</option>
            <option value='Selected'>Selected</option>
            <option value='Rejected'>Rejected</option>
          </select>
        </div>
        <span className='text-xs text-gray-400 ml-auto'>Showing {filteredApplicants.length} of {applicants.length}</span>
      </div>

      {/* Applicant Cards */}
      <div className='p-6 lg:px-10'>
        {filteredApplicants.length === 0 ? (
          <div className='text-center py-16 text-gray-400'>
            <div className='text-5xl mb-3'>🔍</div>
            <p>No applicants match the current filters</p>
          </div>
        ) : (
          <div className='grid gap-4'>
            {filteredApplicants.map((applicant, index) => {
              const rounds = applicant.jobId?.rounds || []
              const nextRound = getNextRound(applicant)
              const isFinalized = applicant.status === 'Selected' || applicant.status === 'Rejected'

              return (
                <div key={index} className='bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition'>
                  {/* Top Row: Applicant Info + Status */}
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                      {applicant.userId.image ? (
                        <img className='w-11 h-11 rounded-full object-cover border-2 border-gray-100' src={applicant.userId.image} alt="" />
                      ) : (
                        <div className='w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold'>
                          {applicant.userId.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className='font-semibold text-gray-800'>{applicant.userId.name}</h3>
                        <p className='text-xs text-gray-500'>
                          {applicant.userId.email}
                          {applicant.userId.dept && ` · ${applicant.userId.dept}`}
                          {applicant.userId.cgpa && ` · CGPA: ${applicant.userId.cgpa}`}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full'>{applicant.jobId.title}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusStyle(applicant.status)}`}>
                        {applicant.status}
                      </span>
                      {applicant.userId.resume && (
                        <a href={applicant.userId.resume} target='_blank' rel='noreferrer'
                          className='text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full hover:bg-blue-100 transition flex items-center gap-1'>
                          📄 Resume
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Round Progression Stepper */}
                  {rounds.length > 0 && (
                    <div className='mt-4 pt-3 border-t border-gray-100'>
                      <div className='flex items-center gap-1 overflow-x-auto pb-2'>
                        {rounds.map((round, i) => {
                          const currentIdx = applicant.currentRound ?? -1
                          const historyEntry = applicant.roundHistory?.find(h => h.round === round)
                          let stepStatus = 'pending'
                          if (historyEntry) {
                            stepStatus = historyEntry.status === 'Passed' ? 'passed' : historyEntry.status === 'Failed' ? 'failed' : 'active'
                          }

                          const bgColor = stepStatus === 'passed' ? 'bg-green-500 text-white' :
                            stepStatus === 'failed' ? 'bg-red-500 text-white' :
                              stepStatus === 'active' ? 'bg-blue-500 text-white animate-pulse' :
                                'bg-gray-200 text-gray-500'

                          const lineColor = stepStatus === 'passed' ? 'bg-green-400' :
                            stepStatus === 'failed' ? 'bg-red-400' : 'bg-gray-200'

                          return (
                            <div key={i} className='flex items-center'>
                              <div className='flex flex-col items-center min-w-[70px]'>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${bgColor}`}>
                                  {stepStatus === 'passed' ? '✓' : stepStatus === 'failed' ? '✗' : i + 1}
                                </div>
                                <span className='text-[10px] text-gray-500 mt-1 text-center leading-tight'>{round}</span>
                              </div>
                              {i < rounds.length - 1 && (
                                <div className={`h-0.5 w-6 ${lineColor} -mt-4`}></div>
                              )}
                            </div>
                          )
                        })}

                        {/* Final: Selected */}
                        <div className='flex items-center'>
                          <div className={`h-0.5 w-6 ${applicant.status === 'Selected' ? 'bg-green-400' : 'bg-gray-200'} -mt-4`}></div>
                          <div className='flex flex-col items-center min-w-[70px]'>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${applicant.status === 'Selected' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                              {applicant.status === 'Selected' ? '🎉' : '🏆'}
                            </div>
                            <span className='text-[10px] text-gray-500 mt-1'>Selected</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!isFinalized && (
                    <div className='mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2'>
                      {/* Promote to next round */}
                      {nextRound && (
                        <button
                          onClick={() => changeJobApplicationStatus(applicant._id, nextRound.name)}
                          className='bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-1'
                        >
                          ▶ Promote to {nextRound.name}
                        </button>
                      )}

                      {/* If no more rounds or no rounds, show Select */}
                      {(!nextRound || rounds.length === 0) && (
                        <button
                          onClick={() => changeJobApplicationStatus(applicant._id, 'Selected')}
                          className='bg-green-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-1'
                        >
                          ✅ Select Candidate
                        </button>
                      )}

                      <button
                        onClick={() => changeJobApplicationStatus(applicant._id, 'Rejected')}
                        className='bg-red-50 text-red-600 text-xs px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium border border-red-200'
                      >
                        ✗ Reject
                      </button>

                      {/* Advanced: Jump to specific round (dropdown) */}
                      {rounds.length > 2 && (
                        <div className='relative group'>
                          <button className='bg-gray-100 text-gray-600 text-xs px-3 py-2 rounded-lg hover:bg-gray-200 transition'>
                            More ▾
                          </button>
                          <div className='absolute left-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg hidden group-hover:block z-20'>
                            {rounds.map((round, i) => (
                              <button key={i} onClick={() => changeJobApplicationStatus(applicant._id, round)}
                                className='w-full text-left text-xs px-4 py-2 hover:bg-gray-50 text-gray-700'>
                                Move to {round}
                              </button>
                            ))}
                            <div className='border-t'>
                              <button onClick={() => changeJobApplicationStatus(applicant._id, 'Selected')}
                                className='w-full text-left text-xs px-4 py-2 hover:bg-green-50 text-green-600'>
                                ✅ Select
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Finalized status badge */}
                  {isFinalized && (
                    <div className='mt-3 pt-3 border-t border-gray-100'>
                      <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${applicant.status === 'Selected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {applicant.status === 'Selected' ? '🎉 Candidate Selected' : '❌ Candidate Rejected'}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div>
      <Navbar />
      <Loading />
    </div>
  )
}

export default ViewApplications