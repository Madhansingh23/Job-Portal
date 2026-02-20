import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const RecruiterProfile = () => {

    const { backendUrl, companyToken, companyData, setCompanyData } = useContext(AppContext)

    const [isEdit, setIsEdit] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState('')

    // Password Change
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        if (companyData) {
            setName(companyData.name || '')
            setEmail(companyData.email || '')
            setImagePreview(companyData.image || '')
        }
    }, [companyData])

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleUpdate = async () => {
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('email', email)
            if (image) formData.append('image', image)

            const { data } = await axios.post(`${backendUrl}/api/company/update-profile`, formData, {
                headers: { token: companyToken, 'Content-Type': 'multipart/form-data' }
            })

            if (data.success) {
                toast.success(data.message)
                setCompanyData(data.company)
                setIsEdit(false)
                setImage(null)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            return toast.error('New passwords do not match')
        }
        try {
            const { data } = await axios.post(`${backendUrl}/api/company/change-password`,
                { currentPassword, newPassword },
                { headers: { token: companyToken } }
            )
            if (data.success) {
                toast.success(data.message)
                setShowPasswordForm(false)
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    if (!companyData) return <div className='flex items-center justify-center h-[60vh]'><div className='text-slate-400'>Loading...</div></div>

    return (
        <div className='max-w-4xl mx-auto animate-fade-in'>

            {/* Header */}
            <div className='bg-gradient-to-r from-royal-blue to-indigo-700 rounded-2xl p-8 text-white mb-8 shadow-xl relative overflow-hidden'>
                <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none'></div>
                <div className='relative z-10'>
                    <h1 className='text-2xl font-bold'>Company Profile</h1>
                    <p className='text-blue-100 text-sm mt-1'>Manage your company information and credentials</p>
                </div>
                <div className='absolute bottom-4 right-6 text-blue-200/30 text-6xl font-black select-none'>🏢</div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

                {/* Profile Card */}
                <div className='lg:col-span-1'>
                    <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 text-center'>
                        <div className='relative inline-block mb-4'>
                            <div className='w-28 h-28 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg mx-auto'>
                                <img src={imagePreview || companyData.image} alt={companyData.name} className='w-full h-full object-cover' />
                            </div>
                            {isEdit && (
                                <label className='absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition shadow-md'>
                                    <span className='text-white text-sm'>📷</span>
                                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                                </label>
                            )}
                        </div>
                        <h2 className='text-xl font-bold text-slate-800 dark:text-white'>{companyData.name}</h2>
                        <p className='text-sm text-slate-400 mt-1'>{companyData.email}</p>
                        <span className='inline-block mt-3 text-[10px] font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full'>Recruiter</span>

                        <div className='mt-6 pt-4 border-t border-slate-100 dark:border-slate-700'>
                            <p className='text-xs text-slate-400 mb-2'>Role & Responsibilities</p>
                            <div className='space-y-2 text-left'>
                                <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300'>
                                    <span>📋</span> Post & manage job listings
                                </div>
                                <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300'>
                                    <span>👥</span> Review student applications
                                </div>
                                <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300'>
                                    <span>✅</span> Select/reject candidates
                                </div>
                                <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300'>
                                    <span>🔗</span> Coordinate with placement team
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details & Edit */}
                <div className='lg:col-span-2 space-y-6'>

                    {/* Company Info */}
                    <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700'>
                        <div className='flex justify-between items-center mb-6'>
                            <h3 className='font-bold text-lg text-slate-800 dark:text-white'>Company Information</h3>
                            {!isEdit ? (
                                <button onClick={() => setIsEdit(true)} className='text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline'>Edit</button>
                            ) : (
                                <div className='flex gap-2'>
                                    <button onClick={() => { setIsEdit(false); setName(companyData.name); setEmail(companyData.email); setImage(null); setImagePreview(companyData.image) }} className='text-slate-400 text-sm hover:text-slate-600'>Cancel</button>
                                    <button onClick={handleUpdate} className='bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200 dark:shadow-none'>Save</button>
                                </div>
                            )}
                        </div>

                        <div className='space-y-5'>
                            <div>
                                <label className='text-xs text-slate-400 mb-1 block'>Company Name</label>
                                {isEdit ? (
                                    <input value={name} onChange={e => setName(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition' />
                                ) : (
                                    <p className='text-slate-800 dark:text-white font-medium'>{companyData.name}</p>
                                )}
                            </div>
                            <div>
                                <label className='text-xs text-slate-400 mb-1 block'>Email</label>
                                {isEdit ? (
                                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition' />
                                ) : (
                                    <p className='text-slate-800 dark:text-white font-medium'>{companyData.email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700'>
                        <div className='flex justify-between items-center mb-4'>
                            <h3 className='font-bold text-lg text-slate-800 dark:text-white'>🔐 Security</h3>
                            <button onClick={() => setShowPasswordForm(!showPasswordForm)} className='text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline'>
                                {showPasswordForm ? 'Cancel' : 'Change Password'}
                            </button>
                        </div>

                        {showPasswordForm ? (
                            <div className='space-y-4 animate-fade-in'>
                                <div>
                                    <label className='text-xs text-slate-400 mb-1 block'>Current Password</label>
                                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800' placeholder='Enter current password' />
                                </div>
                                <div>
                                    <label className='text-xs text-slate-400 mb-1 block'>New Password</label>
                                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800' placeholder='Min 6 characters' />
                                </div>
                                <div>
                                    <label className='text-xs text-slate-400 mb-1 block'>Confirm New Password</label>
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800' placeholder='Confirm new password' />
                                </div>
                                <button onClick={handleChangePassword} className='bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none'>
                                    Update Password
                                </button>
                            </div>
                        ) : (
                            <p className='text-sm text-slate-400'>Your password was set during registration. Click "Change Password" to update it.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default RecruiterProfile
