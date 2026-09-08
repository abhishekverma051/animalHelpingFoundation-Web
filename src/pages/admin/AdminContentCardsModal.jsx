import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Layers, Check, AlertCircle } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function AdminContentCardsModal({ campaign, isOpen, onClose, onRefresh }) {
  if (!isOpen || !campaign) return null;

  const [cards, setCards] = useState(campaign.additionalCards || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for creating / editing a card
  const [editingCardId, setEditingCardId] = useState(null); // null means adding new
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Confirmation modal state for deletion
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleOpenAddForm = () => {
    setEditingCardId(null);
    setHeading('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80');
    setIsFormOpen(true);
    setError('');
  };

  const handleOpenEditForm = (card) => {
    setEditingCardId(card.id);
    setHeading(card.heading || '');
    setDescription(card.description || '');
    setImage(card.image || '');
    setIsFormOpen(true);
    setError('');
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    setError('');

    if (!heading.trim() || !description.trim()) {
      setError('Heading and description are required.');
      return;
    }

    try {
      setLoading(true);
      if (editingCardId) {
        // Edit existing card
        const res = await api.updateContentCard(campaign.id, editingCardId, {
          heading: heading.trim(),
          description: description.trim(),
          image: image.trim()
        });
        setCards(res.additionalCards);
        showSuccess('Content card updated successfully!');
      } else {
        // Add new card
        const res = await api.addContentCard(campaign.id, {
          heading: heading.trim(),
          description: description.trim(),
          image: image.trim()
        });
        setCards(res.additionalCards);
        showSuccess('Content card added successfully!');
      }
      setIsFormOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to save content card.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!deleteConfirmId) return;

    try {
      setDeleteLoading(true);
      const res = await api.deleteContentCard(campaign.id, deleteConfirmId);
      setCards(res.additionalCards);
      showSuccess('Content card deleted.');
      setDeleteConfirmId(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to delete content card.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMoveCard = async (index, direction) => {
    const newCards = [...cards];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCards.length) return;

    // Swap elements
    const temp = newCards[index];
    newCards[index] = newCards[targetIndex];
    newCards[targetIndex] = temp;

    setCards(newCards);

    try {
      const cardIds = newCards.map(c => c.id);
      const res = await api.reorderContentCards(campaign.id, cardIds);
      setCards(res.additionalCards);
      showSuccess('Cards reordered.');
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to reorder cards.');
    }
  };

  return (
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
        maxWidth: '780px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
        animation: 'modalSlideUp 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          color: '#ffffff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={22} color="#d32020" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Campaign Content Cards
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              Managing additional detail sections for: <strong style={{ color: '#ffffff' }}>{campaign.title}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
          {success && (
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #6ee7b7',
              color: '#065f46',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '16px',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              {success}
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '16px',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {/* Add New Card Trigger Button */}
          {!isFormOpen && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                Total Cards: {cards.length} (No Limit)
              </span>
              <button
                onClick={handleOpenAddForm}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#d32020',
                  color: '#ffffff',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={16} />
                <span>Add Content Card</span>
              </button>
            </div>
          )}

          {/* Inline Form for Adding / Editing */}
          {isFormOpen && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #d32020',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 10px 25px rgba(211,32,32,0.08)'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                {editingCardId ? 'Edit Content Card' : 'Add New Content Card'}
              </h4>

              <form onSubmit={handleSaveCard}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Card Heading / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24/7 Mobile ICU & Ambulance"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
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

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about this feature or update for the public campaign page..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Card Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
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

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
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
                    disabled={loading}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#d32020',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Saving...' : (editingCardId ? 'Update Card' : 'Add Card')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Content Cards */}
          {cards.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <ImageIcon size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No Content Cards Added Yet</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                Add additional image cards to present richer stories and details on the campaign page.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cards.map((card, idx) => (
                <div key={card.id} style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <img 
                      src={card.image} 
                      alt={card.heading} 
                      style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} 
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          #{idx + 1}
                        </span>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                          {card.heading}
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Reordering */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {/* Reorder Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        onClick={() => handleMoveCard(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '3px',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          opacity: idx === 0 ? 0.3 : 1
                        }}
                      >
                        <ArrowUp size={14} color="#334155" />
                      </button>
                      <button
                        onClick={() => handleMoveCard(idx, 'down')}
                        disabled={idx === cards.length - 1}
                        title="Move Down"
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '3px',
                          cursor: idx === cards.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: idx === cards.length - 1 ? 0.3 : 1
                        }}
                      >
                        <ArrowDown size={14} color="#334155" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenEditForm(card)}
                      title="Edit Card"
                      style={{
                        padding: '8px',
                        backgroundColor: '#f1f5f9',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#2563eb',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(card.id)}
                      title="Delete Card"
                      style={{
                        padding: '8px',
                        backgroundColor: '#fef2f2',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#dc2626',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Done Managing Cards
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Card Deletion */}
      <ConfirmationModal
        isOpen={!!deleteConfirmId}
        title="Delete Content Card?"
        message="Are you sure you want to delete this additional content card? This action cannot be undone."
        confirmText="Delete Card"
        type="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteCard}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
