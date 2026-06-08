import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './index.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import StartPage from './pages/StartPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import DisclaimerPage from './pages/legal/DisclaimerPage';

import FreeGuidePage from './pages/FreeGuidePage';
import ReportGuidePage from './pages/ReportGuidePage';

import ReportRecoveryPage from './pages/ReportRecoveryPage';
import ScrollToTop from './components/ScrollToTop';
import PremiumUploadPage from './pages/PremiumUploadPage';
import AdminDashboard from './pages/AdminDashboard';

import PensionCalculatorPage from './pages/calculator/PensionCalculatorPage';

function App() {
  return (
    <div className="App">
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/start" element={<StartPage />} />

        <Route path="/free-guide" element={<FreeGuidePage />} />
        <Route path="/report-guide" element={<ReportGuidePage />} />

        <Route path="/calculator" element={<PensionCalculatorPage />} />

        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/report-recovery" element={<ReportRecoveryPage />} />
        <Route path="/premium-upload" element={<PremiumUploadPage />} />
        <Route path="/$Sp83199" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;