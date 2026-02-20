import { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import * as XLSX from 'xlsx'

const ViewApplications = () => {

  const { backendUrl, companyToken } = useContext(AppContext)
  const [applicants, setApplicants] = useState(null)
  const [filterJob, setFilterJob] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Export Function
  const exportToExcel = () => {
    const dataToExport = filteredApplicants.map(app => ({
      Name: app.userId.name,
      Email: app.userId.email,
      Phone: app.userId.phone || 'N/A',
      CGPA: app.userId.cgpa || 'N/A',
      JobTitle: app.jobId.title,
      Status: app.status,
      AppliedDate: new Date(app.date).toLocaleDateString()
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants");
    XLSX.writeFile(workbook, "Applicants_List.xlsx");
  }

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

  const [uploadingFor, setUploadingFor] = useState(null)
  const fileInputRef = useState(null) // actually using useRef below

  // ... (inside component)
  const fileInput = document.getElementById('offer-upload') // Simple workaround or use useRef properly

  const changeJobApplicationStatus = async (id, status, file = null) => {
    try {
      const formData = new FormData()
      formData.append('id', id)
      formData.append('status', status)
      if (file) {
        formData.append('offerLetter', file)
      }

      const { data } = await axios.post(`${backendUrl}/api/company/change-status`,
        formData,
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

  const handleHireClick = (applicantId) => {
    setUploadingFor(applicantId)
    // Trigger file input
    document.getElementById('offer-upload').click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && uploadingFor) {
      changeJobApplicationStatus(uploadingFor, 'Selected', file)
      setUploadingFor(null)
      e.target.value = '' // Reset
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
      case 'Selected': return 'bg-green-100 text-green-700 border border-green-200'
      case 'Rejected': return 'bg-red-100 text-red-600 border border-red-200'
      case 'Pending': return 'bg-amber-100 text-amber-700 border border-amber-200'
      default: return 'bg-blue-100 text-royal-blue border border-blue-200'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">

      {/* Hidden File Input */}
      <input
        type="file"
        id="offer-upload"
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.png"
        onChange={handleFileChange}
      />

      {applicants ? (
        <div className='container mx-auto px-4 py-8 max-w-7xl'>

          {/* Header Section */}
          <div className='bg-gradient-to-r from-royal-blue to-indigo-700 text-white rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none'></div>
            <div className='relative z-10 flex flex-col md:flex-row justify-between items-center gap-4'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>Applicant Management</h1>
                <p className='text-blue-100 text-sm mt-1'>Review and manage candidate applications efficiently.</p>
              </div>
              <div className='flex items-center gap-4'>
                <div className='bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10'>
                  <span className='font-bold text-xl block text-center leading-none'>{applicants.length}</span>
                  <span className='text-xs text-blue-100 uppercase tracking-wider'>Total</span>
                </div>
                <button onClick={exportToExcel} className='bg-white text-royal-blue hover:bg-blue-50 px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-lg flex items-center gap-2'>
                  <img src={assets.upload_area_icon} className='w-4 md:hidden' alt="" /> {/* Fallback icon if no export icon */}
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters & Content */}
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>

            {/* Sidebar Filters */}
            <div className='lg:col-span-1 space-y-4'>
              <div className='glass-card p-5 rounded-xl'>
                <h3 className='font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2'>
                  <svg className="w-4 h-4 text-royal-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                  Filter Applications
                </h3>

                <div className='space-y-4'>
                  <div>
                    <label className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block'>Job Role</label>
                    <select value={filterJob} onChange={e => setFilterJob(e.target.value)} className='w-full border border-slate-200 dark:border-slate-600 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-royal-blue bg-white dark:bg-slate-800 dark:text-slate-200 transition'>
                      <option value='all'>All Jobs</option>
                      {jobTitles.map((title, i) => <option key={i} value={title}>{title}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block'>Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className='w-full border border-slate-200 dark:border-slate-600 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-royal-blue bg-white dark:bg-slate-800 dark:text-slate-200 transition'>
                      <option value='all'>All Status</option>
                      <option value='Pending'>Pending</option>
                      <option value='Selected'>Selected</option>
                      <option value='Rejected'>Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className='glass-card p-5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none'>
                <h4 className='font-bold text-sm mb-2'>Pro Tip</h4>
                <p className='text-xs text-indigo-100 leading-relaxed'>
                  Upload an offer letter when sending a "Selected" status. The candidate will receive it instantly.
                </p>
              </div>
            </div>

            {/* Main List */}
            <div className='lg:col-span-3'>
              {applicants.length === 0 ? (
                <div className='glass-card p-12 rounded-xl flex flex-col items-center justify-center text-center'>
                  <div className='w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-4xl'>📭</div>
                  <h3 className='text-lg font-bold text-slate-700'>No Applications Yet</h3>
                  <p className='text-slate-500 max-w-xs mt-2'>Applications will appear here once students start applying to your job postings.</p>
                </div>
              ) : filteredApplicants.length === 0 ? (
                <div className='glass-card p-12 rounded-xl flex flex-col items-center justify-center text-center'>
                  <div className='w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-4xl'>🔍</div>
                  <h3 className='text-lg font-bold text-slate-700'>No Matches Found</h3>
                  <p className='text-slate-500 mt-2'>Try adjusting your filters to see more results.</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {filteredApplicants.map((applicant, index) => {
                    const rounds = applicant.jobId?.rounds || []
                    const nextRound = getNextRound(applicant)
                    const isFinalized = applicant.status === 'Selected' || applicant.status === 'Rejected'

                    return (
                      <div key={index} className='glass-card rounded-xl p-6 border-l-4 border-l-transparent hover:border-l-royal-blue transition-all duration-300 group'>
                        <div className='flex flex-col md:flex-row md:items-start justify-between gap-4'>

                          {/* Candidate Info */}
                          <div className='flex items-start gap-4'>
                            {applicant.userId.image ? (
                              <img className='w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm' src={applicant.userId.image} alt="" />
                            ) : (
                              <div className='w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-sm'>
                                {applicant.userId.name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h3 className='font-bold text-lg text-slate-800 dark:text-white group-hover:text-royal-blue transition-colors'>{applicant.userId.name}</h3>
                              <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1'>
                                <span className='flex items-center gap-1'><span className='opacity-70'>📧</span> {applicant.userId.email}</span>
                                {applicant.userId.phone && <span className='hidden sm:inline'>•</span>}
                                {applicant.userId.phone && <span>{applicant.userId.phone}</span>}
                              </div>
                              <div className='flex items-center gap-2 mt-3'>
                                <span className='text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md'>
                                  {applicant.jobId.title}
                                </span>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${getStatusStyle(applicant.status)}`}>
                                  {applicant.status}
                                </span>
                                {applicant.userId.resume && (
                                  <a href={applicant.userId.resume} target='_blank' rel='noreferrer' className='text-xs font-medium text-royal-blue hover:underline flex items-center gap-1 ml-2'>
                                    View Resume ↗
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Date */}
                          <div className='text-xs text-slate-400 font-medium whitespace-nowrap bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full'>
                            Applied: {new Date(applicant.date).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Rounds Visualization */}
                        {rounds.length > 0 && (
                          <div className='mt-6 mb-2'>
                            <div className='flex items-center w-full max-w-3xl'>
                              {rounds.map((round, i) => {
                                const currentIdx = applicant.currentRound ?? -1
                                const historyEntry = applicant.roundHistory?.find(h => h.round === round)
                                let stepStatus = 'pending'
                                if (historyEntry) {
                                  stepStatus = historyEntry.status === 'Passed' ? 'passed' : historyEntry.status === 'Failed' ? 'failed' : 'active'
                                } else if (i <= currentIdx && !historyEntry) {
                                  stepStatus = 'passed'
                                }

                                // Styles
                                let dotClass = 'bg-slate-200 text-slate-400'
                                let lineClass = 'bg-slate-200'

                                if (stepStatus === 'passed') {
                                  dotClass = 'bg-green-500 text-white shadow-lg shadow-green-200'
                                  lineClass = 'bg-green-500'
                                } else if (stepStatus === 'failed') {
                                  dotClass = 'bg-red-500 text-white shadow-lg shadow-red-200'
                                  lineClass = 'bg-red-200'
                                } else if (stepStatus === 'active') {
                                  dotClass = 'bg-royal-blue text-white ring-4 ring-blue-100 scale-110 shadow-lg shadow-blue-200'
                                  lineClass = 'bg-slate-200'
                                }

                                return (
                                  <div key={i} className='flex-1 flex items-center relative'>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${dotClass}`} title={round}>
                                      {stepStatus === 'passed' ? '✓' : stepStatus === 'failed' ? '✗' : i + 1}
                                    </div>
                                    {/* Text Label */}
                                    <span className={`absolute top-10 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap ${stepStatus === 'active' ? 'text-royal-blue' : 'text-slate-400'}`}>
                                      {round}
                                    </span>

                                    {/* Connecting Line */}
                                    {i < rounds.length && (
                                      <div className={`flex-1 h-1 mx-2 rounded-full ${i < rounds.length - 1 ? lineClass : 'hidden'}`}></div>
                                    )}

                                    {/* Final Status if last item */}
                                    {i === rounds.length - 1 && (
                                      <>
                                        <div className={`flex-1 h-1 mx-2 rounded-full ${isFinalized ? (applicant.status === 'Selected' ? 'bg-green-500' : 'bg-red-200') : 'bg-slate-200'}`}></div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ml-0 ${applicant.status === 'Selected' ? 'bg-green-600 text-white ring-4 ring-green-100' : applicant.status === 'Rejected' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                                          {applicant.status === 'Selected' ? '★' : applicant.status === 'Rejected' ? 'x' : 'Wait'}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Actions Actions */}
                        {!isFinalized && (
                          <div className='mt-8 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-3'>
                            {nextRound ? (
                              <button onClick={() => changeJobApplicationStatus(applicant._id, nextRound.name)} className='btn-royal px-4 py-2 text-xs rounded-lg flex items-center gap-2'>
                                <span>Promote to {nextRound.name}</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                              </button>
                            ) : rounds.length > 0 ? (
                              <button onClick={() => handleHireClick(applicant._id)} className='btn-royal px-4 py-2 text-xs rounded-lg bg-green-600 hover:bg-green-700 hover:shadow-green-200'>
                                HIRE CANDIDATE & SEND OFFER
                              </button>
                            ) : (
                              <button onClick={() => handleHireClick(applicant._id)} className='btn-royal px-4 py-2 text-xs rounded-lg bg-green-600 hover:bg-green-700 hover:shadow-green-200'>
                                Select Candidate & Send Offer
                              </button>
                            )}

                            <button onClick={() => changeJobApplicationStatus(applicant._id, 'Rejected')} className='px-4 py-2 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition'>
                              Reject Candidate
                            </button>

                            {/* Dropdown for specific jumps */}
                            {rounds.length > 2 && (
                              <div className='relative group'>
                                <button className='px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-medium transition'>Moves...</button>
                                <div className='absolute left-0 bottom-full mb-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 hidden group-hover:block z-50 p-1'>
                                  {rounds.map((r, idx) => (
                                    <button key={idx} onClick={() => changeJobApplicationStatus(applicant._id, r)} className='w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300'>
                                      Jump to {r}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {isFinalized && (
                          <div className={`mt-6 p-3 rounded-lg flex items-center gap-3 ${applicant.status === 'Selected' ? 'bg-green-50/50 border border-green-100' : 'bg-red-50/50 border border-red-100'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${applicant.status === 'Selected' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {applicant.status === 'Selected' ? '🎉' : '⚠️'}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${applicant.status === 'Selected' ? 'text-green-800' : 'text-red-800'}`}>
                                {applicant.status === 'Selected' ? 'Candidate Hired!' : 'Application Rejected'}
                              </p>
                              {applicant.status === 'Selected' && applicant.offerLetter && (
                                <a href={applicant.offerLetter} target='_blank' rel="noreferrer" className='text-xs text-blue-600 hover:underline block'>View Offer Letter</a>
                              )}
                              {applicant.status === 'Selected' && (
                                <p className='text-xs mt-1 font-medium'>
                                  Offer Status: <span className={applicant.offerStatus === 'Accepted' ? 'text-green-600' : applicant.offerStatus === 'Rejected' ? 'text-red-600' : 'text-amber-500'}>{applicant.offerStatus || 'Pending'}</span>
                                </p>
                              )}
                              <p className='text-xs text-slate-500 mt-1'>
                                Processed on {new Date().toLocaleDateString()}
                              </p>
                            </div>

                            <button onClick={() => changeJobApplicationStatus(applicant._id, 'Pending')} className='ml-auto text-xs text-slate-400 hover:text-slate-600 underline'>
                              Undo
                            </button>
                          </div>
                        )}

                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <Loading />
      )}
    </div>
  )
}

export default ViewApplications