import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, HeartHandshake, LogOut, Shield, ExternalLink, Menu, X } from 'lucide-react';
import webLogo from '../../assets/webLogo.png';
import AdminDashboard from './AdminDashboard';
import AdminCampaigns from './AdminCampaigns';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Exactly two navigation tabs: 'dashboard' | 'campaigns'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
          padding: '0 24px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo & Admin Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src={webLogo} alt="Logo" style={{ height: '36px', objectFit: 'contain' }} />
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '14px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff' }}>
                Admin Panel
              </span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8' }}>
                Animal Helping Foundation
              </span>
            </div>
          </div>

          {/* Desktop Nav Tabs & User Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Exactly 2 Navigation Tabs */}
            <nav className="desktop-tabs" style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '12px' }}>
              <button
                onClick={() => setActiveTab('dashboard')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: activeTab === 'dashboard' ? '#d32020' : 'transparent',
                  color: activeTab === 'dashboard' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('campaigns')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: activeTab === 'campaigns' ? '#d32020' : 'transparent',
                  color: activeTab === 'campaigns' ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <HeartHandshake size={18} />
                <span>Campaigns</span>
              </button>
            </nav>

            {/* Quick Links & User Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}>
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
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
          </div>
        </div>
      </header>

      {/* Navigation Bar for Sub-view Tabs (Sticky Sub-nav) */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '24px' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '14px 4px',
              borderBottom: activeTab === 'dashboard' ? '3px solid #d32020' : '3px solid transparent',
              color: activeTab === 'dashboard' ? '#d32020' : '#64748b',
              fontWeight: 700,
              fontSize: '0.95rem',
              background: 'none',
              border: 'none',
              borderBottomWidth: '3px',
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === 'dashboard' ? '#d32020' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <LayoutDashboard size={18} />
            <span>1. Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            style={{
              padding: '14px 4px',
              color: activeTab === 'campaigns' ? '#d32020' : '#64748b',
              fontWeight: 700,
              fontSize: '0.95rem',
              background: 'none',
              border: 'none',
              borderBottomWidth: '3px',
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === 'campaigns' ? '#d32020' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <HeartHandshake size={18} />
            <span>2. Campaigns</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'dashboard' && <AdminDashboard onNavigateCampaigns={() => setActiveTab('campaigns')} />}
        {activeTab === 'campaigns' && <AdminCampaigns />}
      </main>
    </div>
  );
}
