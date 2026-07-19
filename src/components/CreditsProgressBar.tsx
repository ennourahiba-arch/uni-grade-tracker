import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { totalCreditsEarned } from '../lib/gradeMath';

export function CreditsProgressBar() {
  const { courses, settings, updateSettings } = useAppData();
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState(String(settings.totalCreditsTarget));

  const earned = totalCreditsEarned(courses);
  const target = settings.totalCreditsTarget || 1;
  const pct = Math.min(100, (earned / target) * 100);

  function saveTarget() {
    const num = Number(targetDraft);
    if (!Number.isNaN(num) && num > 0) {
      updateSettings({ totalCreditsTarget: num });
    }
    setEditingTarget(false);
  }

  return (
    <div className="card">
      <div className="card__header">
        <h3>Credits progress</h3>
        {editingTarget ? (
          <div className="inline-edit">
            <input
              type="number"
              min="1"
              value={targetDraft}
              onChange={(e) => setTargetDraft(e.target.value)}
              style={{ width: '5rem' }}
            />
            <button className="btn btn--small btn--primary" onClick={saveTarget}>
              Save
            </button>
          </div>
        ) : (
          <button className="btn btn--small" onClick={() => setEditingTarget(true)}>
            Edit target
          </button>
        )}
      </div>
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-bar__label">
        {earned} / {settings.totalCreditsTarget} CFU ({pct.toFixed(0)}%)
      </p>
    </div>
  );
}
