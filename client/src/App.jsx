import { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import RecruiterLogin from './pages/RecruiterLogin'
import { AppContext } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import RecruiterDashboard from './pages/RecruiterDashboard'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import 'quill/dist/quill.snow.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login'
import CoordinatorLogin from './pages/CoordinatorLogin'
import CoordinatorDashboard from './pages/CoordinatorDashboard'
import Profile from './pages/Profile'
import StudentNotices from './pages/StudentNotices'
import RecruiterProfile from './pages/RecruiterProfile'
import CoordinatorProfile from './pages/CoordinatorProfile'

const App = () => {

  const { companyToken } = useContext(AppContext)

  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/recruiter-login' element={<RecruiterLogin />} />
        <Route path='/apply-job/:id' element={<ApplyJob />} />
        <Route path='/applications' element={<Applications />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/coordinator-login' element={<CoordinatorLogin />} />
        <Route path='/dashboard/coordinator' element={<CoordinatorDashboard />} />
        <Route path='/coordinator-profile' element={<CoordinatorProfile />} />
        <Route path='/notices' element={<StudentNotices />} />
        <Route path='/dashboard' element={<Dashboard />}>
          {
            companyToken ? <>
              <Route path='home' element={<RecruiterDashboard />} />
              <Route path='add-job' element={<AddJob />} />
              <Route path='manage-jobs' element={<ManageJobs />} />
              <Route path='view-applications' element={<ViewApplications />} />
              <Route path='profile' element={<RecruiterProfile />} />
            </> : null
          }
        </Route>
      </Routes>
    </div>
  )
}

export default App