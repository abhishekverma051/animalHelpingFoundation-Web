import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CausesSection from './components/CausesSection';
import AboutSection from './components/AboutSection';
import YourImpactSection from './components/YourImpactSection';
import RecognitionSection from './components/RecognitionSection';
import LiveFeedAndStoriesSection from './components/LiveFeedAndStoriesSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import DonateModal from './components/DonateModal';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import CampaignDetailPage from './pages/public/CampaignDetailPage';
import { CheckCircle } from 'lucide-react';

// Protected Route Component for Admin Panel
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: '#d32020',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontWeight: 600 }}>Authenticating Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// Main Public Homepage Component
function PublicHomePage() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const handleOpenDonate = (campaign = null) => {
    setSelectedCampaign(campaign);
    setDonateModalOpen(true);
  };

  const handleCloseDonate = () => {
    setDonateModalOpen(false);
  };

  const handleShare = (campaign) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Link copied to clipboard! Share with your friends 🐾');
    } else {
      setToastMessage('Sharing campaign: ' + campaign.title);
    }
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="app">
      <Navbar onOpenDonate={() => handleOpenDonate()} />
      <HeroSection onOpenDonate={handleOpenDonate} />
      <CausesSection onOpenDonate={handleOpenDonate} onShare={handleShare} />
      <AboutSection />
      <YourImpactSection onOpenDonate={handleOpenDonate} />
      <RecognitionSection onOpenDonate={handleOpenDonate} />
      <LiveFeedAndStoriesSection />
      <FaqSection />
      <Footer />

      <DonateModal 
        isOpen={donateModalOpen} 
        onClose={handleCloseDonate} 
        campaign={selectedCampaign} 
      />

      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle size={18} color="#4ade80" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/campaign/:id" element={<CampaignDetailPage />} />

        {/* Admin Authentication & Panel Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/*" 
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          } 
        />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
