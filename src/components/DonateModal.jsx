import React, { useState } from 'react';
import { X, CheckCircle, Heart } from 'lucide-react';

export default function DonateModal({ isOpen, onClose, campaign }) {
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState('one-time');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'upi'
  });

  if (!isOpen) return null;

  const handleAmountClick = (amt) => {
    setSelectedAmount(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const finalAmount = customAmount ? `₹${customAmount}` : `₹${selectedAmount || 500}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {!submitted ? (
          <>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Heart size={20} color="#d92626" fill="#d92626" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#d92626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ANIMAL HELPING FOUNDATION
                </span>
              </div>
              <h3>{campaign ? campaign.title : 'Support Our Animal Cause'}</h3>
              <p>Your contribution directly provides food, medical care, and shelter to stray animals in need.</p>
            </div>

            {/* Frequency Selection */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button 
                type="button"
                className={`amount-btn ${frequency === 'one-time' ? 'selected' : ''}`}
                style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
                onClick={() => setFrequency('one-time')}
              >
                Give One-Time
              </button>
              <button 
                type="button"
                className={`amount-btn ${frequency === 'monthly' ? 'selected' : ''}`}
                style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
                onClick={() => setFrequency('monthly')}
              >
                Give Monthly 💖
              </button>
            </div>

            {/* Amount Selection */}
            <div className="amount-grid">
              {[500, 1000, 2500, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`amount-btn ${selectedAmount === amt ? 'selected' : ''}`}
                  onClick={() => handleAmountClick(amt)}
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label>Custom Amount (₹)</label>
              <input
                type="number"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={handleCustomChange}
              />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-submit-donation">
                Donate {finalAmount} {frequency === 'monthly' ? '/ Month' : ''}
              </button>
            </form>
          </>
        ) : (
          <div className="success-box">
            <div className="success-icon">
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', color: '#111827' }}>
              Thank You, {formData.name || 'Kind Heart'}! 🎉
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '20px', lineHeight: 1.6 }}>
              Your generous contribution of <strong>{finalAmount}</strong> has been received! You are helping us feed and treat animals who have no one.
            </p>
            <button 
              className="btn-submit-donation"
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
            >
              Done & Return to Site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
