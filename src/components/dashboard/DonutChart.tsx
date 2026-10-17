import React from 'react';

interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  total?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  centerLabel?: string;
  centerValue?: string | number;
  showLegend?: boolean;
  legendPosition?: 'bottom' | 'right';
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  total,
  size = 140,
  strokeWidth = 12,
  className = '',
  centerLabel = 'Total',
  centerValue,
  showLegend = true,
  legendPosition = 'bottom',
}) => {
  // ============================================================
  // CALCULATIONS
  // ============================================================
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate total if not provided
  const totalValue = total || data.reduce((sum, item) => sum + item.value, 0);

  // Calculate cumulative offset
  let cumulativeOffset = 0;

  // ============================================================
  // SEGMENTS
  // ============================================================
  const segments = data.map((item) => {
    const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    const offset = (percentage / 100) * circumference;

    const segment = {
      ...item,
      percentage,
      offset,
      strokeDasharray: `${offset} ${circumference - offset}`,
      strokeDashoffset: -cumulativeOffset,
    };

    cumulativeOffset += offset;
    return segment;
  });

  // ============================================================
  // CLASSES
  // ============================================================
  const classes = [
    'donut-chart',
    `donut-size-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const legendClasses = [
    'donut-legend',
    `legend-${legendPosition}`,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={classes}>
      <div className="donut-chart-container">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="donut-svg"
          style={{ width: size, height: size }}
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="donut-track"
            strokeWidth={strokeWidth}
          />

          {/* Data segments */}
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              className="donut-segment"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={segment.strokeDasharray}
              strokeDashoffset={segment.strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.8s ease',
              }}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="donut-center">
          {centerValue !== undefined ? (
            <>
              <strong className="donut-center-value">{centerValue}</strong>
              <span className="donut-center-label">{centerLabel}</span>
            </>
          ) : (
            <span className="donut-center-label">{centerLabel}</span>
          )}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className={legendClasses}>
          {data.map((item, index) => {
            const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            return (
              <div key={index} className="legend-item">
                <span
                  className="legend-dot"
                  style={{ backgroundColor: item.color }}
                />
                <span className="legend-label">{item.label}</span>
                <span className="legend-value">{item.value}</span>
                <span className="legend-percentage">({percentage.toFixed(1)}%)</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DonutChart;