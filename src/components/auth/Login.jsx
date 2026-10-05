import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const API = 'http://127.0.0.1:8000';

const Login = ({ onLogin }) => {
  const { language, toggleLanguage, t } = useLanguage();

  // Also replace setLanguage since toggleLanguage is the name in LanguageContext.
  // Wait, let's double check if setLanguage is actually toggleLanguage in LanguageContext.
  // The earlier LanguageContext had `toggleLanguage`, not `setLanguage` in the provider value.
  // Ah, the LanguageContext I viewed had `toggleLanguage`, let me use that instead.
  // But wait, the button at line 129 uses `setLanguage` which might be causing issues or maybe it worked if they renamed it? Let's just use what's there but destructure `t`.

  // 'signin' | 'signup'
  const [mode, setMode] = useState('signin');

  // Form fields
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);

  // UI state
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const resetForm = () => {
    setName(''); setEmail(''); setPassword(''); setConfirm('');
    setError(''); setSuccess('');
  };

  const switchMode = (m) => { setMode(m); resetForm(); };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic client-side validation
    if (!email.includes('@')) { setError(t('login.errEmail')); return; }
    if (password.length < 6)  { setError(t('login.errPassword')); return; }
    if (mode === 'signup') {
      if (!name.trim())       { setError(t('login.errName')); return; }
      if (password !== confirm){ setError(t('login.errMatch')); return; }
    }

    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/signup' : '/signin';
      const body = mode === 'signup'
        ? { name: name.trim(), email, password }
        : { email, password };

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || t('login.errDefault'));
        return;
      }

      if (mode === 'signup') {
        setSuccess(t('login.successSignup'));
        setTimeout(() => onLogin(data.user), 1200);
      } else {
        onLogin(data.user);
      }
    } catch {
      setError(t('login.errServer'));
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.25s',
  };

  const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-main)',
      position: 'relative',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        .auth-input:focus { border-color: #22c55e !important; }
        .auth-tab { cursor:pointer; padding:10px 24px; border-radius:8px; border:none; font-size:0.9rem; font-weight:600; transition:all 0.25s; }
        .auth-tab.active { background:#22c55e; color:#fff; }
        .auth-tab:not(.active) { background:transparent; color:rgba(255,255,255,0.4); }
        .auth-tab:not(.active):hover { color:rgba(255,255,255,0.75); }
        .auth-submit { width:100%; padding:14px; border:none; border-radius:10px; font-size:1rem; font-weight:700; cursor:pointer; transition:all 0.3s; background:linear-gradient(135deg,#16a34a,#22c55e); color:#fff; }
        .auth-submit:hover:not(:disabled) { transform:translateY(-1px); }
        .auth-submit:disabled { opacity:0.5; cursor:not-allowed; }
        .auth-pw-wrap { position:relative; }
        .auth-pw-toggle { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.4); padding:0; display:flex; }
        @keyframes auth-spin { to { transform:rotate(360deg); } }
        .auth-spin { animation:auth-spin 0.8s linear infinite; display:inline-block; }
      `}</style>

      {/* Language Toggle */}
      <div style={{ position: 'absolute', top: '24px', right: '32px' }}>
        <button
          onClick={() => toggleLanguage(language === 'en' ? 'ta' : 'en')}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            padding: '8px 16px', borderRadius: '99px', color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: '16px', color: '#22c55e' }}>translate</span>
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'rgba(15,23,42,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: 'linear-gradient(135deg,#16a34a,#22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '30px', color: '#fff' }}>eco</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', textAlign: 'center' }}>
            {t('login.title')}
          </h1>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', textAlign: 'center' }}>
            {mode === 'signin' ? t('login.signInSub') : t('login.signUpSub')}
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)',
          borderRadius: '10px', padding: '4px', marginBottom: '28px',
        }}>
          <button className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            style={{ flex: 1 }} onClick={() => switchMode('signin')}>
            {t('login.signInTab')}
          </button>
          <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            style={{ flex: 1 }} onClick={() => switchMode('signup')}>
            {t('login.signUpTab')}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Name — signup only */}
          {mode === 'signup' && (
            <div>
              <label style={labelStyle}>{t('login.fullName')}</label>
              <input
                className="auth-input"
                style={inputStyle}
                type="text"
                placeholder={t('login.namePlaceholder')}
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label style={labelStyle}>{t('login.email')}</label>
            <input
              className="auth-input"
              style={inputStyle}
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>{t('login.password')}</label>
            <div className="auth-pw-wrap">
              <input
                className="auth-input"
                style={{ ...inputStyle, paddingRight: '44px' }}
                type={showPw ? 'text' : 'password'}
                placeholder={mode === 'signup' ? t('login.pwPlaceholderSignUp') : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)}>
                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
                  {showPw ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password — signup only */}
          {mode === 'signup' && (
            <div>
              <label style={labelStyle}>{t('login.confirmPassword')}</label>
              <div className="auth-pw-wrap">
                <input
                  className="auth-input"
                  style={{ ...inputStyle, paddingRight: '44px', borderColor: confirm && confirm !== password ? '#ef4444' : '' }}
                  type={showPw ? 'text' : 'password'}
                  placeholder={t('login.pwPlaceholderConfirm')}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                {confirm && (
                  <span className="material-symbols-rounded" style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '18px', color: confirm === password ? '#22c55e' : '#ef4444',
                  }}>
                    {confirm === password ? 'check_circle' : 'cancel'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 14px', background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
              color: '#ef4444', fontSize: '0.85rem',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px', flexShrink: 0 }}>error</span>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 14px', background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px',
              color: '#22c55e', fontSize: '0.85rem',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '18px', flexShrink: 0 }}>check_circle</span>
              {success}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="auth-submit" disabled={loading} style={{ marginTop: '4px' }}>
            {loading
              ? <span className="auth-spin material-symbols-rounded" style={{ fontSize: '20px' }}>progress_activity</span>
              : mode === 'signin' ? t('login.btnSignIn') : t('login.btnSignUp')
            }
          </button>
        </form>

        {/* Switch link */}
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
          {mode === 'signin' ? t('login.noAccount') : t('login.hasAccount')}
          <button
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', padding: 0 }}
          >
            {mode === 'signin' ? t('login.signUpTab') : t('login.signInTab')}
          </button>
        </p>

      </div>
    </div>
  );
};

export default Login;
