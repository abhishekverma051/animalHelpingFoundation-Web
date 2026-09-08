import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Star, 
  TrendingUp, 
  Heart, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  X
} from 'lucide-react';

export default function AdminDashboard({ onNavigateCampaigns }) {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [featuredIds, setFeaturedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selection Modal state for adding featured campaigns
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [tempFeaturedIds, setTempFeaturedIds] = useState([]);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, campaignsRes, featuredRes] = await Promise.all([
        api.getStats(),
        api.getCampaigns(),
        api.getFeatured()
      ]);

      setStats(statsRes.stats);
      setCampaigns(campaignsRes.campaigns || []);
      setFeaturedIds(featuredRes.featuredIds || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Open featured campaign selector modal
  const handleOpenSelectModal = () => {
    setTempFeaturedIds([...featuredIds]);
    setModalError('');
    setSelectModalOpen(true);
  };

  // Toggle selection inside modal (enforce max 4)
  const handleToggleSelectInModal = (id) => {
    setModalError('');
    if (tempFeaturedIds.includes(id)) {
      setTempFeaturedIds(tempFeaturedIds.filter(fId => fId !== id));
    } else {
      if (tempFeaturedIds.length >= 4) {
        setModalError('Maximum limit of 4 featured campaigns reached. Unselect one to choose a different campaign.');
        return;
      }
      setTempFeaturedIds([...tempFeaturedIds, id]);
    }
  };

  // Save selected featured campaigns
  const handleSaveFeatured = async () => {
    if (tempFeaturedIds.length > 4) {
      setModalError('Maximum limit is 4 featured campaigns.');
      return;
    }

    try {
      setModalSaving(true);
      setModalError('');
      const res = await api.updateFeatured(tempFeaturedIds);
      setFeaturedIds(res.featuredIds);
      setSelectModalOpen(false);
      showSuccess('Featured campaigns updated successfully! Changes are live on the website hero section.');
      loadDashboardData();
    } catch (err) {
      setModalError(err.message || 'Failed to update featured campaigns.');
    } finally {
      setModalSaving(false);
    }
  };

  // Quick remove featured campaign directly from dashboard card
  const handleRemoveFeatured = async (id) => {
    const updated = featuredIds.filter(fId => fId !== id);
    try {
      const res = await api.updateFeatured(updated);
      setFeaturedIds(res.featuredIds);
      showSuccess('Campaign unfeatured.');
      loadDashboardData();
    } catch (err) {
      setError(err.message || 'Failed to remove featured campaign.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#d32020',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ fontWeight: 600 }}>Loading Dashboard Statistics...</p>
      </div>
    );
  }

  const featuredCampaignsList = featuredIds
    .map(id => campaigns.find(c => c.id === id))
    .filter(Boolean);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="admin-dashboard-view">
      {/* Toast Notification */}
      {successMsg && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #6ee7b7',
          color: '#065f46',
          padding: '14px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
        }}>
          <Check size={20} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          padding: '14px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600
        }}>
          <AlertCircle size={20} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          Campaign Overview & Highlights
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Monitor overall fundraising performance and manage the top 4 featured campaigns displayed on the public hero section.
        </p>
      </div>

      {/* Key Statistics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Stat 1: Total Campaigns */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Campaigns
            </span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              {stats?.totalCampaigns || 0}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} />
              <span>{stats?.activeCount || 0} Active Campaigns</span>
            </div>
          </div>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#fef2f2',
            color: '#d32020',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Heart size={28} />
          </div>
        </div>

        {/* Stat 2: Overall Funding Raised */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Overall Funding Raised
            </span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
              {formatCurrency(stats?.overallFundingRaised || 0)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Combined total across all campaigns
            </div>
          </div>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={28} />
          </div>
        </div>

        {/* Stat 3: Featured Limit Status */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Featured Hero Section
            </span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>
              {featuredIds.length} <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 600 }}>/ 4 Max</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Displayed on public website homepage
            </div>
          </div>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#fffbeb',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={28} />
          </div>
        </div>
      </div>

      {/* FEATURED CAMPAIGNS MANAGEMENT SECTION */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
        marginBottom: '40px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '24px',
          borderBottom: '1px solid #f1f5f9',
          marginBottom: '28px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                Featured / Highlighted Campaigns
              </h3>
              <span style={{
                backgroundColor: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fef3c7',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={14} />
                Max 4 Limit
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              Selected campaigns are prominently showcased in the Hero section of the public homepage.
            </p>
          </div>

          <button
            onClick={handleOpenSelectModal}
            style={{
              padding: '12px 22px',
              backgroundColor: '#d32020',
              backgroundImage: 'linear-gradient(90deg, #e83030 0%, #b81414 100%)',
              color: '#ffffff',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 16px -4px rgba(211, 32, 32, 0.4)'
            }}
          >
            <Plus size={18} />
            <span>Manage / Change Featured ({featuredIds.length}/4)</span>
          </button>
        </div>

        {/* Featured Campaigns List / Grid */}
        {featuredCampaignsList.length === 0 ? (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '2px dashed #e2e8f0'
          }}>
            <Sparkles size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              No Featured Campaigns Selected
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
              Select up to 4 campaigns to feature on the homepage hero section.
            </p>
            <button
              onClick={handleOpenSelectModal}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Select Featured Campaigns
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {featuredCampaignsList.map((campaign, idx) => {
              const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
              return (
                <div key={campaign.id} style={{
                  backgroundColor: '#ffffff',
                  border: '2px solid #fef3c7',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Badge position */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#d97706',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Star size={12} fill="#ffffff" />
                    Featured #{idx + 1}
                  </div>

                  <div style={{ height: '150px', position: 'relative', overflow: 'hidden' }}>
                    <img 
                      src={campaign.image} 
                      alt={campaign.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
                    }} />
                  </div>

                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.4 }}>
                        {campaign.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '14px' }}>
                        {campaign.description}
                      </p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
                        <span color="#059669">{formatCurrency(campaign.raisedAmount)}</span>
                        <span style={{ color: '#64748b' }}>{percent}% of {formatCurrency(campaign.goalAmount)}</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '14px' }}>
                        <div style={{ height: '100%', width: `${percent}%`, backgroundColor: '#d32020', borderRadius: '9999px' }} />
                      </div>

                      <button
                        onClick={() => handleRemoveFeatured(campaign.id)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Unselect / Remove Featured</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FEATURED CAMPAIGNS SELECTION MODAL */}
      {selectModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            animation: 'modalSlideUp 0.25s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Select Featured Campaigns
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                  Choose up to 4 campaigns to feature on the homepage. (Currently selected: {tempFeaturedIds.length} / 4)
                </p>
              </div>

              <button
                onClick={() => setSelectModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
              {modalError && (
                <div style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#b45309',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  marginBottom: '16px',
                  fontWeight: 600
                }}>
                  {modalError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {campaigns.map((camp) => {
                  const isSelected = tempFeaturedIds.includes(camp.id);
                  const isMaxReached = tempFeaturedIds.length >= 4 && !isSelected;

                  return (
                    <div
                      key={camp.id}
                      onClick={() => !isMaxReached && handleToggleSelectInModal(camp.id)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        border: isSelected ? '2px solid #d32020' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#fef2f2' : (isMaxReached ? '#f8fafc' : '#ffffff'),
                        cursor: isMaxReached ? 'not-allowed' : 'pointer',
                        opacity: isMaxReached ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img 
                          src={camp.image} 
                          alt={camp.title} 
                          style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} 
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                              {camp.title}
                            </h4>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: camp.status === 'Active' ? '#dcfce7' : (camp.status === 'Paused' ? '#fef3c7' : '#f3f4f6'),
                              color: camp.status === 'Active' ? '#15803d' : (camp.status === 'Paused' ? '#b45309' : '#4b5563')
                            }}>
                              {camp.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            Goal: {formatCurrency(camp.goalAmount)} | Raised: {formatCurrency(camp.raisedAmount)}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: isSelected ? 'none' : '2px solid #cbd5e1',
                        backgroundColor: isSelected ? '#d32020' : 'transparent',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 28px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                {tempFeaturedIds.length} / 4 Campaigns Selected
              </span>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setSelectModalOpen(false)}
                  disabled={modalSaving}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFeatured}
                  disabled={modalSaving}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#d32020',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: modalSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {modalSaving ? 'Saving...' : 'Apply Selection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
