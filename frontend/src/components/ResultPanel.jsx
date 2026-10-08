import React from 'react';
import ChurnGauge from './ChurnGauge.jsx';

/**
 * ResultPanel — displays churn prediction output
 *
 * @param {object|null} result  API response from /api/predict
 * @param {string|null} error   Error message if request failed
 */
const ResultPanel = ({ result, error }) => {

  // ── Empty State ──────────────────────────────────────────────
  if (!result && !error) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🤖</div>
        <h3>Awaiting Member Analysis</h3>
        <p>
          Fill in the member profile on the left and click
          <strong> Predict Churn Risk</strong> to see AI-powered
          retention intelligence.
        </p>
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '320px' }}>
          {['High Risk: Low visit frequency', 'Medium Risk: Irregular schedule', 'Low Risk: Consistent engagement'].map((tip, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              fontSize: '13px',
              color: 'var(--clr-text-secondary)',
            }}>
              <span style={{ fontSize: '16px' }}>{['🔴','🟡','🟢'][i]}</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────
  if (error) {
    return (
      <div className="result-panel">
        <div className="error-banner">
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Prediction Failed</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>{error}</div>
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '13px',
          color: 'var(--clr-text-secondary)',
          lineHeight: '1.7',
        }}>
          <strong style={{ color: 'var(--clr-text-primary)' }}>Troubleshooting:</strong>
          <br />
          1. Ensure the Spring Boot backend is running on <code style={{ color: 'var(--clr-primary)', background: 'rgba(99,179,237,0.1)', padding: '1px 5px', borderRadius: '4px' }}>localhost:8080</code>
          <br />
          2. Confirm <code style={{ color: 'var(--clr-primary)', background: 'rgba(99,179,237,0.1)', padding: '1px 5px', borderRadius: '4px' }}>churn_model.onnx</code> exists in the project root
          <br />
          3. Run <code style={{ color: 'var(--clr-primary)', background: 'rgba(99,179,237,0.1)', padding: '1px 5px', borderRadius: '4px' }}>python train_model.py</code> first to generate the model
        </div>
      </div>
    );
  }

  // ── Success State ────────────────────────────────────────────
  const {
    churnProbability,
    churnProbabilityPct,
    riskLevel,
    riskColor,
    retentionStrategy,
    actionItems,
    predictedLabel,
  } = result;

  const riskClass = {
    HIGH: 'risk-high',
    MEDIUM: 'risk-medium',
    LOW: 'risk-low',
  }[riskLevel] || 'risk-low';

  const riskEmoji = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢' }[riskLevel] || '🟢';

  const badgeStyle = {
    background: `${riskColor}20`,
    border: `1px solid ${riskColor}50`,
    color: riskColor,
  };

  return (
    <div className="result-panel">

      {/* ─ Prediction Hero ──────────────────── */}
      <div className={`prediction-hero ${riskClass}`}>
        <div className="prediction-label">Churn Risk Score</div>

        <ChurnGauge probability={churnProbability} riskColor={riskColor} />

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <span className="risk-badge" style={badgeStyle}>
            {riskEmoji} {riskLevel} RISK
          </span>
          <div style={{ fontSize: '13px', color: 'var(--clr-text-secondary)' }}>
            Predicted:{' '}
            <strong style={{ color: predictedLabel === 1 ? riskColor : 'var(--clr-risk-low)' }}>
              {predictedLabel === 1 ? '⚠ Likely to Churn' : '✅ Likely Retained'}
            </strong>
          </div>
        </div>
      </div>

      {/* ─ Risk Bar Breakdown ───────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--clr-border)',
        borderRadius: '12px',
        padding: '16px 20px',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
          Risk Zone Breakdown
        </div>
        <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', gap: '2px' }}>
          {[
            { label: 'Low', pct: 40, color: 'var(--clr-risk-low)' },
            { label: 'Med', pct: 30, color: 'var(--clr-risk-medium)' },
            { label: 'High', pct: 30, color: 'var(--clr-risk-high)' },
          ].map(z => (
            <div
              key={z.label}
              style={{
                flex: z.pct,
                background: z.color,
                opacity: riskLevel === z.label.toUpperCase() || (z.label === 'Med' && riskLevel === 'MEDIUM') ? 1 : 0.25,
                transition: 'opacity 0.5s',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          {['0%', '40%', '70%', '100%'].map(v => (
            <span key={v} style={{ fontSize: '10px', color: 'var(--clr-text-muted)' }}>{v}</span>
          ))}
        </div>
        {/* Indicator needle */}
        <div style={{ position: 'relative', height: '1px', marginTop: '-18px' }}>
          <div style={{
            position: 'absolute',
            left: `${Math.min(Math.max(churnProbability * 100, 1), 99)}%`,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `7px solid ${riskColor}`,
            marginTop: '2px',
            transition: 'left 1s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>

      {/* ─ Retention Strategy ───────────────── */}
      <div className="strategy-block">
        <div className="strategy-title">🎯 Retention Strategy</div>
        <div className="strategy-message">{retentionStrategy}</div>
        <div className="action-list">
          {(actionItems || []).map((action, idx) => (
            <div key={idx} className="action-item" style={{ animationDelay: `${idx * 60}ms` }}>
              {action}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ResultPanel;
