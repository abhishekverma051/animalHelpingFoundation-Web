import React from 'react';

export default function RecognitionSection({ onOpenDonate }) {
  return (
    <>
      <section className="recognition-section" id="recognition">
        <div className="container">
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="pill-tag">OUR IMPACT & RECOGNITION</span>
            <h2 className="section-title">
              Making a <span style={{ color: '#d92626' }}>Difference</span>, One Life at a Time.
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto', maxWidth: '780px' }}>
              For years, we've worked to rescue, protect, and care for animals in need. Every milestone reflects the compassion of our supporters and the collective effort to give vulnerable animals a safer, healthier life.
            </p>
          </div>

          {/* 3 Stats & Impact Cards Grid */}
          <div className="stats-grid-4">
            {/* Card 1: 500+ Rescues & Initiatives */}
            <div className="stat-box-white">
              <img 
                src="/assets/dogFeet.png" 
                alt="Paw Prints" 
                style={{ position: 'absolute', top: '20px', right: '20px', width: '56px', opacity: 0.8 }} 
              />
              <div style={{ fontSize: '3.6rem', fontWeight: 900, color: '#111827', lineHeight: 1, marginBottom: '24px' }}>
                500<span style={{ color: '#d92626' }}>+</span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                Rescues & Initiatives
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.5 }}>
                Every Rescue Represents A Life Given Another Chance & Every Initiative.
              </p>
            </div>

            {/* Card 2: Animals Helped 10K+ */}
            <div className="stat-box-white" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                  Animals Helped
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.4 }}>
                  From Rescue And Food Support To Medical Treatment And Rehabilitation.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px' }}>
                <div style={{ fontSize: '3.6rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>
                  10K<span style={{ color: '#d92626' }}>+</span>
                </div>
                <img src="/assets/dogPng.png" alt="Dog Icon" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Card 3: Dark Red Statement Card */}
            <div className="stat-box-red">
              <div style={{ height: '110px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                <img src="/assets/rubble_rescue.png" alt="Rescue Under Rubble" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.92)', lineHeight: 1.5, marginBottom: '20px' }}>
                Our work isn't measured only in numbers. It's measured in lives rescued, wounds healed, hungry animals fed, and vulnerable lives given a safe place to recover.
              </p>
              <button 
                style={{ background: '#ffffff', color: '#b91c1c', fontWeight: 800, fontSize: '0.85rem', padding: '10px 20px', borderRadius: '50px', width: '100%' }}
                onClick={() => onOpenDonate()}
              >
                Learn More About Our Work →
              </button>
            </div>
          </div>

          {/* Featured & Recognized Banner */}
          <div className="featured-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src="/assets/medal.png" alt="Medal Icon" style={{ width: '32px' }} />
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                  Our Work Has Been
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontStyle: 'italic', color: '#f87171' }}>
                  Featured & Recognized
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '16px', opacity: 0.85 }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>ANI NEWS</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>DNA</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>oneindia</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>BusinessWorld</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>ABP</span>
                </div>
              </div>
            </div>

            <div style={{ width: '220px', height: '120px', borderRadius: '16px', overflow: 'hidden' }}>
              <img src="/assets/vet_treating.png" alt="Vet Treating Puppy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Full Viewport-Width Immersive Nepal Floods Emergency Banner matching Screenshot 4 */}
      <section className="nepal-floods-fullwidth">
        <img src="/assets/nepalFlood.png" alt="Nepal Floods Rescue" className="nepal-floods-fullwidth-bg" />
        
        {/* Top Fade & Bottom Fade Overlay Gradient */}
        <div className="nepal-floods-fullwidth-overlay"></div>

        <div className="nepal-floods-content">
          <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            Help Save Animals Affected by the <span style={{ color: '#f87171' }}>Nepal Floods</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, marginBottom: '32px', maxWidth: '840px', margin: '0 auto 32px' }}>
            Floodwaters have left countless animals vulnerable, stranded, and without access to food or safe shelter. Your support can help us provide food, clean water, emergency rescue, medical care, and temporary shelter to animals affected by the crisis.
          </p>
          <button 
            className="btn-hero-primary"
            style={{ margin: '0 auto', padding: '16px 48px', fontSize: '1rem', fontWeight: 800 }}
            onClick={() => onOpenDonate({ title: 'Nepal Floods Animal Relief' })}
          >
            DONATE NOW
          </button>
        </div>
      </section>
    </>
  );
}
