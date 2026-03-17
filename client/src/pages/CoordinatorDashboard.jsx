import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../assets/assets'
import * as XLSX from 'xlsx'
import AnalyticsDashboard from './AnalyticsDashboard'
import Navbar from '../components/Navbar'

const CoordinatorDashboard = () => {

    const { backendUrl } = useContext(AppContext)
    const [token, setToken] = useState(localStorage.getItem('token'))

    const [activeTab, setActiveTab] = useState('Analytics')
    const [students, setStudents] = useState([])
    const [placedStudents, setPlacedStudents] = useState([])
    const [unplacedStudents, setUnplacedStudents] = useState([])

    // Requests and Notices State
    const [changeRequests, setChangeRequests] = useState([])
    const [notices, setNotices] = useState([])
    const [noticeTitle, setNoticeTitle] = useState('')
    const [noticeDesc, setNoticeDesc] = useState('')
    const [noticeType, setNoticeType] = useState('All') // All, Department, Group

    // Missing States
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingStudent, setEditingStudent] = useState(null)
    const [showGroupModal, setShowGroupModal] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupDesc, setNewGroupDesc] = useState('')
    const [memberSearch, setMemberSearch] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [groups, setGroups] = useState([]) // Was declared? No, fetchGroups sets it but state was missing!


    const tabs = [
        { key: 'Analytics', label: '📊 Analytics' },
        { key: 'Placed', label: '✅ Placed' },
        { key: 'Unplaced', label: '⏳ Unplaced' },
        { key: 'Students', label: '👥 All Students' },
        { key: 'Groups', label: '📁 Groups' },
        { key: 'Notices', label: '📢 Notices' },
        { key: 'Requests', label: '🔔 Requests' },
        { key: 'Reports', label: '📑 Reports' },
    ]

    // Fetch Data Functions
    const fetchNotices = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/notices/all', { headers: { token } })
            if (data.success) setNotices(data.notices)
        } catch (error) { toast.error(error.message) }
    }

    // Post Notice
    const handlePostNotice = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post(backendUrl + '/api/notices/create', {
                title: noticeTitle,
                description: noticeDesc,
                type: noticeType
            }, { headers: { token } })
            if (data.success) {
                toast.success("Notice Posted")
                setNoticeTitle('')
                setNoticeDesc('')
                fetchNotices()
            } else {
                toast.error(data.message)
            }
        } catch (error) { toast.error(error.message) }
    }

    // Delete Notice
    const handleDeleteNotice = async (id) => {
        if (!window.confirm("Delete this notice?")) return;
        try {
            const { data } = await axios.post(backendUrl + '/api/notices/delete', { id }, { headers: { token } })
            if (data.success) {
                toast.success("Notice Deleted")
                fetchNotices()
            }
        } catch (error) { toast.error(error.message) }
    }

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/coordinator/students', { headers: { token } })
            if (data.success) setStudents(data.students.reverse())
            else toast.error(data.message)
        } catch (error) { toast.error(error.message) }
    }

    const fetchPlacedStudents = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/coordinator/placed-students', { headers: { token } })
            if (data.success) {
                setPlacedStudents(data.placedStudents)
            } else {
                toast.error(data.message)
            }
        } catch (error) { toast.error(error.message) }
    }

    const fetchUnplacedStudents = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/coordinator/unplaced-students', { headers: { token } })
            if (data.success) {
                setUnplacedStudents(data.unplacedStudents)
            } else {
                toast.error(data.message)
            }
        } catch (error) { toast.error(error.message) }
    }

    const fetchGroups = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/groups/all', { headers: { token } })
            if (data.success) setGroups(data.groups)
        } catch (error) { toast.error(error.message) }
    }

    const fetchChangeRequests = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/change-requests/all', { headers: { token } })
            if (data.success) setChangeRequests(data.requests)
        } catch (error) { toast.error(error.message) }
    }

    useEffect(() => {
        if (!token) {
            navigate('/coordinator-login')
            return
        }
        if (token) {
            fetchStudents()
            fetchPlacedStudents()
            fetchUnplacedStudents()
            fetchGroups()
            fetchChangeRequests()
            fetchNotices()
        }
    }, [token])

    // Update Student
    const handleUpdateStudent = async (e) => {
        e.preventDefault()
        if (editingStudent.cgpa < 0 || editingStudent.cgpa > 10) {
            return toast.error("CGPA must be between 0 and 10")
        }
        try {
            const { data } = await axios.post(backendUrl + '/api/coordinator/update-student', editingStudent, { headers: { token } })
            if (data.success) {
                toast.success("Student updated successfully")
                setShowEditModal(false)
                fetchStudents()
            } else {
                toast.error(data.message)
            }
        } catch (error) { toast.error(error.message) }
    }

    // Create Group
    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return toast.error("Group name required")
        try {
            const { data } = await axios.post(backendUrl + '/api/groups/create', { name: newGroupName, description: newGroupDesc }, { headers: { token } })
            if (data.success) {
                toast.success("Group created")
                setNewGroupName('')
                setNewGroupDesc('')
                fetchGroups()
            } else {
                toast.error(data.message)
            }
        } catch (error) { toast.error(error.message) }
    }

    // Add Member to Group
    const handleAddMember = async (studentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/groups/add-member', { groupId: selectedGroup._id, studentId }, { headers: { token } })
            if (data.success) {
                toast.success("Member added")
                // Update local group state
                const updatedGroups = groups.map(g => {
                    if (g._id === selectedGroup._id) {
                        const student = students.find(s => s._id === studentId)
                        return { ...g, members: [...g.members, student] }
                    }
                    return g
                })
                setGroups(updatedGroups)
                setSelectedGroup(updatedGroups.find(g => g._id === selectedGroup._id))
            } else {
                toast.error(data.message)
            }
        } catch (error) { toast.error(error.message) }
    }

    // Remove Member from Group
    const handleRemoveMember = async (studentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/groups/remove-member', { groupId: selectedGroup._id, studentId }, { headers: { token } })
            if (data.success) {
                toast.success("Member removed")
                // Update local group state
                const updatedGroups = groups.map(g => {
                    if (g._id === selectedGroup._id) {
                        return { ...g, members: g.members.filter(m => m._id !== studentId) }
                    }
                    return g
                })
                setGroups(updatedGroups)
                setSelectedGroup(updatedGroups.find(g => g._id === selectedGroup._id))
            } else {
                toast.error(data.message)
            }
        } catch (error) { toast.error(error.message) }
    }

    // Review Change Request
    const handleReviewRequest = async (requestId, action, note = '') => {
        try {
            const { data } = await axios.post(backendUrl + '/api/change-requests/review', { requestId, action, reviewNote: note }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                fetchChangeRequests()
                fetchStudents() // Refresh student data if approved
            } else {
                toast.error(data.message)
            }
        } catch (error) { toast.error(error.message) }
    }

    // Export Reports
    const downloadReport = (data, filename) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    }

    return (
        <div className='min-h-screen bg-slate-50 dark:bg-slate-900 font-inter'>
            <Navbar />

            {/* Tabs */}
            <div className='bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-6 lg:px-10 flex overflow-x-auto no-scrollbar gap-8'>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`py-4 text-sm font-medium border-b-[3px] whitespace-nowrap transition-all duration-300 ${activeTab === tab.key ? 'border-blue-600 text-blue-600 dark:text-blue-400 scale-105' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:border-gray-200 dark:hover:border-slate-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className='p-6 lg:px-10 animate-fade-in'>

                {/* ANALYTICS TAB */}
                {activeTab === 'Analytics' && <div className="animate-slide-up"><AnalyticsDashboard /></div>}

                {/* PLACED STUDENTS TAB */}
                {activeTab === 'Placed' && (
                    <div className='space-y-6 animate-slide-up'>
                        <div className='bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center transition-all hover:shadow-md'>
                            <h2 className='font-bold text-lg text-gray-800 dark:text-white'>Placed Students <span className='bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full ml-2'>{placedStudents.length}</span></h2>
                            <button onClick={() => downloadReport(placedStudents, 'Placed_Students')} className='bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2'>
                                <span>📥</span> Export Excel
                            </button>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {placedStudents.map((item, i) => (
                                <div key={i} className='bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700'>
                                    <div className='flex items-center gap-3 mb-3'>
                                        <div className='w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold'>
                                            {item.student?.name?.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                            <p className='font-semibold text-gray-800 dark:text-white'>{item.student?.name || 'Unknown'}</p>
                                            <p className='text-xs text-gray-500 dark:text-slate-400'>{item.student?.dept || '-'} · {item.student?.registerNumber || '-'}</p>
                                        </div>
                                    </div>
                                    <div className='border-t pt-2 mt-2 space-y-2'>
                                        {item.offers && item.offers.map((offer, idx) => (
                                            <div key={idx} className='text-xs border-b last:border-0 pb-1 last:pb-0 border-gray-100'>
                                                <div className='flex justify-between'>
                                                    <span className='font-medium text-gray-700 dark:text-gray-300'>{offer.company}</span>
                                                    <span className='text-green-600 font-semibold'>₹{offer.salary}</span>
                                                </div>
                                                <p className='text-gray-500'>{offer.role}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* UNPLACED STUDENTS TAB */}
                {activeTab === 'Unplaced' && (
                    <div className='bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden'>
                        <div className='p-4 border-b dark:border-slate-700 flex justify-between items-center'>
                            <h2 className='font-semibold dark:text-white'>Unplaced Students ({unplacedStudents.length})</h2>
                            <button onClick={() => downloadReport(unplacedStudents, 'Unplaced_Students')} className='text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800'>Export Excel</button>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm text-left text-gray-500 dark:text-slate-400'>
                                <thead className='text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-700/50'>
                                    <tr>
                                        <th className='px-6 py-3'>Name</th>
                                        <th className='px-6 py-3'>Reg No</th>
                                        <th className='px-6 py-3'>Dept</th>
                                        <th className='px-6 py-3'>CGPA</th>
                                        <th className='px-6 py-3'>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unplacedStudents.map((student, i) => (
                                        <tr key={i} className='bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'>
                                            <td className='px-6 py-4 font-medium text-gray-900 dark:text-white'>{student.name}</td>
                                            <td className='px-6 py-4'>{student.registerNumber}</td>
                                            <td className='px-6 py-4'>{student.dept}</td>
                                            <td className='px-6 py-4'>{student.cgpa}</td>
                                            <td className='px-6 py-4'>{student.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ALL STUDENTS TAB */}
                {activeTab === 'Students' && (
                    <div className='bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden'>
                        <div className='p-4 border-b dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between'>
                            <h2 className='font-semibold dark:text-white'>All Students</h2>
                            <input type="text" placeholder='Search students...' className='border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-1.5 text-sm w-full sm:w-64 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
                                onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className='overflow-x-auto h-[600px]'>
                            <table className='w-full text-sm text-left text-gray-500 dark:text-slate-400'>
                                <thead className='text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-700/50 sticky top-0'>
                                    <tr>
                                        <th className='px-6 py-3'>Name</th>
                                        <th className='px-6 py-3'>Reg No</th>
                                        <th className='px-6 py-3'>Dept</th>
                                        <th className='px-6 py-3'>CGPA</th>
                                        <th className='px-6 py-3'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.registerNumber?.includes(searchTerm)).map((student, i) => (
                                        <tr key={i} className='bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'>
                                            <td className='px-6 py-4 font-medium text-gray-900 dark:text-white'>{student.name}</td>
                                            <td className='px-6 py-4'>{student.registerNumber}</td>
                                            <td className='px-6 py-4'>{student.dept}</td>
                                            <td className='px-6 py-4'>{student.cgpa}</td>
                                            <td className='px-6 py-4'>
                                                <button onClick={() => { setEditingStudent(student); setShowEditModal(true) }} className='text-blue-600 dark:text-blue-400 hover:underline'>Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* GROUPS TAB */}
                {activeTab === 'Groups' && (
                    <div className='space-y-6'>
                        {/* ... existing groups content ... */}
                        {/* Create Group */}
                        <div className='bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700'>
                            <h3 className='font-semibold mb-4 dark:text-white'>Create New Group</h3>
                            <div className='flex gap-4 items-end'>
                                <div className='flex-1'>
                                    <label className='text-xs text-gray-500 dark:text-slate-400 mb-1 block'>Group Name</label>
                                    <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-3 py-2 text-sm' placeholder='e.g. Elite Coders 2024' />
                                </div>
                                <div className='flex-[2]'>
                                    <label className='text-xs text-gray-500 dark:text-slate-400 mb-1 block'>Description</label>
                                    <input type="text" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-3 py-2 text-sm' placeholder='Description...' />
                                </div>
                                <button onClick={handleCreateGroup} className='bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none'>Create</button>
                            </div>
                        </div>

                        {/* Groups List */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {groups.map((group, i) => (
                                <div key={i} className='bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition'>
                                    <div className='flex justify-between items-start mb-2'>
                                        <h3 className='font-bold text-lg dark:text-white'>{group.name}</h3>
                                        <span className='bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-medium'>{group.members.length} Members</span>
                                    </div>
                                    <p className='text-gray-500 dark:text-slate-400 text-sm mb-4 line-clamp-2'>{group.description}</p>
                                    <button onClick={() => { setSelectedGroup(group); setShowGroupModal(true) }} className='w-full py-2 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition'>Manage Members</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* NOTICES TAB */}
                {activeTab === 'Notices' && (
                    <div className='space-y-6'>
                        {/* Post Notice */}
                        <div className='bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700'>
                            <h3 className='font-semibold mb-4 dark:text-white'>Post New Notice</h3>
                            <form onSubmit={handlePostNotice} className='space-y-4'>
                                <div className='flex gap-4'>
                                    <div className='flex-[2]'>
                                        <label className='text-xs text-gray-500 dark:text-slate-400 mb-1 block'>Title</label>
                                        <input type="text" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-3 py-2 text-sm' placeholder='Notice Title' required />
                                    </div>
                                    <div className='flex-1'>
                                        <label className='text-xs text-gray-500 dark:text-slate-400 mb-1 block'>Target Audience</label>
                                        <select value={noticeType} onChange={e => setNoticeType(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-3 py-2 text-sm'>
                                            <option value="All">All Students</option>
                                            <option value="Department">My Department</option>
                                            <option value="Group">Specific Group</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className='text-xs text-gray-500 dark:text-slate-400 mb-1 block'>Description</label>
                                    <textarea value={noticeDesc} onChange={e => setNoticeDesc(e.target.value)} className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded px-3 py-2 text-sm h-24' placeholder='Notice details...' required></textarea>
                                </div>
                                <div className='flex justify-end'>
                                    <button type='submit' className='bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none'>Post Notice</button>
                                </div>
                            </form>
                        </div>

                        {/* Notices List */}
                        <div className='space-y-4'>
                            {notices.map((notice, i) => (
                                <div key={i} className='bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 relative group'>
                                    <div className='flex justify-between items-start'>
                                        <div>
                                            <h3 className='font-bold text-gray-800 dark:text-white'>{notice.title}</h3>
                                            <p className='text-xs text-gray-500 dark:text-slate-400 mt-1'>{new Date(notice.date).toLocaleDateString()} · To: {notice.type}</p>
                                        </div>
                                        <button onClick={() => handleDeleteNotice(notice._id)} className='text-red-500 opacity-0 group-hover:opacity-100 transition text-sm hover:underline'>Delete</button>
                                    </div>
                                    <p className='text-gray-600 dark:text-slate-300 text-sm mt-3 whitespace-pre-wrap'>{notice.description}</p>
                                </div>
                            ))}
                            {notices.length === 0 && <p className='text-center text-gray-500 dark:text-slate-400 py-10'>No notices posted yet.</p>}
                        </div>
                    </div>
                )}

                {/* REQUESTS TAB */}
                {activeTab === 'Requests' && (
                    <div className='bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden'>
                        <div className='p-4 border-b dark:border-slate-700'>
                            <h2 className='font-semibold dark:text-white'>Student Change Requests</h2>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm text-left text-gray-500 dark:text-slate-400'>
                                <thead className='text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-700/50'>
                                    <tr>
                                        <th className='px-6 py-3'>Student</th>
                                        <th className='px-6 py-3'>Field</th>
                                        <th className='px-6 py-3'>Current</th>
                                        <th className='px-6 py-3'>Requested</th>
                                        <th className='px-6 py-3'>Reason</th>
                                        <th className='px-6 py-3'>Status</th>
                                        <th className='px-6 py-3'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {changeRequests.map((req, i) => (
                                        <tr key={i} className='bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'>
                                            <td className='px-6 py-4 font-medium text-gray-900 dark:text-white'>{req.studentId?.name}</td>
                                            <td className='px-6 py-4 capitalize'>{req.fieldName}</td>
                                            <td className='px-6 py-4 text-gray-400 dark:text-slate-500'>{req.currentValue || '-'}</td>
                                            <td className='px-6 py-4 font-medium text-blue-600 dark:text-blue-400'>{req.requestedValue}</td>
                                            <td className='px-6 py-4'>{req.reason}</td>
                                            <td className='px-6 py-4'>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${req.status === 'Approved' ? 'bg-green-100 text-green-700' : req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4'>
                                                {req.status === 'Pending' && (
                                                    <div className='flex gap-2'>
                                                        <button onClick={() => handleReviewRequest(req._id, 'Approved')} className='text-green-600 hover:underline'>Approve</button>
                                                        <button onClick={() => handleReviewRequest(req._id, 'Rejected')} className='text-red-600 hover:underline'>Reject</button>
                                                    </div>
                                                )}
                                                {req.status !== 'Pending' && <span className='text-xs text-gray-400'>Reviewed by {req.reviewedBy?.name}</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* REPORTS TAB */}
                {activeTab === 'Reports' && (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up'>
                        <div onClick={() => downloadReport(students, 'All_Students')} className='bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 text-center cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group'>
                            <div className='text-5xl mb-6 group-hover:scale-110 transition-transform duration-300'>👥</div>
                            <h3 className='font-bold text-xl text-gray-800 dark:text-white mb-2'>All Students Report</h3>
                            <p className='text-sm text-gray-500 dark:text-slate-400'>Download the complete student database with full details.</p>
                            <span className='mt-6 inline-block text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:underline'>Download Excel &rarr;</span>
                        </div>
                        <div onClick={() => downloadReport(placedStudents, 'Placed_Students')} className='bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 text-center cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 group'>
                            <div className='text-5xl mb-6 group-hover:scale-110 transition-transform duration-300'>✅</div>
                            <h3 className='font-bold text-xl text-gray-800 dark:text-white mb-2'>Placement Report</h3>
                            <p className='text-sm text-gray-500 dark:text-slate-400'>Download list of placed students and their offers.</p>
                            <span className='mt-6 inline-block text-green-600 dark:text-green-400 text-sm font-medium group-hover:underline'>Download Excel &rarr;</span>
                        </div>
                        <div onClick={() => downloadReport(unplacedStudents, 'Unplaced_Students')} className='bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 text-center cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 group'>
                            <div className='text-5xl mb-6 group-hover:scale-110 transition-transform duration-300'>⏳</div>
                            <h3 className='font-bold text-xl text-gray-800 dark:text-white mb-2'>Unplaced Report</h3>
                            <p className='text-sm text-gray-500 dark:text-slate-400'>Download list of students currently seeking opportunities.</p>
                            <span className='mt-6 inline-block text-red-500 dark:text-red-400 text-sm font-medium group-hover:underline'>Download Excel &rarr;</span>
                        </div>
                    </div>
                )}

            </div>

            {showEditModal && editingStudent && (
                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border dark:border-slate-700'>
                        <h3 className='text-lg font-bold mb-1 dark:text-white'>Edit Student</h3>
                        <p className='text-xs text-gray-500 dark:text-slate-400 mb-4'>Update student details and verify academic fields</p>
                        <form onSubmit={handleUpdateStudent} className='space-y-4'>
                            <div>
                                <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>Name</label>
                                <input className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 mt-1' value={editingStudent.name} disabled />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>Register Number</label>
                                    <input className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 mt-1' value={editingStudent.registerNumber || ''} onChange={e => setEditingStudent({ ...editingStudent, registerNumber: e.target.value })} />
                                </div>
                                <div>
                                    <label className='text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide'>Department</label>
                                    <input className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 mt-1' value={editingStudent.dept || ''} onChange={e => setEditingStudent({ ...editingStudent, dept: e.target.value })} />
                                </div>
                            </div>

                            {/* Verifiable Fields */}
                            <div className='border dark:border-slate-600 rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-slate-700/30'>
                                <p className='text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider'>Verifiable Academic Fields</p>
                                <div className='grid grid-cols-3 gap-3'>
                                    <div>
                                        <label className='text-xs text-gray-500 dark:text-slate-400'>CGPA</label>
                                        <input className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 mt-1' type="number" step="0.01" min="0" max="10" value={editingStudent.cgpa || ''} onChange={e => setEditingStudent({ ...editingStudent, cgpa: e.target.value })} />
                                        <button type='button' onClick={async () => { const { data } = await axios.post(backendUrl + '/api/coordinator/verify-field', { userId: editingStudent._id, field: 'cgpa', verified: !editingStudent.verifiedFields?.cgpa }, { headers: { token } }); if (data.success) { toast.success(data.message); setEditingStudent({ ...editingStudent, verifiedFields: { ...editingStudent.verifiedFields, cgpa: !editingStudent.verifiedFields?.cgpa } }); fetchStudents(); } }} className={`mt-1 w-full text-xs py-1.5 rounded-lg font-bold transition ${editingStudent.verifiedFields?.cgpa ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 border dark:border-slate-500'}`}>
                                            {editingStudent.verifiedFields?.cgpa ? '✓ Verified' : 'Verify'}
                                        </button>
                                    </div>
                                    <div>
                                        <label className='text-xs text-gray-500 dark:text-slate-400'>Batch</label>
                                        <input className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 mt-1' value={editingStudent.batch || ''} onChange={e => setEditingStudent({ ...editingStudent, batch: e.target.value })} />
                                        <button type='button' onClick={async () => { const { data } = await axios.post(backendUrl + '/api/coordinator/verify-field', { userId: editingStudent._id, field: 'batch', verified: !editingStudent.verifiedFields?.batch }, { headers: { token } }); if (data.success) { toast.success(data.message); setEditingStudent({ ...editingStudent, verifiedFields: { ...editingStudent.verifiedFields, batch: !editingStudent.verifiedFields?.batch } }); fetchStudents(); } }} className={`mt-1 w-full text-xs py-1.5 rounded-lg font-bold transition ${editingStudent.verifiedFields?.batch ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 border dark:border-slate-500'}`}>
                                            {editingStudent.verifiedFields?.batch ? '✓ Verified' : 'Verify'}
                                        </button>
                                    </div>
                                    <div>
                                        <label className='text-xs text-gray-500 dark:text-slate-400'>Branch</label>
                                        <input className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 mt-1' value={editingStudent.branch || ''} onChange={e => setEditingStudent({ ...editingStudent, branch: e.target.value })} />
                                        <button type='button' onClick={async () => { const { data } = await axios.post(backendUrl + '/api/coordinator/verify-field', { userId: editingStudent._id, field: 'branch', verified: !editingStudent.verifiedFields?.branch }, { headers: { token } }); if (data.success) { toast.success(data.message); setEditingStudent({ ...editingStudent, verifiedFields: { ...editingStudent.verifiedFields, branch: !editingStudent.verifiedFields?.branch } }); fetchStudents(); } }} className={`mt-1 w-full text-xs py-1.5 rounded-lg font-bold transition ${editingStudent.verifiedFields?.branch ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 border dark:border-slate-500'}`}>
                                            {editingStudent.verifiedFields?.branch ? '✓ Verified' : 'Verify'}
                                        </button>
                                    </div>
                                    <div>
                                        <label className='text-xs text-gray-500 dark:text-slate-400'>10th Marks</label>
                                        <input className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 mt-1' type="number" value={editingStudent.tenthMarks || ''} onChange={e => setEditingStudent({ ...editingStudent, tenthMarks: e.target.value })} />
                                        <button type='button' onClick={async () => { const { data } = await axios.post(backendUrl + '/api/coordinator/verify-field', { userId: editingStudent._id, field: 'tenthMarks', verified: !editingStudent.verifiedFields?.tenthMarks }, { headers: { token } }); if (data.success) { toast.success(data.message); setEditingStudent({ ...editingStudent, verifiedFields: { ...editingStudent.verifiedFields, tenthMarks: !editingStudent.verifiedFields?.tenthMarks } }); fetchStudents(); } }} className={`mt-1 w-full text-xs py-1.5 rounded-lg font-bold transition ${editingStudent.verifiedFields?.tenthMarks ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 border dark:border-slate-500'}`}>
                                            {editingStudent.verifiedFields?.tenthMarks ? '✓ Verified' : 'Verify'}
                                        </button>
                                    </div>
                                    <div>
                                        <label className='text-xs text-gray-500 dark:text-slate-400'>12th Marks</label>
                                        <input className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 mt-1' type="number" value={editingStudent.twelfthMarks || ''} onChange={e => setEditingStudent({ ...editingStudent, twelfthMarks: e.target.value })} />
                                        <button type='button' onClick={async () => { const { data } = await axios.post(backendUrl + '/api/coordinator/verify-field', { userId: editingStudent._id, field: 'twelfthMarks', verified: !editingStudent.verifiedFields?.twelfthMarks }, { headers: { token } }); if (data.success) { toast.success(data.message); setEditingStudent({ ...editingStudent, verifiedFields: { ...editingStudent.verifiedFields, twelfthMarks: !editingStudent.verifiedFields?.twelfthMarks } }); fetchStudents(); } }} className={`mt-1 w-full text-xs py-1.5 rounded-lg font-bold transition ${editingStudent.verifiedFields?.twelfthMarks ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 border dark:border-slate-500'}`}>
                                            {editingStudent.verifiedFields?.twelfthMarks ? '✓ Verified' : 'Verify'}
                                        </button>
                                    </div>
                                    <div>
                                        <label className='text-xs text-gray-500 dark:text-slate-400'>Arrears</label>
                                        <input className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-2 mt-1' type="number" value={editingStudent.numberOfArrears !== undefined ? editingStudent.numberOfArrears : ''} onChange={e => setEditingStudent({ ...editingStudent, numberOfArrears: e.target.value })} />
                                        <button type='button' onClick={async () => { const { data } = await axios.post(backendUrl + '/api/coordinator/verify-field', { userId: editingStudent._id, field: 'numberOfArrears', verified: !editingStudent.verifiedFields?.numberOfArrears }, { headers: { token } }); if (data.success) { toast.success(data.message); setEditingStudent({ ...editingStudent, verifiedFields: { ...editingStudent.verifiedFields, numberOfArrears: !editingStudent.verifiedFields?.numberOfArrears } }); fetchStudents(); } }} className={`mt-1 w-full text-xs py-1.5 rounded-lg font-bold transition ${editingStudent.verifiedFields?.numberOfArrears ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 border dark:border-slate-500'}`}>
                                            {editingStudent.verifiedFields?.numberOfArrears ? '✓ Verified' : 'Verify'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className='flex justify-end gap-3 mt-4'>
                                <button type='button' onClick={() => setShowEditModal(false)} className='px-5 py-2.5 border dark:border-slate-600 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium text-sm'>Cancel</button>
                                <button type='submit' className='px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-lg shadow-blue-200 dark:shadow-none'>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MANAGE GROUP MEMBERS MODAL */}
            {showGroupModal && selectedGroup && (
                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
                    <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl border dark:border-slate-700'>
                        <div className='flex justify-between items-start mb-4'>
                            <div>
                                <h3 className='text-lg font-bold dark:text-white'>{selectedGroup.name}</h3>
                                <p className='text-sm text-gray-500 dark:text-slate-400'>Manage Members</p>
                            </div>
                            <button onClick={() => setShowGroupModal(false)} className='text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl'>&times;</button>
                        </div>

                        {/* Search and Add */}
                        <div className='mb-4 relative'>
                            <input
                                type="text"
                                placeholder='Search and click to add student...'
                                className='w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-4 py-2 pl-10 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
                                value={memberSearch}
                                onChange={e => setMemberSearch(e.target.value)}
                            />
                            <span className='absolute left-3 top-2.5 text-gray-400'>🔍</span>
                            {memberSearch && (
                                <div className='absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto z-10'>
                                    {students.filter(s => s.name?.toLowerCase().includes(memberSearch.toLowerCase()) && !selectedGroup.members.some(m => m._id === s._id)).map(student => (
                                        <div key={student._id} onClick={() => { handleAddMember(student._id); setMemberSearch('') }} className='p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b dark:border-slate-600 last:border-0 flex justify-between items-center'>
                                            <div>
                                                <p className='font-medium text-sm dark:text-white'>{student.name}</p>
                                                <p className='text-xs text-gray-500 dark:text-slate-400'>{student.registerNumber} · {student.dept}</p>
                                            </div>
                                            <span className='text-blue-600 dark:text-blue-400 text-xs font-bold'>+ ADD</span>
                                        </div>
                                    ))}
                                    {students.filter(s => s.name?.toLowerCase().includes(memberSearch.toLowerCase()) && !selectedGroup.members.some(m => m._id === s._id)).length === 0 && (
                                        <div className='p-3 text-sm text-gray-400 dark:text-slate-500 text-center'>No matching students found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Members List */}
                        <div className='flex-1 overflow-y-auto border dark:border-slate-600 rounded-lg'>
                            <table className='w-full text-sm text-left text-gray-500 dark:text-slate-400'>
                                <thead className='text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-700/50 sticky top-0'>
                                    <tr>
                                        <th className='px-4 py-3'>Name</th>
                                        <th className='px-4 py-3'>Reg No</th>
                                        <th className='px-4 py-3'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedGroup.members.length > 0 ? selectedGroup.members.map((member, i) => (
                                        <tr key={i} className='border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 bg-white dark:bg-slate-800'>
                                            <td className='px-4 py-3 dark:text-white'>{member.name}</td>
                                            <td className='px-4 py-3'>{member.registerNumber}</td>
                                            <td className='px-4 py-3'>
                                                <button onClick={() => handleRemoveMember(member._id)} className='text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 dark:border-red-800 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20'>REMOVE</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" className='text-center py-10 text-gray-400 dark:text-slate-500'>No members active in this group</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default CoordinatorDashboard
