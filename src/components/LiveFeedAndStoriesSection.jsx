import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const liveDonors = [
  { name: 'Akhil Singh', time: 'Just Now', amount: '₹2,500' },
  { name: 'Jeeny Sabestian', time: '32 min ago', amount: '₹6,000' },
  { name: 'Abhishek Verma', time: '1 hour ago', amount: '₹5,600' },
  { name: 'Divya Shukla', time: 'Just Now', amount: '₹1,500' },
  { name: 'Shivam Tripathi', time: 'Just Now', amount: '₹2,800' }
];

const fallbackBlogStories = [
  {
    id: 'blog-1',
    tag: 'Animal Rescue | 08/08/2026',
    title: 'What Happens After an Animal Is Rescued?',
    desc: 'From emergency rescue to recovery, discover the journey of an animal receiving care, treatment, and a second chance.',
    image: '/assets/impact3.png'
  },
  {
    id: 'blog-2',
    tag: 'Animal Rescue | 08/08/2026',
    title: 'From the Streets to Safety: A Second Chance',
    desc: 'A look into the story of a rescued animal, the challenges they faced, and the care that helped them recover.',
    image: '/assets/card4_hd.jpg'
  },
  {
    id: 'blog-3',
    tag: 'Animal Rescue | 08/08/2026',
    title: '5 Simple Ways You Can Help Animals in Need',
    desc: 'Small acts of kindness can make a lasting difference. Here are simple ways to support animals in your everyday life.',
    image: '/assets/impact2.png'
  }
];

export default function LiveFeedAndStoriesSection() {
  const [blogs, setBlogs] = useState(fallbackBlogStories);

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
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="donors-dark-bg-section">
      <div className="container" style={{ paddingLeft: '80px', paddingRight: '80px' }}>
        {/* Live Donors Card Grid matching Screenshot 4 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '32px', marginBottom: '24px' }}>
          {/* Left Box: Photo with Raised Till Now Overlay */}
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '320px', background: '#111' }}>
            <img src="/assets/dogWithAmbrella.jpg" alt="Dogs under Umbrella" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 100%)', padding: '24px' }}>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                Raised Till Now:
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                ₹ 4.2 L<span style={{ color: '#f87171' }}>+</span>
              </div>
            </div>
          </div>

          {/* Right Box: Recent Donors List in subtle border box */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {liveDonors.map((donor, idx) => (
              <div className="donor-feed-item" key={idx} style={{ padding: '10px 0', borderBottom: idx < liveDonors.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#f87171' }}>
                    {donor.name.charAt(0)}
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
            ))}
          </div>
        </div>

        {/* Progress Bar & Funding Stats matching Screenshot 4 */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: '38%', height: '100%', background: '#ef4444' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <span style={{ fontWeight: 800, color: '#ffffff' }}>₹4,56,373 / ₹12,00,000</span>
            <span style={{ color: '#9ca3af' }}>38% funded · <strong style={{ color: '#ffffff' }}>156 donors</strong></span>
          </div>
        </div>

        {/* Stories Section */}
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
      </div>
    </section>
  );
}
