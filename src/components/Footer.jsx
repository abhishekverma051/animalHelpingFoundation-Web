import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-dark">
      {/* Dog background photo from assets */}
      <div className="footer-dark-bg-wrapper">
        <img 
          src="/assets/webFooter.jpg" 
          alt="Footer Dog Background" 
          className="footer-dark-bg" 
        />
        <div className="footer-dark-overlay"></div>
      </div>

      <div className="container footer-container">
        <div className="footer-grid">
          {/* Brand & Address Column */}
          <div className="footer-brand-col">
            <img src="/assets/webLogo.png" alt="Animal Helping Foundation" className="footer-logo" />
            <div className="footer-address-box">
              <strong>Head Office:</strong>
              <div>Ward Number 2, Kothi (Satna)-485005,</div>
              <div>Madhya Pradesh (India)</div>
            </div>

            <div className="footer-social-row">
              {/* YouTube */}
              <a href="#youtube" aria-label="YouTube" className="footer-social-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a href="#linkedin" aria-label="LinkedIn" className="footer-social-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a href="#twitter" aria-label="X" className="footer-social-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-link-list">
              <li><a href="#home">Home</a></li>
              <li><a href="#life">Life</a></li>
              <li><a href="#causes">Explore Campaigns</a></li>
              <li><a href="#trusts">Small Trusts</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#blogs">Blogs</a></li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div className="footer-contact-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <ul className="footer-link-list">
              <li>Business</li>
              <li>Customer Support</li>
              <li>Career</li>
              <li className="footer-contact-highlight">sales@cheemoboilers.com</li>
              <li className="footer-contact-highlight">Tel:+91-172-5090487, 5055666</li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Line */}
        <div className="footer-bottom-bar">
          <div>© {new Date().getFullYear()} AnimalHelpingFoundation</div>
          <div>Maintained by Grabky-Technologies, Bhopal</div>
        </div>
      </div>
    </footer>
  );
}
