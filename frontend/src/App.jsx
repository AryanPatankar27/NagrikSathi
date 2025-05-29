import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage'
import LoginSignup from './pages/LoginSignup'
import RTIGenerator from './pages/RTIGenerator'
import ScamReport from './pages/ScamReport'
import AdminDashboard from './pages/AdminDashboard';
import GovJobRadar from './pages/GovJobRadar';
import AdminLogin from './pages/AdminLogin';
import HomePage from './pages/HomePage';
import CivicIssuesPage from './pages/CivicIssuesPage';
import './index.css'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/rti" element={<RTIGenerator />} />
        <Route path="/scam" element={<ScamReport />} />
        <Route path="/report-issue" element={<CivicIssuesPage />} />
        <Route path="/govt-job" element={<GovJobRadar />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
}

export default App