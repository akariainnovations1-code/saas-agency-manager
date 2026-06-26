import React, { useState } from 'react';

const SalesChart = ({ data = [], type = 'line' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-muted)' }}>
        No chart metrics logged.
      </div>
    );
  }

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 1000) * 1.15; // padding top
  const minVal = 0;
  
  const width = 500;
  const height = 180;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = height - paddingBottom - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, name: d.name, value: d.value };
  });

  // Construct SVG Path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : '';

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="chart-container-box" style={{ flexGrow: 1 }}>
      <div className="svg-chart-wrapper" style={{ height: `${height}px` }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            {/* Gradient Area Fill */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
            {/* Premium Glow effect */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="var(--primary)" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * chartHeight;
            const gridVal = maxVal - ratio * (maxVal - minVal);
            return (
              <g key={i}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="var(--border)" 
                  strokeWidth="1" 
                  strokeDasharray="4,4" 
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 4} 
                  fill="var(--text-muted)" 
                  fontSize="9.5px" 
                  fontWeight="600"
                  textAnchor="end"
                >
                  {formatCurrency(gridVal)}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          {type === 'line' && points.length > 0 && (
            <path d={areaPath} fill="url(#chartGradient)" />
          )}

          {/* Line Path */}
          {type === 'line' && points.length > 0 && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="var(--primary)" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              filter="url(#glow)"
            />
          )}

          {/* Render Bars if chart type is Bar */}
          {type === 'bar' && points.map((p, i) => {
            const barWidth = Math.min(22, chartWidth / data.length - 12);
            const barHeight = height - paddingBottom - p.y;
            return (
              <rect
                key={i}
                x={p.x - barWidth / 2}
                y={p.y}
                width={barWidth}
                height={Math.max(barHeight, 4)}
                rx="4"
                className="svg-bar-element"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* Interaction Dots and Overlay text triggers */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Vertical guideline */}
              {hoveredIdx === i && (
                <line
                  x1={p.x}
                  y1={paddingTop}
                  x2={p.x}
                  y2={height - paddingBottom}
                  stroke="var(--primary)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              )}

              {/* Data points */}
              {type === 'line' && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === i ? 6.5 : 4}
                  fill={hoveredIdx === i ? 'var(--secondary)' : 'var(--primary)'}
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                  style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              )}

              {/* Horizontal labels */}
              <text
                x={p.x}
                y={height - paddingBottom + 16}
                fill="var(--text-muted)"
                fontSize="10px"
                fontWeight="700"
                textAnchor="middle"
              >
                {p.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Popup Overlay card */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div 
            className="svg-chart-tooltip"
            style={{
              left: `${points[hoveredIdx].x - 60}px`,
              top: `${points[hoveredIdx].y - 48}px`,
            }}
          >
            <div>{points[hoveredIdx].name} Revenue</div>
            <div style={{ color: 'var(--primary)', fontWeight: '800', marginTop: '2px' }}>
              {formatCurrency(points[hoveredIdx].value)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesChart;
