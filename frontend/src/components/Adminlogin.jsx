import React, { useState } from 'react';

// ✅ Set your admin credentials here
// For production, move this to backend with JWT authentication
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'feedbackiq2026';

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('fiq_admin', 'true');
        onSuccess();
      } else {
        setError('Invalid username or password. Please try again.');
        setPassword('');
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '44px 40px',
        maxWidth: 420,
        width: '100%',
        boxShadow: '0 20px 60px rgba(37,99,235,0.12)',
        border: '1px solid #E2E8F0',
        textAlign: 'center'
      }}>
        {/* Lock icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'linear-gradient(135deg,#2563EB,#6366F1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', margin: '0 auto 20px'
        }}>🔐</div>

        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.4rem', color: '#1E293B', marginBottom: 8
        }}>
          Admin Dashboard
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: 28, lineHeight: 1.6 }}>
          This area is restricted to administrators.<br />
          Enter your credentials to continue.
        </p>

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>

          {/* Username */}
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: 7 }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            placeholder="Enter admin username"
            autoFocus
            autoComplete="username"
            style={{
              width: '100%', padding: '12px 14px',
              border: `1.5px solid ${error ? '#EF4444' : '#E2E8F0'}`,
              borderRadius: 10, fontSize: '0.95rem',
              background: '#F8FAFC', marginBottom: 14,
              outline: 'none', transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={e => { if (!error) e.target.style.borderColor = '#2563EB'; }}
            onBlur={e => { if (!error) e.target.style.borderColor = '#E2E8F0'; }}
          />

          {/* Password */}
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: 7 }}>
            Password
          </label>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter admin password"
              autoComplete="current-password"
              style={{
                width: '100%', padding: '12px 44px 12px 14px',
                border: `1.5px solid ${error ? '#EF4444' : '#E2E8F0'}`,
                borderRadius: 10, fontSize: '0.95rem',
                background: '#F8FAFC',
                outline: 'none', transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => { if (!error) e.target.style.borderColor = '#2563EB'; }}
              onBlur={e => { if (!error) e.target.style.borderColor = '#E2E8F0'; }}
            />
            {/* Show/hide toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: '1rem',
                color: '#94A3B8', padding: 0
              }}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {error && (
            <p style={{ color: '#EF4444', fontSize: '0.83rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              width: '100%', padding: '13px',
              background: loading || !username || !password
                ? '#CBD5E1'
                : 'linear-gradient(135deg,#2563EB,#6366F1)',
              border: 'none', borderRadius: 10,
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
              marginTop: 4, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block'
                }}></span>
                Verifying…
              </>
            ) : '🔓 Access Dashboard'}
          </button>
        </form>

        {/* ✅ NO password hint shown to users */}
        <p style={{ marginTop: 20, fontSize: '0.75rem', color: '#CBD5E1', lineHeight: 1.6 }}>
          Contact your administrator if you have lost access.
        </p>
      </div>
    </div>
  );
}