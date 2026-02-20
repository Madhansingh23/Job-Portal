import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'

const CoordinatorProfile = () => {

    const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/^['"]|['"]$/g, '').replace(/\/+$/, '')
    const token = localStorage.getItem('coordinatorToken')

    const [coordinator, setCoordinator] = useState(null)
    const [isEdit, setIsEdit] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [dept, setDept] = useState('')

    // Password
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/coordinator/profile`, { headers: { token } })
            if (data.success) {
                setCoordinator(data.coordinator)
                setName(data.coordinator.name || '')
                setEmail(data.coordinator.email || '')
                setPhone(data.coordinator.phone || '')
                setDept(data.coordinator.dept || '')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (token) fetchProfile()
    }, [])

    const handleUpdate = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/coordinator/update-profile`,
                { name, email, phone, dept },
                { headers: { token } }
            )
            if (data.success) {
                toast.success(data.message)
                setCoordinator(data.coordinator)
                setIsEdit(false)
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
            const { data } = await axios.post(`${backendUrl}/api/coordinator/change-password`,
                { currentPassword, newPassword },
                { headers: { token } }
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

    if (!coordinator) return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center h-[60vh]'><div className='text-slate-400'>Loading...</div></div>
        </div>
    )

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors'>
            <Navbar />

            <div className='max-w-4xl mx-auto px-4 py-8 animate-fade-in'>

                {/* Header */}
                <div className='bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white mb-8 shadow-xl relative overflow-hidden'>
                    <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none'></div>
                    <div className='relative z-10'>
                        <h1 className='text-2xl font-bold'>Coordinator Profile</h1>
                        <p className='text-emerald-100 text-sm mt-1'>Manage your placement coordinator information</p>
                    </div>
                    <div className='absolute bottom-4 right-6 text-emerald-200/30 text-6xl font-black select-none'>🎓</div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

                    {/* Profile Card */}
                    <div className='lg:col-span-1'>
                        <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 text-center'>
                            <div className='w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg mx-auto mb-4'>
                                <img src={coordinator.image || 'https://via.placeholder.com/150'} alt={coordinator.name} className='w-full h-full object-cover' />
                            </div>
                            <h2 className='text-xl font-bold text-slate-800 dark:text-white'>{coordinator.name}</h2>
                            <p className='text-sm text-slate-400 mt-1'>{coordinator.email}</p>
                            <span className='inline-block mt-3 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full'>Placement Coordinator</span>

                            <div className='mt-6 pt-4 border-t border-slate-100 dark:border-slate-700'>
                                <p className='text-xs text-slate-400 mb-2'>Role & Responsibilities</p>
                                <div className='space-y-2 text-left'>
                                    <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300'>
                                        <span>📊</span> Oversee placement activities
                                    </div>
                                    <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300'>
                                        <span>✅</span> Verify student academic data
                                    </div>
                                    <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300'>
                                        <span>👥</span> Manage student groups
                                    </div>
                                    <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300'>
                                        <span>📢</span> Post notices to students
                                    </div>
                                    <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300'>
                                        <span>🔗</span> Bridge recruiters ↔ students
                                    </div>
                                    <div className='flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300'>
                                        <span>📈</span> Generate placement reports
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details & Edit */}
                    <div className='lg:col-span-2 space-y-6'>

                        {/* Coordinator Info */}
                        <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700'>
                            <div className='flex justify-between items-center mb-6'>
                                <h3 className='font-bold text-lg text-slate-800 dark:text-white'>Personal Information</h3>
                                {!isEdit ? (
                                    <button onClick={() => setIsEdit(true)} className='text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline'>Edit</button>
                                ) : (
                                    <div className='flex gap-2'>
                                        <button onClick={() => { setIsEdit(false); setName(coordinator.name); setEmail(coordinator.email); setPhone(coordinator.phone || ''); setDept(coordinator.dept || '') }} className='text-slate-400 text-sm hover:text-slate-600'>Cancel</button>
                                        <button onClick={handleUpdate} className='bg-emerald-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-emerald-700 transition shadow-md shadow-emerald-200 dark:shadow-none'>Save</button>
                                    </div>
                                )}
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                                <div>
                                    <label className='text-xs text-slate-400 mb-1 block'>Full Name</label>
                                    {isEdit ? (
                                        <input value={name} onChange={e => setName(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition' />
                                    ) : (
                                        <p className='text-slate-800 dark:text-white font-medium'>{coordinator.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className='text-xs text-slate-400 mb-1 block'>Email</label>
                                    {isEdit ? (
                                        <input value={email} onChange={e => setEmail(e.target.value)} type="email" className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition' />
                                    ) : (
                                        <p className='text-slate-800 dark:text-white font-medium'>{coordinator.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label className='text-xs text-slate-400 mb-1 block'>Phone</label>
                                    {isEdit ? (
                                        <input value={phone} onChange={e => setPhone(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition' />
                                    ) : (
                                        <p className='text-slate-800 dark:text-white font-medium'>{coordinator.phone || 'Not set'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className='text-xs text-slate-400 mb-1 block'>Department</label>
                                    {isEdit ? (
                                        <input value={dept} onChange={e => setDept(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 outline-none transition' />
                                    ) : (
                                        <p className='text-slate-800 dark:text-white font-medium'>{coordinator.dept || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Change Password */}
                        <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='font-bold text-lg text-slate-800 dark:text-white'>🔐 Security</h3>
                                <button onClick={() => setShowPasswordForm(!showPasswordForm)} className='text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline'>
                                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                                </button>
                            </div>

                            {showPasswordForm ? (
                                <div className='space-y-4 animate-fade-in'>
                                    <div>
                                        <label className='text-xs text-slate-400 mb-1 block'>Current Password</label>
                                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800' placeholder='Enter current password' />
                                    </div>
                                    <div>
                                        <label className='text-xs text-slate-400 mb-1 block'>New Password</label>
                                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800' placeholder='Min 6 characters' />
                                    </div>
                                    <div>
                                        <label className='text-xs text-slate-400 mb-1 block'>Confirm New Password</label>
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800' placeholder='Confirm new password' />
                                    </div>
                                    <button onClick={handleChangePassword} className='bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none'>
                                        Update Password
                                    </button>
                                </div>
                            ) : (
                                <p className='text-sm text-slate-400'>Your password was set during registration. Click "Change Password" to update it.</p>
                            )}
                        </div>

                        {/* Connections */}
                        <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700'>
                            <h3 className='font-bold text-lg text-slate-800 dark:text-white mb-4'>🔗 Role Connections</h3>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div className='bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800'>
                                    <p className='text-sm font-bold text-blue-700 dark:text-blue-400 mb-2'>↕ With Recruiters</p>
                                    <ul className='text-xs text-blue-600 dark:text-blue-300 space-y-1'>
                                        <li>• Forward eligible student profiles</li>
                                        <li>• Coordinate placement drives</li>
                                        <li>• Manage company group access</li>
                                    </ul>
                                </div>
                                <div className='bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800'>
                                    <p className='text-sm font-bold text-amber-700 dark:text-amber-400 mb-2'>↕ With Students</p>
                                    <ul className='text-xs text-amber-600 dark:text-amber-300 space-y-1'>
                                        <li>• Verify academic credentials</li>
                                        <li>• Post placement notices</li>
                                        <li>• Handle change requests</li>
                                        <li>• Track placement status</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CoordinatorProfile
