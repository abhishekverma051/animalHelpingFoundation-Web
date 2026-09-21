import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return 'Recent';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (isNaN(diffSec)) return 'Recent';
  if (diffSec < 60) return 'Just Now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hour${Math.floor(diffSec / 3600) > 1 ? 's' : ''} ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} day${Math.floor(diffSec / 86400) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

export default function LiveFeedAndStoriesSection({ campaign, donations }) {
  const [blogs, setBlogs] = useState([]);
  const [fetchedDonations, setFetchedDonations] = useState([]);
  const [siteStats, setSiteStats] = useState({ totalDonors: 0, overallFundingRaised: 0 });

  useEffect(() => {
    let isMounted = true;
    api.getBlogs()
      .then(res => {
        if (isMounted && res.blogs && res.blogs.length > 0) {
          setBlogs(res.blogs);
        }
      })
      .catch(err => {
        console.warn('Could not fetch dynamic blogs, using fallback stories:', err);
      });

    // If donations are not passed via props (e.g. on homepage), fetch real recent donations from backend
    if (!donations) {
      Promise.all([
        api.getRecentDonations().catch(() => ({ donations: [], totalDonors: 0, totalRaised: 0 })),
        api.getStats().catch(() => ({ stats: {} }))
      ]).then(([donRes, statRes]) => {
        if (isMounted) {
          setFetchedDonations(donRes.donations || []);
          setSiteStats({
            totalDonors: donRes.totalDonors || (donRes.donations ? donRes.donations.length : 0),
            overallFundingRaised: statRes?.stats?.overallFundingRaised || donRes.totalRaised || 0
          });
        }
      });
    }

    return () => { isMounted = false; };
  }, [donations]);

  // Use real donations list
  const realDonations = donations !== undefined ? (donations || []) : fetchedDonations;

  // Compute dynamic stats
  const displayImg = campaign?.image || "/assets/dogWithAmbrella.jpg";
  const raisedAmount = campaign 
    ? Number(campaign.raisedAmount || 0) 
    : siteStats.overallFundingRaised;
  const goalAmount = campaign 
    ? Number(campaign.goalAmount || 1) 
    : 3000000;
  const fundedPercent = goalAmount > 0 
    ? Math.min(Math.round((raisedAmount / goalAmount) * 100), 100) 
    : 0;
  
  // Format raised display amount for overlay
  const raisedLakhs = raisedAmount >= 100000 
    ? (raisedAmount / 100000).toFixed(1) + ' L' 
    : raisedAmount.toLocaleString();

  // Donor list
  const activeDonors = realDonations.slice(0, 5).map(d => ({
    name: d.donorName || (d.isAnonymous ? 'Anonymous' : 'Kind Donor'),
    time: formatRelativeTime(d.createdAt),
    amount: `₹${Number(d.amount).toLocaleString()}`
  }));

  const totalDonorCount = donations !== undefined 
    ? (donations || []).length 
    : siteStats.totalDonors;

  return (
    <section className="donors-dark-bg-section">
      <div className="container feed-container">
        {/* Live Donors Card Grid matching Screenshot 4 */}
        <div className="donors-feed-grid">
          {/* Left Box: Photo with Raised Till Now Overlay */}
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '320px', background: '#111' }}>
            <img src={displayImg} alt={campaign?.title || "Dogs under Umbrella"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)', padding: '24px' }}>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                Raised Till Now:
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                ₹ {raisedLakhs}<span style={{ color: '#f87171' }}>+</span>
              </div>
            </div>
          </div>

          {/* Right Box: Recent Donors List in subtle border box */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '260px' }}>
            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem', marginBottom: '12px', opacity: 0.9 }}>
              Recent Campaign Supporters ({totalDonorCount})
            </div>
            {activeDonors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'rgba(255, 255, 255, 0.7)' }}>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', color: '#fff' }}>No donations recorded yet</p>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Be the first to support and your contribution will show up here!</p>
              </div>
            ) : (
              activeDonors.map((donor, idx) => (
                <div className="donor-feed-item" key={idx} style={{ padding: '10px 0', borderBottom: idx < activeDonors.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#f87171' }}>
                      {(donor.name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{donor.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{donor.time}</div>
                    </div>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                    {donor.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Progress Bar & Funding Stats matching Screenshot 4 */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${fundedPercent}%`, height: '100%', background: '#ef4444' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ fontWeight: 800, color: '#ffffff' }}>₹{raisedAmount.toLocaleString()} / ₹{goalAmount.toLocaleString()}</span>
            <span style={{ color: '#9ca3af' }}>{fundedPercent}% funded · <strong style={{ color: '#ffffff' }}>{totalDonorCount} donors</strong></span>
          </div>
        </div>

        {/* Stories Section */}
        {blogs.length > 0 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '40px' }} id="blogs">
              <span className="pill-tag" style={{ background: 'rgba(255,255,255,0.1)', color: '#f87171' }}>INSIGHTS & STORIES</span>
              <h2 className="section-title" style={{ color: '#ffffff' }}>Stories That Inspire Compassion & Action</h2>
            </div>

            {/* Blog Cards Grid */}
            <div className="blog-cards-grid">
              {blogs.map((story) => (
                <div className="blog-card" key={story.id}>
                  <img src={story.image} alt={story.title} className="blog-card-img" />
                  <div style={{ padding: '20px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#d92626', fontWeight: 800 }}>{story.tag}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: '8px 0 6px', lineHeight: 1.35 }}>
                      {story.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>
                      {story.desc || story.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
