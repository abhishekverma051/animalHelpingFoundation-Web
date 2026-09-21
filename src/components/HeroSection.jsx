import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSection({ onOpenDonate }) {
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchHeroCampaigns = async () => {
      try {
        setLoading(true);
        const [featRes, allRes] = await Promise.all([
          api.getFeatured().catch(() => ({ featuredCampaigns: [] })),
          api.getCampaigns('Active').catch(() => ({ campaigns: [] }))
        ]);

        const feat = featRes.featuredCampaigns || [];
        const all = allRes.campaigns || [];
        
        // Combine featured & active to ensure up to 4 campaigns in hero carousel
        const combined = [...feat];
        all.forEach(c => {
          if (!combined.some(item => item.id === c.id)) {
            combined.push(c);
          }
        });

        if (isMounted && combined.length > 0) {
          setSlides(combined.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch hero campaigns:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHeroCampaigns();
    return () => { isMounted = false; };
  }, []);

  // Auto-scrolling carousel timer (Every 4.5 seconds, pauses on hover)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  if (loading || slides.length === 0) {
    return (
      <section className="hero-wrapper">
        <div className="hero-banner" style={{ background: '#120a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '1.1rem' }}>
            {loading ? 'Loading Active Causes...' : 'No active causes currently available.'}
          </div>
        </div>
      </section>
    );
  }

  const current = slides[activeSlide % slides.length];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const percent = Math.min(100, Math.round(((current.raisedAmount || 0) / (current.goalAmount || 1)) * 100));

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="hero-wrapper">
      <div 
        className="hero-banner"
        onClick={() => navigate(`/campaign/${current.id}`)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        {/* Top-Right Starburst Badge Accent */}
        <div className="starburst-badge"></div>

        {/* Left Yellow Accent Ribbon Badge */}
        <div className="yellow-badge-accent"></div>

        {/* Background Image */}
        <img 
          key={current.id || activeSlide}
          src={current.image} 
          alt={current.title} 
          className="hero-bg-img" 
          style={{ transition: 'opacity 0.5s ease-in-out' }}
        />
        <div className="hero-overlay"></div>

        {/* Carousel Navigation Arrow - Left */}
        {slides.length > 1 && (
          <button
            onClick={handlePrev}
            className="hero-carousel-nav-btn hero-carousel-prev"
            title="Previous Campaign"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Carousel Navigation Arrow - Right */}
        {slides.length > 1 && (
          <button
            onClick={handleNext}
            className="hero-carousel-nav-btn hero-carousel-next"
            title="Next Campaign"
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div className="hero-content">
          {/* Top Funding Stats Tracker */}
          <div className="hero-stats-row">
            <div className="hero-stats-info">
              <span className="hero-raised-val">{formatCurrency(current.raisedAmount)} / {formatCurrency(current.goalAmount)}</span>
              <span className="hero-donors-val">{percent}% funded · Cause #{activeSlide + 1} of {slides.length}</span>
            </div>
            <div className="hero-progress-track">
              <div 
                className="hero-progress-fill" 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title">
            {current.title}
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            {current.description}
          </p>

          {/* CTA Action Buttons */}
          <div className="hero-actions">
            <button 
              className="btn-hero-primary" 
              onClick={(e) => {
                e.stopPropagation();
                onOpenDonate(current);
              }}
            >
              Donate Now &rarr;
            </button>
            <a 
              href={`/campaign/${current.id}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/campaign/${current.id}`);
              }}
              className="btn-hero-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              View Campaign Details
            </a>
          </div>
        </div>

        {/* Carousel Slide Indicators & Auto-Scroll Status */}
        {slides.length > 1 && (
          <div 
            className="hero-carousel-indicator"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlide(idx);
                  }}
                  style={{
                    backgroundColor: idx === activeSlide ? '#d32020' : 'rgba(255,255,255,0.4)',
                    width: idx === activeSlide ? '22px' : '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  title={`Go to Campaign #${idx + 1}`}
                />
              ))}
            </div>

            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', marginLeft: '4px' }}>
              0{activeSlide + 1}<span style={{ opacity: 0.6, fontWeight: 600 }}>/0{slides.length}</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
