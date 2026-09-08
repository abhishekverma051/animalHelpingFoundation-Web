import React, { useState } from 'react';
import { X, CheckCircle, Heart, Shield, User, Mail, Phone, Lock } from 'lucide-react';
import { api } from '../services/api';

export default function DonateModal({ isOpen, onClose, campaign, onSuccess, initialAmount }) {
  const [selectedAmount, setSelectedAmount] = useState(initialAmount || 1000);
  const [customAmount, setCustomAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'upi'
  });

  React.useEffect(() => {
    if (isOpen && initialAmount) {
      const num = Number(initialAmount);
      if ([500, 1000, 2500, 5000, 10000].includes(num)) {
        setSelectedAmount(num);
        setCustomAmount('');
      } else {
        setSelectedAmount(null);
        setCustomAmount(String(num));
      }
    }
  }, [initialAmount, isOpen]);

  if (!isOpen) return null;

  const handleAmountClick = (amt) => {
    setSelectedAmount(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmt = Number(customAmount || selectedAmount || 500);
    if (!numericAmt || numericAmt <= 0) {
      setError('Please select or enter a valid donation amount.');
      return;
    }

    if (!formData.phone || formData.phone.trim().length < 8) {
      setError('Please enter a valid contact number.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createDonation({
        campaignId: campaign ? campaign.id : 'camp-1',
        donorName: formData.name,
        email: formData.email,
        phone: formData.phone,
        amount: numericAmt,
        isAnonymous
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Donation submit error:', err);
      setError(err.message || 'Failed to process donation.');
    } finally {
      setSubmitting(false);
    }
  };

  const finalAmount = customAmount ? `₹${customAmount}` : `₹${selectedAmount || 500}`;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100000 }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', borderRadius: '28px', padding: '32px', maxHeight: '88vh', overflowY: 'auto' }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {!submitted ? (
          <>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ backgroundColor: '#fee2e2', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={18} color="#d32020" fill="#d32020" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#d32020', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ANIMAL HELPING FOUNDATION
                </span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '6px' }}>
                {campaign ? campaign.title : 'Support Our Animal Cause'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Your contribution directly provides food, medical care, and emergency shelter to stray animals in need.
              </p>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                marginBottom: '20px',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            {/* Amount Selection Grid */}
            <div className="amount-grid" style={{ marginBottom: '16px' }}>
              {[500, 1000, 2500, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`amount-btn ${selectedAmount === amt ? 'selected' : ''}`}
                  onClick={() => handleAmountClick(amt)}
                  style={{ fontWeight: 800 }}
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                Custom Amount (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#64748b', fontSize: '0.95rem' }}>₹</span>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={handleCustomChange}
                  style={{ paddingLeft: '32px' }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} color="#d32020" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Email Address */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} color="#d32020" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Contact Number */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={15} color="#d32020" />
                  <span>Contact Number (Phone / WhatsApp) *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Anonymous Donation Checkbox Card */}
              <div style={{
                margin: '16px 0 24px',
                padding: '14px 16px',
                backgroundColor: '#f8fafc',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#d32020' }}
                />
                <label htmlFor="anonymousCheck" style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 700, cursor: 'pointer', userSelect: 'none', flex: 1 }}>
                  Make my donation anonymous
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                  <Lock size={14} color="#059669" />
                  <span>Private</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="btn-submit-donation"
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Heart size={18} fill="#ffffff" />
                <span>{submitting ? 'Processing Donation...' : `Donate ${finalAmount}`}</span>
              </button>
            </form>
          </>
        ) : (
          <div className="success-box" style={{ padding: '24px 12px' }}>
            <div className="success-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a', margin: '0 auto 16px' }}>
              <CheckCircle size={40} />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>
              Thank You, {isAnonymous ? 'Kind Supporter' : (formData.name || 'Kind Heart')}! 🎉
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
              Your generous contribution of <strong>{finalAmount}</strong> has been successfully received! You are directly saving lives and helping stray animals.
              {isAnonymous && (
                <span style={{ display: 'block', marginTop: '10px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                  🔒 Your identity remains private and will display as "Anonymous" on the donor list.
                </span>
              )}
            </p>
            <button 
              className="btn-submit-donation"
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              style={{ padding: '14px 28px', borderRadius: '12px', fontWeight: 700 }}
            >
              Done & Return to Site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
