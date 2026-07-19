import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocalStorage, makeId } from '../lib/storage';
import { DEFAULT_SETTINGS, type Course, type Settings, type StudySession, type Todo, type UpcomingExam } from '../types';

const STORAGE_KEYS = {
  courses: 'ugt.courses',
  exams: 'ugt.upcomingExams',
  settings: 'ugt.settings',
  todos: 'ugt.todos',
  studySessions: 'ugt.studySessions',
};

interface AppDataContextValue {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Omit<Course, 'id'>>) => void;
  deleteCourse: (id: string) => void;

  upcomingExams: UpcomingExam[];
  addExam: (exam: Omit<UpcomingExam, 'id'>) => void;
  deleteExam: (id: string) => void;

  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;

  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'done'>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;

  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id'>) => void;

  resetAllData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useLocalStorage<Course[]>(STORAGE_KEYS.courses, []);
  const [upcomingExams, setUpcomingExams] = useLocalStorage<UpcomingExam[]>(STORAGE_KEYS.exams, []);
  const [settings, setSettings] = useLocalStorage<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  const [todos, setTodos] = useLocalStorage<Todo[]>(STORAGE_KEYS.todos, []);
  const [studySessions, setStudySessions] = useLocalStorage<StudySession[]>(STORAGE_KEYS.studySessions, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      courses,
      addCourse: (course) => setCourses((prev) => [...prev, { ...course, id: makeId() }]),
      updateCourse: (id, updates) =>
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c))),
      deleteCourse: (id) => {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        setTodos((prev) => prev.filter((t) => t.courseId !== id));
      },

      upcomingExams,
      addExam: (exam) => setUpcomingExams((prev) => [...prev, { ...exam, id: makeId() }]),
      deleteExam: (id) => setUpcomingExams((prev) => prev.filter((e) => e.id !== id)),

      settings,
      updateSettings: (updates) => setSettings((prev) => ({ ...prev, ...updates })),

      todos,
      addTodo: (todo) => setTodos((prev) => [...prev, { ...todo, id: makeId(), done: false }]),
      toggleTodo: (id) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
      deleteTodo: (id) => setTodos((prev) => prev.filter((t) => t.id !== id)),

      studySessions,
      addStudySession: (session) => setStudySessions((prev) => [...prev, { ...session, id: makeId() }]),

      resetAllData: () => {
        setCourses([]);
        setUpcomingExams([]);
        setSettings(DEFAULT_SETTINGS);
        setTodos([]);
        setStudySessions([]);
      },
    }),
    [courses, upcomingExams, settings, todos, studySessions, setCourses, setUpcomingExams, setSettings, setTodos, setStudySessions]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
