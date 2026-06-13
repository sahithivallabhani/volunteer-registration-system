import React, { useState } from 'react';

// SVG Bar Chart Component
export function BarChart({ data, height = 200 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = height - 40; // reserve space for labels
  const barWidth = 32;
  const gap = 24;
  const paddingX = 20;
  const svgWidth = Math.max(300, data.length * (barWidth + gap) + paddingX * 2);

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${svgWidth} ${height}`} preserveAspectRatio="xMinYMin meet">
        {/* Draw grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingX + (1 - ratio) * (chartHeight - paddingX);
          return (
            <g key={idx}>
              <line 
                x1={paddingX} 
                y1={y} 
                x2={svgWidth - paddingX} 
                y2={y} 
                stroke="var(--border-color)" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <text 
                x={paddingX - 5} 
                y={y + 4} 
                fill="var(--text-muted)" 
                fontSize="10" 
                textAnchor="end"
              >
                {Math.round(ratio * maxValue)}
              </text>
            </g>
          );
        })}

        {/* Draw bars */}
        {data.map((d, idx) => {
          const x = paddingX + idx * (barWidth + gap) + 10;
          const valRatio = d.value / maxValue;
          const barHeight = valRatio * (chartHeight - paddingX);
          const y = chartHeight - barHeight;

          const isHovered = hoveredIdx === idx;

          return (
            <g 
              key={idx} 
              onMouseEnter={() => setHoveredIdx(idx)} 
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Highlight background on hover */}
              {isHovered && (
                <rect 
                  x={x - 8} 
                  y={paddingX} 
                  width={barWidth + 16} 
                  height={chartHeight - paddingX + 10} 
                  fill="rgba(139, 92, 246, 0.05)" 
                  rx="8" 
                />
              )}

              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 4)} // at least 4px tall
                rx="6"
                fill={isHovered ? 'url(#barGlowGrad)' : 'url(#barGrad)'}
                filter={isHovered ? 'url(#glow)' : ''}
                style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />

              {/* Tooltip value */}
              {isHovered && (
                <g>
                  <rect 
                    x={x - 10} 
                    y={y - 28} 
                    width={barWidth + 20} 
                    height={20} 
                    fill="var(--bg-secondary)" 
                    stroke="var(--primary)" 
                    strokeWidth="1"
                    rx="4" 
                  />
                  <text 
                    x={x + barWidth / 2} 
                    y={y - 14} 
                    fill="var(--text-primary)" 
                    fontSize="10" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    {d.value}
                  </text>
                </g>
              )}

              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 20}
                fill={isHovered ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize="10"
                fontWeight="500"
                textAnchor="middle"
                style={{ transition: 'color 0.2s' }}
              >
                {d.name}
              </text>
            </g>
          );
        })}

        {/* Definitions for Gradients & Glows */}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--secondary)" />
          </linearGradient>
          <linearGradient id="barGlowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-hover)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

// SVG Donut Chart Component
export function DonutChart({ data, size = 180 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  if (!data || data.length === 0) {
    return (
      <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No data available
      </div>
    );
  }

  const total = data.reduce((acc, d) => acc + d.value, 0);
  const radius = 50;
  const strokeWidth = 12;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;

  let currentOffset = 0;
  const colors = [
    'var(--primary)', 
    'var(--secondary)', 
    'var(--success)', 
    'var(--warning)', 
    '#ec4899', 
    '#f43f5e'
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r={innerRadius} 
            fill="transparent" 
            stroke="var(--border-color)" 
            strokeWidth={strokeWidth} 
          />
          {data.map((d, idx) => {
            if (d.value === 0 || total === 0) return null;
            const pct = d.value / total;
            const strokeLength = pct * circumference;
            const strokeOffset = circumference - strokeLength + currentOffset;
            currentOffset -= strokeLength;

            const isHovered = hoveredIdx === idx;
            const color = colors[idx % colors.length];

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={innerRadius}
                fill="transparent"
                stroke={color}
                strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transform="rotate(-90 50 50)"
                strokeLinecap="round"
                style={{ 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                  cursor: 'pointer',
                  filter: isHovered ? `drop-shadow(0 0 6px ${color})` : ''
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          {hoveredIdx !== null ? (
            <>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{data[hoveredIdx].name}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {data[hoveredIdx].value} hrs
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {Math.round((data[hoveredIdx].value / total) * 100)}%
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Approved</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {total} hrs
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '130px' }}>
        {data.map((d, idx) => {
          const color = colors[idx % colors.length];
          const isHovered = hoveredIdx === idx;
          return (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                opacity: hoveredIdx === null || isHovered ? 1 : 0.4,
                transition: 'opacity 0.2s',
                padding: '0.25rem',
                borderRadius: '6px',
                background: isHovered ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: isHovered ? 600 : 400 }}>{d.name}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginLeft: 'auto', fontWeight: 'bold' }}>{d.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Progress Bar list for ranking (e.g. Top Volunteers)
export function RankingList({ data }) {
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No data yet</div>;

  const maxVal = Math.max(...data.map(d => d.hours), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {data.map((item, idx) => {
        const pct = (item.hours / maxVal) * 100;
        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {idx + 1}. {item.name}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
                {item.hours} hours approved
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${pct}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  borderRadius: '4px',
                  transition: 'width 1s ease-out'
                }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
