export type TabId = 'dashboard' | 'courses' | 'exams' | 'retake' | 'study' | 'transcript' | 'settings';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'courses', label: 'Courses' },
  { id: 'exams', label: 'Exams' },
  { id: 'retake', label: 'Retake Sim' },
  { id: 'study', label: 'Study' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'settings', label: 'Settings' },
];

interface NavTabsProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function NavTabs({ active, onChange }: NavTabsProps) {
  return (
    <nav className="nav-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tabs__item ${active === tab.id ? 'nav-tabs__item--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
