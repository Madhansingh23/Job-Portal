import { useContext, useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const AddJob = () => {

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('Madurai');
    const [category, setCategory] = useState('Programming');
    const [level, setLevel] = useState('Beginner level');
    const [offerType, setOfferType] = useState('Direct FTE');
    const [salary, setSalary] = useState(0);

    // New Constraints
    const [minCGPA, setMinCGPA] = useState(0);
    const [targetBatch, setTargetBatch] = useState('');
    const [eligibleDepts, setEligibleDepts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [eligibleGroups, setEligibleGroups] = useState([]);

    // Dynamic Rounds
    const [rounds, setRounds] = useState(['Round 1', 'Round 2', 'HR Round']);
    const [currentRoundInput, setCurrentRoundInput] = useState('');

    const editorRef = useRef(null)
    const quillRef = useRef(null)

    const { backendUrl, companyToken } = useContext(AppContext)

    const handleAddRound = () => {
        if (currentRoundInput.trim()) {
            setRounds([...rounds, currentRoundInput.trim()]);
            setCurrentRoundInput('');
        }
    }

    const handleRemoveRound = (index) => {
        const newRounds = rounds.filter((_, i) => i !== index);
        setRounds(newRounds);
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        try {

            const description = quillRef.current.root.innerHTML

            const { data } = await axios.post(`${backendUrl}/api/company/post-job`,
                { title, description, location, salary, category, level, minCGPA, targetBatch, eligibleDepts, eligibleGroups, rounds, offerType },
                { headers: { token: companyToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setTitle('')
                setSalary(0)
                quillRef.current.root.innerHTML = ""
                setRounds(['Round 1', 'Round 2', 'HR Round'])
                setEligibleGroups([])
                setEligibleDepts([])
                setMinCGPA(0)
                setMinTenthMarks(0)
                setMinTwelfthMarks(0)
                setMaxArrears('')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }


    }


    useEffect(() => {
        // Initiate Quill only once
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
            })
        }
    }, [])

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/company/groups`, { headers: { token: companyToken } })
                if (data.success) {
                    setGroups(data.groups)
                }
            } catch (error) {
                toast.error(error.message)
            }
        }
        if (companyToken) fetchGroups()
    }, [companyToken, backendUrl])

    const inputClass = 'w-full px-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400'
    const labelClass = 'text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 block'

    return (
        <div className='max-w-4xl animate-fade-in'>
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3'>
                    <span className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-blue-200 dark:shadow-none'>➕</span>
                    Post a New Job
                </h1>
                <p className='text-sm text-slate-500 mt-2'>Fill in the details below to create a new job listing.</p>
            </div>

            <form onSubmit={onSubmitHandler} className='space-y-6'>

                {/* Job Title */}
                <div className='bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm'>
                    <h3 className='text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2'>
                        <span className='w-1 h-5 bg-blue-600 rounded-full'></span>
                        Basic Information
                    </h3>
                    <div className='space-y-4'>
                        <div>
                            <label className={labelClass}>Job Title *</label>
                            <input type="text" placeholder='e.g. Software Developer'
                                onChange={e => setTitle(e.target.value)} value={title}
                                required className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Job Description *</label>
                            <div className='rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700'>
                                <div ref={editorRef}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Job Details Grid */}
                <div className='bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm'>
                    <h3 className='text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2'>
                        <span className='w-1 h-5 bg-indigo-600 rounded-full'></span>
                        Job Details
                    </h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        <div>
                            <label className={labelClass}>Category</label>
                            <select className={inputClass} onChange={e => setCategory(e.target.value)}>
                                {JobCategories.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Location</label>
                            <select className={inputClass} onChange={e => setLocation(e.target.value)}>
                                {JobLocations.map((location, index) => (
                                    <option key={index} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Level</label>
                            <select className={inputClass} onChange={e => setLevel(e.target.value)}>
                                <option value="Beginner level">Beginner level</option>
                                <option value="Intermediate level">Intermediate level</option>
                                <option value="Senior level">Senior level</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Offer Type</label>
                            <select className={inputClass} onChange={e => setOfferType(e.target.value)}>
                                <option value="Direct FTE">Direct FTE</option>
                                <option value="Intern + FTE">Intern + FTE</option>
                                <option value="Trainee + Intern + FTE">Trainee + Intern + FTE</option>
                                <option value="Trainee + FTE">Trainee + FTE</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Salary (₹)</label>
                            <input min={0} className={inputClass} onChange={e => setSalary(e.target.value)} type="Number" placeholder='e.g. 500000' />
                        </div>
                    </div>
                </div>

                {/* Eligibility */}
                <div className='bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm'>
                    <h3 className='text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2'>
                        <span className='w-1 h-5 bg-green-600 rounded-full'></span>
                        Eligibility Constraints
                    </h3>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                        <div>
                            <label className={labelClass}>Min CGPA</label>
                            <input type="number" step="0.1" placeholder='e.g. 7.5'
                                className={inputClass}
                                value={minCGPA} onChange={e => setMinCGPA(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Min 10th Marks (%)</label>
                            <input type="number" step="0.1" placeholder='e.g. 85'
                                className={inputClass}
                                value={minTenthMarks} onChange={e => setMinTenthMarks(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Min 12th Marks (%)</label>
                            <input type="number" step="0.1" placeholder='e.g. 85'
                                className={inputClass}
                                value={minTwelfthMarks} onChange={e => setMinTwelfthMarks(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Max Standing Arrears</label>
                            <input type="number" placeholder='Leave empty for no limit'
                                className={inputClass}
                                value={maxArrears} onChange={e => setMaxArrears(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Target Batch</label>
                            <input type="text" placeholder='e.g. 2025'
                                className={inputClass}
                                value={targetBatch} onChange={e => setTargetBatch(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Eligible Departments</label>
                            <input type="text" placeholder='CSE, IT, ECE...'
                                className={inputClass}
                                onChange={e => setEligibleDepts(e.target.value.split(',').map(s => s.trim()))}
                            />
                        </div>
                    </div>
                </div>

                {/* Target Groups */}
                <div className='bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm'>
                    <h3 className='text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2'>
                        <span className='w-1 h-5 bg-purple-600 rounded-full'></span>
                        Target Groups <span className='text-xs font-normal text-slate-400'>(Optional)</span>
                    </h3>
                    <div className='flex gap-4 flex-wrap'>
                        {groups.length > 0 ? groups.map((group) => (
                            <label key={group._id} htmlFor={`group-${group._id}`}
                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${eligibleGroups.includes(group._id)
                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold'
                                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    id={`group-${group._id}`}
                                    value={group._id}
                                    checked={eligibleGroups.includes(group._id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setEligibleGroups([...eligibleGroups, group._id])
                                        } else {
                                            setEligibleGroups(eligibleGroups.filter(id => id !== group._id))
                                        }
                                    }}
                                    className='w-4 h-4 rounded accent-blue-600'
                                />
                                {group.name}
                            </label>
                        )) : <p className='text-sm text-slate-400 italic'>No groups available</p>}
                    </div>
                </div>

                {/* Recruitment Rounds */}
                <div className='bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm'>
                    <h3 className='text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2'>
                        <span className='w-1 h-5 bg-orange-500 rounded-full'></span>
                        Recruitment Rounds
                    </h3>
                    <div className='flex gap-2 mb-4'>
                        <input
                            type="text"
                            placeholder='Add Round (e.g. Aptitude Test)'
                            className={`${inputClass} flex-1`}
                            value={currentRoundInput}
                            onChange={e => setCurrentRoundInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddRound())}
                        />
                        <button type='button' onClick={handleAddRound} className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95'>
                            Add
                        </button>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                        {rounds.map((round, index) => (
                            <div key={index} className='bg-slate-50 dark:bg-slate-700/50 px-4 py-2 rounded-xl flex items-center gap-3 border border-slate-200 dark:border-slate-600 group hover:border-blue-300 transition'>
                                <span className='w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold'>{index + 1}</span>
                                <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>{round}</span>
                                <button type='button' onClick={() => handleRemoveRound(index)} className='text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-6 h-6 rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100'>✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button className='w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2'>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Post Job Listing
                </button>
            </form>
        </div>
    )
}

export default AddJob