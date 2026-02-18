import { useContext, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { assets } from '../assets/assets'
import moment from 'moment'
import Footer from '../components/Footer'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'

// ... (Rest of component starts at line 12, already edited)

// Remove useEffect dependent on 'user'
// We can use userData from AppContext instead


const Applications = () => {

  const [isEdit, setIsEdit] = useState(false)
  const [resume, setResume] = useState(null)

  const { backendUrl, userData, userApplications, fetchUserData, fetchUserApplications, token } = useContext(AppContext)

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
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

    setIsEdit(false)
    setResume(null)
    setIsEdit(false)
    setResume(null)
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

  useEffect(() => {
    if (token) {
      fetchUserApplications()
    }
  }, [token])

  if (!userData) {
    return <Loading />
  }

  return (
    <>
      <Navbar />
      <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => window.history.back()} className='p-2 rounded-full hover:bg-gray-100 transition' title="Go Back">
            <img src={assets.left_arrow_icon || assets.back_arrow_icon} alt="Back" className="w-5 h-5" />
          </button>
          <h2 className='text-xl font-semibold'>Your Resume</h2>
        </div>
        <div className='flex gap-2 mb-6 mt-3'>
          {
            isEdit || (userData && userData.resume === "")
              ? <>
                <label className='flex items-center' htmlFor="resumeUpload">
                  <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2 cursor-pointer'>{resume ? resume.name : "Select Resume"}</p>
                  <input id='resumeUpload' onChange={e => setResume(e.target.files[0])} accept='application/pdf' type="file" hidden />
                  <img src={assets.profile_upload_icon} alt="" />
                </label>
                <button onClick={updateResume} className='bg-green-100 border border-green-400 rounded-lg px-4 py-2'>Save</button>
              </>
              : <div className='flex gap-2'>
                <a target='_blank' href={userData.resume} className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg'>
                  Resume
                </a>
                <button onClick={() => setIsEdit(true)} className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2'>
                  Edit
                </button>
              </div>
          }
        </div>
        <h2 className='text-xl font-semibold mb-4'>Jobs Applied</h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border rounded-lg text-sm text-left'>
            <thead>
              <tr>
                <th className='py-3 px-4 border-b'>Company</th>
                <th className='py-3 px-4 border-b'>Job Title</th>
                <th className='py-3 px-4 border-b max-sm:hidden'>Location</th>
                <th className='py-3 px-4 border-b max-sm:hidden'>Date</th>
                <th className='py-3 px-4 border-b'>Status</th>
              </tr>
            </thead>
            <tbody>
              {userApplications && userApplications.length > 0 ? userApplications.map((job, index) => (
                <tr key={index}>
                  <td className='py-3 px-4 flex items-center gap-2 border-b'>
                    <img className='w-8 h-8' src={job.companyId.image} alt="" />
                    {job.companyId.name}
                  </td>
                  <td className='py-2 px-4 border-b'>{job.jobId.title}</td>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{job.jobId.location}</td>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{moment(job.date).format('ll')}</td>
                  <td className='py-2 px-4 border-b'>
                    {/* Status Badge or Actions */}
                    <td className='py-2 px-4 border-b w-80'>
                      {/* Visual Stepper */}
                      <div className='flex items-center w-full min-w-[200px] mb-2'>
                        {(() => {
                          const rounds = job.jobId.rounds && job.jobId.rounds.length > 0 ? job.jobId.rounds : ['Round 1', 'Round 2'];
                          const steps = ['Applied', ...rounds, 'Selected'];

                          let currentStep = steps.indexOf(job.status);
                          if (currentStep === -1) {
                            if (job.status === 'Pending') currentStep = 0;
                            if (job.status === 'Rejected') currentStep = -1;
                            if (job.status === 'Offer Accepted' || job.status === 'Accepted') currentStep = steps.length;
                          }

                          return (
                            <div className="flex w-full items-center">
                              {steps.map((step, sIndex) => {
                                const isCompleted = currentStep > sIndex || job.status === 'Accepted' || job.status === 'Offer Accepted';
                                const isActive = currentStep === sIndex;
                                return (
                                  <div key={sIndex} className="flex-1 flex items-center relative group">
                                    <div className={`w-3 h-3 rounded-full z-10 ${job.status === 'Rejected' ? 'bg-red-500' :
                                        isCompleted || isActive ? 'bg-green-500' : 'bg-gray-300'
                                      }`} title={step}></div>
                                    {sIndex < steps.length - 1 && (
                                      <div className={`h-1 w-full -ml-1 ${job.status === 'Rejected' ? 'bg-red-200' :
                                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                        }`}></div>
                                    )}
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 bg-white border px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 transition-opacity">
                                      {step}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })()}
                      </div>

                      <div className='text-center'>
                        {job.status === 'Selected' ? (
                          <div className='flex gap-2 justify-center'>
                            <button onClick={() => toast.success('Offer Accepted! (Mock)')} className='bg-green-600 text-white text-[10px] px-2 py-1 rounded hover:bg-green-700'>Accept</button>
                            <button onClick={() => toast.info('Offer Declined. (Mock)')} className='bg-red-500 text-white text-[10px] px-2 py-1 rounded hover:bg-red-600'>Decline</button>
                          </div>
                        ) : (
                          <div className={`text-xs font-medium ${job.status === 'Rejected' ? 'text-red-600' :
                              job.status === 'Accepted' || job.status === 'Offer Accepted' ? 'text-green-600' : 'text-blue-600'
                            }`}>
                            {job.status}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Withdraw Button */}
                    {['Pending', 'Applied'].includes(job.status) && (
                      <button onClick={() => withdrawApplication(job._id)} className='text-xs text-red-500 hover:underline mt-2 block w-full text-center'>Withdraw</button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">No applications found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Applications