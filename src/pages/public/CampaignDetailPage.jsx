import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LiveFeedAndStoriesSection from '../../components/LiveFeedAndStoriesSection';
import FaqSection from '../../components/FaqSection';
import DonateModal from '../../components/DonateModal';
import AdminContentCardsModal from '../admin/AdminContentCardsModal';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Layers, 
  CheckCircle, 
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Edit3,
  Users,
  Eye,
  X
} from 'lucide-react';

// Custom PhonePe Icon Component
const PhonePeIcon = () => (
  <div style={{
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#5f259f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '0.85rem',
    boxShadow: '0 2px 8px rgba(95, 37, 159, 0.4)'
  }}>
    <span style={{ fontFamily: 'sans-serif' }}>पे</span>
  </div>
);

// Custom GPay Icon Component
const GPayIcon = () => (
  <div style={{
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  </div>
);

// Custom Bhim UPI Icon Component
const BhimUpiIcon = () => (
  <div style={{
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M5 4L12 18L19 4H14.5L12 9.5L9.5 4H5Z" fill="#F97316"/>
      <path d="M12 18L17.5 7H14.5L12 12L9.5 7H6.5L12 18Z" fill="#10B981"/>
    </svg>
  </div>
);

// WhatsApp Icon Component
const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.553 4.108 1.52 5.836L0 24l6.335-1.503C8.012 23.468 9.954 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.802 0-3.52-.47-5.02-1.297l-.36-.197-3.75.89.91-3.646-.217-.37C2.696 15.86 2 13.99 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/>
  </svg>
);

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Admin View State
  const fromAdminParam = searchParams.get('fromAdmin') === 'true' || searchParams.get('admin') === 'true';
  const hasAdminToken = Boolean(localStorage.getItem('admin_token'));
  const isAdminUser = hasAdminToken || isAuthenticated;
  const [isAdminMode, setIsAdminMode] = useState(fromAdminParam || isAdminUser);
  const [contentCardsModalOpen, setContentCardsModalOpen] = useState(false);
  const [showDonationsModal, setShowDonationsModal] = useState(false);
  
  // Floating Bar State
  const [selectedDonateAmount, setSelectedDonateAmount] = useState(3000);
  const [customDonateAmount, setCustomDonateAmount] = useState('3000');

  const fetchCampaignAndDonations = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError('');
      const [campRes, donRes] = await Promise.all([
        api.getCampaignById(id),
        api.getCampaignDonations(id).catch(() => ({ donations: [] }))
      ]);
      setCampaign(campRes.campaign);
      setDonations(donRes.donations || []);
    } catch (err) {
      console.error('Error fetching campaign detail:', err);
      if (!isSilent) setError(err.message || 'Campaign not found.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCampaignAndDonations();
    }
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Campaign link copied to clipboard! 🐾');
    } else {
      setToastMessage('Sharing campaign: ' + campaign?.title);
    }
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleDonationSuccess = () => {
    fetchCampaignAndDonations(true);
    setToastMessage('Thank you for your generous donation! 💖');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenDonateWithAmount = (amt) => {
    const val = Number(amt) || 3000;
    setSelectedDonateAmount(val);
    setDonateModalOpen(true);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
        <Navbar isAdmin={isAdminUser} />
        <div style={{ padding: '80px 24px', textAlign: 'center', color: '#64748b' }}>
          <div style={{
            width: '44px',
            height: '44px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#d32020',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontWeight: 600 }}>Loading Campaign Details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
        <Navbar isAdmin={isAdminUser} />
        <div style={{ maxWidth: '600px', margin: '80px auto', padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <AlertCircle size={48} color="#dc2626" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Campaign Not Found
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            {error || 'The requested campaign might have been removed or does not exist.'}
          </p>
          <Link
            to={isAdminUser ? "/admin/campaigns" : "/"}
            style={{
              padding: '12px 24px',
              backgroundColor: '#d32020',
              color: '#ffffff',
              borderRadius: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={18} />
            <span>{isAdminUser ? "Back to Admin Campaigns" : "Back to All Campaigns"}</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
  const campaignDetailsEntries = (campaign.campaignDetails && campaign.campaignDetails.length > 0)
    ? campaign.campaignDetails
    : (campaign.additionalCards || []).map(card => ({
        id: card.id,
        image: card.image,
        description: card.description || card.heading || ''
      }));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: isAdminMode ? '40px' : '110px' }}>
      
      {/* Sticky Admin Control Bar (Visible when user is Admin) */}
      {isAdminUser && (
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 24px',
          borderBottom: '3px solid #d32020',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 10000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              backgroundColor: '#d32020',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldCheck size={14} />
              <span>ADMIN CONTROL MODE</span>
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>
              Campaign: <strong>{campaign.title}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              style={{
                padding: '6px 14px',
                backgroundColor: isAdminMode ? 'rgba(255,255,255,0.15)' : '#10b981',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Eye size={14} />
              <span>{isAdminMode ? 'Switch to Donor View' : 'Switch to Admin Management View'}</span>
            </button>

            <Link
              to="/admin/campaigns"
              style={{
                padding: '6px 14px',
                backgroundColor: '#d32020',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Admin Campaigns</span>
            </Link>
          </div>
        </div>
      )}

      <Navbar isAdmin={isAdminUser} onOpenDonate={() => handleOpenDonateWithAmount(selectedDonateAmount)} />

      {/* Back Navigation Bar */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link
            to={isAdminUser ? "/admin/campaigns" : "/"}
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#d32020',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={18} />
            <span>{isAdminUser ? "← Back to Admin Campaigns" : "Back to Homepage & All Causes"}</span>
          </Link>

          {isAdminUser && (
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isAdminMode ? '#1e40af' : '#047857', backgroundColor: isAdminMode ? '#eff6ff' : '#ecfdf5', padding: '4px 12px', borderRadius: '9999px', border: `1px solid ${isAdminMode ? '#bfdbfe' : '#a7f3d0'}` }}>
              {isAdminMode ? "⚡ Active Mode: Admin View" : "👁️ Active Mode: Donor Preview"}
            </span>
          )}
        </div>
      </div>

      {/* Campaign Header & Hero Banner */}
      <div className="causes-container-60" style={{ margin: '24px auto' }}>
        <div className="campaign-hero-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 15px 35px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0'
        }}>
          {/* Cover Image */}
          <div className="campaign-cover-box" style={{ height: '100%', minHeight: '280px', position: 'relative' }}>
            <img 
              src={campaign.image} 
              alt={campaign.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              backgroundColor: campaign.status === 'Active' ? '#15803d' : (campaign.status === 'Paused' ? '#b45309' : '#4b5563'),
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {campaign.status} Campaign
            </div>
          </div>

          {/* Details & Action Card */}
          <div className="campaign-details-box" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d32020', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Verified NGO Rescue Cause
                </span>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '12px' }}>
                {campaign.title}
              </h1>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                {campaign.description}
              </p>
            </div>

            <div>
              {/* ADMIN MODE VIEW CARD (Replaces Donate Now for Admin) */}
              {isAdminMode ? (
                <div style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '20px',
                  padding: '24px',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  boxShadow: '0 10px 25px rgba(15,23,42,0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={20} color="#38bdf8" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Admin Campaign Management
                      </span>
                    </div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      backgroundColor: campaign.status === 'Active' ? '#166534' : (campaign.status === 'Paused' ? '#92400e' : '#374151'),
                      color: '#ffffff'
                    }}>
                      {campaign.status}
                    </span>
                  </div>

                  {/* Funding Progress Bar */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                      <span>Progress ({percent}%)</span>
                      <span style={{ color: '#4ade80', fontWeight: 800 }}>{formatCurrency(campaign.raisedAmount)} / {formatCurrency(campaign.goalAmount)}</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#334155', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percent}%`, backgroundColor: '#38bdf8', borderRadius: '9999px' }} />
                    </div>
                  </div>

                  {/* Metric Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ backgroundColor: '#1e293b', padding: '10px 12px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, display: 'block' }}>RAISED</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4ade80' }}>{formatCurrency(campaign.raisedAmount)}</span>
                    </div>
                    <div style={{ backgroundColor: '#1e293b', padding: '10px 12px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, display: 'block' }}>GOAL</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{formatCurrency(campaign.goalAmount)}</span>
                    </div>
                    <div style={{ backgroundColor: '#1e293b', padding: '10px 12px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, display: 'block' }}>DONORS</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>{donations.length}</span>
                    </div>
                  </div>

                  {/* Admin Quick Action Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <button
                      onClick={() => navigate('/admin/campaigns')}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#d32020',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Edit3 size={15} />
                      <span>Edit Campaign</span>
                    </button>

                    <button
                      onClick={() => setContentCardsModalOpen(true)}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#334155',
                        color: '#ffffff',
                        border: '1px solid #475569',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Layers size={15} />
                      <span>Content Cards</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowDonationsModal(true)}
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      padding: '10px 14px',
                      backgroundColor: '#1e293b',
                      color: '#94a3b8',
                      border: '1px solid #334155',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Users size={14} />
                    <span>View {donations.length} Campaign Donations</span>
                  </button>

                  <div style={{ marginTop: '14px', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                    ⚡ Online donation buttons & floating UPI bar are hidden in Admin View.
                  </div>
                </div>
              ) : (
                /* PUBLIC USER VIEW CARD (Donate Now buttons) */
                <div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Raised so far</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
                          {formatCurrency(campaign.raisedAmount)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Target Goal</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                          {formatCurrency(campaign.goalAmount)}
                        </div>
                      </div>
                    </div>

                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{ height: '100%', width: `${percent}%`, backgroundColor: '#d32020', borderRadius: '9999px' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                      <span>{percent}% Funded</span>
                      <span>100% Direct Impact</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleOpenDonateWithAmount(selectedDonateAmount)}
                      disabled={campaign.status !== 'Active'}
                      style={{
                        flex: 1,
                        padding: '14px 20px',
                        backgroundColor: campaign.status === 'Active' ? '#d32020' : '#94a3b8',
                        backgroundImage: campaign.status === 'Active' ? 'linear-gradient(90deg, #e83030 0%, #b81414 100%)' : 'none',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        cursor: campaign.status === 'Active' ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: campaign.status === 'Active' ? '0 8px 20px -4px rgba(211,32,32,0.4)' : 'none'
                      }}
                    >
                      <Heart size={18} fill="#ffffff" />
                      <span>{campaign.status === 'Active' ? 'Donate Now' : `Campaign ${campaign.status}`}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      style={{
                        padding: '14px',
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Share Campaign"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CAMPAIGN HIGHLIGHTS & IMPACT STORIES SECTION */}
      <div className="causes-container-60" style={{ margin: '36px auto' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#15803d" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>
                Project Highlights & Story
              </h2>
            </div>
            {isAdminMode && (
              <button
                onClick={() => setContentCardsModalOpen(true)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Layers size={14} />
                <span>Manage Story Cards</span>
              </button>
            )}
          </div>

          {campaignDetailsEntries.length === 0 ? (
            <div style={{
              padding: '36px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '2px dashed #cbd5e1',
              textAlign: 'center'
            }}>
              <Sparkles size={32} color="#94a3b8" style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Standard Rescue Support Program
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Every contribution directly fuels our on-the-ground rescue vehicles and emergency veterinary care teams.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {campaignDetailsEntries.map((detail, idx) => (
                <div key={detail.id || idx} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.03)'
                }}>
                  {detail.image && (
                    <div style={{ width: '100%', overflow: 'hidden' }}>
                      <img 
                        src={detail.image} 
                        alt={`Campaign detail ${idx + 1}`} 
                        style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }} 
                      />
                    </div>
                  )}

                  {detail.description && (
                    <div style={{
                      backgroundColor: '#4a301e',
                      color: '#fbf7f4',
                      padding: '20px 24px',
                      fontSize: '0.92rem',
                      lineHeight: 1.65,
                      whiteSpace: 'pre-line',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                      {detail.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <LiveFeedAndStoriesSection campaign={campaign} donations={donations} />
      <FaqSection />
      <Footer />

      {/* FLOATING WHATSAPP BUTTON (Only in Donor View) */}
      {!isAdminMode && (
        <a
          href="https://wa.me/919999999999?text=Hello%2C%20I%20want%20to%20know%20more%20about%20the%20NGO%20campaigns"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '16px',
            zIndex: 9999,
            backgroundColor: '#25D366',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: '9999px',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          <WhatsAppIcon />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: '0.65rem', opacity: 0.9, fontWeight: 600 }}>Chat with us on</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>WhatsApp</span>
          </div>
        </a>
      )}

      {/* FLOATING PAYMENT BAR (Only rendered in Public/Donor View) */}
      {!isAdminMode && (
        <div 
          className="no-scrollbar"
          style={{
            position: 'fixed',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: 'calc(100% - 24px)',
            maxWidth: '1080px',
            backgroundColor: '#18181b',
            borderRadius: '20px',
            padding: '10px 14px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            boxSizing: 'border-box',
            overflowX: 'auto'
          }}
        >
          {/* Left: Donate Via UPI & App Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ color: '#ffffff', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>Donate Via</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>UPI</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                onClick={() => handleOpenDonateWithAmount(selectedDonateAmount)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
                title="Donate via PhonePe"
              >
                <PhonePeIcon />
                <span style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginTop: '2px' }}>PhonePe</span>
              </div>

              <div 
                onClick={() => handleOpenDonateWithAmount(selectedDonateAmount)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
                title="Donate via GPay"
              >
                <GPayIcon />
                <span style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginTop: '2px' }}>Gpay</span>
              </div>

              <div 
                onClick={() => handleOpenDonateWithAmount(selectedDonateAmount)}
                style={{ textAlign: 'center', cursor: 'pointer' }}
                title="Donate via BHIM UPI"
              >
                <BhimUpiIcon />
                <span style={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginTop: '2px' }}>UPI</span>
              </div>
            </div>
          </div>

          {/* Center & Right: Presets & Amount Input & Donate Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[500, 1000, 2500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedDonateAmount(amt);
                    setCustomDonateAmount(String(amt));
                  }}
                  style={{
                    backgroundColor: selectedDonateAmount === amt ? '#ef4444' : '#27272a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              padding: '4px 8px',
              color: '#ffffff'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0' }}>₹</span>
              <input
                type="number"
                value={customDonateAmount}
                onChange={(e) => {
                  setCustomDonateAmount(e.target.value);
                  setSelectedDonateAmount(Number(e.target.value) || null);
                }}
                style={{
                  width: '56px',
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  outline: 'none',
                  paddingLeft: '4px'
                }}
              />
            </div>

            <button
              onClick={() => handleOpenDonateWithAmount(selectedDonateAmount || customDonateAmount || 3000)}
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                whiteSpace: 'nowrap'
              }}
            >
              Donate
            </button>
          </div>
        </div>
      )}

      {/* ADMIN DONATIONS MODAL */}
      {showDonationsModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '24px', maxWidth: '680px', width: '100%',
            maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ padding: '20px 24px', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Campaign Donations History</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0' }}>{campaign.title}</p>
              </div>
              <button onClick={() => setShowDonationsModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {donations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <Users size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600 }}>No online donations recorded for this campaign yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {donations.map((don, idx) => (
                    <div key={don.id || idx} style={{ padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{don.donorName || 'Anonymous Hero'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{don.donorEmail || 'No email provided'} • {don.createdAt ? new Date(don.createdAt).toLocaleString('en-IN') : 'Recent'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.05rem' }}>₹{(don.amount || 0).toLocaleString('en-IN')}</div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '9999px' }}>{don.paymentStatus || 'Completed'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', textAlign: 'right', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setShowDonationsModal(false)} style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN CONTENT CARDS MANAGING MODAL */}
      {contentCardsModalOpen && (
        <AdminContentCardsModal
          campaign={campaign}
          isOpen={contentCardsModalOpen}
          onClose={() => setContentCardsModalOpen(false)}
          onRefresh={() => fetchCampaignAndDonations(true)}
        />
      )}

      {/* Interactive Donation Modal */}
      <DonateModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        campaign={campaign}
        onSuccess={handleDonationSuccess}
        initialAmount={selectedDonateAmount || customDonateAmount}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle size={18} color="#4ade80" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
