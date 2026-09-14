import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function ImageUploader({ value, onChange, label = 'Campaign Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image file size must be less than 10MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // 1. Try uploading to backend API
      const res = await api.uploadImage(file);
      if (res && res.url) {
        onChange(res.url);
      } else {
        throw new Error('Upload returned empty URL');
      }
    } catch (err) {
      console.warn('API upload failed, using local FileReader fallback:', err);
      // 2. Local fallback via FileReader Data URL so device upload ALWAYS succeeds!
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
        setUploading(false);
      };
      reader.onerror = () => {
        setError('Failed to read image file from device.');
        setUploading(false);
      };
      reader.readAsDataURL(file);
      return;
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  return (
    <div style={{ marginBottom: '18px' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
            {label} *
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            style={{
              fontSize: '0.78rem',
              color: '#2563eb',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <LinkIcon size={13} />
            <span>{showUrlInput ? 'Back to File Upload' : 'Paste Image URL instead'}</span>
          </button>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          marginBottom: '10px',
          fontWeight: 600
        }}>
          {error}
        </div>
      )}

      {showUrlInput ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={customUrl || value || ''}
            onChange={(e) => {
              setCustomUrl(e.target.value);
              onChange(e.target.value);
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {value ? (
            /* Live Image Preview Card */
            <div style={{
              position: 'relative',
              borderRadius: '14px',
              overflow: 'hidden',
              border: '2px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={value} 
                alt="Uploaded Preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: '6px'
              }}>
                <label style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <UploadCloud size={14} />
                  <span>Change Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  style={{
                    backgroundColor: 'rgba(220, 38, 38, 0.9)',
                    color: '#ffffff',
                    padding: '6px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  title="Remove Image"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Device File Upload Dropzone */
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              borderRadius: '16px',
              border: '2px dashed #cbd5e1',
              backgroundColor: '#f8fafc',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />

              {uploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#2563eb' }}>
                  <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Uploading Image from Device...</span>
                </div>
              ) : (
                <>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#fee2e2',
                    color: '#d32020',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px'
                  }}>
                    <UploadCloud size={24} />
                  </div>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                    Click to Upload Image from Device
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Supports PNG, JPG, WEBP, GIF (Max 10MB)
                  </span>
                </>
              )}
            </label>
          )}
        </div>
      )}
    </div>
  );
}
