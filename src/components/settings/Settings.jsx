import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Settings = ({ user, setUser }) => {
  const { language, toggleLanguage, t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async () => {
    if (!editEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_email: user.email,
          new_name: editName,
          new_email: editEmail
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update profile');
      }
      setUser(data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '32px 40px' }}>
      
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1>{t('settings.title')}</h1>
        </div>
      </div>

      <div className="bento-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px', gap: '24px' }}>
        
        {/* Profile Settings */}
        <div className="bento-item" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ 
              background: 'var(--glass-highlight)', 
              color: 'var(--accent-cyan)', 
              width: '48px', height: '48px', 
              borderRadius: '12px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--glass-border)'
            }}>
              <span className="material-symbols-rounded">person</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Profile Settings</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Update your personal information</p>
            </div>
            {!isEditing && (
              <button 
                className="secondary-btn" 
                onClick={() => { setIsEditing(true); setSuccess(''); setError(''); }}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--glass-border)', padding: '20px', borderRadius: '12px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</span>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '4px', fontWeight: 600 }}>{user?.name || 'Not set'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</span>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '4px', fontWeight: 600 }}>{user?.email}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</label>
                <input 
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  className="primary-btn" 
                  onClick={handleUpdateProfile} 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="secondary-btn" 
                  onClick={() => { setIsEditing(false); setEditName(user?.name || ''); setEditEmail(user?.email || ''); setError(''); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><span className="material-symbols-rounded" style={{fontSize: '16px'}}>error</span> {error}</div>}
          {success && <div style={{ color: '#22c55e', fontSize: '0.9rem', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><span className="material-symbols-rounded" style={{fontSize: '16px'}}>check_circle</span> {success}</div>}
        </div>
        
        {/* Language Settings */}
        <div className="bento-item" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ 
              background: 'var(--glass-highlight)', 
              color: 'var(--accent-cyan)', 
              width: '48px', height: '48px', 
              borderRadius: '12px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--glass-border)'
            }}>
              <span className="material-symbols-rounded">translate</span>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('settings.langTitle')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{t('settings.langDesc')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => toggleLanguage('en')}
              style={{
                flex: 1,
                padding: '16px',
                background: language === 'en' ? 'var(--accent-cyan)' : 'var(--glass-border)',
                color: language === 'en' ? '#ffffff' : 'var(--text-primary)',
                border: language === 'en' ? 'none' : '1px solid var(--glass-border)',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: 'none'
              }}
            >
              English
            </button>
            <button 
              onClick={() => toggleLanguage('ta')}
              style={{
                flex: 1,
                padding: '16px',
                background: language === 'ta' ? 'var(--accent-cyan)' : 'var(--glass-border)',
                color: language === 'ta' ? '#ffffff' : 'var(--text-primary)',
                border: language === 'ta' ? 'none' : '1px solid var(--glass-border)',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: 'none'
              }}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Settings;
