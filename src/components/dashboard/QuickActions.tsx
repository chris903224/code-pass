import React from 'react';

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  color?: string;
  onClick: () => void;
  badge?: string | number;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
  className?: string;
  title?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  columns = 4,
  className = '',
  title = 'Quick Actions',
}) => {
  // ============================================================
  // COLUMN CLASSES
  // ============================================================
  const columnClasses: Record<number, string> = {
    2: 'quick-actions-2',
    3: 'quick-actions-3',
    4: 'quick-actions-4',
  };

  // ============================================================
  // CLASSES
  // ============================================================
  const classes = [
    'quick-actions',
    columnClasses[columns] || 'quick-actions-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={classes}>
      {title && <h3 className="quick-actions-title">{title}</h3>}
      <div className="quick-actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className={`quick-action-card ${action.disabled ? 'disabled' : ''}`}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            <div
              className="quick-action-icon"
              style={{ backgroundColor: action.color || 'var(--blue-light)' }}
            >
              <span className="quick-action-emoji">{action.icon}</span>
              {action.badge && (
                <span className="quick-action-badge">{action.badge}</span>
              )}
            </div>
            <div className="quick-action-content">
              <strong className="quick-action-label">{action.label}</strong>
              {action.description && (
                <span className="quick-action-description">
                  {action.description}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;