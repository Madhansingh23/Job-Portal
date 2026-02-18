import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { assets } from '../assets/assets'
import * as XLSX from 'xlsx'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import Navbar from '../components/Navbar'

const CoordinatorDashboard = () => {

    const { backendUrl } = useContext(AppContext)
    const [token, setToken] = useState(localStorage.getItem('token'))

    const [activeTab, setActiveTab] = useState('Analytics')
    const [students, setStudents] = useState([])
    const [placedStudents, setPlacedStudents] = useState([])
    const [unplacedStudents, setUnplacedStudents] = useState([])

    // New State for Groups & Requests
    const [groups, setGroups] = useState([])
    const [changeRequests, setChangeRequests] = useState([])
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupDesc, setNewGroupDesc] = useState('')

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('')

    // Edit Student Modal
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingStudent, setEditingStudent] = useState(null)

    // Group Member Modal
    const [showGroupModal, setShowGroupModal] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [memberSearch, setMemberSearch] = useState('')

    const tabs = [
        { key: 'Analytics', label: '📊 Analytics' },
        { key: 'Placed', label: '✅ Placed' },
        { key: 'Unplaced', label: '⏳ Unplaced' },
        { key: 'Students', label: '👥 All Students' },
        { key: 'Groups', label: '📁 Groups' },
        { key: 'Requests', label: '🔔 Requests' },
        { key: 'Reports', label: '📑 Reports' },
    ]

    // Fetch Data Functions
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
            if (data.success) setPlacedStudents(data.students)
        } catch (error) { toast.error(error.message) }
    }

    const fetchUnplacedStudents = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/coordinator/unplaced-students', { headers: { token } })
            if (data.success) setUnplacedStudents(data.students)
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
        if (token) {
            fetchStudents()
            fetchPlacedStudents()
            fetchUnplacedStudents()
            fetchGroups()
            fetchChangeRequests()
        }
    }, [token])

    // Update Student
    const handleUpdateStudent = async (e) => {
        e.preventDefault()
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
        <div className='min-h-screen bg-gray-50'>
            <Navbar />

            {/* Page Title */}
            <div className='bg-gradient-to-r from-blue-800 to-indigo-900 text-white px-6 lg:px-10 py-4'>
                <h1 className='text-xl font-bold'>Coordinator Dashboard</h1>
                <p className='text-blue-200 text-xs mt-0.5'>Campus Placement Management</p>
            </div>

            {/* Tabs */}
            <div className='bg-white border-b px-6 lg:px-10 flex overflow-x-auto no-scrollbar gap-6'>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className='p-6 lg:px-10'>

                {/* ANALYTICS TAB */}
                {activeTab === 'Analytics' && <AnalyticsDashboard />}

                {/* PLACED STUDENTS TAB */}
                {activeTab === 'Placed' && (
                    <div className='space-y-4'>
                        <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center'>
                            <h2 className='font-semibold'>Placed Students ({placedStudents.length})</h2>
                            <button onClick={() => downloadReport(placedStudents, 'Placed_Students')} className='text-sm text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg border border-green-200'>Export Excel</button>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {placedStudents.map((item, i) => (
                                <div key={i} className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                                    <div className='flex items-center gap-3 mb-3'>
                                        <div className='w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold'>
                                            {item.userId.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className='font-semibold text-gray-800'>{item.userId.name}</p>
                                            <p className='text-xs text-gray-500'>{item.userId.dept} · {item.userId.registerNumber}</p>
                                        </div>
                                    </div>
                                    <div className='border-t pt-2 mt-2'>
                                        <p className='text-sm font-medium text-gray-700'>{item.companyId.name}</p>
                                        <p className='text-xs text-gray-500'>{item.jobId.title}</p>
                                        <p className='text-xs font-semibold text-green-600 mt-1'>Package: ₹{item.jobId.salary}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* UNPLACED STUDENTS TAB */}
                {activeTab === 'Unplaced' && (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='p-4 border-b flex justify-between items-center'>
                            <h2 className='font-semibold'>Unplaced Students ({unplacedStudents.length})</h2>
                            <button onClick={() => downloadReport(unplacedStudents, 'Unplaced_Students')} className='text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200'>Export Excel</button>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm text-left text-gray-500'>
                                <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
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
                                        <tr key={i} className='bg-white border-b hover:bg-gray-50'>
                                            <td className='px-6 py-4 font-medium text-gray-900'>{student.name}</td>
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
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='p-4 border-b flex flex-col sm:flex-row gap-4 justify-between'>
                            <h2 className='font-semibold'>All Students</h2>
                            <input type="text" placeholder='Search students...' className='border rounded-lg px-3 py-1.5 text-sm w-full sm:w-64'
                                onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className='overflow-x-auto h-[600px]'>
                            <table className='w-full text-sm text-left text-gray-500'>
                                <thead className='text-xs text-gray-700 uppercase bg-gray-50 sticky top-0'>
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
                                        <tr key={i} className='bg-white border-b hover:bg-gray-50'>
                                            <td className='px-6 py-4 font-medium text-gray-900'>{student.name}</td>
                                            <td className='px-6 py-4'>{student.registerNumber}</td>
                                            <td className='px-6 py-4'>{student.dept}</td>
                                            <td className='px-6 py-4'>{student.cgpa}</td>
                                            <td className='px-6 py-4'>
                                                <button onClick={() => { setEditingStudent(student); setShowEditModal(true) }} className='text-blue-600 hover:underline'>Edit</button>
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
                        {/* Create Group */}
                        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
                            <h3 className='font-semibold mb-4'>Create New Group</h3>
                            <div className='flex gap-4 items-end'>
                                <div className='flex-1'>
                                    <label className='text-xs text-gray-500 mb-1 block'>Group Name</label>
                                    <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className='w-full border rounded px-3 py-2 text-sm' placeholder='e.g. Elite Coders 2024' />
                                </div>
                                <div className='flex-[2]'>
                                    <label className='text-xs text-gray-500 mb-1 block'>Description</label>
                                    <input type="text" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} className='w-full border rounded px-3 py-2 text-sm' placeholder='Description...' />
                                </div>
                                <button onClick={handleCreateGroup} className='bg-black text-white px-5 py-2 rounded text-sm hover:bg-gray-800 transition'>Create</button>
                            </div>
                        </div>

                        {/* Groups List */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {groups.map((group, i) => (
                                <div key={i} className='bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition'>
                                    <div className='flex justify-between items-start mb-2'>
                                        <h3 className='font-bold text-lg'>{group.name}</h3>
                                        <span className='bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full font-medium'>{group.members.length} Members</span>
                                    </div>
                                    <p className='text-gray-500 text-sm mb-4 line-clamp-2'>{group.description}</p>
                                    <button onClick={() => { setSelectedGroup(group); setShowGroupModal(true) }} className='w-full py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 transition'>Manage Members</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* REQUESTS TAB */}
                {activeTab === 'Requests' && (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <div className='p-4 border-b'>
                            <h2 className='font-semibold'>Student Change Requests</h2>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm text-left text-gray-500'>
                                <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
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
                                        <tr key={i} className='bg-white border-b hover:bg-gray-50'>
                                            <td className='px-6 py-4 font-medium text-gray-900'>{req.studentId?.name}</td>
                                            <td className='px-6 py-4 capitalize'>{req.fieldName}</td>
                                            <td className='px-6 py-4 text-gray-400'>{req.currentValue || '-'}</td>
                                            <td className='px-6 py-4 font-medium text-blue-600'>{req.requestedValue}</td>
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
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div onClick={() => downloadReport(students, 'All_Students')} className='bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center cursor-pointer hover:shadow-md hover:border-blue-200 transition'>
                            <div className='text-4xl mb-4'>👥</div>
                            <h3 className='font-semibold'>All Students Report</h3>
                            <p className='text-sm text-gray-500 mt-2'>Download complete student database</p>
                        </div>
                        <div onClick={() => downloadReport(placedStudents, 'Placed_Students')} className='bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center cursor-pointer hover:shadow-md hover:border-green-200 transition'>
                            <div className='text-4xl mb-4'>✅</div>
                            <h3 className='font-semibold'>Placement Report</h3>
                            <p className='text-sm text-gray-500 mt-2'>Download list of placed students</p>
                        </div>
                        <div onClick={() => downloadReport(unplacedStudents, 'Unplaced_Students')} className='bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center cursor-pointer hover:shadow-md hover:border-red-200 transition'>
                            <div className='text-4xl mb-4'>⏳</div>
                            <h3 className='font-semibold'>Unplaced Report</h3>
                            <p className='text-sm text-gray-500 mt-2'>Download list of students seeking jobs</p>
                        </div>
                    </div>
                )}

            </div>

            {/* EDIT STUDENT MODAL */}
            {showEditModal && editingStudent && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-xl p-6 w-full max-w-lg'>
                        <h3 className='text-lg font-bold mb-4'>Edit Student</h3>
                        <form onSubmit={handleUpdateStudent} className='space-y-4'>
                            <div>
                                <label className='text-sm text-gray-600'>Name</label>
                                <input className='w-full border rounded px-3 py-2' value={editingStudent.name} onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })} disabled />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm text-gray-600'>Register Number</label>
                                    <input className='w-full border rounded px-3 py-2' value={editingStudent.registerNumber || ''} onChange={e => setEditingStudent({ ...editingStudent, registerNumber: e.target.value })} />
                                </div>
                                <div>
                                    <label className='text-sm text-gray-600'>Department</label>
                                    <input className='w-full border rounded px-3 py-2' value={editingStudent.dept || ''} onChange={e => setEditingStudent({ ...editingStudent, dept: e.target.value })} />
                                </div>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='text-sm text-gray-600'>CGPA</label>
                                    <input className='w-full border rounded px-3 py-2' type="number" step="0.01" value={editingStudent.cgpa || ''} onChange={e => setEditingStudent({ ...editingStudent, cgpa: e.target.value })} />
                                </div>
                            </div>
                            <div className='flex justify-end gap-3 mt-4'>
                                <button type='button' onClick={() => setShowEditModal(false)} className='px-4 py-2 border rounded text-gray-600 hover:bg-gray-50'>Cancel</button>
                                <button type='submit' className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MANAGE GROUP MEMBERS MODAL */}
            {showGroupModal && selectedGroup && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-xl p-6 w-full max-w-2xl h-[80vh] flex flex-col'>
                        <div className='flex justify-between items-start mb-4'>
                            <div>
                                <h3 className='text-lg font-bold'>{selectedGroup.name}</h3>
                                <p className='text-sm text-gray-500'>Manage Members</p>
                            </div>
                            <button onClick={() => setShowGroupModal(false)} className='text-gray-400 hover:text-gray-600 text-xl'>&times;</button>
                        </div>

                        {/* Search and Add */}
                        <div className='mb-4 relative'>
                            <input
                                type="text"
                                placeholder='Search and click to add student...'
                                className='w-full border rounded px-4 py-2 pl-10'
                                value={memberSearch}
                                onChange={e => setMemberSearch(e.target.value)}
                            />
                            <span className='absolute left-3 top-2.5 text-gray-400'>🔍</span>
                            {/* Search Results Dropdown */}
                            {memberSearch && (
                                <div className='absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto z-10'>
                                    {students.filter(s => s.name?.toLowerCase().includes(memberSearch.toLowerCase()) && !selectedGroup.members.some(m => m._id === s._id)).map(student => (
                                        <div key={student._id} onClick={() => { handleAddMember(student._id); setMemberSearch('') }} className='p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 flex justify-between items-center'>
                                            <div>
                                                <p className='font-medium text-sm'>{student.name}</p>
                                                <p className='text-xs text-gray-500'>{student.registerNumber} · {student.dept}</p>
                                            </div>
                                            <span className='text-blue-600 text-xs font-bold'>+ ADD</span>
                                        </div>
                                    ))}
                                    {students.filter(s => s.name?.toLowerCase().includes(memberSearch.toLowerCase()) && !selectedGroup.members.some(m => m._id === s._id)).length === 0 && (
                                        <div className='p-3 text-sm text-gray-400 text-center'>No matching students found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Members List */}
                        <div className='flex-1 overflow-y-auto border rounded-lg'>
                            <table className='w-full text-sm text-left text-gray-500'>
                                <thead className='text-xs text-gray-700 uppercase bg-gray-50 sticky top-0'>
                                    <tr>
                                        <th className='px-4 py-3'>Name</th>
                                        <th className='px-4 py-3'>Reg No</th>
                                        <th className='px-4 py-3'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedGroup.members.length > 0 ? selectedGroup.members.map((member, i) => (
                                        <tr key={i} className='border-b hover:bg-gray-50 bg-white'>
                                            <td className='px-4 py-3'>{member.name}</td>
                                            <td className='px-4 py-3'>{member.registerNumber}</td>
                                            <td className='px-4 py-3'>
                                                <button onClick={() => handleRemoveMember(member._id)} className='text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 px-2 py-1 rounded hover:bg-red-50'>REMOVE</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" className='text-center py-10 text-gray-400'>No members active in this group</td></tr>
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
