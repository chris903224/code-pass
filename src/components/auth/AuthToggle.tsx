import React from 'react';

type AuthTab = 'login' | 'register';

interface AuthToggleProps {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  disabled?: boolean;
}

const AuthToggle: React.FC<AuthToggleProps> = ({
  activeTab,
  onTabChange,
  disabled = false,
}) => {
  return (
    <div className="auth-toggle">
      <button
        className={`auth-toggle-btn ${activeTab === 'login' ? 'active' : ''}`}
        onClick={() => onTabChange('login')}
        type="button"
        disabled={disabled}
      >
        Sign In
      </button>
      <button
        className={`auth-toggle-btn ${activeTab === 'register' ? 'active' : ''}`}
        onClick={() => onTabChange('register')}
        type="button"
        disabled={disabled}
      >
        Register
      </button>
    </div>
  );
};

export default AuthToggle;