import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, HeartHandshake, BookOpen, LogOut, Shield, ExternalLink, Menu, X } from 'lucide-react';
import webLogo from '../../assets/webLogo.png';
import AdminDashboard from './AdminDashboard';
import AdminCampaigns from './AdminCampaigns';
import AdminBlogs from './AdminBlogs';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation tabs: 'dashboard' | 'campaigns' | 'blogs'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Header */}
      <header style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo & Admin Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={webLogo} alt="Logo" style={{ height: '32px', objectFit: 'contain' }} />
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '10px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff', display: 'block', lineHeight: 1.1 }}>
                Admin Panel
              </span>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>
                Animal Helping Foundation
              </span>
            </div>
          </div>

          {/* Desktop Nav Tabs & User Controls (Hidden on Mobile) */}
          <div className="admin-desktop-header-controls" style={{ alignItems: 'center', gap: '20px' }}>
            {/* 3 Navigation Tabs */}
            <nav style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '12px' }}>
              <button
                onClick={() => handleSelectTab('dashboard')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: activeTab === 'dashboard' ? '#d32020' : 'transparent',
                  color: activeTab === 'dashboard' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleSelectTab('campaigns')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: activeTab === 'campaigns' ? '#d32020' : 'transparent',
                  color: activeTab === 'campaigns' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <HeartHandshake size={16} />
                <span>Campaigns</span>
              </button>

              <button
                onClick={() => handleSelectTab('blogs')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: activeTab === 'blogs' ? '#d32020' : 'transparent',
                  color: activeTab === 'blogs' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <BookOpen size={16} />
                <span>Blogs & Stories</span>
              </button>
            </nav>

            {/* Quick Links & User Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '14px' }}>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none'
                }}
              >
                <span>View Site</span>
                <ExternalLink size={13} />
              </a>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="admin-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px'
            }}
            aria-label="Toggle admin menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: '#1e293b',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <button
              onClick={() => handleSelectTab('dashboard')}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: activeTab === 'dashboard' ? '#d32020' : 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                border: 'none',
                textAlign: 'left'
              }}
            >
              <LayoutDashboard size={18} />
              <span>1. Dashboard</span>
            </button>

            <button
              onClick={() => handleSelectTab('campaigns')}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: activeTab === 'campaigns' ? '#d32020' : 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                border: 'none',
                textAlign: 'left'
              }}
            >
              <HeartHandshake size={18} />
              <span>2. Campaigns</span>
            </button>

            <button
              onClick={() => handleSelectTab('blogs')}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: activeTab === 'blogs' ? '#d32020' : 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                border: 'none',
                textAlign: 'left'
              }}
            >
              <BookOpen size={18} />
              <span>3. Blogs & Stories</span>
            </button>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none'
                }}
              >
                <span>View Public Site</span>
                <ExternalLink size={14} />
              </a>

              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Navigation Bar for Sub-view Tabs (Sticky Sub-nav with Mobile Horizontal Scroll) */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px', display: 'flex', gap: '16px', minWidth: 'max-content' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '12px 4px',
              color: activeTab === 'dashboard' ? '#d32020' : '#64748b',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: 'none',
              border: 'none',
              borderBottomWidth: '3px',
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === 'dashboard' ? '#d32020' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <LayoutDashboard size={16} />
            <span>1. Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            style={{
              padding: '12px 4px',
              color: activeTab === 'campaigns' ? '#d32020' : '#64748b',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: 'none',
              border: 'none',
              borderBottomWidth: '3px',
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === 'campaigns' ? '#d32020' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <HeartHandshake size={16} />
            <span>2. Campaigns</span>
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            style={{
              padding: '12px 4px',
              color: activeTab === 'blogs' ? '#d32020' : '#64748b',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: 'none',
              border: 'none',
              borderBottomWidth: '3px',
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === 'blogs' ? '#d32020' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <BookOpen size={16} />
            <span>3. Blogs & Stories</span>
          </button>
        </div>
      </div>

      {/* Inline styles for responsive header toggle */}
      <style>{`
        .admin-mobile-toggle {
          display: none;
        }
        .admin-desktop-header-controls {
          display: flex;
        }
        @media (max-width: 768px) {
          .admin-mobile-toggle {
            display: flex !important;
          }
          .admin-desktop-header-controls {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Tab Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        {activeTab === 'dashboard' && <AdminDashboard onNavigateCampaigns={() => setActiveTab('campaigns')} />}
        {activeTab === 'campaigns' && <AdminCampaigns />}
        {activeTab === 'blogs' && <AdminBlogs />}
      </main>
    </div>
  );
}
