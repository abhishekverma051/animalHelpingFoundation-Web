import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ onOpenDonate, isAdmin = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header>
      {/* Main Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <a href="/" className="brand-logo">
            <img src="/assets/logo.png" alt="Animal Helping Foundation" />
          </a>

          <ul className={`nav-menu ${mobileOpen ? 'mobile-open' : ''}`}>
            <li><a href="/" className="nav-link active" onClick={() => setMobileOpen(false)}>Home</a></li>
            <li><a href="/#explore" className="nav-link" onClick={() => setMobileOpen(false)}>Explore Campaigns</a></li>
            <li><a href="/#about" className="nav-link" onClick={() => setMobileOpen(false)}>About Us</a></li>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAdmin ? (
              <a
                href="/admin/dashboard"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.2)'
                }}
              >
                👑 Admin Dashboard
              </a>
            ) : (
              <button className="btn-donate-nav" onClick={onOpenDonate}>
                Donate Now
              </button>
            )}
            <button 
              className="mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
