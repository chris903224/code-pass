import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface LoginProps {
  onSuccess: () => void;
  userType: 'student' | 'department' | 'admin';
}

const Login: React.FC<LoginProps> = ({ onSuccess, userType }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const getLabel = () => {
    switch (userType) {
      case 'student': return 'Student ID / Username';
      case 'department': return 'Department ID / Email';
      case 'admin': return 'Admin Username';
      default: return 'Username';
    }
  };

  const getPlaceholder = () => {
    switch (userType) {
      case 'student': return 'Enter your username or ID';
      case 'department': return 'Enter your department email';
      case 'admin': return 'Enter admin username';
      default: return 'Enter your username';
    }
  };

  const getIcon = () => {
    switch (userType) {
      case 'student': return '🎓';
      case 'department': return '🏛️';
      case 'admin': return '👑';
      default: return '👤';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // INAYOS: Nilagyan ng 'as any' para hindi mag-reklamo ang TypeScript 
      // kahit hindi pa updated ang interface sa AuthContext.
      await login({ identifier, password, userType } as any);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div className="login-header" style={{ marginBottom: '24px' }}>
        <h2>Welcome Back!</h2>
        <p>Sign in to continue to Clear Pass.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', display: 'block' }}>{getLabel()} <span style={{color: 'var(--color-danger)'}}>*</span></label>
          <div className="input-wrapper">
            <span className="input-icon">{getIcon()}</span>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={getPlaceholder()}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', display: 'block' }}>Password <span style={{color: 'var(--color-danger)'}}>*</span></label>
          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none', padding: '0 16px', cursor: 'pointer', fontSize: '18px', opacity: 0.6, transition: '0.2s' }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="form-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="remember-me" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" style={{ accentColor: 'var(--blue-primary)', width: '16px', height: '16px' }} />
            Remember Me
          </label>
          <a href="#" className="forgot-password" style={{ fontSize: '13px', color: 'var(--blue-primary)', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</a>
        </div>

        {error && <div className="form-error" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px', borderRadius: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ padding: '16px', fontSize: '16px', letterSpacing: '1px', marginTop: '8px' }}>
          {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </form>
    </div>
  );
};

export default Login;