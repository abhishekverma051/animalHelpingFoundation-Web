import React from 'react';

export default function AboutSection() {
  return (
    <section className="about-section" id="about" style={{ position: 'relative' }}>
      {/* Decorative graphic accents from assets */}
      <img 
        src="/assets/redFlower.png" 
        alt="Red Flower Accent" 
        style={{ position: 'absolute', bottom: '180px', left: '10px', width: '32px', zIndex: 2 }}
      />
      <img 
        src="/assets/yellowSketch.png" 
        alt="Yellow Sketch Accent" 
        style={{ position: 'absolute', top: '380px', right: '10px', width: '36px', zIndex: 2 }}
      />

      <div className="container">
        {/* Header with Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
          <div>
            <span className="pill-tag">ABOUT THE NGO / OUR IMPACT</span>
            <h2 className="section-title" style={{ fontSize: '2.5rem', maxWidth: '640px', marginTop: '8px' }}>
              Turning Compassion Into Meaningful Action
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                15<span style={{ color: '#d92626' }}>+</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, marginTop: '4px' }}>
                Years Of Experience
              </div>
            </div>

            <div style={{ width: '1px', height: '50px', background: '#e5e7eb' }}></div>

            <div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                100<span style={{ color: '#d92626' }}>+</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600, marginTop: '4px' }}>
                Campaigns & Initiatives
              </div>
            </div>
          </div>
        </div>

        {/* Multi-panel Photo Collage */}
        <div style={{ borderRadius: '24px', overflow: 'hidden', marginBottom: '40px', boxShadow: 'var(--shadow-md)' }}>
          <img 
            src="/assets/community.png" 
            alt="Turning Compassion Into Action Collage" 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Paragraphs with Red Highlight Pills matching Figma */}
        <div style={{ maxWidth: '1040px', fontSize: '1.08rem', color: '#4b5563', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p>
            <span className="pill-highlight-text">We believe meaningful change begins with compassion and action.</span> Our work focuses on supporting people and communities who need a helping hand, turning the generosity of our donors into real support where it matters most.
          </p>

          <p>
            From providing essential resources to <span className="pill-highlight-text">Supporting education, healthcare, food, and other community initiatives,</span> we work closely with those we serve to create an impact that goes beyond a single contribution.
          </p>
        </div>
      </div>
    </section>
  );
}
