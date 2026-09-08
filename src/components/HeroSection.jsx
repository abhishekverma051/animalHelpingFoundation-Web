import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

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
  }
];

export default function HeroSection({ onOpenDonate }) {
  const [slides, setSlides] = useState(fallbackSlides);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.getFeatured();
        if (res.featuredCampaigns && res.featuredCampaigns.length > 0) {
          setSlides(res.featuredCampaigns);
        }
      } catch (err) {
        console.error('Failed to fetch featured campaigns for hero:', err);
      }
    };

    fetchFeatured();
  }, []);

  const current = slides[activeSlide % slides.length] || fallbackSlides[0];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const percent = Math.min(100, Math.round(((current.raisedAmount || 0) / (current.goalAmount || 1)) * 100));

  return (
    <section className="hero-wrapper">
      <div className="hero-banner">
        {/* Top-Right Starburst Badge Accent */}
        <div className="starburst-badge"></div>

        {/* Left Yellow Accent Ribbon Badge */}
        <div className="yellow-badge-accent"></div>

        {/* Background Image */}
        <img 
          src={current.image} 
          alt={current.title} 
          className="hero-bg-img" 
        />
        <div className="hero-overlay"></div>

        <div className="hero-content">
          {/* Top Funding Stats Tracker */}
          <div className="hero-stats-row">
            <div className="hero-stats-info">
              <span className="hero-raised-val">{formatCurrency(current.raisedAmount)} / {formatCurrency(current.goalAmount)}</span>
              <span className="hero-donors-val">{percent}% funded · Featured Cause</span>
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
            <button className="btn-hero-primary" onClick={() => onOpenDonate(current)}>
              Donate Now &rarr;
            </button>
            <a 
              href={`/campaign/${current.id}`}
              className="btn-hero-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              View Campaign Details
            </a>
          </div>
        </div>

        {/* Slide Indicator (Max 4 Featured) */}
        {slides.length > 1 && (
          <div 
            className="slide-indicator"
            onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
            style={{ cursor: 'pointer' }}
            title="Click to cycle next featured campaign"
          >
            0{(activeSlide % slides.length) + 1}<span className="total-slides">/0{Math.min(4, slides.length)}</span>
          </div>
        )}
      </div>
    </section>
  );
}
