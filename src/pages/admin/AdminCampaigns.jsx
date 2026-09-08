import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Plus, 
  Edit3, 
  PauseCircle, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Trash2, 
  AlertCircle, 
  Check, 
  X,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';
import AdminContentCardsModal from './AdminContentCardsModal';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal State for Add / Edit Campaign
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null); // null = Add New
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [raisedAmount, setRaisedAmount] = useState('');
  const [status, setStatus] = useState('Active');
  const [campaignDetails, setCampaignDetails] = useState([{ image: '', description: '' }]);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Confirmation Modals for Pause & Close actions
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    campaignId: null,
    targetStatus: null, // 'Paused' | 'Closed' | 'DELETE'
    title: '',
    message: '',
    confirmText: '',
    type: 'warning'
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Content Cards Manager Modal State
  const [contentCardsModalCampaign, setContentCardsModalCampaign] = useState(null);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getCampaigns();
      setCampaigns(res.campaigns || []);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError(err.message || 'Failed to load campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  // Open Add Campaign Modal
  const handleOpenAddModal = () => {
    setEditingCampaign(null);
    setTitle('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80');
    setGoalAmount('');
    setRaisedAmount('0');
    setStatus('Active');
    setCampaignDetails([{ image: '', description: '' }]);
    setModalError('');
    setCampaignModalOpen(true);
  };

  // Open Edit Campaign Modal
  const handleOpenEditModal = (camp) => {
    setEditingCampaign(camp);
    setTitle(camp.title || '');
    setDescription(camp.description || '');
    setImage(camp.image || '');
    setGoalAmount(camp.goalAmount || '');
    setRaisedAmount(camp.raisedAmount || 0);
    setStatus(camp.status || 'Active');
    const initialDetails = (camp.campaignDetails && camp.campaignDetails.length > 0)
      ? camp.campaignDetails.map(d => ({ image: d.image || '', description: d.description || '' }))
      : (camp.additionalCards && camp.additionalCards.length > 0)
        ? camp.additionalCards.map(c => ({ image: c.image || '', description: c.description || c.heading || '' }))
        : [{ image: '', description: '' }];
    setCampaignDetails(initialDetails);
    setModalError('');
    setCampaignModalOpen(true);
  };

  const handleAddDetailEntry = () => {
    setCampaignDetails(prev => [...prev, { image: '', description: '' }]);
  };

  const handleUpdateDetailEntry = (index, field, value) => {
    setCampaignDetails(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveDetailEntry = (index) => {
    setCampaignDetails(prev => {
      if (prev.length <= 1) return [{ image: '', description: '' }];
      return prev.filter((_, i) => i !== index);
    });
  };

  // Save Campaign (Create / Update)
  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!title.trim() || !description.trim() || !goalAmount) {
      setModalError('Campaign title, description, and goal amount are required.');
      return;
    }

    const validDetails = campaignDetails
      .filter(d => d.description.trim() || d.image.trim())
      .map(d => ({ description: d.description.trim(), image: d.image.trim() }));

    try {
      setSaving(true);
      if (editingCampaign) {
        // Update
        await api.updateCampaign(editingCampaign.id, {
          title: title.trim(),
          description: description.trim(),
          image: image.trim(),
          goalAmount: Number(goalAmount),
          raisedAmount: Number(raisedAmount),
          status,
          campaignDetails: validDetails
        });
        showSuccess('Campaign updated successfully!');
      } else {
        // Create new
        await api.createCampaign({
          title: title.trim(),
          description: description.trim(),
          image: image.trim(),
          goalAmount: Number(goalAmount),
          campaignDetails: validDetails
        });
        showSuccess('New campaign created successfully!');
      }

      setCampaignModalOpen(false);
      loadCampaigns();
    } catch (err) {
      setModalError(err.message || 'Failed to save campaign.');
    } finally {
      setSaving(false);
    }
  };

  // Request status change confirmation dialog (Pause or Close or Delete)
  const triggerPauseConfirmation = (camp) => {
    setConfirmModalState({
      isOpen: true,
      campaignId: camp.id,
      targetStatus: 'Paused',
      title: `Pause "${camp.title}"?`,
      message: 'Pausing this campaign will temporarily stop accepting new online donations while keeping the campaign visible. You can reactivate it anytime.',
      confirmText: 'Pause Campaign',
      type: 'warning'
    });
  };

  const triggerCloseConfirmation = (camp) => {
    setConfirmModalState({
      isOpen: true,
      campaignId: camp.id,
      targetStatus: 'Closed',
      title: `Close "${camp.title}"?`,
      message: 'Closing this campaign marks it as completed/closed. Are you sure you want to proceed?',
      confirmText: 'Close Campaign',
      type: 'danger'
    });
  };

  const triggerDeleteConfirmation = (camp) => {
    setConfirmModalState({
      isOpen: true,
      campaignId: camp.id,
      targetStatus: 'DELETE',
      title: `Delete "${camp.title}"?`,
      message: 'Are you sure you want to permanently delete this campaign? This action cannot be undone.',
      confirmText: 'Delete Campaign',
      type: 'danger'
    });
  };

  // Execute confirmed action
  const handleConfirmAction = async () => {
    const { campaignId, targetStatus } = confirmModalState;
    if (!campaignId) return;

    try {
      setActionLoading(true);
      if (targetStatus === 'DELETE') {
        await api.deleteCampaign(campaignId);
        showSuccess('Campaign deleted successfully.');
      } else {
        await api.updateCampaign(campaignId, { status: targetStatus });
        showSuccess(`Campaign status changed to ${targetStatus}.`);
      }
      setConfirmModalState({ ...confirmModalState, isOpen: false });
      loadCampaigns();
    } catch (err) {
      setError(err.message || 'Failed to perform campaign action.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || c.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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
        <p style={{ fontWeight: 600 }}>Loading Campaign Management...</p>
      </div>
    );
  }

  return (
    <div className="admin-campaigns-view">
      {/* Toast Notification */}
      {success && (
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
          fontWeight: 600
        }}>
          <Check size={20} color="#059669" />
          <span>{success}</span>
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

      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            Campaign Management
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Create, edit, pause, close, and manage additional content cards for all NGO campaigns.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          style={{
            padding: '14px 24px',
            backgroundColor: '#d32020',
            backgroundImage: 'linear-gradient(90deg, #e83030 0%, #b81414 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '0.95rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 20px -5px rgba(211,32,32,0.4)'
          }}
        >
          <Plus size={20} />
          <span>Add New Campaign</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search campaigns by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Status:</span>
          {['All', 'Active', 'Paused', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: filterStatus === st ? 'none' : '1px solid #cbd5e1',
                backgroundColor: filterStatus === st ? '#0f172a' : '#ffffff',
                color: filterStatus === st ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '2px dashed #e2e8f0'
        }}>
          <AlertCircle size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            No Campaigns Found
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
            {searchQuery ? 'No campaigns match your search query.' : 'Click "Add New Campaign" to get started.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {filteredCampaigns.map((camp) => {
            const percent = Math.min(100, Math.round((camp.raisedAmount / camp.goalAmount) * 100));

            const statusStyles = {
              Active: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
              Paused: { bg: '#fef3c7', text: '#b45309', border: '#fde047' },
              Closed: { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' }
            };
            const sStyle = statusStyles[camp.status] || statusStyles.Active;

            return (
              <div key={camp.id} style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                {/* Image & Status Badge */}
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={camp.image} 
                    alt={camp.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    backgroundColor: sStyle.bg,
                    color: sStyle.text,
                    border: `1px solid ${sStyle.border}`,
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {camp.status}
                  </div>

                  <a
                    href={`/campaign/${camp.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>View Public Page</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Card Content */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', lineHeight: 1.4 }}>
                      {camp.title}
                    </h3>
                    <p style={{
                      fontSize: '0.85rem',
                      color: '#64748b',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '16px'
                    }}>
                      {camp.description}
                    </p>
                  </div>

                  <div>
                    {/* Goal vs Raised Progress */}
                    <div style={{ marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                        <span style={{ color: '#059669' }}>{formatCurrency(camp.raisedAmount)} Raised</span>
                        <span style={{ color: '#64748b' }}>Goal: {formatCurrency(camp.goalAmount)}</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${percent}%`,
                          backgroundColor: camp.status === 'Active' ? '#d32020' : '#94a3b8',
                          borderRadius: '9999px'
                        }} />
                      </div>
                    </div>

                    {/* Additional Content Cards Badge */}
                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={16} color="#d32020" />
                        {camp.additionalCards?.length || 0} Content Cards Attached
                      </span>
                      <button
                        onClick={() => setContentCardsModalCampaign(camp)}
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#2563eb',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Manage Cards
                      </button>
                    </div>

                    {/* Card Actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => handleOpenEditModal(camp)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Edit3 size={15} />
                        <span>Edit</span>
                      </button>

                      {camp.status === 'Active' ? (
                        <button
                          onClick={() => triggerPauseConfirmation(camp)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            border: '1px solid #fef3c7',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <PauseCircle size={15} />
                          <span>Pause</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => triggerCloseConfirmation(camp)}
                          disabled={camp.status === 'Closed'}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: camp.status === 'Closed' ? '#f3f4f6' : '#fef2f2',
                            color: camp.status === 'Closed' ? '#9ca3af' : '#dc2626',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            border: 'none',
                            cursor: camp.status === 'Closed' ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <XCircle size={15} />
                          <span>{camp.status === 'Closed' ? 'Closed' : 'Close'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT CAMPAIGN MODAL */}
      {campaignModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            animation: 'modalSlideUp 0.25s ease-out'
          }}>
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0f172a',
              color: '#ffffff'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingCampaign ? 'Edit Campaign Details' : 'Add New NGO Campaign'}
              </h3>
              <button
                onClick={() => setCampaignModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} style={{ overflowY: 'auto', flex: 1, padding: '24px 28px' }}>
              {modalError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  marginBottom: '18px',
                  fontWeight: 600
                }}>
                  {modalError}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Campaign Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Rescue & Medical Fund for Stray Animals"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Campaign Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the cause, mission, and why donors should support..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Campaign Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Goal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {editingCampaign && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Amount Raised (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={raisedAmount}
                      onChange={(e) => setRaisedAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Campaign Details Section */}
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Campaign Details
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Add multiple description & image entries to tell the campaign story on the details page.
                  </p>
                </div>

                {campaignDetails.map((detail, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d32020' }}>
                        Detail Entry #{idx + 1}
                      </span>
                      {campaignDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDetailEntry(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Image
                      </label>
                      <input
                        type="url"
                        placeholder="Upload or enter Image URL (e.g. https://...)"
                        value={detail.image}
                        onChange={(e) => handleUpdateDetailEntry(idx, 'image', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Enter description describing the campaign highlight, story, impact, etc..."
                        value={detail.description}
                        onChange={(e) => handleUpdateDetailEntry(idx, 'description', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddDetailEntry}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#ffffff',
                    border: '2px dashed #d32020',
                    color: '#d32020',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={18} />
                  <span>Add More</span>
                </button>
              </div>

              {editingCampaign && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Campaign Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Active">Active (Accepting Donations)</option>
                    <option value="Paused">Paused (Temporarily On Hold)</option>
                    <option value="Closed">Closed (Completed)</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setCampaignModalOpen(false)}
                  disabled={saving}
                  style={{
                    padding: '12px 20px',
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
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#d32020',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : (editingCampaign ? 'Update Campaign' : 'Create Campaign')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
        type={confirmModalState.type}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModalState({ ...confirmModalState, isOpen: false })}
      />

      {/* ADDITIONAL CONTENT CARDS MODAL */}
      {contentCardsModalCampaign && (
        <AdminContentCardsModal
          campaign={contentCardsModalCampaign}
          isOpen={!!contentCardsModalCampaign}
          onClose={() => setContentCardsModalCampaign(null)}
          onRefresh={loadCampaigns}
        />
      )}
    </div>
  );
}
