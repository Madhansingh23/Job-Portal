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
                { title, description, location, salary, category, level, minCGPA, targetBatch, eligibleDepts, eligibleGroups, rounds },
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
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }


    }


    useEffect(() => {
        // Initiate Qill only once
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

    return (
        <form onSubmit={onSubmitHandler} className='container p-4 flex flex-col w-full items-start gap-3'>

            <div className='w-full'>
                <p className='mb-2'>Job Title</p>
                <input type="text" placeholder='Type here'
                    onChange={e => setTitle(e.target.value)} value={title}
                    required
                    className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded'
                />
            </div>

            <div className='w-full max-w-lg'>
                <p className='my-2'>Job Description</p>
                <div ref={editorRef}>

                </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

                <div>
                    <p className='mb-2'>Job Category</p>
                    <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setCategory(e.target.value)}>
                        {JobCategories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <p className='mb-2'>Job Location</p>
                    <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setLocation(e.target.value)}>
                        {JobLocations.map((location, index) => (
                            <option key={index} value={location}>{location}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <p className='mb-2'>Job Level</p>
                    <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setLevel(e.target.value)}>
                        <option value="Beginner level">Beginner level</option>
                        <option value="Intermediate level">Intermediate level</option>
                        <option value="Senior level">Senior level</option>
                    </select>
                </div>

            </div>
            <div>
                <p className='mb-2'>Job Salary</p>
                <input min={0} className='w-full px-3 py-2 border-2 border-gray-300 rounded sm:w-[120px]' onChange={e => setSalary(e.target.value)} type="Number" placeholder='2500' />
            </div>

            <div className='w-full'>
                <p className='mb-2'>Eligibility Constraints</p>
                <div className='flex gap-4 flex-wrap'>
                    <input type="number" step="0.1" placeholder='Min CGPA (e.g. 7.5)'
                        className='px-3 py-2 border-2 border-gray-300 rounded'
                        value={minCGPA} onChange={e => setMinCGPA(e.target.value)}
                    />
                    <input type="text" placeholder='Target Batch (e.g. 2025)'
                        className='px-3 py-2 border-2 border-gray-300 rounded'
                        value={targetBatch} onChange={e => setTargetBatch(e.target.value)}
                    />
                    <input type="text" placeholder='Eligible Depts (comma sep)'
                        className='px-3 py-2 border-2 border-gray-300 rounded w-full max-w-xs'
                        onChange={e => setEligibleDepts(e.target.value.split(',').map(s => s.trim()))}
                    />
                </div>
            </div>

            <div className='w-full'>
                <p className='mb-2'>Target Groups (Optional)</p>
                <div className='flex gap-4 flex-wrap'>
                    {groups.length > 0 ? groups.map((group) => (
                        <div key={group._id} className='flex items-center gap-2'>
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
                                className='w-4 h-4'
                            />
                            <label htmlFor={`group-${group._id}`} className='text-sm select-none cursor-pointer'>{group.name}</label>
                        </div>
                    )) : <p className='text-sm text-gray-400'>No groups available</p>}
                </div>
            </div>

            <div className='w-full max-w-lg'>
                <p className='mb-2'>Recruitment Rounds</p>
                <div className='flex gap-2 mb-2'>
                    <input
                        type="text"
                        placeholder='Add Round (e.g. Aptitude)'
                        className='px-3 py-2 border-2 border-gray-300 rounded w-full'
                        value={currentRoundInput}
                        onChange={e => setCurrentRoundInput(e.target.value)}
                    />
                    <button type='button' onClick={handleAddRound} className='bg-blue-600 text-white px-4 py-2 rounded'>Add</button>
                </div>
                <div className='flex flex-wrap gap-2'>
                    {rounds.map((round, index) => (
                        <div key={index} className='bg-gray-100 px-3 py-1 rounded flex items-center gap-2 border border-gray-300'>
                            <span>{index + 1}. {round}</span>
                            <span onClick={() => handleRemoveRound(index)} className='text-red-500 cursor-pointer font-bold'>x</span>
                        </div>
                    ))}
                </div>
            </div>

            <button className='w-28 py-3 mt-4 bg-black text-white rounded'>ADD</button>
        </form>
    )
}

export default AddJob