import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import moment from 'moment'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loading from '../components/Loading'

const Applications = () => {
  const navigate = useNavigate()
  const [isEdit, setIsEdit] = useState(false)
  const [resume, setResume] = useState(null)

  const { backendUrl, userData, userApplications, fetchUserData, fetchUserApplications, token } = useContext(AppContext)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchUserApplications()
  }, [token])

  const updateResume = async () => {
    try {
      const formData = new FormData()
      formData.append('resume', resume)

      const { data } = await axios.post(`${backendUrl}/api/users/update-resume`,
        formData,
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        await fetchUserData()
        setIsEdit(false)
        setResume(null)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const withdrawApplication = async (applicationId) => {
    try {
      if (window.confirm("Are you sure you want to withdraw this application?")) {
        const { data } = await axios.post(`${backendUrl}/api/users/withdraw`, { applicationId }, { headers: { token } })
        if (data.success) {
          toast.success(data.message)
          fetchUserApplications()
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleOfferResponse = async (applicationId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this offer? This action cannot be undone.`)) return

    try {
      const { data } = await axios.post(`${backendUrl}/api/users/respond-to-offer`,
        { applicationId, status },
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

  if (!userData) {
    return <Loading />
  }

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500'>
      <Navbar />

      <div className='container mx-auto px-4 py-8 flex-1 max-w-7xl animate-fade-in'>

        {/* Header and Resume Section */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10'>

          {/* Welcome / Stats Card */}
          <div className='lg:col-span-2 bg-gradient-to-r from-royal-blue to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group'>
            <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700'></div>
            <h1 className='text-3xl font-bold mb-2 relative z-10'>My Applications</h1>
            <p className='text-blue-100 mb-6 max-w-xl relative z-10'>Track your job application status and manage your resume here.</p>

            <div className='flex items-center gap-6 relative z-10'>
              <div className='bg-white/20 backdrop-blur-md rounded-lg px-5 py-3 border border-white/10 hover:bg-white/30 transition-colors'>
                <span className='block text-2xl font-bold'>{userApplications.length}</span>
                <span className='text-xs text-blue-100 uppercase tracking-wider'>Applied</span>
              </div>
              <div className='bg-white/20 backdrop-blur-md rounded-lg px-5 py-3 border border-white/10 hover:bg-white/30 transition-colors'>
                <span className='block text-2xl font-bold'>
                  {userApplications.filter(job => job.status === 'Selected').length}
                </span>
                <span className='text-xs text-blue-100 uppercase tracking-wider'>Selected</span>
              </div>
            </div>
          </div>

          {/* Resume Card */}
          <div className='glass-card p-6 rounded-2xl flex flex-col justify-center border border-slate-100 dark:border-slate-700 shadow-lg'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-royal-blue dark:text-blue-400'>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l5.414 5.414a1 1 0 01.586 1.414V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h2 className='text-lg font-bold text-slate-800 dark:text-white'>Resume</h2>
            </div>

            {isEdit || (userData && userData.resume === "") ? (
              <div className='space-y-3 animate-fade-in'>
                <label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg cursor-pointer bg-blue-50/50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-slate-800 transition'>
                  <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                    <svg className="w-8 h-8 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className='text-sm text-slate-500 font-medium'>{resume ? resume.name : "Click to upload PDF"}</p>
                  </div>
                  <input onChange={e => setResume(e.target.files[0])} accept='application/pdf' type="file" hidden />
                </label>
                <div className='flex gap-2'>
                  <button onClick={() => setIsEdit(false)} className='flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition'>Cancel</button>
                  <button onClick={updateResume} disabled={!resume} className='flex-1 py-2 rounded-lg bg-royal-blue text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition shadow-md shadow-blue-200 dark:shadow-none'>Save Resume</button>
                </div>
              </div>
            ) : (
              <div className='bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700'>
                <div className='flex items-center justify-between mb-4'>
                  <span className='text-sm text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px]'>{userData.resume.split('/').pop()}</span>
                  <span className='text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full'>ACTIVE</span>
                </div>
                <div className='flex gap-2'>
                  <a target='_blank' href={userData.resume} rel="noreferrer" className='flex-1 text-center py-2.5 rounded-lg bg-royal-blue text-white hover:bg-blue-700 text-sm font-medium transition shadow-md shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2'>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    View
                  </a>
                  <button onClick={() => setIsEdit(true)} className='px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm text-sm font-medium transition'>
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Applications List */}
        <h2 className='text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2'>
          <span className='bg-royal-blue w-1.5 h-6 rounded-full'></span>
          Applied Jobs
          <span className='text-sm font-normal text-slate-400 ml-2'>({userApplications.length})</span>
        </h2>

        {userApplications && userApplications.length > 0 ? (
          <div className='grid gap-6'>
            {userApplications.map((job, index) => {
              // Rounds Logic
              const rounds = job.jobId.rounds && job.jobId.rounds.length > 0 ? job.jobId.rounds : ['Round 1', 'Round 2'];
              const steps = ['Applied', ...rounds, 'Hired'];
              let currentStep = 0;
              if (job.status === 'Selected' || job.status === 'Offer Accepted' || job.status === 'Accepted') currentStep = steps.length - 1;
              else if (job.currentRound !== undefined && job.currentRound >= 0) {
                currentStep = job.currentRound + 1; // +1 because 0 is Applied
              } else if (job.status === 'Rejected') {
                currentStep = -1; // Special case
              }

              return (
                <div key={index} className='glass-card rounded-xl p-6 border border-slate-100/50 dark:border-slate-700/50 hover:shadow-xl hover:shadow-blue-100/50 dark:hover:shadow-black/30 transition duration-300 group bg-white/60 dark:bg-slate-800/60 backdrop-blur-md'>
                  <div className='flex flex-col md:flex-row gap-6'>

                    {/* Logo & Basic Info */}
                    <div className='flex items-start gap-4 md:w-1/3 min-w-[300px]'>
                      <div className='w-16 h-16 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-2 flex-shrink-0'>
                        <img className='w-full h-full object-contain' src={job.companyId.image} alt={job.companyId.name} />
                      </div>
                      <div>
                        <h3 className='font-bold text-lg text-slate-800 dark:text-white leading-tight group-hover:text-royal-blue transition-colors'>{job.jobId.title}</h3>
                        <p className='text-slate-500 dark:text-slate-400 font-medium'>{job.companyId.name}</p>
                        <div className='flex items-center gap-2 mt-2 text-xs text-slate-400'>
                          <span className='flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded'>📍 {job.jobId.location}</span>
                          <span className='flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded'>📅 {moment(job.date).format('ll')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Tracker */}
                    <div className='flex-1 flex flex-col justify-center px-4'>
                      <div className='relative flex items-center justify-between w-full mb-3 mt-2'>
                        <div className='absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-700 -z-10 rounded-full'></div>

                        {steps.map((step, sIndex) => {
                          const isCompleted = (currentStep >= sIndex && job.status !== 'Rejected') || (job.status === 'Selected' || job.status === 'Accepted');
                          const isActive = currentStep === sIndex && job.status !== 'Rejected';
                          const isRejected = job.status === 'Rejected' && sIndex === (job.currentRound ? job.currentRound + 1 : 1);

                          let dotClass = 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                          let labelClass = 'text-slate-400 dark:text-slate-500'

                          if (isCompleted) {
                            dotClass = 'bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-green-900/30'
                            labelClass = 'text-green-600 font-bold'
                          }
                          else if (isRejected) {
                            dotClass = 'bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-red-900/30'
                            labelClass = 'text-red-500 font-bold'
                          }
                          else if (isActive) {
                            dotClass = 'bg-royal-blue text-white ring-4 ring-blue-50 dark:ring-blue-900/30 scale-110 shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                            labelClass = 'text-royal-blue font-bold'
                          }

                          return (
                            <div key={sIndex} className="flex flex-col items-center relative group/step">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${dotClass}`}>
                                {isCompleted ? '✓' : isRejected ? '✕' : sIndex + 1}
                              </div>
                              <div className={`absolute -bottom-6 whitespace-nowrap text-[10px] font-medium transition-colors ${labelClass}`}>
                                {step}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='md:w-1/6 flex flex-col items-end justify-center gap-3 border-l border-slate-100 dark:border-slate-700 pl-4'>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold w-full text-center shadow-sm ${job.status === 'Selected' ? 'bg-green-100 text-green-700 border border-green-200' :
                        job.status === 'Rejected' ? 'bg-red-100 text-red-600 border border-red-200' :
                          'bg-blue-50 text-royal-blue border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                        }`}>
                        {job.status}
                      </span>

                      {['Pending', 'Applied'].includes(job.status) && (
                        <button onClick={() => withdrawApplication(job._id)} className='text-xs text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg transition w-full border border-red-100 hover:shadow-md'>
                          Withdraw
                        </button>
                      )}

                      {/* Offer Actions */}
                      {job.status === 'Selected' && (
                        <div className='flex flex-col gap-2 w-full'>
                          {job.offerLetter && (
                            <a href={job.offerLetter} target='_blank' rel='noreferrer' className='text-xs bg-royal-blue text-center text-white px-3 py-1.5 rounded-lg transition w-full shadow-md shadow-blue-200 hover:scale-105'>
                              View Offer Letter
                            </a>
                          )}

                          {job.offerStatus === 'Pending' ? (
                            <div className='flex gap-1 w-full'>
                              <button onClick={() => handleOfferResponse(job._id, 'Accepted')} className='flex-1 text-xs bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg transition shadow-sm'>
                                Accept
                              </button>
                              <button onClick={() => handleOfferResponse(job._id, 'Rejected')} className='flex-1 text-xs bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-lg transition shadow-sm'>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`text-xs text-center font-bold px-2 py-1 rounded w-full ${job.offerStatus === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              Offer {job.offerStatus}
                            </span>
                          )}
                        </div>
                      )}


                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='glass-card p-16 rounded-2xl flex flex-col items-center justify-center text-center'>
            <div className='w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-5xl animate-bounce-slow'>🚀</div>
            <h3 className='text-xl font-bold text-slate-800 dark:text-white'>No Applications Yet</h3>
            <p className='text-slate-500 mt-2 max-w-md'>You haven't applied to any jobs yet. Browse available jobs and start your career journey today!</p>
            <button onClick={() => navigate('/')} className='mt-6 bg-royal-blue text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 hover:scale-105 transition-transform'>
              Browse Jobs
            </button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default Applications