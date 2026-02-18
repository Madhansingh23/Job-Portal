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

    const jobsPerPage = 6

    return (
        <div className='container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8'>

            {/* Sidebar */}
            <div className='w-full lg:w-1/4 bg-white px-4'>

                {/*  Search Filter from Hero Component */}
                {
                    isSearched && (searchFilter.title !== "" || searchFilter.location !== "") && (
                        <>
                            <h3 className='font-medium text-lg mb-4'>Current Search</h3>
                            <div className='mb-4 text-gray-600'>
                                {searchFilter.title && (
                                    <span className='inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded'>
                                        {searchFilter.title}
                                        <img onClick={e => setSearchFilter(prev => ({ ...prev, title: "" }))} className='cursor-pointer' src={assets.cross_icon} alt="" />
                                    </span>
                                )}
                                {searchFilter.location && (
                                    <span className='ml-2 inline-flex items-center gap-2.5 bg-red-50 border border-red-200 px-4 py-1.5 rounded'>
                                        {searchFilter.location}
                                        <img onClick={e => setSearchFilter(prev => ({ ...prev, location: "" }))} className='cursor-pointer' src={assets.cross_icon} alt="" />
                                    </span>
                                )}
                            </div>
                        </>
                    )
                }

                <div className='flex items-center justify-between lg:hidden mb-3'>
                    <button onClick={e => setShowFilter(prev => !prev)} className='px-6 py-1.5 rounded border border-gray-400'>
                        {showFilter ? "Close" : "Filters"}
                        {activeFilterCount > 0 && <span className='ml-1.5 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5'>{activeFilterCount}</span>}
                    </button>
                    {activeFilterCount > 0 && (
                        <button onClick={clearAllFilters} className='text-sm text-red-500 hover:underline'>Clear All</button>
                    )}
                </div>

                <div className={showFilter ? "" : "max-lg:hidden"}>

                    {/* Clear all - desktop */}
                    {activeFilterCount > 0 && (
                        <button onClick={clearAllFilters} className='text-sm text-red-500 hover:underline mb-4 max-lg:hidden'>Clear All Filters ({activeFilterCount})</button>
                    )}

                    {/* Category Filter */}
                    <h4 className='font-medium text-lg py-4'>Category</h4>
                    <ul className='space-y-3 text-gray-600 text-sm'>
                        {JobCategories.map((category, index) => (
                            <li className='flex gap-3 items-center' key={index}>
                                <input
                                    className='scale-125 accent-blue-600'
                                    type="checkbox"
                                    onChange={() => handleCategoryChange(category)}
                                    checked={selectedCategories.includes(category)}
                                />
                                {category}
                            </li>
                        ))}
                    </ul>

                    {/* Location Filter */}
                    <h4 className='font-medium text-lg py-4 pt-8'>Location</h4>
                    <ul className='space-y-3 text-gray-600 text-sm'>
                        {JobLocations.map((location, index) => (
                            <li className='flex gap-3 items-center' key={index}>
                                <input
                                    className='scale-125 accent-blue-600'
                                    type="checkbox"
                                    onChange={() => handleLocationChange(location)}
                                    checked={selectedLocations.includes(location)}
                                />
                                {location}
                            </li>
                        ))}
                    </ul>

                    {/* Level Filter */}
                    <h4 className='font-medium text-lg py-4 pt-8'>Job Level</h4>
                    <ul className='space-y-3 text-gray-600 text-sm'>
                        {jobLevels.map((level, index) => (
                            <li className='flex gap-3 items-center' key={index}>
                                <input
                                    className='scale-125 accent-blue-600'
                                    type="checkbox"
                                    onChange={() => handleLevelChange(level)}
                                    checked={selectedLevels.includes(level)}
                                />
                                {level}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Job listings */}
            <section className='w-full lg:w-3/4 text-gray-800 max-lg:px-4'>

                {/* Header with stats */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                    <div>
                        <h3 className='font-bold text-2xl text-gray-800' id='job-list'>Campus Placements</h3>
                        <p className='text-gray-500 text-sm mt-1'>
                            {filteredJobs.length} {filteredJobs.length === 1 ? 'opportunity' : 'opportunities'} available
                            {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active)`}
                        </p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <label className='text-sm text-gray-500'>Sort:</label>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className='border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100'
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="salary-high">Salary: High to Low</option>
                            <option value="salary-low">Salary: Low to High</option>
                        </select>
                    </div>
                </div>

                {/* Time Filter Tabs */}
                <div className='flex flex-wrap gap-2 mb-6'>
                    {timeFilterOptions.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setTimeFilter(opt.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${timeFilter === opt.key
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                        >
                            {opt.label}
                            {opt.key !== 'all' && (
                                <span className='ml-1.5 text-xs opacity-75'>
                                    ({jobs.filter(j => {
                                        const diff = Date.now() - j.date
                                        if (opt.key === '24h') return diff <= 86400000
                                        if (opt.key === '7d') return diff <= 604800000
                                        if (opt.key === '30d') return diff <= 2592000000
                                        return true
                                    }).length})
                                </span>
                            )}
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
                    <div className='flex items-center justify-center space-x-2 mt-10'>
                        <a href="#job-list">
                            <button
                                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                                className='w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-30'
                                disabled={currentPage === 1}
                            >
                                <img src={assets.left_arrow_icon} alt="" className="w-4" />
                            </button>
                        </a>
                        {Array.from({ length: Math.ceil(filteredJobs.length / jobsPerPage) }).map((_, index) => (
                            <a key={index} href="#job-list">
                                <button onClick={() => setCurrentPage(index + 1)} className={`w-10 h-10 flex items-center justify-center border rounded-lg transition font-medium ${currentPage === index + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{index + 1}</button>
                            </a>
                        ))}
                        <a href="#job-list">
                            <button
                                onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(filteredJobs.length / jobsPerPage)))}
                                className='w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-30'
                                disabled={currentPage === Math.ceil(filteredJobs.length / jobsPerPage)}
                            >
                                <img src={assets.right_arrow_icon} alt="" className="w-4" />
                            </button>
                        </a>
                    </div>
                )}

            </section>

        </div>
    )
}

export default JobListing