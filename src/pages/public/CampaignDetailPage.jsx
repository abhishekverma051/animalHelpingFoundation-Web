import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DonateModal from '../../components/DonateModal';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Layers, 
  CheckCircle, 
  Clock, 
  Target, 
  ShieldCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getCampaignById(id);
        setCampaign(res.campaign);
      } catch (err) {
        console.error('Error fetching campaign detail:', err);
        setError(err.message || 'Campaign not found.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCampaign();
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
  const additionalCards = campaign.additionalCards || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar onOpenDonate={() => setDonateModalOpen(true)} />

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
                  onClick={() => setDonateModalOpen(true)}
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

      {/* DYNAMIC ADDITIONAL CONTENT CARDS SECTION */}
      <div style={{ maxWidth: '1280px', margin: '48px auto 80px', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Layers size={26} color="#d32020" />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Campaign Highlights & Impact Stories
          </h2>
        </div>
        <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '36px' }}>
          Learn how your donations directly resource emergency ambulances, vet surgeries, and daily feeding stations for this campaign.
        </p>

        {additionalCards.length === 0 ? (
          <div style={{
            padding: '48px 24px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '2px dashed #e2e8f0',
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px'
          }}>
            {additionalCards.map((card, idx) => (
              <div key={card.id || idx} style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease'
              }}>
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={card.image} 
                    alt={card.heading} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: '#d32020',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Feature #{idx + 1}
                  </div>
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', lineHeight: 1.35 }}>
                    {card.heading}
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6 }}>
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Interactive Donation Modal */}
      <DonateModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        campaign={campaign}
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
