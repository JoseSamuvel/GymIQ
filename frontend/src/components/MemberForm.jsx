import React, { useState, useCallback } from 'react';

// Default form state mirroring the feature vector columns
const DEFAULT_FORM = {
  age: '',
  avg_workout_duration_min: '',
  avg_calories_burned: '',
  total_weight_lifted_kg: '',
  visits_per_month: '',
  tenure_days: '',
  // Categorical selections (stored as UI-friendly labels, converted on submit)
  gender: 'Male',
  membership_type: 'Monthly',
  favorite_exercise: 'Cardio',
};

const MemberForm = ({ onPredict, loading }) => {
  const [form, setForm] = useState(DEFAULT_FORM);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Build the feature payload matching OnnxInferenceService expectations
    const gender_male = form.gender === 'Male' ? 1 : 0;
    const membership_type_quarterly = form.membership_type === 'Quarterly' ? 1 : 0;
    const membership_type_yearly    = form.membership_type === 'Yearly'    ? 1 : 0;

    const ex = form.favorite_exercise;
    const payload = {
      age:                          parseFloat(form.age) || 30,
      avg_workout_duration_min:     parseFloat(form.avg_workout_duration_min) || 60,
      avg_calories_burned:          parseFloat(form.avg_calories_burned) || 450,
      total_weight_lifted_kg:       parseFloat(form.total_weight_lifted_kg) || 9000,
      visits_per_month:             parseFloat(form.visits_per_month) || 10,
      tenure_days:                  parseFloat(form.tenure_days) || 90,
      gender_male,
      membership_type_quarterly,
      membership_type_yearly,
      favorite_exercise_cycling:    ex === 'Cycling'    ? 1 : 0,
      favorite_exercise_deadlift:   ex === 'Deadlift'   ? 1 : 0,
      'favorite_exercise_pull-ups': ex === 'Pull-ups'   ? 1 : 0,
      favorite_exercise_squats:     ex === 'Squats'     ? 1 : 0,
      favorite_exercise_treadmill:  ex === 'Treadmill'  ? 1 : 0,
    };

    onPredict(payload);
  }, [form, onPredict]);

  const fillDemo = useCallback((type) => {
    if (type === 'high') {
      setForm({
        age: '46', avg_workout_duration_min: '33', avg_calories_burned: '210',
        total_weight_lifted_kg: '4600', visits_per_month: '4',
        tenure_days: '57', gender: 'Male', membership_type: 'Monthly',
        favorite_exercise: 'Squats',
      });
    } else if (type === 'low') {
      setForm({
        age: '28', avg_workout_duration_min: '90', avg_calories_burned: '580',
        total_weight_lifted_kg: '14000', visits_per_month: '22',
        tenure_days: '307', gender: 'Female', membership_type: 'Yearly',
        favorite_exercise: 'Deadlift',
      });
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} id="member-prediction-form">
      {/* Demo Quickfill buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => fillDemo('high')}
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,71,87,0.4)',
            background: 'rgba(255,71,87,0.1)',
            color: '#FF6B81',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
        >
          🔴 Load High-Risk Demo
        </button>
        <button
          type="button"
          onClick={() => fillDemo('low')}
          style={{
            padding: '7px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(46,213,115,0.4)',
            background: 'rgba(46,213,115,0.1)',
            color: '#2ED573',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
        >
          🟢 Load Low-Risk Demo
        </button>
      </div>

      <div className="form-grid">

        {/* ── Physical Profile ──────────────────────── */}
        <div className="form-section-label">👤 Physical Profile</div>

        <div className="form-group">
          <label className="form-label" htmlFor="age">
            <span className="label-icon">🎂</span> Age (years)
          </label>
          <input
            id="age"
            className="form-input"
            type="number" name="age"
            value={form.age} onChange={handleChange}
            placeholder="e.g. 28"
            min="15" max="80"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="gender">
            <span className="label-icon">⚧</span> Gender
          </label>
          <select
            id="gender"
            className="form-select"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* ── Membership Info ───────────────────────── */}
        <div className="form-section-label">🪪 Membership</div>

        <div className="form-group">
          <label className="form-label" htmlFor="membership_type">
            <span className="label-icon">📋</span> Membership Type
          </label>
          <select
            id="membership_type"
            className="form-select"
            name="membership_type"
            value={form.membership_type}
            onChange={handleChange}
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tenure_days">
            <span className="label-icon">📅</span> Tenure Days
          </label>
          <input
            id="tenure_days"
            className="form-input"
            type="number" name="tenure_days"
            value={form.tenure_days} onChange={handleChange}
            placeholder="Days since joining"
            min="0" required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="visits_per_month">
            <span className="label-icon">🏃</span> Visits / Month
          </label>
          <input
            id="visits_per_month"
            className="form-input"
            type="number" name="visits_per_month"
            value={form.visits_per_month} onChange={handleChange}
            placeholder="e.g. 12"
            min="0" max="31" required
          />
        </div>

        {/* ── Workout Metrics ───────────────────────── */}
        <div className="form-section-label">💪 Workout Metrics</div>

        <div className="form-group">
          <label className="form-label" htmlFor="avg_workout_duration_min">
            <span className="label-icon">⏱️</span> Avg Duration (min)
          </label>
          <input
            id="avg_workout_duration_min"
            className="form-input"
            type="number" name="avg_workout_duration_min"
            value={form.avg_workout_duration_min} onChange={handleChange}
            placeholder="e.g. 60"
            min="10" max="240" required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="avg_calories_burned">
            <span className="label-icon">🔥</span> Avg Calories Burned
          </label>
          <input
            id="avg_calories_burned"
            className="form-input"
            type="number" name="avg_calories_burned"
            value={form.avg_calories_burned} onChange={handleChange}
            placeholder="e.g. 450"
            min="50" required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="total_weight_lifted_kg">
            <span className="label-icon">🏋️</span> Total Weight Lifted (kg)
          </label>
          <input
            id="total_weight_lifted_kg"
            className="form-input"
            type="number" name="total_weight_lifted_kg"
            value={form.total_weight_lifted_kg} onChange={handleChange}
            placeholder="e.g. 9000"
            min="0" required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="favorite_exercise">
            <span className="label-icon">🎯</span> Favorite Exercise
          </label>
          <select
            id="favorite_exercise"
            className="form-select"
            name="favorite_exercise"
            value={form.favorite_exercise}
            onChange={handleChange}
          >
            <option value="Cardio">Cardio (General)</option>
            <option value="Cycling">Cycling</option>
            <option value="Deadlift">Deadlift</option>
            <option value="Pull-ups">Pull-ups</option>
            <option value="Squats">Squats</option>
            <option value="Treadmill">Treadmill</option>
          </select>
        </div>

        {/* Submit */}
        <button
          id="predict-btn"
          type="submit"
          className="btn-predict"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn-spinner" />
              Analyzing Member…
            </>
          ) : (
            '⚡ Predict Churn Risk'
          )}
        </button>

      </div>
    </form>
  );
};

export default MemberForm;
