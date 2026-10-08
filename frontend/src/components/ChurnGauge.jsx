import React, { useCallback } from 'react';

/**
 * ChurnGauge — Animated SVG semi-circle gauge
 *
 * @param {number}  probability  0.0 – 1.0
 * @param {string}  riskColor    Hex color matching risk level
 */
const ChurnGauge = ({ probability = 0, riskColor = '#63B3ED' }) => {
  const radius  = 70;
  const cx      = 90;
  const cy      = 90;
  const startX  = cx - radius;
  const startY  = cy;
  const endX    = cx + radius;

  // Semi-circle arc length
  const circumference = Math.PI * radius;
  const filled        = circumference * Math.min(Math.max(probability, 0), 1);
  const empty         = circumference - filled;
  const pct           = Math.round(probability * 100);

  return (
    <div className="gauge-container" style={{ width: 180, height: 100, margin: '0 auto' }}>
      <svg
        className="gauge-svg"
        viewBox="0 0 180 95"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={riskColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={riskColor} />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d={`M ${startX} ${cy} A ${radius} ${radius} 0 0 1 ${endX} ${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Filled arc */}
        <path
          d={`M ${startX} ${cy} A ${radius} ${radius} 0 0 1 ${endX} ${cy}`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${empty}`}
          filter="url(#glow)"
          style={{
            transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((val) => {
          const angle = (val / 100) * Math.PI;
          const tx = cx - radius * Math.cos(angle);
          const ty = cy - radius * Math.sin(angle);
          return (
            <circle
              key={val}
              cx={tx}
              cy={ty}
              r="2"
              fill="rgba(255,255,255,0.2)"
            />
          );
        })}
      </svg>

      {/* Center value */}
      <div className="gauge-value">
        <div className="gauge-pct" style={{ color: riskColor }}>{pct}%</div>
        <div className="gauge-label">Churn Risk</div>
      </div>
    </div>
  );
};

export default ChurnGauge;
