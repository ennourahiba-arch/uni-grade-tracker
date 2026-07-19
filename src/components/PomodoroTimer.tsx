import { useEffect, useRef, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { todayIso } from '../lib/dateUtils';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

export function PomodoroTimer() {
  const { courses, addStudySession } = useAppData();
  const [courseId, setCourseId] = useState<string>('');
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function handlePhaseComplete() {
    setRunning(false);
    if (mode === 'work') {
      addStudySession({ courseId: courseId || null, date: todayIso(), minutes: WORK_MINUTES });
      setMode('break');
      setSecondsLeft(BREAK_MINUTES * 60);
    } else {
      setMode('work');
      setSecondsLeft(WORK_MINUTES * 60);
    }
  }

  function reset() {
    setRunning(false);
    setMode('work');
    setSecondsLeft(WORK_MINUTES * 60);
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="card">
      <h3>Study timer (Pomodoro)</h3>
      <label className="field">
        <span>Course (optional)</span>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">General study</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="pomodoro">
        <span className="pomodoro__mode">{mode === 'work' ? 'Focus' : 'Break'}</span>
        <span className="pomodoro__time">
          {minutes}:{seconds}
        </span>
        <div className="form-actions">
          <button className="btn btn--primary" onClick={() => setRunning((r) => !r)}>
            {running ? 'Pause' : 'Start'}
          </button>
          <button className="btn" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
