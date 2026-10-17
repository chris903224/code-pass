import React from 'react';

interface Activity {
  id: string;
  title: string;
  description?: string;
  icon: string;
  iconColor?: string;
  timestamp: string | Date;
  status?: 'success' | 'warning' | 'error' | 'info';
  user?: {
    name: string;
    avatar?: string;
  };
  onClick?: () => void;
}

interface RecentActivityProps {
  activities: Activity[];
  className?: string;
  title?: string;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  emptyMessage?: string;
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  className = '',
  title = 'Recent Activity',
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  emptyMessage = 'No recent activity',
  loading = false,
}) => {
  // ============================================================
  // FORMAT TIMESTAMP
  // ============================================================
  const formatTime = (timestamp: string | Date): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // ============================================================
  // STATUS ICONS
  // ============================================================
  const statusIcons: Record<string, string> = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  };

  // ============================================================
  // DISPLAY ACTIVITIES
  // ============================================================
  const displayActivities = activities.slice(0, maxItems);

  // ============================================================
  // CLASSES
  // ============================================================
  const classes = [
    'recent-activity',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={classes}>
      <div className="recent-activity-header">
        <h3 className="recent-activity-title">{title}</h3>
        {showViewAll && activities.length > maxItems && (
          <button
            className="recent-activity-view-all"
            onClick={onViewAll}
          >
            View All
          </button>
        )}
      </div>

      <div className="recent-activity-list">
        {loading ? (
          <div className="recent-activity-loading">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        ) : displayActivities.length === 0 ? (
          <div className="recent-activity-empty">
            <span className="empty-icon">📭</span>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          displayActivities.map((activity) => (
            <div
              key={activity.id}
              className={`recent-activity-item ${activity.onClick ? 'clickable' : ''}`}
              onClick={activity.onClick}
            >
              <div
                className="activity-icon"
                style={{ backgroundColor: activity.iconColor || 'var(--blue-light)' }}
              >
                {activity.icon}
              </div>

              <div className="activity-content">
                <div className="activity-main">
                  <strong className="activity-title">{activity.title}</strong>
                  {activity.status && (
                    <span className={`activity-status status-${activity.status}`}>
                      {statusIcons[activity.status]}
                    </span>
                  )}
                </div>

                {activity.description && (
                  <p className="activity-description">{activity.description}</p>
                )}

                <div className="activity-footer">
                  <span className="activity-time">{formatTime(activity.timestamp)}</span>
                  {activity.user && (
                    <span className="activity-user">
                      {activity.user.avatar ? (
                        <img
                          src={activity.user.avatar}
                          alt={activity.user.name}
                          className="activity-avatar"
                        />
                      ) : (
                        <span className="activity-user-initial">
                          {activity.user.name.charAt(0)}
                        </span>
                      )}
                      {activity.user.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;