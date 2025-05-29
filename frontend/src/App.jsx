import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage'
import LoginSignup from './pages/LoginSignup'
import RTIGenerator from './pages/RTIGenerator'
import ScamReport from './pages/ScamReport'
import AdminDashboard from './pages/AdminDashboard';
import GovJobRadar from './pages/GovJobRadar'
import './index.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/rti" element={<RTIGenerator />} />
        <Route path="/scam" element={<ScamReport />} />
        <Route path="/govt-job" element={<GovJobRadar />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App