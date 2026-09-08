import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Flag, IndianRupee, Send, Users, ArrowUpRight, ExternalLink } from 'lucide-react';

export default function CausesSection({ onOpenDonate, onShare }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveCampaigns = async () => {
      try {
        setLoading(true);
        const res = await api.getCampaigns('Active');
        if (res.campaigns && res.campaigns.length > 0) {
          setCampaigns(res.campaigns);
        }
      } catch (err) {
        console.error('Failed to fetch public campaigns:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCampaigns();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <section className="causes-section" id="causes">
      <div className="causes-container-60">
        {/* Section Header */}
        <div className="causes-header-centered">
          <span className="pill-tag">CAUSES WE SUPPORT</span>
          <h2 className="section-title">Support a Cause That Matters to You</h2>
          <p className="section-subtitle">
            From emergency veterinary surgeries and daily nourishment drives to rabies vaccination and winter protection, your support brings vital resources to stray animals.
          </p>
        </div>

        {/* Campaign Cards Grid */}
        <div className="cards-grid">
          {campaigns.map((campaign) => {
            const percent = Math.min(100, Math.round(((campaign.raisedAmount || 0) / (campaign.goalAmount || 1)) * 100));

            return (
              <div className="cause-card" key={campaign.id}>
                {/* Card Image Wrapper */}
                <div className="card-img-container">
                  <img 
                    src={campaign.image} 
                    alt={campaign.title} 
                    className="card-img" 
                  />
                  <div className="card-donor-badge">
                    <Users size={14} color="#d92626" />
                    <span>Active Cause</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  <div className="card-progress-bar">
                    <div 
                      className="card-progress-fill" 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  <Link to={`/campaign/${campaign.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{campaign.title}</span>
                      <ExternalLink size={16} color="#d32020" style={{ flexShrink: 0, marginLeft: '8px' }} />
                    </h3>
                  </Link>

                  <p className="card-desc">{campaign.description}</p>

                  <div className="card-stats-box">
                    <div className="stat-item">
                      <span className="stat-icon"><Flag size={16} /></span>
                      <div className="stat-text">
                        <span className="stat-label">Goal</span>
                        <span className="stat-value">{formatCurrency(campaign.goalAmount)}</span>
                      </div>
                    </div>

                    <div className="stat-item">
                      <span className="stat-icon"><IndianRupee size={16} /></span>
                      <div className="stat-text">
                        <span className="stat-label">Raised</span>
                        <span className="stat-value">{formatCurrency(campaign.raisedAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className="btn-card-share" 
                      onClick={() => onShare(campaign)}
                    >
                      <Send size={14} /> Share
                    </button>
                    <button 
                      className="btn-card-donate" 
                      onClick={() => onOpenDonate(campaign)}
                    >
                      Donate Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
