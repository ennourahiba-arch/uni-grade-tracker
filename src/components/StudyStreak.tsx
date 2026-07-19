import { useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';

/** Computes the current consecutive-day study streak from logged study sessions. */
function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const uniqueDays = Array.from(new Set(dates)).sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const cursor = new Date(today);

  for (const day of uniqueDays) {
    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((cursor.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (diffDays === 1 && streak === 0) {
      // Allow the streak to still count if today hasn't been studied yet but yesterday was.
      streak += 1;
      cursor.setTime(dayDate.getTime());
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function StudyStreak() {
  const { studySessions } = useAppData();
  const streak = useMemo(() => computeStreak(studySessions.map((s) => s.date)), [studySessions]);
  const totalMinutes = studySessions.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className="card">
      <h3>Study streak</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card__label">Current streak</span>
          <span className="stat-card__value">{streak}</span>
          <span className="stat-card__hint">day{streak === 1 ? '' : 's'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Total study time</span>
          <span className="stat-card__value">{(totalMinutes / 60).toFixed(1)}</span>
          <span className="stat-card__hint">hours</span>
        </div>
      </div>
    </div>
  );
}
