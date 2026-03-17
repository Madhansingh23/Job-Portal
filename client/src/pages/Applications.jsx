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
          <div className='lg:col-span-2 relative bg-slate-900 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl overflow-hidden group animate-slide-up'>
            <div className='absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90'></div>
            <div className='absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-overlay filter blur-[80px] opacity-20 group-hover:scale-110 transition-transform duration-[2s]'></div>
            
            <div className='relative z-10'>
                <span className='inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4'>
                    Application Tracking
                </span>
                <h1 className='text-4xl md:text-5xl font-black mb-2 tracking-tight'>Career Journey</h1>
                <p className='text-blue-100/70 mb-8 max-w-xl font-medium'>Monitor your recruitment progress and manage your professional credentials in one place.</p>

                <div className='flex flex-wrap items-center gap-4'>
                  <div className='bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/10 hover:bg-white/20 transition-all group/stat'>
                    <span className='block text-3xl font-black group-hover:scale-110 transition-transform'>{userApplications.length}</span>
                    <span className='text-[10px] text-blue-200 font-black uppercase tracking-widest'>Total Applied</span>
                  </div>
                  <div className='bg-emerald-500/20 backdrop-blur-xl rounded-2xl px-6 py-4 border border-emerald-400/20 hover:bg-emerald-500/30 transition-all group/stat'>
                    <span className='block text-3xl font-black text-emerald-300 group-hover:scale-110 transition-transform'>
                      {userApplications.filter(job => job.status === 'Selected' || job.status === 'Accepted').length}
                    </span>
                    <span className='text-[10px] text-emerald-300/70 font-black uppercase tracking-widest'>Offers Received</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Resume Card */}
          <div className='glass-card p-8 rounded-[2rem] flex flex-col justify-center border-none shadow-2xl shadow-blue-500/5 animate-slide-up hover:shadow-blue-500/10 transition-all' style={{animationDelay: '100ms'}}>
            <div className='flex items-center gap-4 mb-6'>
              <div className='w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600'>
                <span className='text-2xl'>📄</span>
              </div>
              <div>
                <h2 className='text-lg font-black text-slate-800 dark:text-white leading-none'>Resume</h2>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1'>Main Document</p>
              </div>
            </div>

            {isEdit || (userData && (userData.resume === "" || !userData.resume)) ? (
              <div className='space-y-4 animate-fade-in'>
                <label className='flex flex-col items-center justify-center w-full h-36 rounded-[1.5rem] cursor-pointer bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all group overflow-hidden relative'>
                  <div className='flex flex-col items-center justify-center relative z-10'>
                    <div className='w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform'>
                        <span className='text-xl'>📤</span>
                    </div>
                    <p className='text-[10px] font-black uppercase tracking-widest text-slate-500'>{resume ? resume.name : "Upload PDF Resume"}</p>
                  </div>
                  <input onChange={e => setResume(e.target.files[0])} accept='application/pdf' type="file" hidden />
                </label>
                <div className='flex gap-3'>
                  <button onClick={() => setIsEdit(false)} className='flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition'>Cancel</button>
                  <button onClick={updateResume} disabled={!resume} className='flex-1 py-3 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:shadow-xl hover:shadow-blue-500/20 transition-all'>Save</button>
                </div>
              </div>
            ) : (
              <div className='bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800'>
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex flex-col'>
                    <span className='text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px]'>{userData.resume.split('/').pop().slice(-20)}</span>
                    <span className='text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1'>Verified Active</span>
                  </div>
                  <div className='w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xs'>✓</div>
                </div>
                <div className='flex gap-3'>
                  <a target='_blank' href={userData.resume} rel="noreferrer" className='flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors'>
                    View File
                  </a>
                  <button onClick={() => setIsEdit(true)} className='px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-md transition-all'>
                    Edit
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