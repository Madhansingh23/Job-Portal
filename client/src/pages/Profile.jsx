import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Profile = () => {

    const { userData, backendUrl, token, fetchUserData } = useContext(AppContext)

    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(null)

    // Form Data
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')
    const [gender, setGender] = useState('Male')
    const [currentLocation, setCurrentLocation] = useState('')
    const [preferredLocation, setPreferredLocation] = useState('')
    const [resume, setResume] = useState(null)

    // Academic Data
    const [registerNumber, setRegisterNumber] = useState('')
    const [dept, setDept] = useState('')
    const [cgpa, setCgpa] = useState('')
    const [batch, setBatch] = useState('')
    const [branch, setBranch] = useState('')
    const [tenthMarks, setTenthMarks] = useState('')
    const [twelfthMarks, setTwelfthMarks] = useState('')
    const [numberOfArrears, setNumberOfArrears] = useState('')

    // Change Request State
    const [changeRequestField, setChangeRequestField] = useState('')
    const [changeRequestValue, setChangeRequestValue] = useState('')
    const [changeRequestReason, setChangeRequestReason] = useState('')
    const [showChangeRequestModal, setShowChangeRequestModal] = useState(false)
    const [myChangeRequests, setMyChangeRequests] = useState([])
    const [showRequestsPanel, setShowRequestsPanel] = useState(false)

    useEffect(() => {
        if (userData) {
            setFirstName(userData.firstName || userData.name?.split(' ')[0] || '')
            setLastName(userData.lastName || userData.name?.split(' ')[1] || '')
            setPhone(userData.phone || '')
            setGender(userData.gender || 'Male')
            setCurrentLocation(userData.currentLocation || '')
            setPreferredLocation(userData.preferredLocation || '')

            setRegisterNumber(userData.registerNumber || '')
            setDept(userData.dept || '')
            setCgpa(userData.cgpa || '')
            setBatch(userData.batch || '')
            setBranch(userData.branch || '')
            setTenthMarks(userData.tenthMarks || '')
            setTwelfthMarks(userData.twelfthMarks || '')
            setNumberOfArrears(userData.numberOfArrears ?? '')
        }
    }, [userData])

    // Fetch my change requests
    const fetchMyChangeRequests = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/change-requests/my-requests`, { headers: { token } })
            if (data.success) setMyChangeRequests(data.requests)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        if (token) fetchMyChangeRequests()
    }, [token])

    // Update Profile Function (personal details only - NOT academic)
    const updateProfile = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/users/update-profile',
                {
                    firstName, lastName, phone, gender, currentLocation, preferredLocation,
                    registerNumber, dept, batch, branch
                },
                { headers: { token } }
            )
            if (data.success) {
                toast.success(data.message)
                await fetchUserData()
                setIsEdit(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Update Image Function
    const updateImage = async (imageFile) => {
        try {
            const formData = new FormData()
            formData.append('image', imageFile)

            const { data } = await axios.post(backendUrl + '/api/users/update-image',
                formData,
                { headers: { token } }
            )

            if (data.success) {
                toast.success(data.message)
                await fetchUserData()
                setImage(null)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Update Resume Function
    const updateResume = async () => {
        if (!resume) return;
        try {
            const formData = new FormData()
            formData.append('resume', resume)
            const { data } = await axios.post(backendUrl + '/api/users/update-resume', formData, { headers: { token } })
            if (data.success) {
                toast.success("Resume Updated")
                await fetchUserData()
                setResume(null)
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    // Submit Change Request (for CGPA, 10th, 12th, Arrears)
    const submitChangeRequest = async () => {
        if (!changeRequestValue || !changeRequestReason) {
            return toast.error('Please fill all fields')
        }
        try {
            const { data } = await axios.post(`${backendUrl}/api/change-requests/create`,
                { fieldName: changeRequestField, requestedValue: changeRequestValue, reason: changeRequestReason },
                { headers: { token } }
            )
            if (data.success) {
                toast.success('Change request submitted to coordinator')
                setShowChangeRequestModal(false)
                setChangeRequestField('')
                setChangeRequestValue('')
                setChangeRequestReason('')
                fetchMyChangeRequests()
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    // Open change request modal for a specific field
    const openChangeRequest = (field, label) => {
        setChangeRequestField(field)
        setChangeRequestValue('')
        setChangeRequestReason('')
        setShowChangeRequestModal(true)
    }

    // Field label mapping
    const fieldLabels = {
        cgpa: 'CGPA',
        tenthMarks: '10th Marks (%)',
        twelfthMarks: '12th Marks (%)',
        numberOfArrears: 'Number of Arrears'
    }


    return userData ? (
        <div>
            <Navbar />
            <div className='min-h-screen bg-gray-50 dark:bg-slate-900 pt-10 pb-20 px-4 transition-colors'>
                <div className='max-w-4xl mx-auto relative'>

                    {/* Background decoration */}
                    <div className='absolute -top-10 -left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob'></div>
                    <div className='absolute -top-10 -right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000'></div>

                    <div className='relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl rounded-2xl overflow-hidden'>

                        {/* Banner/Header */}
                        <div className='h-32 bg-gradient-to-r from-blue-600 to-indigo-700'></div>

                        <div className='px-8 pb-12'>
                            {/* Profile Image & Key Info */}
                            <div className='relative flex flex-col md:flex-row justify-between items-end -mt-12 md:-mt-16 mb-8 gap-6'>
                                <div className='flex items-end gap-6'>
                                    <label htmlFor='image-upload' className='relative cursor-pointer group'>
                                        <div className='w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white group-hover:shadow-2xl transition duration-300'>
                                            <img
                                                className='w-full h-full object-cover bg-white dark:bg-slate-700'
                                                src={image ? URL.createObjectURL(image) : userData.image}
                                                alt="Profile"
                                            />
                                        </div>
                                        {isEdit && (
                                            <div className='absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm'>
                                                <img src={assets.upload_area || assets.profile_upload_icon} alt="" className='w-8 invert' />
                                            </div>
                                        )}
                                        <input onChange={prev => {
                                            if (!isEdit) return;
                                            setImage(prev.target.files[0])
                                            updateImage(prev.target.files[0])
                                        }} type="file" id='image-upload' hidden accept="image/*" disabled={!isEdit} />
                                    </label>

                                    <div className='mb-2'>
                                        <h1 className='text-3xl font-bold text-gray-800 dark:text-white tracking-tight'>{userData.name}</h1>
                                        <p className='text-gray-500 dark:text-slate-400 font-medium'>Student • {userData.dept || 'Department N/A'}</p>
                                    </div>
                                </div>

                                <div className='mb-2 flex gap-2'>
                                    <button onClick={() => { setShowRequestsPanel(!showRequestsPanel) }} className='text-sm font-medium text-slate-600 dark:text-slate-300 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition'>
                                        📋 My Requests {myChangeRequests.length > 0 && `(${myChangeRequests.length})`}
                                    </button>
                                    {isEdit ? (
                                        <div className='flex gap-2 shadow-sm rounded-full bg-white dark:bg-slate-700 p-1 border dark:border-slate-600'>
                                            <button onClick={updateProfile} className='bg-black dark:bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:scale-105 transition shadow-lg'>Save</button>
                                            <button onClick={() => setIsEdit(false)} className='text-gray-600 dark:text-gray-300 px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-600 transition'>Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setIsEdit(true)} className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200/50 dark:shadow-none hover:shadow-blue-300/50 transition flex items-center gap-2 transform hover:-translate-y-0.5'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Change Request History Panel */}
                            {showRequestsPanel && (
                                <div className='mb-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 animate-fade-in'>
                                    <h3 className='text-lg font-bold text-slate-800 dark:text-white mb-4'>📋 My Change Requests</h3>
                                    {myChangeRequests.length === 0 ? (
                                        <p className='text-sm text-slate-400'>No change requests submitted yet.</p>
                                    ) : (
                                        <div className='space-y-3'>
                                            {myChangeRequests.map((req, idx) => (
                                                <div key={idx} className='flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700'>
                                                    <div>
                                                        <p className='font-medium text-sm text-slate-700 dark:text-white'>
                                                            {fieldLabels[req.fieldName] || req.fieldName}: <span className='text-slate-400'>{req.currentValue}</span> → <span className='text-blue-600 dark:text-blue-400 font-bold'>{req.requestedValue}</span>
                                                        </p>
                                                        <p className='text-xs text-slate-400 mt-1'>Reason: {req.reason}</p>
                                                    </div>
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${req.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                                        req.status === 'Rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Main Grid */}
                            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

                                {/* Left Column: Personal & Contact */}
                                <div className='lg:col-span-2 space-y-8'>

                                    {/* Personal Information */}
                                    <section>
                                        <h3 className='text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2'>
                                            <span className='w-1 h-6 bg-blue-600 rounded-full'></span>
                                            Personal Information
                                        </h3>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/50 dark:bg-slate-800/30 p-6 rounded-xl border border-gray-100 dark:border-slate-700'>
                                            <div>
                                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide block mb-1'>First Name</label>
                                                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={!isEdit} className={`w-full p-2.5 rounded-lg border ${isEdit ? 'bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border-transparent text-gray-800 dark:text-white font-medium'} outline-none transition`} />
                                            </div>
                                            <div>
                                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide block mb-1'>Last Name</label>
                                                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} disabled={!isEdit} className={`w-full p-2.5 rounded-lg border ${isEdit ? 'bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border-transparent text-gray-800 dark:text-white font-medium'} outline-none transition`} />
                                            </div>
                                            <div>
                                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide block mb-1'>Phone</label>
                                                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} disabled={!isEdit} className={`w-full p-2.5 rounded-lg border ${isEdit ? 'bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border-transparent text-gray-800 dark:text-white font-medium'} outline-none transition`} />
                                            </div>
                                            <div>
                                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide block mb-1'>Gender</label>
                                                <select value={gender} onChange={e => setGender(e.target.value)} disabled={!isEdit} className={`w-full p-2.5 rounded-lg border ${isEdit ? 'bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border-transparent text-gray-800 dark:text-white font-medium appearance-none'} outline-none transition`}>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Location & Preferences */}
                                    <section>
                                        <h3 className='text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2'>
                                            <span className='w-1 h-6 bg-purple-600 rounded-full'></span>
                                            Location & Preferences
                                        </h3>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/50 dark:bg-slate-800/30 p-6 rounded-xl border border-gray-100 dark:border-slate-700'>
                                            <div>
                                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide block mb-1'>Current Location</label>
                                                <input type="text" value={currentLocation} onChange={e => setCurrentLocation(e.target.value)} disabled={!isEdit} className={`w-full p-2.5 rounded-lg border ${isEdit ? 'bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border-transparent text-gray-800 dark:text-white font-medium'} outline-none transition`} />
                                            </div>
                                            <div>
                                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide block mb-1'>Preferred Location</label>
                                                <input type="text" value={preferredLocation} onChange={e => setPreferredLocation(e.target.value)} disabled={!isEdit} className={`w-full p-2.5 rounded-lg border ${isEdit ? 'bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-100' : 'bg-transparent border-transparent text-gray-800 dark:text-white font-medium'} outline-none transition`} />
                                            </div>
                                        </div>
                                    </section>

                                </div>

                                {/* Right Column: Academic & Resume */}
                                <div className='space-y-8'>

                                    {/* Resume Section */}
                                    <section className='bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30'>
                                        <h3 className='text-sm font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wide mb-4'>Resume / CV</h3>
                                        <div className='flex flex-col gap-3'>
                                            {isEdit ? (
                                                <div className='space-y-3'>
                                                    <div className='bg-white dark:bg-slate-800 border-2 border-dashed border-blue-200 dark:border-blue-700 rounded-xl p-4 text-center hover:bg-blue-50 dark:hover:bg-slate-700/50 transition cursor-pointer relative group'>
                                                        <input id='resume-upload' onChange={e => setResume(e.target.files[0])} type="file" className='absolute inset-0 opacity-0 cursor-pointer' accept="application/pdf" />
                                                        <p className='text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:scale-105 transition'>{resume ? resume.name : "Click to Upload New PDF"}</p>
                                                    </div>
                                                    {resume && (
                                                        <button onClick={updateResume} className='w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm'>Confirm Upload</button>
                                                    )}
                                                </div>
                                            ) : (
                                                userData.resume ? (
                                                    <a href={userData.resume} target='_blank' rel="noreferrer" className='flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none hover:-translate-y-0.5 transform'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                        View Resume
                                                    </a>
                                                ) : <div className='p-4 text-center text-gray-400 text-sm bg-gray-100 dark:bg-slate-800 rounded-xl border dark:border-slate-700'>No Resume Uploaded</div>
                                            )}
                                        </div>
                                    </section>

                                    {/* Academic Details — Read-only, with Change Request buttons */}
                                    <section>
                                        <h3 className='text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2'>
                                            <span className='w-1 h-6 bg-green-600 rounded-full'></span>
                                            Academic Details
                                        </h3>
                                        <div className='flex flex-col gap-4 bg-gray-50/50 dark:bg-slate-800/30 p-6 rounded-xl border border-gray-100 dark:border-slate-700'>

                                            {/* Register Number & Dept (editable by student) */}
                                            <div>
                                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide block mb-1'>Register Number</label>
                                                <input type="text" value={registerNumber} onChange={e => setRegisterNumber(e.target.value)} disabled={!isEdit} className={`w-full p-2 rounded-lg border ${isEdit ? 'bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600' : 'bg-transparent border-transparent text-gray-800 dark:text-white font-medium'} outline-none transition`} placeholder='Reg. No' />
                                            </div>
                                            <div>
                                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide block mb-1'>Department</label>
                                                <input type="text" value={dept} onChange={e => setDept(e.target.value)} disabled={!isEdit} className={`w-full p-2 rounded-lg border ${isEdit ? 'bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600' : 'bg-transparent border-transparent text-gray-800 dark:text-white font-medium'} outline-none transition`} placeholder='e.g. CSE' />
                                            </div>

                                            {/* CGPA — Read-only, requires coordinator approval */}
                                            <div>
                                                <div className='flex items-center justify-between mb-1'>
                                                    <div className='flex items-center gap-2'>
                                                        <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>CGPA</label>
                                                        {userData.verifiedFields?.cgpa
                                                            ? <span className='text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full'>✓ Verified</span>
                                                            : <span className='text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full'>⚠ Pending</span>
                                                        }
                                                    </div>
                                                    <button onClick={() => openChangeRequest('cgpa', 'CGPA')} className='text-[10px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline transition'>
                                                        ✏️ Request Update
                                                    </button>
                                                </div>
                                                <input type="number" step="0.01" min="0" max="10" value={cgpa} disabled className={`w-full p-2 rounded-lg border bg-transparent border-transparent ${userData.verifiedFields?.cgpa ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'} font-bold outline-none`} placeholder='0.0' />
                                            </div>

                                            {/* Batch & Branch (editable) */}
                                            <div className='flex gap-4'>
                                                <div className='flex-1'>
                                                    <div className='flex items-center gap-2 mb-1'>
                                                        <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>Batch</label>
                                                        {userData.verifiedFields?.batch ? <span className='text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full'>✓ Verified</span> : <span className='text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full'>⚠ Pending</span>}
                                                    </div>
                                                    <input type="text" value={batch} onChange={e => setBatch(e.target.value)} disabled={!isEdit} className={`w-full p-2 rounded-lg border ${isEdit ? 'bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600' : `bg-transparent border-transparent ${userData.verifiedFields?.batch ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'} font-medium`} outline-none transition`} placeholder='e.g. 2026' />
                                                </div>
                                                <div className='flex-1'>
                                                    <div className='flex items-center gap-2 mb-1'>
                                                        <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>Branch</label>
                                                        {userData.verifiedFields?.branch ? <span className='text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full'>✓ Verified</span> : <span className='text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full'>⚠ Pending</span>}
                                                    </div>
                                                    <input type="text" value={branch} onChange={e => setBranch(e.target.value)} disabled={!isEdit} className={`w-full p-2 rounded-lg border ${isEdit ? 'bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600' : `bg-transparent border-transparent ${userData.verifiedFields?.branch ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'} font-medium`} outline-none transition`} placeholder='e.g. B.Tech' />
                                                </div>
                                            </div>

                                            {/* 10th, 12th Marks — Read-only, requires coordinator approval */}
                                            <div className='flex gap-4'>
                                                <div className='flex-1'>
                                                    <div className='flex items-center justify-between mb-1'>
                                                        <div className='flex items-center gap-2'>
                                                            <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>10th (%)</label>
                                                            {userData.verifiedFields?.tenthMarks ? <span className='text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full'>✓</span> : <span className='text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full'>⚠</span>}
                                                        </div>
                                                        <button onClick={() => openChangeRequest('tenthMarks', '10th Marks')} className='text-[10px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline'>✏️</button>
                                                    </div>
                                                    <input type="number" step="0.01" min="0" max="100" value={tenthMarks} disabled className={`w-full p-2 rounded-lg border bg-transparent border-transparent ${userData.verifiedFields?.tenthMarks ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'} font-bold outline-none`} placeholder='e.g. 85.5' />
                                                </div>
                                                <div className='flex-1'>
                                                    <div className='flex items-center justify-between mb-1'>
                                                        <div className='flex items-center gap-2'>
                                                            <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>12th (%)</label>
                                                            {userData.verifiedFields?.twelfthMarks ? <span className='text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full'>✓</span> : <span className='text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full'>⚠</span>}
                                                        </div>
                                                        <button onClick={() => openChangeRequest('twelfthMarks', '12th Marks')} className='text-[10px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline'>✏️</button>
                                                    </div>
                                                    <input type="number" step="0.01" min="0" max="100" value={twelfthMarks} disabled className={`w-full p-2 rounded-lg border bg-transparent border-transparent ${userData.verifiedFields?.twelfthMarks ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'} font-bold outline-none`} placeholder='e.g. 90.0' />
                                                </div>
                                            </div>

                                            {/* Arrears — Read-only, requires coordinator approval */}
                                            <div>
                                                <div className='flex items-center justify-between mb-1'>
                                                    <div className='flex items-center gap-2'>
                                                        <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>Number of Arrears</label>
                                                        {userData.verifiedFields?.numberOfArrears ? <span className='text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full'>✓ Verified</span> : <span className='text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full'>⚠ Pending</span>}
                                                    </div>
                                                    <button onClick={() => openChangeRequest('numberOfArrears', 'Number of Arrears')} className='text-[10px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline'>✏️ Request</button>
                                                </div>
                                                <input type="number" min="0" value={numberOfArrears} disabled className={`w-full p-2 rounded-lg border bg-transparent border-transparent ${userData.verifiedFields?.numberOfArrears ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'} font-bold outline-none`} placeholder='0' />
                                            </div>

                                            <div className='bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 mt-2'>
                                                <p className='text-xs text-amber-700 dark:text-amber-400'>
                                                    <strong>📌 Note:</strong> CGPA, 10th/12th marks, and arrears require coordinator approval to update. Use the <strong>"Request Update"</strong> button to submit a change request.
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Request Modal */}
            {showChangeRequestModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in'>
                    <div className='bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border dark:border-slate-700'>
                        <h3 className='text-xl font-bold text-slate-800 dark:text-white mb-2'>Request {fieldLabels[changeRequestField]} Update</h3>
                        <p className='text-sm text-slate-500 dark:text-slate-400 mb-6'>This request will be sent to the placement coordinator for approval.</p>

                        <div className='space-y-4'>
                            <div>
                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase block mb-1'>Current Value</label>
                                <input type="text" value={userData[changeRequestField] ?? 'Not set'} disabled className='w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 outline-none' />
                            </div>
                            <div>
                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase block mb-1'>New Requested Value</label>
                                <input
                                    type={changeRequestField === 'numberOfArrears' ? 'number' : 'text'}
                                    value={changeRequestValue}
                                    onChange={e => setChangeRequestValue(e.target.value)}
                                    className='w-full p-2.5 rounded-lg border bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-100'
                                    placeholder={`Enter new ${fieldLabels[changeRequestField]}`}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase block mb-1'>Reason for Change</label>
                                <textarea
                                    value={changeRequestReason}
                                    onChange={e => setChangeRequestReason(e.target.value)}
                                    className='w-full p-2.5 rounded-lg border bg-white dark:bg-slate-700 border-blue-200 dark:border-slate-600 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-100 min-h-[80px] resize-none'
                                    placeholder='e.g. Updated CGPA after semester results'
                                />
                            </div>
                        </div>

                        <div className='flex gap-3 mt-6'>
                            <button onClick={() => setShowChangeRequestModal(false)} className='flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition'>Cancel</button>
                            <button onClick={submitChangeRequest} className='flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none'>Submit Request</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    ) : null
}

export default Profile
