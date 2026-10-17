import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  fullWidth = false,
  ...props
}) => {
  // ============================================================
  // VARIANTS
  // ============================================================
  const variantClasses: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-warning',
  };

  // ============================================================
  // SIZES
  // ============================================================
  const sizeClasses: Record<string, string> = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  // ============================================================
  // CLASSES
  // ============================================================
  const classes = [
    'btn',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'btn-full' : '',
    isLoading ? 'btn-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="spinner">⏳</span>}
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="btn-icon">{icon}</span>
      )}
      <span className="btn-text">{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="btn-icon">{icon}</span>
      )}
    </button>
  );
};

export default Button;