import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function YourImpactSection({ onOpenDonate }) {
  const [monthlyAmount, setMonthlyAmount] = useState('5000');
  const [selectedPreset, setSelectedPreset] = useState(5000);

  const handlePresetClick = (amt) => {
    setSelectedPreset(amt);
    setMonthlyAmount(amt.toString());
  };

  return (
    <section className="impact-section" id="impact">
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '40px' }}>
          <span className="pill-tag">YOUR IMPACT</span>
          <h2 className="section-title">
            Every Contribution Has a <span style={{ color: '#d92626' }}>Purpose</span>
          </h2>
          <p className="section-subtitle" style={{ maxWidth: '820px' }}>
            Your donation doesn't just support a campaign — it helps turn a genuine need into meaningful action. Together with our supporters, we work to ensure every contribution reaches the causes and communities that need it most.
          </p>
        </div>

        {/* 3 Impact Cards */}
        <div className="impact-cards-grid">
          {/* Card 1 */}
          <div className="impact-card">
            <img src="/assets/impact1.png" alt="Rescue Animals in Need" className="impact-card-img" />
            <div className="impact-card-overlay"></div>
            <div className="impact-watermark">01</div>
            <div className="impact-card-content">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px', color: '#fff' }}>
                Rescue Animals in Need
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                Help rescue injured, abandoned, and vulnerable animals from unsafe and difficult situations.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="impact-card">
            <img src="/assets/impact2.png" alt="Provide Food & Nutrition" className="impact-card-img" />
            <div className="impact-card-overlay"></div>
            <div className="impact-watermark">02</div>
            <div className="impact-card-content">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px', color: '#fff' }}>
                Provide Food & Nutrition
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                Support daily meals and proper nutrition for animals who depend on timely care and support.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="impact-card">
            <img src="/assets/impact3.png" alt="Fund Medical Care" className="impact-card-img" />
            <div className="impact-card-overlay"></div>
            <div className="impact-watermark">03</div>
            <div className="impact-card-content">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px', color: '#fff' }}>
                Fund Medical Care
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                Help cover emergency treatment, medicines, vaccinations, and ongoing veterinary care.
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Donation Banner Card */}
        <div className="monthly-donation-card">
          <img 
            src="/assets/monthly_puppy.png" 
            alt="Sad Puppy" 
            className="monthly-donation-bg" 
          />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '580px' }}>
            <span style={{ fontSize: '1.35rem', fontStyle: 'italic', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
              Feed a Helpless Animal.
            </span>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#f87171', lineHeight: 1.1, margin: '4px 0 16px' }}>
              Every Month.
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, marginBottom: '24px' }}>
              Thousands of abandoned and vulnerable animals struggle for food, shelter, and medical care every day. Your support can help us provide them with the care and protection they deserve.
            </p>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 600 }}>Donation Amount</label>
              <input 
                type="text" 
                className="monthly-form-input" 
                placeholder="e.g. 5000"
                value={monthlyAmount}
                onChange={(e) => {
                  setMonthlyAmount(e.target.value);
                  setSelectedPreset(null);
                }}
              />
            </div>

            {/* Preset Amount Pills */}
            <div className="preset-pills-row">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className={`preset-pill-btn ${selectedPreset === amt ? 'active' : ''}`}
                  onClick={() => handlePresetClick(amt)}
                >
                  ₹ {amt}+
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <button 
              className="btn-hero-primary" 
              style={{ width: '100%', justifyContent: 'center', marginBottom: '14px' }}
              onClick={() => onOpenDonate({ title: 'Monthly Animal Care Supporter', isMonthly: true })}
            >
              Start Monthly Donation <ArrowRight size={18} />
            </button>

            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
              *Your monthly contribution helps us provide care consistently, not just when an emergency arises.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
