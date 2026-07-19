import { PomodoroTimer } from './PomodoroTimer';
import { StudyStreak } from './StudyStreak';

export function StudyPage() {
  return (
    <div className="page">
      <h2>Study</h2>
      <div className="two-col">
        <PomodoroTimer />
        <StudyStreak />
      </div>
    </div>
  );
}
