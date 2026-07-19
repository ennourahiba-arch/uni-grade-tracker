import { useAppData } from '../context/AppDataContext';
import { totalCreditsEarned, weightedAverage } from '../lib/gradeMath';

export function StatsSummary() {
  const { courses } = useAppData();
  const taken = courses.filter((c) => c.grade !== null);
  const avg = weightedAverage(courses);
  const credits = totalCreditsEarned(courses);
  const passCount = taken.filter((c) => (c.grade ?? 0) >= 18).length;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-card__label">Weighted average</span>
        <span className="stat-card__value">{avg !== null ? avg.toFixed(2) : '—'}</span>
        <span className="stat-card__hint">out of 30</span>
      </div>
      <div className="stat-card">
        <span className="stat-card__label">Exams taken</span>
        <span className="stat-card__value">{taken.length}</span>
        <span className="stat-card__hint">{passCount} passed</span>
      </div>
      <div className="stat-card">
        <span className="stat-card__label">Credits earned</span>
        <span className="stat-card__value">{credits}</span>
        <span className="stat-card__hint">CFU</span>
      </div>
    </div>
  );
}
