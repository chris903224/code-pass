import React from 'react';

type BadgeVariant = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'cleared' 
  | 'active' 
  | 'inactive'
  | 'warning'
  | 'info';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  className = '',
  size = 'md',
  icon,
  onClick,
}) => {
  // ============================================================
  // VARIANTS
  // ============================================================
  const variantClasses: Record<BadgeVariant, string> = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    cleared: 'badge-approved',
    active: 'badge-approved',
    inactive: 'badge-pending',
    warning: 'badge-warning',
    info: 'badge-info',
  };

  // ============================================================
  // SIZES
  // ============================================================
  const sizeClasses: Record<string, string> = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  };

  // ============================================================
  // CLASSES
  // ============================================================
  const classes = [
    'badge',
    variantClasses[variant],
    sizeClasses[size],
    onClick ? 'badge-clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <span className={classes} onClick={onClick}>
      {icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-text">{children}</span>
    </span>
  );
};

export default Badge;