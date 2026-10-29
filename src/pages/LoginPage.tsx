import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import AuthToggle from '../components/auth/AuthToggle';
import Brand from '../components/layout/Brand';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'student' | 'department' | 'admin'>('student'); // Kailangan ito
  
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate(`/${user.userType}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="bg-blob blob-1" aria-hidden="true" />
      <div className="bg-blob blob-2" aria-hidden="true" />
      <div className="bg-blob blob-3" aria-hidden="true" />

      <div className="login-container">
        <div className="login-left">
          <div className="glass-sheen" aria-hidden="true" />
          <div className="brand-wrapper"><Brand /></div>
          <div className="brand-message">
            <h2>Track, Submit, and Complete Your Clearance Online.</h2>
            <p className="brand-sub">A seamless clearance workflow — built for students, departments, and admins.</p>
          </div>
          <div className="brand-features">
            <div className="feature-item"><span className="feature-icon">📝</span><span>Submit Request</span></div>
            <div className="feature-item"><span className="feature-icon">📊</span><span>Track Progress</span></div>
            <div className="feature-item"><span className="feature-icon">✅</span><span>Get Cleared</span></div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-wrapper" style={{ position: 'relative' }}>
            
            {/* Role Switcher */}
            <div style={{
              position: 'absolute', top: '-50px', right: '0', display: 'flex', gap: '4px',
              background: 'var(--bg-base)', padding: '4px', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--clay-shadow-in)'
            }}>
              <button onClick={() => setUserType('student')} style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: userType === 'student' ? '#fff' : 'transparent', color: userType === 'student' ? 'var(--blue-primary)' : 'var(--text-muted)', boxShadow: userType === 'student' ? 'var(--clay-shadow-out)' : 'none', transition: 'all 0.2s' }}>🎓 Student</button>
              <button onClick={() => setUserType('department')} style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: userType === 'department' ? '#fff' : 'transparent', color: userType === 'department' ? 'var(--blue-primary)' : 'var(--text-muted)', boxShadow: userType === 'department' ? 'var(--clay-shadow-out)' : 'none', transition: 'all 0.2s' }}>🏛️ Department</button>
              <button onClick={() => setUserType('admin')} style={{ padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: userType === 'admin' ? '#fff' : 'transparent', color: userType === 'admin' ? 'var(--blue-primary)' : 'var(--text-muted)', boxShadow: userType === 'admin' ? 'var(--clay-shadow-out)' : 'none', transition: 'all 0.2s' }}>👑 Admin</button>
            </div>

            <AuthToggle activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tiyakin na may userType prop ang Register */}
            {activeTab === 'login' ? (
              <Login onSuccess={() => {}} userType={userType} />
            ) : (
              <Register onSuccess={() => {}} userType={userType} />
            )}

            <div className="login-footer">
              <p>Clear Pass &bull; Clearance Management System</p>
              <p className="copyright">All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;