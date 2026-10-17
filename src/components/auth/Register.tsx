import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { UserType } from '../../types';
import UserTypeSelector from './UserTypeSelector';
import Input from '../common/Input';
import Button from '../common/Button';

interface RegisterProps {
  onSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
  // ============================================================
  // STATE
  // ============================================================
  const { register, loading } = useAuth();
  const [userType, setUserType] = useState<UserType>('student');
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
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

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="register-form-container">
      <div className="login-header">
        <h2>Create Account</h2>
        <p>Register to start using Clear Pass.</p>
      </div>

      <UserTypeSelector
        selectedType={userType}
        onSelect={setUserType}
        isRegister
        disabled={loading}
      />

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <Input
          id="fullName"
          name="fullName"
          label="Full Name"
          type="text"
          icon="👤"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <Input
          id="username"
          name="username"
          label="Username / ID"
          type="text"
          icon="🆔"
          placeholder="Choose a username or ID"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <Input
          id="email"
          name="email"
          label="Email Address"
          type="email"
          icon="📧"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <Input
          id="password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon="🔒"
          placeholder="Create a password (min. 8 characters)"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          required
          minLength={8}
          showToggle
          onTogglePassword={togglePasswordVisibility}
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          icon="🔐"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <div className="form-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={loading}
            />
            <span className="checkmark"></span>
            I agree to the <a href="#" className="terms-link">Terms &amp; Conditions</a>
          </label>
        </div>

        {error && <div className="form-error">{error}</div>}

        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={loading}
          className="signin-btn"
        >
          {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </Button>
      </form>
    </div>
  );
};

export default Register;