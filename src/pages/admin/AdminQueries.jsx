import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  MessageSquare, 
  Search, 
  Phone, 
  Mail, 
  CheckCircle, 
  Clock, 
  Trash2, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  ExternalLink,
  Filter
} from 'lucide-react';

export default function AdminQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedQueryId, setExpandedQueryId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminQueries();
      if (res && res.queries) {
        setQueries(res.queries);
      }
    } catch (err) {
      console.error('Failed to load admin queries:', err);
      setStatusMessage('Error loading queries from backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await api.updateQueryStatus(id, newStatus);
      setQueries(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
      setStatusMessage(`Query marked as ${newStatus}`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update query status: ' + (err.message || 'Server error'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteQuery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact query? This cannot be undone.')) {
      return;
    }
    try {
      setUpdatingId(id);
      await api.deleteQuery(id);
      setQueries(prev => prev.filter(q => q.id !== id));
      setStatusMessage('Query deleted successfully.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting query:', err);
      alert('Failed to delete query: ' + (err.message || 'Server error'));
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats calculation
  const totalCount = queries.length;
  const newCount = queries.filter(q => q.status === 'New').length;
  const inProgressCount = queries.filter(q => q.status === 'In Progress').length;
  const resolvedCount = queries.filter(q => q.status === 'Resolved').length;

  // Filter queries
  const filteredQueries = queries.filter(q => {
    const matchesFilter = statusFilter === 'ALL' || q.status === statusFilter;
    const s = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery || 
      (q.fullName && q.fullName.toLowerCase().includes(s)) ||
      (q.email && q.email.toLowerCase().includes(s)) ||
      (q.contactNumber && q.contactNumber.toLowerCase().includes(s)) ||
      (q.subject && q.subject.toLowerCase().includes(s)) ||
      (q.message && q.message.toLowerCase().includes(s));
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px 80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            Contact Inquiries & Messages
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.94rem', margin: 0 }}>
            Manage direct questions and messages submitted by website visitors.
          </p>
        </div>

        <button
          onClick={fetchQueries}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '0.88rem',
            color: '#334155',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
          }}
        >
          <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {statusMessage && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Total */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            Total Inquiries
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>
            {totalCount}
          </div>
        </div>

        {/* New / Unread */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #fecaca',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', marginBottom: '8px' }}>
            New / Unread
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#dc2626' }}>
            {newCount}
          </div>
        </div>

        {/* In Progress */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #fed7aa',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', marginBottom: '8px' }}>
            In Progress
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ea580c' }}>
            {inProgressCount}
          </div>
        </div>

        {/* Resolved */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: '8px' }}>
            Resolved
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#16a34a' }}>
            {resolvedCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All (${totalCount})` },
            { id: 'New', label: `New (${newCount})` },
            { id: 'In Progress', label: `In Progress (${inProgressCount})` },
            { id: 'Resolved', label: `Resolved (${resolvedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: statusFilter === tab.id ? '#0f172a' : '#f1f5f9',
                color: statusFilter === tab.id ? '#ffffff' : '#475569',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 280px', maxWidth: '420px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search name, phone, email, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Query List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <RefreshCw size={32} color="#94a3b8" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontWeight: 600 }}>Loading queries from database...</p>
        </div>
      ) : filteredQueries.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}>
          <MessageSquare size={44} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
            No queries found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            {searchQuery || statusFilter !== 'ALL' 
              ? 'No inquiries match your current search or filter criteria.' 
              : 'When visitors submit the Contact Us form, their messages will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredQueries.map((query) => {
            const isExpanded = expandedQueryId === query.id;
            const dateStr = new Date(query.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            const statusColors = {
              'New': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
              'In Progress': { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
              'Resolved': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }
            };

            const colors = statusColors[query.status] || statusColors['New'];

            return (
              <div
                key={query.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s ease'
                }}
              >
                {/* Query Header Row */}
                <div style={{
                  padding: '20px 24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none'
                }}>
                  {/* Left: Contact Info & Subject */}
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {query.status}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                        {dateStr}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                      {query.subject}
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '0.88rem', color: '#475569' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>
                        👤 {query.fullName}
                      </span>
                      <a 
                        href={`tel:${query.contactNumber}`} 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                        title="Click to dial"
                      >
                        <Phone size={14} />
                        <span>{query.contactNumber}</span>
                      </a>
                      <a 
                        href={`mailto:${query.email}`} 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                        title="Click to send email"
                      >
                        <Mail size={14} />
                        <span>{query.email}</span>
                      </a>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons & Status Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Status Dropdown */}
                    <select
                      value={query.status}
                      disabled={updatingId === query.id}
                      onChange={(e) => handleUpdateStatus(query.id, e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        backgroundColor: '#f8fafc',
                        color: '#334155',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="New">Mark New</option>
                      <option value="In Progress">Mark In Progress</option>
                      <option value="Resolved">Mark Resolved</option>
                    </select>

                    {/* View Message Expand Button */}
                    <button
                      onClick={() => setExpandedQueryId(isExpanded ? null : query.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <span>{isExpanded ? 'Hide' : 'Read'}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {/* Delete Query Button */}
                    <button
                      onClick={() => handleDeleteQuery(query.id)}
                      disabled={updatingId === query.id}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #fee2e2',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete inquiry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded Message Content */}
                {isExpanded && (
                  <div style={{
                    padding: '24px',
                    backgroundColor: '#fafbfc',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '0.04em' }}>
                      Message from visitor:
                    </div>
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      fontSize: '0.94rem',
                      lineHeight: 1.6,
                      color: '#1e293b',
                      whiteSpace: 'pre-wrap',
                      marginBottom: '20px'
                    }}>
                      {query.message}
                    </div>

                    {/* Communication Shortcuts */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      <a
                        href={`tel:${query.contactNumber}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          textDecoration: 'none'
                        }}
                      >
                        <Phone size={16} />
                        <span>Call {query.contactNumber}</span>
                      </a>

                      <a
                        href={`mailto:${query.email}?subject=Re: ${encodeURIComponent(query.subject)}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          textDecoration: 'none'
                        }}
                      >
                        <Mail size={16} />
                        <span>Reply to {query.email}</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
