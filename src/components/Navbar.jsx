import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ onOpenDonate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header>
      {/* Top Meta Bar */}
      <div className="top-bar">
        <div className="top-bar-content">
          <a href="#blogs" className="top-bar-link">BLOGS</a>
          <a href="#contacts" className="top-bar-link">CONTACTS US</a>
          <a href="#locations" className="top-bar-link">LOCATIONS</a>
          <a href="#help" className="top-bar-link">HELP & SUPPORT</a>
        </div>
      </div>

      {/* Main Navbar with 80px horizontal space from device edge & 24px vertical space */}
      <nav className="navbar">
        <div className="navbar-content">
          <a href="/" className="brand-logo">
            <img src="/assets/logo.png" alt="Animal Helping Foundation" />
          </a>

          <ul className={`nav-menu ${mobileOpen ? 'mobile-open' : ''}`}>
            <li><a href="#home" className="nav-link active">Home</a></li>
            <li><a href="#life" className="nav-link">Life</a></li>
            <li><a href="#explore" className="nav-link">Explore Campaigns</a></li>
            <li><a href="#trusts" className="nav-link">Small Trusts</a></li>
            <li><a href="#start" className="nav-link">Start New Campaigns</a></li>
            <li><a href="#about" className="nav-link">About Us</a></li>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-donate-nav" onClick={onOpenDonate}>
              Donate Now
            </button>
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
