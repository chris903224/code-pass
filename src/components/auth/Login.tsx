import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { UserType } from '../../types';
import UserTypeSelector from './UserTypeSelector';
import Input from '../common/Input';
import Button from '../common/Button';

interface LoginProps {
  onSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  // ============================================================
  // STATE
  // ============================================================
  const { login, loading } = useAuth();
  const [userType, setUserType] = useState<UserType>('student');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      await login({
        username: formData.username,
        password: formData.password,
        userType,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Invalid username or password. Please try again.');
      console.error('Login error:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="login-form-container">
      <div className="login-header">
        <h2>Welcome Back!</h2>
        <p>Sign in to continue to Clear Pass.</p>
      </div>

      <UserTypeSelector
        selectedType={userType}
        onSelect={setUserType}
        disabled={loading}
      />

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Input
          id="username"
          name="username"
          label="Student ID / Username"
          type="text"
          icon="👤"
          placeholder="Enter your username or ID"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
          required
          autoComplete="username"
        />

        <Input
          id="password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon="🔒"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          required
          autoComplete="current-password"
          showToggle
          onTogglePassword={togglePasswordVisibility}
        />

        <div className="form-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <span className="checkmark"></span>
            Remember Me
          </label>
          <a href="#" className="forgot-password">
            Forgot Password?
          </a>
        </div>

        {error && <div className="form-error">{error}</div>}

        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={loading}
          className="signin-btn"
        >
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </Button>
      </form>
    </div>
  );
};

export default Login;