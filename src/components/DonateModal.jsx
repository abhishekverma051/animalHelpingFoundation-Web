import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, Heart, Shield, User, Mail, Phone, Lock } from 'lucide-react';
import { api } from '../services/api';
import pixel from '../services/pixel';

export default function DonateModal({ isOpen, onClose, campaign, onSuccess, initialAmount }) {
  const navigate = useNavigate();
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
  const [razorpayPaymentId, setRazorpayPaymentId] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  useEffect(() => {
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
    
    if (isOpen) {
      pixel.trackInitiateCheckout({
        amount: Number(customAmount || selectedAmount || initialAmount || 1000),
        currency: 'INR',
        campaignId: campaign?.id,
        campaignTitle: campaign?.title
      });
    }
  }, [initialAmount, isOpen]);

  if (!isOpen) return null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAmountClick = (amt) => {
    setSelectedAmount(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a promo code.');
      setPromoSuccess('');
      return;
    }
    if (['TEST0', 'METATEST', 'FREE100'].includes(code)) {
      setAppliedPromo(code);
      setPromoSuccess('Promo Code Applied: 100% Free Test Donation (₹0)');
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Use TEST0 for ₹0 testing.');
      setPromoSuccess('');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo('');
    setPromoCodeInput('');
    setPromoSuccess('');
    setPromoError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numericAmt = Number(customAmount || selectedAmount || 500);
    if (!appliedPromo && (!numericAmt || numericAmt <= 0)) {
      setError('Please select or enter a valid donation amount.');
      return;
    }

    if (!isAnonymous && (!formData.name || !formData.name.trim())) {
      setError('Please enter your full name.');
      return;
    }

    if (!isAnonymous && (!formData.email || !formData.email.trim())) {
      setError('Please enter your email address.');
      return;
    }

    if (!formData.phone || formData.phone.trim().length < 8) {
      setError('Please enter a valid contact number.');
      return;
    }

    const effectiveDonorName = isAnonymous ? 'Anonymous' : (formData.name ? formData.name.trim() : 'Kind Heart');
    const effectiveEmail = formData.email ? formData.email.trim() : '';

    // If Test Promo Code is applied: Process ₹0 donation directly and trigger Meta Pixel Purchase event!
    if (appliedPromo) {
      try {
        setSubmitting(true);
        const res = await api.createDonation({
          campaignId: campaign ? campaign.id : 'camp-1',
          donorName: effectiveDonorName,
          email: effectiveEmail,
          phone: formData.phone,
          amount: numericAmt,
          isAnonymous,
          promoCode: appliedPromo
        });

        const testPayId = `pay_test_promo_${Date.now()}`;
        setRazorpayPaymentId(testPayId);
        setSubmitted(true);

        // Fire Meta Pixel Purchase event with the target amount for ad attribution testing
        pixel.trackPurchase({
          orderId: testPayId,
          amount: numericAmt,
          currency: 'INR',
          campaignId: campaign ? campaign.id : 'camp-1',
          campaignTitle: campaign ? campaign.title : 'Animal Welfare Donation'
        });

        if (onSuccess) onSuccess();
        onClose();
        navigate('/thank-you', {
          state: {
            paymentId: testPayId,
            amount: numericAmt,
            donorName: effectiveDonorName,
            campaignTitle: campaign ? campaign.title : 'Emergency Stray Animal Care & Rescue',
            isAnonymous
          }
        });
      } catch (err) {
        console.error('Test Promo Donation Error:', err);
        setError(err.message || 'Failed to process test promo donation.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      setSubmitting(true);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError('Razorpay payment gateway failed to load. Please check your internet connection and try again.');
        setSubmitting(false);
        return;
      }

      // Step 1: Create Order on Backend
      const orderRes = await api.createRazorpayOrder(numericAmt, campaign ? campaign.id : 'camp-1');
      if (!orderRes || !orderRes.order) {
        throw new Error(orderRes.message || 'Could not initiate Razorpay payment order.');
      }

      // Step 2: Launch Razorpay Checkout Popup
      const options = {
        key: orderRes.key || 'rzp_live_TbxI4yt7rPj7yi',
        amount: orderRes.order.amount,
        currency: orderRes.order.currency || 'INR',
        name: 'Animal Helping Foundation',
        description: campaign ? `Donation for ${campaign.title}` : 'Support Stray Animal Care & Medical Relief',
        image: 'https://animalhelpingfoundation.org/assets/webLogo.png',
        order_id: orderRes.order.id,
        prefill: {
          name: effectiveDonorName,
          email: effectiveEmail,
          contact: formData.phone
        },
        theme: {
          color: '#d32020'
        },
        handler: async function (response) {
          try {
            // Step 3: Verify Payment Signature on Backend
            const verifyRes = await api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              campaignId: campaign ? campaign.id : 'camp-1',
              donorName: effectiveDonorName,
              email: effectiveEmail,
              phone: formData.phone,
              amount: numericAmt,
              isAnonymous
            });

            setRazorpayPaymentId(response.razorpay_payment_id);
            setSubmitted(true);

            // Step 4: Fire Meta Pixel Purchase Event (with eventID matching backend CAPI)
            pixel.trackPurchase({
              orderId: response.razorpay_payment_id,
              amount: numericAmt,
              currency: 'INR',
              campaignId: campaign ? campaign.id : 'camp-1',
              campaignTitle: campaign ? campaign.title : 'Animal Welfare Donation'
            });

            if (onSuccess) onSuccess();
            onClose();
            navigate('/thank-you', {
              state: {
                paymentId: response.razorpay_payment_id,
                amount: numericAmt,
                donorName: effectiveDonorName,
                campaignTitle: campaign ? campaign.title : 'Emergency Stray Animal Care & Rescue',
                isAnonymous
              }
            });
          } catch (verifyErr) {
            console.error('Payment Verification Failed:', verifyErr);
            setError(verifyErr.message || 'Payment verification failed. If money was deducted, please contact us.');
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        console.error('Razorpay Payment Failed:', resp);
        setError(resp.error?.description || 'Payment failed or was cancelled. Please try again.');
        setSubmitting(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Donation error:', err);
      setError(err.message || 'Failed to process donation.');
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
                  <span>Full Name {isAnonymous ? '(Optional)' : '*'}</span>
                </label>
                <input
                  type="text"
                  required={!isAnonymous}
                  placeholder={isAnonymous ? "Anonymous Donor (Optional)" : "e.g. Rahul Sharma"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Email Address */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} color="#d32020" />
                  <span>Email Address {isAnonymous ? '(Optional)' : '*'}</span>
                </label>
                <input
                  type="email"
                  required={!isAnonymous}
                  placeholder={isAnonymous ? "Optional for receipt" : "e.g. rahul@example.com"}
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
                margin: '16px 0 16px',
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

              {/* Promo Code / Test Code Card */}
              <div style={{
                marginBottom: '20px',
                padding: '12px 14px',
                backgroundColor: appliedPromo ? '#f0fdf4' : '#fafafa',
                borderRadius: '12px',
                border: appliedPromo ? '1px solid #bbf7d0' : '1px dashed #cbd5e1'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: appliedPromo ? '#16a34a' : '#475569' }}>
                    {appliedPromo ? `✓ Promo Code Applied (${appliedPromo})` : 'Have a Promo / Test Code?'}
                  </span>
                  {appliedPromo && (
                    <button 
                      type="button" 
                      onClick={handleRemovePromo}
                      style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {!appliedPromo ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Enter promo code (e.g. TEST0)" 
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      style={{ 
                        flex: 1, 
                        padding: '8px 12px', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '8px', 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={handleApplyPromo}
                      style={{ 
                        backgroundColor: '#0f172a', 
                        color: '#ffffff', 
                        border: 'none', 
                        borderRadius: '8px', 
                        padding: '8px 16px', 
                        fontSize: '0.85rem', 
                        fontWeight: 700, 
                        cursor: 'pointer' 
                      }}
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 600 }}>
                    🎉 100% Free Test Donation Enabled (Payable: ₹0). Fires live Meta Pixel Purchase for ad testing!
                  </div>
                )}
                {promoSuccess && <div style={{ color: '#16a34a', fontSize: '0.78rem', marginTop: '6px', fontWeight: 700 }}>✓ {promoSuccess}</div>}
                {promoError && <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '6px', fontWeight: 600 }}>{promoError}</div>}
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
                  gap: '8px',
                  backgroundColor: appliedPromo ? '#16a34a' : undefined
                }}
              >
                <Heart size={18} fill="#ffffff" />
                <span>
                  {submitting 
                    ? 'Processing...' 
                    : appliedPromo 
                      ? 'Complete Free Test Donation (₹0)' 
                      : `Proceed to Pay ${finalAmount}`}
                </span>
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
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '16px', lineHeight: 1.6 }}>
              Your generous contribution of <strong>{finalAmount}</strong> has been successfully received via Razorpay! You are directly saving lives and helping stray animals.
            </p>

            {razorpayPaymentId && (
              <div style={{
                backgroundColor: '#f1f5f9',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                color: '#334155',
                marginBottom: '20px',
                fontWeight: 600,
                textAlign: 'center',
                fontFamily: 'monospace'
              }}>
                Razorpay Payment ID: <strong>{razorpayPaymentId}</strong>
              </div>
            )}

            {isAnonymous && (
              <div style={{ marginBottom: '20px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                🔒 Your identity remains private and will display as "Anonymous" on the donor list.
              </div>
            )}

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
