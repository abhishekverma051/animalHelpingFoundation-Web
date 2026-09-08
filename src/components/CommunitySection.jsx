import React from 'react';

export default function CommunitySection() {
  return (
    <section style={{ padding: '40px 0 80px', backgroundColor: '#fafafa' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="pill-tag">OUR COMMUNITY & IMPACT</span>
          <h2 className="section-title">Join Thousands of Compassionate Animal Lovers</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Together, our volunteer network, veterinary partners, and donors have saved over 15,000 animals.
          </p>
        </div>

        <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <img 
            src="/assets/community.png" 
            alt="Animal Helping Foundation Community Collage" 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
    </section>
  );
}
