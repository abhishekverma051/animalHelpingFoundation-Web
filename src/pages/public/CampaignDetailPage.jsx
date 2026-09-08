import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LiveFeedAndStoriesSection from '../../components/LiveFeedAndStoriesSection';
import FaqSection from '../../components/FaqSection';
import DonateModal from '../../components/DonateModal';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Layers, 
  CheckCircle, 
  Sparkles,
  AlertCircle
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
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Floating Bar State
  const [selectedDonateAmount, setSelectedDonateAmount] = useState(3000);
  const [customDonateAmount, setCustomDonateAmount] = useState('3000');

  const fetchCampaignAndDonations = async () => {
    try {
      setLoading(true);
      setError('');
      const [campRes, donRes] = await Promise.all([
        api.getCampaignById(id),
        api.getCampaignDonations(id).catch(() => ({ donations: [] }))
      ]);
      setCampaign(campRes.campaign);
      setDonations(donRes.donations || []);
    } catch (err) {
      console.error('Error fetching campaign detail:', err);
      setError(err.message || 'Campaign not found.');
    } finally {
      setLoading(false);
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
      setToastMessage('Sharing campaign: ' + campaign.title);
    }
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleDonationSuccess = () => {
    fetchCampaignAndDonations();
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
        <Navbar />
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
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '80px auto', padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <AlertCircle size={48} color="#dc2626" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Campaign Not Found
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            {error || 'The requested campaign might have been removed or does not exist.'}
          </p>
          <Link
            to="/"
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
            <span>Back to All Campaigns</span>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: '110px' }}>
      <Navbar onOpenDonate={() => handleOpenDonateWithAmount(selectedDonateAmount)} />

      {/* Back Navigation Bar */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px' }}>
          <Link
            to="/"
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
            <span>Back to Homepage & All Causes</span>
          </Link>
        </div>
      </div>

      {/* Campaign Header & Hero Banner */}
      <div style={{ maxWidth: '1280px', margin: '32px auto', padding: '0 24px' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 15px 35px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '0'
        }}>
          {/* Cover Image */}
          <div style={{ height: '100%', minHeight: '380px', position: 'relative' }}>
            <img 
              src={campaign.image} 
              alt={campaign.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              backgroundColor: campaign.status === 'Active' ? '#15803d' : (campaign.status === 'Paused' ? '#b45309' : '#4b5563'),
              color: '#ffffff',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {campaign.status} Campaign
            </div>
          </div>

          {/* Details & Donation Card */}
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d32020', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Verified NGO Rescue Cause
                </span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '16px' }}>
                {campaign.title}
              </h1>
              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, marginBottom: '28px' }}>
                {campaign.description}
              </p>
            </div>

            <div>
              {/* Funding Progress Box */}
              <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Raised so far</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
                      {formatCurrency(campaign.raisedAmount)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Target Goal</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {formatCurrency(campaign.goalAmount)}
                    </div>
                  </div>
                </div>

                <div style={{ height: '10px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ height: '100%', width: `${percent}%`, backgroundColor: '#d32020', borderRadius: '9999px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                  <span>{percent}% Funded</span>
                  <span>100% Direct Impact</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <button
                  onClick={() => handleOpenDonateWithAmount(selectedDonateAmount)}
                  disabled={campaign.status !== 'Active'}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    backgroundColor: campaign.status === 'Active' ? '#d32020' : '#94a3b8',
                    backgroundImage: campaign.status === 'Active' ? 'linear-gradient(90deg, #e83030 0%, #b81414 100%)' : 'none',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    cursor: campaign.status === 'Active' ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: campaign.status === 'Active' ? '0 10px 25px -5px rgba(211,32,32,0.5)' : 'none'
                  }}
                >
                  <Heart size={20} fill="#ffffff" />
                  <span>{campaign.status === 'Active' ? 'Donate Now' : `Campaign ${campaign.status}`}</span>
                </button>

                <button
                  onClick={handleShare}
                  style={{
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Share Campaign"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CAMPAIGN HIGHLIGHTS & IMPACT STORIES SECTION (PROJECT CARDS DESIGN) */}
      <div style={{ maxWidth: '1280px', margin: '48px auto 48px', padding: '0 24px' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          padding: '36px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            <Sparkles size={22} color="#15803d" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c1917', margin: 0 }}>
              Project Highlights
            </h2>
          </div>

          {campaignDetailsEntries.length === 0 ? (
            <div style={{
              padding: '48px 24px',
              backgroundColor: '#f8fafc',
              borderRadius: '20px',
              border: '2px dashed #cbd5e1',
              textAlign: 'center'
            }}>
              <Sparkles size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Standard Rescue Support Program
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Every contribution directly fuels our on-the-ground rescue vehicles and emergency veterinary care teams.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {campaignDetailsEntries.map((detail, idx) => (
                <div key={detail.id || idx} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.04)'
                }}>
                  {detail.image && (
                    <div style={{ width: '100%', overflow: 'hidden' }}>
                      <img 
                        src={detail.image} 
                        alt={`Campaign detail ${idx + 1}`} 
                        style={{ width: '100%', maxHeight: '520px', objectFit: 'cover', display: 'block' }} 
                      />
                    </div>
                  )}

                  {detail.description && (
                    <div style={{
                      backgroundColor: '#4a301e',
                      color: '#fbf7f4',
                      padding: '28px 32px',
                      fontSize: '0.96rem',
                      lineHeight: 1.7,
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

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        href="https://wa.me/919999999999?text=Hello%2C%20I%20want%20to%20know%20more%20about%20the%20NGO%20campaigns"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: '#25D366',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '9999px',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          cursor: 'pointer'
        }}
      >
        <WhatsAppIcon />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: 600 }}>Chat with us on</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>WhatsApp</span>
        </div>
      </a>

      {/* FLOATING PAYMENT BAR */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'calc(100% - 32px)',
        maxWidth: '1080px',
        backgroundColor: '#18181b',
        borderRadius: '20px',
        padding: '12px 20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        boxSizing: 'border-box',
        overflowX: 'auto'
      }}>
        {/* Left: Donate Via UPI & App Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          <div style={{ color: '#ffffff', lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>Donate Via</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>UPI</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              onClick={() => handleOpenDonateWithAmount(selectedDonateAmount)}
              style={{ textAlign: 'center', cursor: 'pointer' }}
              title="Donate via PhonePe"
            >
              <PhonePeIcon />
              <span style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginTop: '2px' }}>PhonePe</span>
            </div>

            <div 
              onClick={() => handleOpenDonateWithAmount(selectedDonateAmount)}
              style={{ textAlign: 'center', cursor: 'pointer' }}
              title="Donate via GPay"
            >
              <GPayIcon />
              <span style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginTop: '2px' }}>Gpay</span>
            </div>

            <div 
              onClick={() => handleOpenDonateWithAmount(selectedDonateAmount)}
              style={{ textAlign: 'center', cursor: 'pointer' }}
              title="Donate via BHIM UPI"
            >
              <BhimUpiIcon />
              <span style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginTop: '2px' }}>Bhim UPI</span>
            </div>

            <div 
              onClick={() => handleOpenDonateWithAmount(selectedDonateAmount)}
              style={{ textAlign: 'center', cursor: 'pointer' }}
              title="More Payment Options"
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#27272a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, lineHeight: 0 }}>...</span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginTop: '2px' }}>More</span>
            </div>
          </div>
        </div>

        {/* Vertical Divider Line */}
        <div style={{ width: '1px', height: '36px', backgroundColor: '#3f3f46', flexShrink: 0, margin: '0 4px' }} />

        {/* Center & Right: Presets & Amount Input & Donate Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[500, 1000, 2500, 5000, 10000].map((amt) => (
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
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
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
            borderRadius: '10px',
            padding: '6px 12px',
            color: '#ffffff'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>₹ INR ▾</span>
            <span style={{ margin: '0 8px', color: '#52525b' }}>|</span>
            <input
              type="number"
              value={customDonateAmount}
              onChange={(e) => {
                setCustomDonateAmount(e.target.value);
                setSelectedDonateAmount(Number(e.target.value) || null);
              }}
              style={{
                width: '70px',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            onClick={() => handleOpenDonateWithAmount(selectedDonateAmount || customDonateAmount || 3000)}
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 28px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
            }}
          >
            Donate
          </button>
        </div>
      </div>

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
