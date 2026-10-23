import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import AuthToggle from '../components/auth/AuthToggle';
import Brand from '../components/layout/Brand';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
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
      {/* Animated ambient blobs */}
      <div className="bg-blob blob-1" aria-hidden="true" />
      <div className="bg-blob blob-2" aria-hidden="true" />
      <div className="bg-blob blob-3" aria-hidden="true" />

      <div className="login-container">
        {/* LEFT SIDE - GLASS PANEL */}
        <div className="login-left">
          <div className="glass-sheen" aria-hidden="true" />
          <div className="brand-wrapper">
            <Brand />
          </div>

          <div className="brand-message">
            <h2>Track, Submit, and Complete Your Clearance Online.</h2>
            <p className="brand-sub">
              A seamless clearance workflow — built for students, departments, and admins.
            </p>
          </div>

          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">📝</span>
              <span>Submit Request</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Track Progress</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Get Cleared</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - NEUMORPHIC SURFACE */}
        <div className="login-right">
          <div className="login-form-wrapper">
            <AuthToggle activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'login' ? (
              <Login onSuccess={() => {}} />
            ) : (
              <Register onSuccess={() => {}} />
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