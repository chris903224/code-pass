import React from 'react';
import StatCard from '../common/StatCard';

export interface StatItem {
  id: string;
  label: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'orange' | 'green' | 'red' | 'purple' | 'gray';
  subtext?: string;
  subtextValue?: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
  loading?: boolean;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 4,
  className = '',
  loading = false,
}) => {
  // ============================================================
  // COLUMN CLASSES
  // ============================================================
  const columnClasses: Record<number, string> = {
    2: 'stats-grid-2',
    3: 'stats-grid-3',
    4: 'stats-grid-4',
  };

  // ============================================================
  // CLASSES
  // ============================================================
  const classes = [
    'stats-grid',
    columnClasses[columns] || 'stats-grid-4',
    loading ? 'stats-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  if (stats.length === 0) {
    return (
      <div className={`${classes} stats-empty`}>
        <span className="empty-icon">📊</span>
        <p>No statistics available</p>
      </div>
    );
  }

  return (
    <div className={classes}>
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          subtext={stat.subtext}
          subtextValue={stat.subtextValue}
          trend={stat.trend}
          onClick={stat.onClick}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default StatsGrid; 