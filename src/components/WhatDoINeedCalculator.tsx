import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { requiredAverageForTargetScore } from '../lib/gradeMath';

export function WhatDoINeedCalculator() {
  const { courses, settings } = useAppData();
  const [targetScore, setTargetScore] = useState('110');

  const target = Number(targetScore);
  const result =
    !Number.isNaN(target) && targetScore !== ''
      ? requiredAverageForTargetScore(courses, target, settings.thesisBonus, settings.totalCreditsTarget)
      : null;

  return (
    <div className="card">
      <h3>What do I need?</h3>
      <p className="muted">
        Target final degree score, given your {settings.totalCreditsTarget} CFU graduation target and{' '}
        {settings.thesisBonus} thesis bonus points.
      </p>
      <label className="field">
        <span>Target final score (out of 110)</span>
        <input
          type="number"
          min="66"
          max="110"
          value={targetScore}
          onChange={(e) => setTargetScore(e.target.value)}
        />
      </label>

      {result && (
        <div className={`callout ${result.achievable ? 'callout--info' : 'callout--warning'}`}>
          <p>{result.note}</p>
          {result.requiredAverage !== null && (
            <p>
              Required average across remaining CFU: <strong>{result.requiredAverage.toFixed(2)} / 31</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
