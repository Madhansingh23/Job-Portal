import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || ''
    const backendUrl = rawBackendUrl.replace(/^['"]|['"]$/g, '').replace(/\/+$/, '')

    // Custom Auth State
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [user, setUser] = useState(null)

    // Recruiter/Company State
    const [companyToken, setCompanyToken] = useState(localStorage.getItem('companyToken'))
    const [companyData, setCompanyData] = useState(null)
    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)

    // Job Data
    const [jobs, setJobs] = useState([])
    const [searchFilter, setSearchFilter] = useState({ title: '', location: '' })
    const [isSearched, setIsSearched] = useState(false)

    // User Data
    const [userData, setUserData] = useState(null)
    const [userApplications, setUserApplications] = useState([])

    // Function to Fetch Jobs 
    const fetchJobs = async () => {
        try {
            let data;
            if (token) {
                // Authenticated: get eligibility-filtered jobs
                const response = await axios.post(`${backendUrl}/api/jobs/all`, {}, { headers: { token } })
                data = response.data;
            } else {
                // Public: get all visible jobs (no auth)
                const response = await axios.get(`${backendUrl}/api/jobs/public`)
                data = response.data;
            }
            if (data.success) {
                setJobs(data.jobs)
            } else {
                if (data.message === 'Not Authorized Login Again') {
                    logout()
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to Fetch Company Data
    const fetchCompanyData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/company/company`, { headers: { token: companyToken } })
            if (data.success) {
                setCompanyData(data.company)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to Fetch User Data
    const fetchUserData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/users/user`,
                { headers: { token } })

            if (data.success) {
                setUserData(data.user)
                setUser(data.user)
            } else {
                if (data.message === 'Not Authorized Login Again') {
                    logout()
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to Fetch User's Applied Applications
    const fetchUserApplications = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/users/applications`,
                { headers: { token } }
            )
            if (data.success) {
                setUserApplications(data.applications)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Login / Logout Logic
    const login = (newToken, newUser) => {
        setToken(newToken)
        setUser(newUser)
        localStorage.setItem('token', newToken)
        // Don't call fetchUserData() here — token state hasn't updated yet (stale closure).
        // The useEffect([token]) below will handle fetching once state is committed.
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        setUserData(null)
        localStorage.removeItem('token')
        toast.success("Logged out successfully")
    }

    // Initial Load
    useEffect(() => {
        if (token) {
            fetchUserData()
            fetchUserApplications()
        }
        fetchJobs() // This might need user token to filter correctly, so we call it again inside fetchUserData or valid token check if strict visibility is on.
    }, [token])

    useEffect(() => {
        if (companyToken) {
            fetchCompanyData()
        }
    }, [companyToken])


    const value = {
        setSearchFilter, searchFilter,
        isSearched, setIsSearched,
        jobs, setJobs, fetchJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken, setCompanyToken,
        companyData, setCompanyData,
        backendUrl,
        userData, setUserData,
        userApplications, setUserApplications,
        fetchUserData,
        fetchUserApplications,
        token, setToken,
        user, setUser,
        login, logout
    }

    return (<AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>)

}