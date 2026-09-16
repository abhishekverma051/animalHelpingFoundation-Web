import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Heart, Share2, Home, ArrowRight, ShieldCheck, Download, Sparkles } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import pixel from '../../services/pixel';

export default function ThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract payment details passed from DonateModal via state or URL search parameters
  const searchParams = new URLSearchParams(location.search);
  const state = location.state || {};

  const paymentId = state.paymentId || searchParams.get('paymentId') || searchParams.get('id') || 'AHF-' + Date.now().toString().slice(-8);
  const amount = Number(state.amount || searchParams.get('amount') || 1000);
  const donorName = state.donorName || searchParams.get('name') || 'Generous Supporter';
  const campaignTitle = state.campaignTitle || searchParams.get('campaign') || 'Emergency Stray Animal Care & Rescue';
  const isAnonymous = Boolean(state.isAnonymous);

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

  const donationDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    // Ensure Meta Pixel Purchase is tracked on the thank you page with unique eventID
    pixel.trackPurchase({
      orderId: paymentId,
      amount: amount,
      currency: 'INR',
      campaignTitle: campaignTitle
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [paymentId, amount, campaignTitle]);

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🐾 I just contributed ${formattedAmount} to "${campaignTitle}" with Animal Helping Foundation. Every small help saves helpless stray animals. Join me and support here: https://animalhelpingfoundation.org`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '40px 16px 80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '640px', width: '100%' }}>

          {/* Success Banner Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            padding: '40px 28px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top Accent Gradient Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #10b981, #059669, #d32020)'
            }} />

            {/* Glowing Icon */}
            <div style={{
              width: '84px',
              height: '84px',
              backgroundColor: '#ecfdf5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 0 12px rgba(236, 253, 245, 0.8)'
            }}>
              <CheckCircle2 size={46} color="#059669" strokeWidth={2.5} />
            </div>

            {/* Heading */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '12px'
            }}>
              <Sparkles size={14} /> Payment Verified & Recorded
            </span>

            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px', letterSpacing: '-0.02em' }}>
              Thank You, {isAnonymous ? 'Kind Supporter' : donorName}! 💖
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 28px' }}>
              Your generous donation of <strong style={{ color: '#0f172a' }}>{formattedAmount}</strong> will directly fund medical treatment, nourishment, and shelter for voiceless stray animals.
            </p>

            {/* Receipt Summary Card */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>Amount Contributed</span>
                <span style={{ fontSize: '1.25rem', color: '#059669', fontWeight: 900 }}>{formattedAmount}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Transaction / Order ID</span>
                <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700, fontFamily: 'monospace' }}>{paymentId}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Cause Supported</span>
                <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700, textAlign: 'right', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {campaignTitle}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Date</span>
                <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>{donationDate}</span>
              </div>
            </div>

            {/* 80G Tax Exemption Note */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '28px',
              textAlign: 'left'
            }}>
              <ShieldCheck size={22} color="#2563eb" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', color: '#1e40af', lineHeight: 1.4 }}>
                <strong>80G Tax Exemption Eligible:</strong> Your donation receipt has been recorded. All contributions to Animal Helping Foundation are eligible for tax exemption under section 80G of the Income Tax Act.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleShareWhatsApp}
                style={{
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '15px 24px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Share2 size={18} />
                <span>Share On WhatsApp & Multiply Impact</span>
              </button>

              <Link
                to="/"
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '14px',
                  padding: '15px 24px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Home size={18} />
                <span>Return To Home Page</span>
              </Link>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
