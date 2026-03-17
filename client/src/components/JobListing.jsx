import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets, JobCategories, JobLocations } from '../assets/assets'
import JobCard from './JobCard'
import moment from 'moment'

const JobListing = () => {

    const { isSearched, searchFilter, setSearchFilter, jobs } = useContext(AppContext)

    const [showFilter, setShowFilter] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedLocations, setSelectedLocations] = useState([])
    const [selectedLevels, setSelectedLevels] = useState([])
    const [timeFilter, setTimeFilter] = useState('all') // 'all' | '24h' | '7d' | '30d'
    const [sortBy, setSortBy] = useState('newest') // 'newest' | 'oldest' | 'salary-high' | 'salary-low'

    const [filteredJobs, setFilteredJobs] = useState(jobs)

    const jobLevels = ['Entry Level', 'Intermediate Level', 'Senior Level', 'Internship']

    const timeFilterOptions = [
        { key: 'all', label: 'All Jobs' },
        { key: '24h', label: 'Last 24 Hours' },
        { key: '7d', label: 'Last 7 Days' },
        { key: '30d', label: 'Last 30 Days' },
    ]

    const handleCategoryChange = (category) => {
        setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category])
    }

    const handleLocationChange = (location) => {
        setSelectedLocations(prev => prev.includes(location) ? prev.filter(c => c !== location) : [...prev, location])
    }

    const handleLevelChange = (level) => {
        setSelectedLevels(prev => prev.includes(level) ? prev.filter(c => c !== level) : [...prev, level])
    }

    const clearAllFilters = () => {
        setSelectedCategories([])
        setSelectedLocations([])
        setSelectedLevels([])
        setTimeFilter('all')
        setSortBy('newest')
        setSearchFilter({ title: '', location: '' })
    }

    useEffect(() => {
        const now = Date.now()

        const matchesCategory = job => selectedCategories.length === 0 || selectedCategories.includes(job.category)
        const matchesLocation = job => selectedLocations.length === 0 || selectedLocations.includes(job.location)
        const matchesLevel = job => selectedLevels.length === 0 || selectedLevels.includes(job.level)
        const matchesTitle = job => searchFilter.title === "" || job.title.toLowerCase().includes(searchFilter.title.toLowerCase())
        const matchesSearchLocation = job => searchFilter.location === "" || job.location.toLowerCase().includes(searchFilter.location.toLowerCase())

        const matchesTime = job => {
            if (timeFilter === 'all') return true
            const jobDate = job.date
            const diff = now - jobDate
            if (timeFilter === '24h') return diff <= 24 * 60 * 60 * 1000
            if (timeFilter === '7d') return diff <= 7 * 24 * 60 * 60 * 1000
            if (timeFilter === '30d') return diff <= 30 * 24 * 60 * 60 * 1000
            return true
        }

        let result = jobs.filter(
            job => matchesCategory(job) && matchesLocation(job) && matchesLevel(job)
                && matchesTitle(job) && matchesSearchLocation(job) && matchesTime(job)
        )

        // Sorting
        if (sortBy === 'newest') result.sort((a, b) => b.date - a.date)
        else if (sortBy === 'oldest') result.sort((a, b) => a.date - b.date)
        else if (sortBy === 'salary-high') result.sort((a, b) => b.salary - a.salary)
        else if (sortBy === 'salary-low') result.sort((a, b) => a.salary - b.salary)

        setFilteredJobs(result)
        setCurrentPage(1)
    }, [jobs, selectedCategories, selectedLocations, selectedLevels, searchFilter, timeFilter, sortBy])

    const activeFilterCount = selectedCategories.length + selectedLocations.length + selectedLevels.length + (timeFilter !== 'all' ? 1 : 0)

    const jobsPerPage = 50

    return (
        <div className='container 2xl:px-20 mx-auto flex flex-col lg:flex-row gap-8 py-10'>

            {/* Sidebar */}
            <div className='w-full lg:w-[300px] flex-shrink-0 animate-fade-in'>
                <div className='glass-card p-6 sticky top-24'>

                {/*  Search Filter from Hero Component */}
                {
                    isSearched && (searchFilter.title !== "" || searchFilter.location !== "") && (
                        <div className='mb-8 animate-slide-up'>
                            <h3 className='font-bold text-slate-800 dark:text-white mb-4 text-xs uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-lg inline-block'>Current Search</h3>
                            <div className='flex flex-wrap gap-2'>
                                {searchFilter.title && (
                                    <span className='inline-flex items-center gap-2 bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition-all hover:bg-blue-600/20 group'>
                                        {searchFilter.title}
                                        <img onClick={e => setSearchFilter(prev => ({ ...prev, title: "" }))} className='w-3 h-3 cursor-pointer dark:invert opacity-50 group-hover:opacity-100 transition' src={assets.cross_icon} alt="" />
                                    </span>
                                )}
                                {searchFilter.location && (
                                    <span className='inline-flex items-center gap-2 bg-rose-600/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition-all hover:bg-rose-600/20 group'>
                                        {searchFilter.location}
                                        <img onClick={e => setSearchFilter(prev => ({ ...prev, location: "" }))} className='w-3 h-3 cursor-pointer dark:invert opacity-50 group-hover:opacity-100 transition' src={assets.cross_icon} alt="" />
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                }

                <div className='flex items-center justify-between lg:hidden mb-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50'>
                    <button 
                        onClick={e => setShowFilter(prev => !prev)} 
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${showFilter ? 'bg-royal-blue text-white shadow-lg' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600'}`}
                    >
                        <span>{showFilter ? "Hide Filters" : "Show Filters"}</span>
                        {activeFilterCount > 0 && <span className='bg-blue-600/20 text-blue-600 dark:text-blue-300 rounded-full px-2 py-0.5 text-[9px]'>{activeFilterCount}</span>}
                        <img src={assets.dropdown_icon} className={`w-2.5 transition-transform duration-300 ${showFilter ? 'rotate-180 brightness-0 invert' : 'opacity-40'}`} alt="" />
                    </button>
                    {activeFilterCount > 0 && (
                        <button onClick={clearAllFilters} className='text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 px-4'>Clear</button>
                    )}
                </div>

                <div className={`${showFilter ? "block animate-fade-in" : "hidden lg:block"} transition-all duration-300`}>

                    {/* Category Filter */}
                    <div className='mb-8 animate-slide-up' style={{animationDelay: '100ms'}}>
                        <h4 className='font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-5 flex items-center gap-2'>
                            <span className='w-1.5 h-1.5 rounded-full bg-blue-600'></span>
                            Category
                        </h4>
                        <ul className='space-y-3'>
                        {JobCategories.map((category, index) => (
                            <li className='flex gap-3 items-center group' key={index}>
                                <input
                                    className='w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-royal-blue focus:ring-royal-blue dark:bg-slate-700 dark:checked:bg-blue-600 cursor-pointer transition-colors accent-blue-600'
                                    type="checkbox"
                                    onChange={() => handleCategoryChange(category)}
                                    checked={selectedCategories.includes(category)}
                                    id={`cat-${index}`}
                                />
                                <label htmlFor={`cat-${index}`} className='cursor-pointer flex-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors'>{category}</label>
                            </li>
                        ))}
                        </ul>
                    </div>

                    {/* Location Filter */}
                    <div className='mb-8 animate-slide-up' style={{animationDelay: '200ms'}}>
                        <h4 className='font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-5 flex items-center gap-2'>
                            <span className='w-1.5 h-1.5 rounded-full bg-indigo-600'></span>
                            Location
                        </h4>
                        <ul className='space-y-3'>
                        {JobLocations.map((location, index) => (
                            <li className='flex gap-3 items-center group' key={index}>
                                <input
                                    className='w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-royal-blue focus:ring-royal-blue dark:bg-slate-700 dark:checked:bg-blue-600 cursor-pointer transition-colors accent-blue-600'
                                    type="checkbox"
                                    onChange={() => handleLocationChange(location)}
                                    checked={selectedLocations.includes(location)}
                                    id={`loc-${index}`}
                                />
                                <label htmlFor={`loc-${index}`} className='cursor-pointer flex-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors'>{location}</label>
                            </li>
                        ))}
                        </ul>
                    </div>

                    {/* Level Filter */}
                    <div className='animate-slide-up' style={{animationDelay: '300ms'}}>
                        <h4 className='font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-5 flex items-center gap-2'>
                            <span className='w-1.5 h-1.5 rounded-full bg-emerald-600'></span>
                            Job Level
                        </h4>
                        <ul className='space-y-3'>
                        {jobLevels.map((level, index) => (
                            <li className='flex gap-3 items-center group' key={index}>
                                <input
                                    className='w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-royal-blue focus:ring-royal-blue dark:bg-slate-700 dark:checked:bg-blue-600 cursor-pointer transition-colors accent-blue-600'
                                    type="checkbox"
                                    onChange={() => handleLevelChange(level)}
                                    checked={selectedLevels.includes(level)}
                                    id={`lvl-${index}`}
                                />
                                <label htmlFor={`lvl-${index}`} className='cursor-pointer flex-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors'>{level}</label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>

            {/* Job listings */}
            <section className='flex-1 text-gray-800 max-lg:px-4'>

                {/* Header with stats */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8'>
                    <div className='animate-slide-up'>
                        <h3 className='font-black text-3xl text-slate-800 dark:text-white tracking-tight' id='job-list'>Campus Opportunities</h3>
                        <p className='text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium flex items-center gap-2'>
                            <span className='w-2 h-2 rounded-full bg-emerald-500'></span>
                            {filteredJobs.length} {filteredJobs.length === 1 ? 'opening' : 'openings'} matches your profile
                        </p>
                    </div>
                    <div className='flex items-center gap-3 animate-slide-up'>
                        <label className='text-xs font-black uppercase tracking-widest text-slate-400'>Sort</label>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className='border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm cursor-pointer font-bold transition-all hover:border-blue-500/40'
                        >
                            <option value="newest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="salary-high">Top Paying</option>
                            <option value="salary-low">Entry Salary</option>
                        </select>
                    </div>
                </div>

                {/* Time Filter Tabs */}
                <div className='flex flex-wrap gap-2 mb-8 animate-slide-up' style={{animationDelay: '100ms'}}>
                    {timeFilterOptions.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setTimeFilter(opt.key)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${timeFilter === opt.key
                                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xl shadow-blue-500/10'
                                : 'bg-white/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700/50'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Job Grid */}
                {filteredJobs.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
                        {filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage).map((job, index) => (
                            <JobCard key={index} job={job} />
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-20'>
                        <div className='text-6xl mb-4'>🔍</div>
                        <h4 className='text-xl font-semibold text-gray-700 mb-2'>No jobs found</h4>
                        <p className='text-gray-500 mb-4'>Try adjusting your filters or search criteria</p>
                        <button onClick={clearAllFilters} className='text-blue-600 font-medium hover:underline'>Clear all filters</button>
                    </div>
                )}

                {/* Pagination */}
                {filteredJobs.length > jobsPerPage && (
                    <div className='flex items-center justify-center gap-3 mt-16 animate-fade-in'>
                        <a href="#job-list">
                            <button
                                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                                className='w-12 h-12 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-20 shadow-sm'
                                disabled={currentPage === 1}
                            >
                                <img src={assets.left_arrow_icon} alt="" className="w-4 opacity-50" />
                            </button>
                        </a>
                        <div className='flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50'>
                            {Array.from({ length: Math.ceil(filteredJobs.length / jobsPerPage) }).map((_, index) => (
                                <a key={index} href="#job-list">
                                    <button 
                                        onClick={() => setCurrentPage(index + 1)} 
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all font-black text-sm ${currentPage === index + 1 ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                    >
                                        {index + 1}
                                    </button>
                                </a>
                            ))}
                        </div>
                        <a href="#job-list">
                            <button
                                onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(filteredJobs.length / jobsPerPage)))}
                                className='w-12 h-12 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-20 shadow-sm'
                                disabled={currentPage === Math.ceil(filteredJobs.length / jobsPerPage)}
                            >
                                <img src={assets.right_arrow_icon} alt="" className="w-4 opacity-50" />
                            </button>
                        </a>
                    </div>
                )}

            </section>

        </div>
    )
}

export default JobListing