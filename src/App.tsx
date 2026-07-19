import { useState } from 'react';
import './App.css';
import { AppDataProvider } from './context/AppDataContext';
import { NavTabs, type TabId } from './components/NavTabs';
import { DashboardPage } from './components/DashboardPage';
import { CoursesPage } from './components/CoursesPage';
import { ExamCountdown } from './components/ExamCountdown';
import { RetakeSimulator } from './components/RetakeSimulator';
import { StudyPage } from './components/StudyPage';
import { TranscriptView } from './components/TranscriptView';
import { SettingsPanel } from './components/SettingsPanel';

function App() {
  const [tab, setTab] = useState<TabId>('dashboard');

  return (
    <AppDataProvider>
      <div className="app-shell">
        <header className="app-header">
          <h1>🎓 Uni Grade Tracker</h1>
          <NavTabs active={tab} onChange={setTab} />
        </header>

        <main className="app-main">
          {tab === 'dashboard' && <DashboardPage />}
          {tab === 'courses' && <CoursesPage />}
          {tab === 'exams' && (
            <div className="page">
              <h2>Exams</h2>
              <ExamCountdown />
            </div>
          )}
          {tab === 'retake' && (
            <div className="page">
              <h2>Retake Simulator</h2>
              <RetakeSimulator />
            </div>
          )}
          {tab === 'study' && <StudyPage />}
          {tab === 'transcript' && <TranscriptView />}
          {tab === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </AppDataProvider>
  );
}

export default App;
