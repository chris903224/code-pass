import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
  showToggle?: boolean;
  onTogglePassword?: () => void;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  showToggle = false,
  onTogglePassword,
  helperText,
  className = '',
  type = 'text',
  id,
  disabled = false,
  ...props
}) => {
  // ============================================================
  // STATE
  // ============================================================
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
    if (onTogglePassword) {
      onTogglePassword();
    }
  };

  const inputType = showToggle ? (showPassword ? 'text' : 'password') : type;

  // ============================================================
  // CLASSES
  // ============================================================
  const wrapperClasses = [
    'input-wrapper',
    error ? 'input-error' : '',
    isFocused ? 'input-focused' : '',
    disabled ? 'input-disabled' : '',
    icon ? 'has-icon' : '',
    showToggle ? 'has-toggle' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {props.required && <span className="required-asterisk">*</span>}
        </label>
      )}

      <div className={wrapperClasses}>
        {icon && <span className="input-icon">{icon}</span>}

        <input
          id={id}
          type={inputType}
          className={`input-field ${className}`}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {showToggle && (
          <button
            type="button"
            className="toggle-password"
            onClick={handleTogglePassword}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {error && <div className="input-error-message">{error}</div>}
      {helperText && !error && <div className="input-helper">{helperText}</div>}
    </div>
  );
};

export default Input;