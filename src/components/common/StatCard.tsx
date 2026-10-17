import React from 'react';

type StatColor = 'blue' | 'orange' | 'green' | 'red' | 'purple' | 'gray';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: StatColor;
  subtext?: string;
  subtextValue?: string | number;
  onClick?: () => void;
  loading?: boolean;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color,
  subtext,
  subtextValue,
  onClick,
  loading = false,
  trend,
  className = '',
}) => {
  // ============================================================
  // COLORS
  // ============================================================
  const colorMap: Record<StatColor, string> = {
    blue: 'stat-icon-blue',
    orange: 'stat-icon-orange',
    green: 'stat-icon-green',
    red: 'stat-icon-red',
    purple: 'stat-icon-purple',
    gray: 'stat-icon-gray',
  };

  // ============================================================
  // TREND
  // ============================================================
  const trendIcon = trend?.direction === 'up' ? '📈' : 
                    trend?.direction === 'down' ? '📉' : '➖';
  const trendColor = trend?.direction === 'up' ? 'trend-up' : 
                     trend?.direction === 'down' ? 'trend-down' : 'trend-neutral';

  // ============================================================
  // CLASSES
  // ============================================================
  const classes = [
    'stat-card',
    onClick ? 'stat-clickable' : '',
    loading ? 'stat-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={classes} onClick={onClick}>
      <div className={`stat-icon ${colorMap[color]}`}>
        {loading ? (
          <div className="stat-skeleton"></div>
        ) : (
          <span className="stat-icon-emoji">{icon}</span>
        )}
      </div>

      <div className="stat-info">
        <span className="stat-label">{label}</span>

        {loading ? (
          <div className="stat-skeleton stat-value-skeleton"></div>
        ) : (
          <strong className="stat-number">{value}</strong>
        )}

        <div className="stat-footer">
          {subtext && <span className="stat-sub">{subtext}</span>}
          {subtextValue && (
            <span className="stat-sub-value">{subtextValue}</span>
          )}
          {trend && (
            <span className={`stat-trend ${trendColor}`}>
              {trendIcon} {trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;