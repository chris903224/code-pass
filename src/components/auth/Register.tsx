import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface RegisterProps {
  onSuccess: () => void;
  userType: 'student' | 'department' | 'admin';
}

// Listahan ng mga pwedeng piliin na Department
const SYSTEM_DEPARTMENTS = [
  'Library',
  'Finance',
  'IT Department',
  'Registrar',
  'Student Affairs',
  'Guidance Office'
];

const Register: React.FC<RegisterProps> = ({ onSuccess, userType }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    departmentName: '', // Ito ang gagamitin natin para sa Dropdown
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);
    try {
      // Ipapasa natin ang formData kasama ang userType
      await register({ ...formData, userType } as any);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <div className="login-header" style={{ marginBottom: '24px' }}>
        <h2>Create an Account</h2>
        <p>Join Clear Pass today.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* FULL NAME */}
        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', display: 'block' }}>Full Name <span style={{color: 'var(--color-danger)'}}>*</span></label>
          <div className="input-wrapper">
            <span className="input-icon">👤</span>
            <input 
              type="text" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              placeholder="Enter your full name" 
              required 
            />
          </div>
        </div>

        {/* EMAIL */}
        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', display: 'block' }}>Email Address <span style={{color: 'var(--color-danger)'}}>*</span></label>
          <div className="input-wrapper">
            <span className="input-icon">📧</span>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Enter your email" 
              required 
            />
          </div>
        </div>

        {/* CONDITIONAL FIELDS base sa UserType */}
        
        {/* Kung Student, ipakita ang Student ID */}
        {userType === 'student' && (
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', display: 'block' }}>Student ID <span style={{color: 'var(--color-danger)'}}>*</span></label>
            <div className="input-wrapper">
              <span className="input-icon">🎓</span>
              <input 
                type="text" 
                name="studentId" 
                value={formData.studentId} 
                onChange={handleChange} 
                placeholder="Enter your Student ID" 
                required 
              />
            </div>
          </div>
        )}

        {/* Kung Department, ipakita ang DROPDOWN ng Departments */}
        {userType === 'department' && (
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', display: 'block' }}>Department Name <span style={{color: 'var(--color-danger)'}}>*</span></label>
            <div className="input-wrapper" style={{ padding: 0, overflow: 'hidden' }}>
              <span className="input-icon" style={{ padding: '0 12px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏛️</span>
              <select 
                name="departmentName" 
                value={formData.departmentName} 
                onChange={handleChange} 
                required
                style={{
                  width: '100%', padding: '14px 16px', border: 'none', background: 'transparent',
                  fontFamily: 'var(--font-family)', fontSize: '14px', color: 'var(--text-dark)', outline: 'none', cursor: 'pointer',
                  WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none'
                }}
              >
                <option value="" disabled>Select a Department</option>
                {SYSTEM_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {/* Custom Arrow Icon for Dropdown */}
              <span style={{ paddingRight: '16px', color: 'var(--text-muted)' }}>▼</span>
            </div>
          </div>
        )}

        {/* PASSWORD */}
        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', display: 'block' }}>Password <span style={{color: 'var(--color-danger)'}}>*</span></label>
          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Create a password" 
              required 
            />
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="form-group">
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px', display: 'block' }}>Confirm Password <span style={{color: 'var(--color-danger)'}}>*</span></label>
          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              placeholder="Confirm your password" 
              required 
            />
          </div>
        </div>

        {error && (
          <div className="form-error" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px', borderRadius: '8px', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ padding: '16px', fontSize: '16px', letterSpacing: '1px', marginTop: '8px' }}>
          {isLoading ? 'CREATING ACCOUNT...' : 'REGISTER'}
        </button>
      </form>
    </div>
  );
};

export default Register;