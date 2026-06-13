import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Shield } from 'lucide-react';

export default function Login({ onToggleAuth, onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Failed to login. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '0.75rem', 
              borderRadius: '50%', 
              background: 'rgba(139, 92, 246, 0.1)', 
              color: 'var(--primary)',
              marginBottom: '1rem' 
            }}
          >
            <Shield size={32} />
          </div>
          <h2>Welcome to VolunTrack</h2>
          <p>Login to manage your volunteering activities</p>
        </div>

        {error && (
          <div 
            style={{ 
              background: 'rgba(244, 63, 94, 0.1)', 
              border: '1px solid var(--error)', 
              color: 'var(--error)', 
              padding: '0.75rem 1rem', 
              borderRadius: '8px', 
              marginBottom: '1.25rem',
              fontSize: '0.9rem' 
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '1.25rem' }}
            disabled={loading}
          >
            <LogIn size={18} />
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <span 
            onClick={onToggleAuth} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Register here
          </span>
        </div>

        <div 
          style={{ 
            marginTop: '1.5rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid var(--border-color)', 
            fontSize: '0.8rem', 
            color: 'var(--text-muted)',
            textAlign: 'center' 
          }}
        >
          Quick Demo Admin: <span style={{ color: 'var(--text-secondary)' }}>admin@volunteer.org</span> / <span style={{ color: 'var(--text-secondary)' }}>admin123</span>
        </div>
      </div>
    </div>
  );
}
