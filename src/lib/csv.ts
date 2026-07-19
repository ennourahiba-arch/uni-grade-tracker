import type { Course } from '../types';

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function coursesToCsv(courses: Course[]): string {
  const header = ['Course Name', 'Grade', 'Credits (CFU)', 'Date Taken', 'Semester', 'Category'];
  const rows = courses.map((c) => [
    escapeCsv(c.name),
    c.grade === null ? 'Not taken' : c.grade === 31 ? '30L' : String(c.grade),
    String(c.credits),
    c.date ?? '',
    c.semester ?? '',
    c.category ?? '',
  ]);
  return [header, ...rows].map((r) => r.join(',')).join('\n');
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
