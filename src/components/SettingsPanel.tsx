import { useAppData } from '../context/AppDataContext';

export function SettingsPanel() {
  const { settings, updateSettings, resetAllData } = useAppData();

  function handleReset() {
    if (window.confirm('This will permanently delete ALL your courses, exams, notes, to-dos and study logs. Continue?')) {
      if (window.confirm('Are you absolutely sure? This cannot be undone.')) {
        resetAllData();
      }
    }
  }

  return (
    <div className="page">
      <h2>Settings</h2>

      <div className="card">
        <h3>Graduation target</h3>
        <label className="field">
          <span>Total CFU needed to graduate</span>
          <input
            type="number"
            min="1"
            value={settings.totalCreditsTarget}
            onChange={(e) => updateSettings({ totalCreditsTarget: Number(e.target.value) || 1 })}
          />
        </label>
        <label className="field">
          <span>Thesis bonus points (added on top of the 110-point projection)</span>
          <input
            type="number"
            value={settings.thesisBonus}
            onChange={(e) => updateSettings({ thesisBonus: Number(e.target.value) || 0 })}
          />
        </label>
      </div>

      <div className="card">
        <h3>Data</h3>
        <p className="muted">
          All your data is stored only in this browser's local storage - nothing is sent to any server.
        </p>
        <button className="btn btn--danger" onClick={handleReset}>
          Reset / clear all data
        </button>
      </div>
    </div>
  );
}
