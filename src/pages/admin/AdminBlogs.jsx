import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, AlertCircle, Check, RefreshCw, Image, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tag: 'Animal Rescue | ' + new Date().toLocaleDateString('en-GB'),
    title: '',
    desc: '',
    image: ''
  });

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getBlogs();
      setBlogs(res.blogs || []);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      setError('Could not load blog stories. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormData({
      tag: 'Animal Rescue | ' + new Date().toLocaleDateString('en-GB'),
      title: '',
      desc: '',
      image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      tag: blog.tag || '',
      title: blog.title || '',
      desc: blog.desc || blog.description || '',
      image: blog.image || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the blog story "${title}"?`)) return;

    try {
      await api.deleteBlog(id);
      setSuccessMessage('Blog story deleted successfully.');
      fetchBlogs();
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      alert(err.message || 'Failed to delete blog story.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.desc.trim()) {
      alert('Please fill in both the Title and Description.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingBlog) {
        await api.updateBlog(editingBlog.id, formData);
        setSuccessMessage('Blog story updated successfully!');
      } else {
        await api.createBlog(formData);
        setSuccessMessage('New blog story published successfully!');
      }
      setModalOpen(false);
      fetchBlogs();
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      alert(err.message || 'Failed to save blog story.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ backgroundColor: '#fee2e2', color: '#d32020', padding: '6px', borderRadius: '10px' }}>
              <BookOpen size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Stories & Blogs Management
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
            Manage the dynamic "Stories That Inspire Compassion & Action" displayed on the homepage and campaign details pages.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchBlogs}
            style={{
              padding: '10px 16px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.88rem'
            }}
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            style={{
              padding: '12px 20px',
              backgroundColor: '#d32020',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(211, 32, 32, 0.3)'
            }}
          >
            <Plus size={18} />
            <span>+ Add New Story</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          color: '#166534',
          padding: '14px 18px',
          borderRadius: '14px',
          marginBottom: '24px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Check size={18} color="#166534" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Content Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p style={{ fontWeight: 700 }}>Loading blog stories...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center',
          border: '1px dashed #cbd5e1'
        }}>
          <BookOpen size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            No Blog Stories Found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            Create your first dynamic story to inspire donors across the platform.
          </p>
          <button
            onClick={handleOpenAdd}
            style={{
              padding: '10px 20px',
              backgroundColor: '#d32020',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            + Add First Story
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {blogs.map((story) => (
            <div
              key={story.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              <div>
                <div style={{ height: '190px', position: 'relative', backgroundColor: '#0f172a' }}>
                  <img
                    src={story.image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'}
                    alt={story.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backdropFilter: 'blur(4px)'
                  }}>
                    {story.tag || 'Animal Story'}
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35, marginBottom: '8px' }}>
                    {story.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                    {story.desc || story.description}
                  </p>
                </div>
              </div>

              <div style={{
                padding: '16px 20px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                  ID: {story.id}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(story)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(story.id, story.title)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '560px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={22} color="#d32020" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingBlog ? 'Edit Blog Story' : 'Publish New Blog Story'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Tag / Category */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Tag / Category (e.g. Animal Rescue | 08/08/2026)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Animal Rescue | Date"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Title */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Story Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What Happens After an Animal Is Rescued?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Image URL */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Image URL / Asset Path *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /assets/impact3.png or https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Story Content / Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the story summary or update description..."
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    fontWeight: 500,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#d32020',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {submitting ? 'Saving...' : editingBlog ? 'Save Changes' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
