import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DonateModal from '../../components/DonateModal';
import { api } from '../../services/api';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Heart
} from 'lucide-react';

export default function ContactPage() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleCaptchaClick = () => {
    if (isCaptchaChecked) return;
    setCaptchaLoading(true);
    setTimeout(() => {
      setCaptchaLoading(false);
      setIsCaptchaChecked(true);
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.contactNumber.trim()) {
      setErrorMessage('Please enter your contact number.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!formData.subject.trim()) {
      setErrorMessage('Please enter a subject.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage('Please enter your message.');
      return;
    }
    if (!isCaptchaChecked) {
      setErrorMessage('Please confirm the "I\'m not a robot" verification.');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitContactQuery(formData);
      setSubmitSuccess(true);
      setFormData({
        fullName: '',
        contactNumber: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsCaptchaChecked(false);
    } catch (err) {
      console.error('Contact submission error:', err);
      setErrorMessage(err.message || 'Unable to submit your message right now. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page" style={{ minHeight: '100vh', backgroundColor: '#fdfdfc', color: '#111827' }}>
      <Navbar onOpenDonate={() => setDonateModalOpen(true)} />

      {/* Hero Header Banner */}
      <section style={{
        backgroundColor: '#faf7f2',
        borderBottom: '1px solid #f1ece4',
        padding: '60px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Artwork matching screenshot */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '4%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          opacity: 0.85,
          pointerEvents: 'none'
        }} className="banner-decor-left">
          {/* Green Paw */}
          <svg width="34" height="34" viewBox="0 0 24 24" fill="#65a30d">
            <circle cx="7" cy="8" r="2.5" />
            <circle cx="17" cy="8" r="2.5" />
            <circle cx="12" cy="5" r="2.5" />
            <path d="M7 16c0-3 2.2-5 5-5s5 2 5 5c0 2-2 3.5-5 3.5S7 18 7 16z" />
          </svg>
          {/* Outlined Helping Hands with Heart */}
          <svg width="84" height="84" viewBox="0 0 100 100" fill="none" stroke="#d97706" strokeWidth="1.6" opacity="0.6">
            <path d="M30 75 C30 50, 42 40, 46 25 C47 20, 52 20, 52 25 C52 40, 50 55, 50 65" />
            <path d="M40 75 C40 55, 52 45, 56 30 C57 25, 62 25, 62 30 C62 45, 60 60, 60 70" />
            <path d="M22 65 C22 55, 32 48, 38 40 C40 37, 44 38, 44 42 C44 50, 40 60, 36 70" />
            <path d="M48 50 C48 45, 55 42, 58 45 C61 48, 55 56, 48 60 C41 56, 35 48, 38 45 C41 42, 48 45, 48 50 Z" stroke="#ef4444" fill="#fee2e2" />
          </svg>
        </div>

        {/* Center Floating Heart */}
        <div style={{
          position: 'absolute',
          top: '32px',
          right: '28%',
          pointerEvents: 'none'
        }}>
          <Heart size={20} color="#dc2626" fill="#dc2626" style={{ opacity: 0.85 }} />
        </div>

        {/* Right Outlined Helping Hands */}
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '4%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          opacity: 0.85,
          pointerEvents: 'none'
        }} className="banner-decor-right">
          <svg width="90" height="90" viewBox="0 0 100 100" fill="none" stroke="#d97706" strokeWidth="1.6" opacity="0.6">
            <path d="M70 75 C70 50, 58 40, 54 25 C53 20, 48 20, 48 25 C48 40, 50 55, 50 65" />
            <path d="M60 75 C60 55, 48 45, 44 30 C43 25, 38 25, 38 30 C38 45, 40 60, 40 70" />
            <path d="M78 65 C78 55, 68 48, 62 40 C60 37, 56 38, 56 42 C56 50, 60 60, 64 70" />
            <path d="M52 50 C52 45, 45 42, 42 45 C39 48, 45 56, 52 60 C59 56, 65 48, 62 45 C59 42, 52 45, 52 50 Z" stroke="#ef4444" fill="#fee2e2" />
          </svg>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontSize: '2.8rem',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.02em',
            marginBottom: '8px'
          }}>
            Contact Us
          </h1>
          <p style={{
            fontSize: '1.05rem',
            color: '#6b7280',
            fontWeight: 500,
            margin: 0
          }}>
            Your enquiry is valuable for us
          </p>
        </div>
      </section>

      {/* Main Content: Two Columns */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '60px 24px 100px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'start'
        }}>
          {/* Left Column: Get in touch & Info cards */}
          <div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '10px',
              letterSpacing: '-0.01em'
            }}>
              Get in touch
            </h2>
            <p style={{
              fontSize: '0.96rem',
              color: '#6b7280',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '520px'
            }}>
              Access our comprehensive help center with FAQs, guides, and direct support options.
            </p>

            {/* 3 Contact Info Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              
              {/* Card 1: Location */}
              <a 
                href="https://maps.app.goo.gl/B3DAbKZVYkzF2kw18" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
                className="contact-info-card"
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#739c3e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(115, 156, 62, 0.25)'
                }}>
                  <MapPin size={22} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                    Location
                  </div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#1f2937', lineHeight: 1.35 }}>
                   Ward Number 2, Kothi (Satna)-485005,
Madhya Pradesh (India)

                  </div>
                </div>
              </a>

              {/* Card 2: Helpline Number (Clickable to open phone dialer) */}
              <a 
                href="tel:+918269639451"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
                className="contact-info-card"
                title="Click to call +91 8269639451"
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#739c3e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(115, 156, 62, 0.25)'
                }}>
                  <Phone size={22} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                    Helpline Number
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                    +91 8269639451
                  </div>
                </div>
              </a>

              {/* Card 3: Email (Clickable to open email client) */}
              <a 
                href="mailto:animalhelpingfoundation06@gmail.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
                className="contact-info-card"
                title="Click to email animalhelpingfoundation06@gmail.com"
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#739c3e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(115, 156, 62, 0.25)'
                }}>
                  <Mail size={22} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                    Email
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', wordBreak: 'break-all' }}>
                    animalhelpingfoundation06@gmail.com
                  </div>
                </div>
              </a>

            </div>

            {/* Google Maps Container */}
            <div style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              height: '310px'
            }}>
              {/* Floating "Open in Maps" Button */}
              <a
                href="https://maps.app.goo.gl/B3DAbKZVYkzF2kw18"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  zIndex: 10,
                  backgroundColor: '#ffffff',
                  color: '#1d4ed8',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <span>Open in Maps</span>
                <ExternalLink size={14} />
              </a>

              {/* Embedded Google Map */}
              <iframe
                title="Animal Helping Foundation Location"
                src="https://maps.google.com/maps?q=Shankar%20Nagar,%20Nandanwan,%20Jodhpur,%20Rajasthan%20342008&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Fill the details Form */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            padding: '36px 36px 40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
            position: 'relative'
          }}>
            {/* Form Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
              <Sparkles size={20} color="#739c3e" />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Fill the details
              </h3>
            </div>

            {submitSuccess ? (
              <div style={{
                padding: '40px 24px',
                textAlign: 'center',
                backgroundColor: '#f0fdf4',
                borderRadius: '16px',
                border: '1px solid #bbf7d0'
              }}>
                <CheckCircle2 size={54} color="#16a34a" style={{ margin: '0 auto 16px' }} />
                <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d', marginBottom: '8px' }}>
                  Thank You for Contacting Us!
                </h4>
                <p style={{ color: '#166534', fontSize: '0.94rem', lineHeight: 1.5, marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
                  Your query has been recorded. Our team will review your message and reach out to you via email or phone as soon as possible.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 28px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Send Another Query
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {errorMessage && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    marginBottom: '20px'
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 2-Column Responsive Form Fields */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '18px',
                  marginBottom: '18px'
                }}>
                  {/* Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter Full Name"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.92rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      className="contact-form-input"
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Contact number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Enter Contact number"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.92rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      className="contact-form-input"
                    />
                  </div>

                  {/* Email ID */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Email ID <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter Email ID"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.92rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      className="contact-form-input"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      Subject <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Enter Subject"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.92rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      className="contact-form-input"
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Message <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter Your message"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    className="contact-form-input"
                  />
                </div>

                {/* reCAPTCHA Checkbox matching screenshot */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  backgroundColor: '#f9fafb',
                  maxWidth: '300px',
                  marginBottom: '24px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }} onClick={handleCaptchaClick}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      border: isCaptchaChecked ? '2px solid #16a34a' : '2px solid #9ca3af',
                      backgroundColor: isCaptchaChecked ? '#16a34a' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}>
                      {captchaLoading ? (
                        <Loader2 size={16} color="#4b5563" style={{ animation: 'spin 1s linear infinite' }} />
                      ) : isCaptchaChecked ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : null}
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151' }}>
                      I'm not a robot
                    </span>
                  </div>

                  {/* Google reCAPTCHA Brand Icon */}
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 15.14 3.44 17.94 5.7 19.8L4.2 21.3C1.6 18.9 0 15.6 0 12C0 5.4 5.4 0 12 0C15.6 0 18.9 1.6 21.3 4.2L19.8 5.7C17.94 3.44 15.14 2 12 2Z" fill="#1d4ed8" />
                      <path d="M22 12C22 17.52 17.52 22 12 22C8.86 22 6.06 20.56 4.2 18.3L5.7 16.8C7.56 18.56 10.36 20 12 20C17.52 20 22 15.52 22 10C22 8.4 21.6 6.9 20.9 5.6L22.4 4.1C23.4 5.8 24 7.8 24 10C24 10.7 23.9 11.3 23.8 12H22Z" fill="#3b82f6" />
                    </svg>
                    <span style={{ fontSize: '0.58rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      reCAPTCHA
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#e11d48',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px 44px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  className="contact-submit-btn"
                >
                  {submitting && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                  <span>{submitting ? 'Submitting...' : 'Submit'}</span>
                </button>
              </form>
            )}

            {/* Bottom-right Corner Playful Decorative Hand/Doodle */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              right: '20px',
              pointerEvents: 'none',
              opacity: 0.85
            }}>
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                <path d="M40 30 C45 20, 55 20, 58 32 C62 25, 72 27, 72 38 C75 32, 85 36, 82 48 C78 62, 60 75, 45 75 C30 75, 25 60, 30 48 Z" fill="#eab308" />
                <path d="M48 52 C48 48, 54 46, 56 48 C58 50, 54 56, 48 60 C42 56, 38 50, 40 48 C42 46, 48 48, 48 52 Z" fill="#047857" />
                <circle cx="20" cy="40" r="3" fill="#047857" />
                <circle cx="26" cy="30" r="2.5" fill="#047857" />
                <circle cx="16" cy="50" r="2.5" fill="#047857" />
                <path d="M45 75 Q60 85 75 80 Q90 75 95 90" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <DonateModal 
        isOpen={donateModalOpen} 
        onClose={() => setDonateModalOpen(false)} 
      />
    </div>
  );
}
