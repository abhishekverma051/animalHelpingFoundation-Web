import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft, ChevronRight, Sparkles, Heart } from 'lucide-react';

const fallbackSlides = [
  {
    id: 'camp-1',
    raisedAmount: 385000,
    goalAmount: 500000,
    title: 'Help Feed & Care for Animals Who Have No One',
    description: 'Thousands of abandoned and vulnerable animals struggle for food, shelter, and medical care every day. Your support can help us provide them with protection.',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'camp-2',
    raisedAmount: 610000,
    goalAmount: 750000,
    title: 'Daily Nourishment & Meal Drive for 1,000+ Street Animals',
    description: 'Feeding wholesome, nutritious food daily to thousands of hungry dogs, cats, and birds across urban animal shelters.',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'camp-3',
    raisedAmount: 240000,
    goalAmount: 400000,
    title: 'Winter Warmth & Emergency Shelter Program',
    description: 'Providing warm reflective jackets, bedding, and temporary shelter to protect helpless animals during harsh weather conditions.',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'camp-4',
    raisedAmount: 180000,
    goalAmount: 300000,
    title: 'Mass Vaccination & ABC Medical Rescue Mission',
    description: 'Protecting stray animals from deadly diseases through comprehensive anti-rabies vaccination and humane population management.',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80'
  }
];

export default function HeroSection({ onOpenDonate }) {
  const [slides, setSlides] = useState(fallbackSlides);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHeroCampaigns = async () => {
      try {
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

        if (combined.length > 0) {
          setSlides(combined.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch hero campaigns:', err);
      }
    };

    fetchHeroCampaigns();
  }, []);

  // Auto-scrolling carousel timer (Every 4.5 seconds, pauses on hover)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const current = slides[activeSlide % slides.length] || fallbackSlides[0];

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
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease, background-color 0.2s ease'
            }}
            title="Previous Campaign"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Carousel Navigation Arrow - Right */}
        {slides.length > 1 && (
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease, background-color 0.2s ease'
            }}
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
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '24px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              padding: '8px 16px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
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
