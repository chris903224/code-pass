import React from 'react';

interface BrandProps {
  className?: string;
  showTagline?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

const Brand: React.FC<BrandProps> = ({
  className = '',
  showTagline = true,
  variant = 'default',
}) => {
  // ============================================================
  // VARIANTS
  // ============================================================
  const variantClasses: Record<string, string> = {
    default: 'brand-default',
    compact: 'brand-compact',
    minimal: 'brand-minimal',
  };

  // ============================================================
  // CLASSES
  // ============================================================
  const classes = [
    'brand',
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={classes}>
      <div className="brand-icon">
        <svg
          width={variant === 'minimal' ? 24 : 26}
          height={variant === 'minimal' ? 24 : 26}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
            fill="#fff"
            opacity=".2"
          />
          <path
            d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M9 12.5l2 2 4-4.5"
            stroke="#fff"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="brand-text">
        <h1 className="brand-name">
          Clear<span className="brand-highlight">Pass</span>
        </h1>
        {showTagline && (
          <p className="brand-tagline">Clearance Management System</p>
        )}
      </div>
    </div>
  );
};

export default Brand;