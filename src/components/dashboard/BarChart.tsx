import React from 'react';

interface BarData {
  label: string;
  value: number;
  color?: string;
  secondaryValue?: number;
  secondaryColor?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  maxValue?: number;
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
  isHorizontal?: boolean;
  animated?: boolean;
  barSpacing?: number;
  emptyMessage?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  maxValue,
  className = '',
  showLabels = true,
  showValues = true,
  isHorizontal = false,
  animated = true,
  barSpacing = 8,
  emptyMessage = 'No data available',
}) => {
  // ============================================================
  // CALCULATIONS
  // ============================================================
  const chartMax = maxValue || Math.max(...data.map((item) => item.value), 1);
  const barCount = data.length;
  const gap = barSpacing;
  const barWidth = isHorizontal
    ? 0
    : Math.min(40, (100 / barCount) - gap);

  // ============================================================
  // CLASSES
  // ============================================================
  const classes = [
    'bar-chart',
    isHorizontal ? 'bar-chart-horizontal' : 'bar-chart-vertical',
    animated ? 'bar-chart-animated' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  if (data.length === 0) {
    return (
      <div className={`${classes} bar-chart-empty`}>
        <span className="empty-icon">📊</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // ============================================================
  // VERTICAL BARS
  // ============================================================
  if (!isHorizontal) {
    return (
      <div className={classes} style={{ height }}>
        <div className="bar-chart-bars">
          {data.map((item, index) => {
            const percentage = (item.value / chartMax) * 100;
            const barColor = item.color || '#3355e0';

            return (
              <div
                key={index}
                className="bar-col"
                style={{
                  flex: barWidth ? `0 0 ${barWidth}%` : 1,
                  margin: `0 ${gap / 2}px`,
                }}
              >
                {showValues && (
                  <span className="bar-value">{item.value}</span>
                )}
                <div
                  className="bar"
                  style={{
                    height: animated ? '0%' : `${percentage}%`,
                    backgroundColor: barColor,
                    transition: animated ? 'height 0.8s ease' : 'none',
                  }}
                />
                {showLabels && (
                  <span className="bar-label">{item.label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================================
  // HORIZONTAL BARS
  // ============================================================
  return (
    <div className={classes} style={{ height }}>
      <div className="bar-chart-bars">
        {data.map((item, index) => {
          const percentage = (item.value / chartMax) * 100;
          const barColor = item.color || '#3355e0';

          return (
            <div key={index} className="bar-row" style={{ marginBottom: gap }}>
              {showLabels && (
                <span className="bar-label">{item.label}</span>
              )}
              <div className="bar-track">
                <div
                  className="bar"
                  style={{
                    width: animated ? '0%' : `${percentage}%`,
                    backgroundColor: barColor,
                    transition: animated ? 'width 0.8s ease' : 'none',
                  }}
                />
              </div>
              {showValues && (
                <span className="bar-value">{item.value}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;