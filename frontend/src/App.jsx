import React, { useState, useCallback } from 'react';
import MemberForm from './components/MemberForm.jsx';
import ResultPanel from './components/ResultPanel.jsx';

// ── API Configuration ──────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Dataset statistics (from model_metadata.json)
const STATS = [
  { icon: '👥', value: '150', label: 'Members Tracked' },
  { icon: '📉', value: '26%',  label: 'Avg Churn Rate' },
  { icon: '✅', value: '17.0', label: 'Retained Visits/mo' },
  { icon: '⚠️', value: '5.7',  label: 'Churned Visits/mo' },
];

export default function App() {
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Prediction API Call ──────────────────────────────────────
  const handlePredict = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);

      // Scroll result into view on mobile
      document.getElementById('result-panel-anchor')?.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
      setError(err.message || 'Failed to connect to prediction service.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="app-layout">

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="header" role="banner">
        <div className="header-logo">
          <div className="logo-icon" aria-hidden="true">💪</div>
          <div>
            <div className="logo-text">GymIQ</div>
            <div className="logo-sub">AI Retention Intelligence</div>
          </div>
        </div>
        <div className="header-badge" role="status" aria-live="polite">
          <div className="status-dot" aria-hidden="true" />
          {loading ? 'Analyzing…' : 'Model Ready'}
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="main-content" role="main">

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-tag" aria-label="AI-powered">
            ✦ AI-Powered · Random Forest · ONNX Runtime
          </div>
          <h1 className="hero-title" id="hero-title">
            Smart Fitness{' '}
            <span className="gradient-text">Churn Prediction</span>
          </h1>
          <p className="hero-subtitle">
            Identify at-risk gym members 30–45 days before they cancel.
            Get personalized retention strategies powered by machine learning.
          </p>
        </section>

        {/* ── Stats Bar ────────────────────────────────────────── */}
        <section
          className="stats-bar"
          aria-label="Dataset Statistics"
          role="region"
        >
          {STATS.map(({ icon, value, label }) => (
            <div className="stat-card" key={label}>
              <div className="stat-icon" aria-hidden="true">{icon}</div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </section>

        {/* ── Main Dashboard Grid ─────────────────────────────── */}
        <section className="dashboard-grid" aria-label="Prediction Dashboard">

          {/* Left — Input Form */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-icon" aria-hidden="true">📋</div>
              <div>
                <div className="card-title">Member Profile</div>
                <div className="card-subtitle">
                  Enter behavioral &amp; membership data
                </div>
              </div>
            </div>
            <MemberForm onPredict={handlePredict} loading={loading} />
          </div>

          {/* Right — Result Panel */}
          <div className="glass-card" id="result-panel-anchor">
            <div className="card-header">
              <div className="card-icon" aria-hidden="true">🎯</div>
              <div>
                <div className="card-title">Prediction Result</div>
                <div className="card-subtitle">
                  Churn probability &amp; retention actions
                </div>
              </div>
            </div>
            <ResultPanel result={result} error={error} />
          </div>

        </section>

        {/* ── How It Works ─────────────────────────────────────── */}
        <section
          style={{
            marginTop: '40px',
            background: 'linear-gradient(145deg, rgba(30,45,75,0.4) 0%, rgba(13,20,38,0.7) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px',
            padding: '32px',
            backdropFilter: 'blur(20px)',
          }}
          aria-labelledby="how-it-works"
        >
          <h2 id="how-it-works" style={{
            fontFamily: 'var(--font-display)', fontSize: '18px',
            fontWeight: 700, marginBottom: '24px',
            background: 'var(--grad-accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            🔬 How the System Works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {[
              {
                step: '01',
                icon: '📊',
                title: 'Data Pipeline',
                desc: 'Raw gym records cleaned, median-imputed, and feature-engineered into Tenure_Days + one-hot vectors.',
              },
              {
                step: '02',
                icon: '🌲',
                title: 'Random Forest',
                desc: 'Trained on 150 members with class_weight="balanced". Handles mixed data types and outliers.',
              },
              {
                step: '03',
                icon: '⚙️',
                title: 'ONNX Runtime',
                desc: 'Model exported to .onnx and loaded by Java Spring Boot. Zero Python dependency at runtime.',
              },
              {
                step: '04',
                icon: '📱',
                title: 'Risk Stratification',
                desc: 'P(churn) ≥ 70% = High, 40–70% = Medium, < 40% = Low. Triggers tailored interventions.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                padding: '20px',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(99,179,237,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '12px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '11px', fontWeight: 800,
                    color: 'var(--clr-primary)',
                    background: 'var(--clr-primary-dim)',
                    padding: '3px 8px',
                    borderRadius: '5px',
                  }}>{step}</span>
                  <span style={{ fontSize: '20px' }}>{icon}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', lineHeight: '1.6' }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="footer" role="contentinfo">
        <p>
          <strong>GymIQ</strong> · Smart Fitness Churn & Retention Prediction System ·
          Built with <strong>Random Forest</strong> + <strong>ONNX Runtime</strong> + <strong>Spring Boot</strong> + <strong>React</strong>
        </p>
      </footer>

    </div>
  );
}
