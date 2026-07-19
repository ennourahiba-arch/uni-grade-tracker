import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { projectDegreeScore, weightedAverage } from '../lib/gradeMath';

export function DegreeProjector() {
  const { courses, settings, updateSettings } = useAppData();
  const [projectedAvgInput, setProjectedAvgInput] = useState('');

  const currentAvg = weightedAverage(courses);
  const currentScore = projectDegreeScore(currentAvg, settings.thesisBonus);

  const projectedAvg = projectedAvgInput ? Number(projectedAvgInput) : null;
  const projectedScore =
    projectedAvg !== null && !Number.isNaN(projectedAvg) ? projectDegreeScore(projectedAvg, settings.thesisBonus) : null;

  return (
    <div className="card">
      <h3>110-point degree score projector</h3>
      <p className="muted">Formula: (weighted average / 30) × 110 + thesis bonus</p>

      <label className="field field--inline">
        <span>Thesis bonus points</span>
        <input
          type="number"
          value={settings.thesisBonus}
          onChange={(e) => updateSettings({ thesisBonus: Number(e.target.value) || 0 })}
          style={{ width: '5rem' }}
        />
      </label>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card__label">Current average</span>
          <span className="stat-card__value">{currentAvg !== null ? currentAvg.toFixed(2) : '—'}</span>
          <span className="stat-card__hint">out of 30</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Current projected score</span>
          <span className="stat-card__value">{currentScore !== null ? currentScore.toFixed(1) : '—'}</span>
          <span className="stat-card__hint">out of 110</span>
        </div>
      </div>

      <label className="field">
        <span>Project a different final average (e.g. if you finish with this average):</span>
        <input
          type="number"
          min="18"
          max="31"
          step="0.1"
          value={projectedAvgInput}
          onChange={(e) => setProjectedAvgInput(e.target.value)}
          placeholder="e.g. 27.5"
        />
      </label>

      {projectedScore !== null && (
        <p className="callout">
          Finishing with an average of <strong>{projectedAvg}</strong> would project to a final score of{' '}
          <strong>{projectedScore.toFixed(1)} / 110</strong>.
        </p>
      )}
    </div>
  );
}
