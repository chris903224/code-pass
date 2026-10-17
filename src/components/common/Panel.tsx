import React from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  noPadding?: boolean;
}

const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  children,
  className = '',
  actions,
  footer,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
  variant = 'default',
  noPadding = false,
}) => {
  // ============================================================
  // VARIANTS
  // ============================================================
  const variantClasses: Record<string, string> = {
    default: 'panel-default',
    primary: 'panel-primary',
    success: 'panel-success',
    warning: 'panel-warning',
    danger: 'panel-danger',
  };

  // ============================================================
  // CLASSES
  // ============================================================
  const classes = [
    'panel',
    variantClasses[variant],
    noPadding ? 'panel-no-padding' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={classes}>
      {/* HEADER */}
      {(title || actions) && (
        <div className="panel-header">
          <div className="panel-title-group">
            {title && <h3 className="panel-title">{title}</h3>}
            {subtitle && <p className="panel-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="panel-actions">{actions}</div>}
        </div>
      )}

      {/* BODY */}
      <div className="panel-body">
        {loading ? (
          <div className="panel-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : empty ? (
          <div className="panel-empty">
            <span className="empty-icon">📭</span>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>

      {/* FOOTER */}
      {footer && <div className="panel-footer">{footer}</div>}
    </div>
  );
};

export default Panel; 