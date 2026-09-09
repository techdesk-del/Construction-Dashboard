import { Activity, ActivityStatus, KpiSummary, MaterialItem } from '@/types';

// Reference date for the dashboard (defaults to current date, or can be set to project benchmark date)
export const PROJECT_REFERENCE_DATE = new Date('2026-09-08T00:00:00');

export function parseDate(s: string): Date {
  const d = new Date(s);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function fmtShort(s: string): string {
  if (!s) return '—';
  const d = parseDate(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function fmtFull(s: string): string {
  if (!s) return '—';
  const d = parseDate(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysBetween(start: string, end: string): number {
  const dStart = parseDate(start);
  const dEnd = parseDate(end);
  const diff = Math.round((dEnd.getTime() - dStart.getTime()) / 86400000) + 1;
  return diff > 0 ? diff : 1;
}

export function computeStatus(a: Activity, refDate: Date = new Date()): ActivityStatus {
  if (a.status === 'Completed' || a.pct >= 100) return 'Completed';
  
  const end = parseDate(a.end);
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);
  
  if (end < today && a.pct < 100) {
    return 'Overdue';
  }
  
  const diffDays = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  if (diffDays >= 0 && diffDays <= 7) {
    return 'Due Soon';
  }
  
  if (a.pct > 0 || a.status === 'In Progress') {
    return 'In Progress';
  }
  
  return 'Not Started';
}

export function getDateRange(activities: Activity[]) {
  // Chakramsar Farmhouse master schedule spans August 1, 2026 to October 31, 2026
  let minTime = parseDate('2026-08-01').getTime();
  let maxTime = parseDate('2026-10-31').getTime();

  if (activities.length > 0) {
    activities.forEach(a => {
      const s = parseDate(a.start).getTime();
      const e = parseDate(a.end).getTime();
      if (!isNaN(s) && s < minTime) minTime = s;
      if (!isNaN(e) && e > maxTime) maxTime = e;
    });
  }

  const min = new Date(minTime);
  min.setHours(0, 0, 0, 0);

  const max = new Date(maxTime);
  max.setHours(0, 0, 0, 0);

  return { min, max };
}

export function computeKpis(activities: Activity[], refDate: Date = new Date()): KpiSummary {
  const total = activities.length;
  let completed = 0;
  let inProgress = 0;
  let overdue = 0;
  let dueSoon = 0;
  let totalPctSum = 0;
  let partialCount = 0;
  let partial50Count = 0;

  activities.forEach(a => {
    const p = typeof a.pct === 'number' ? a.pct : 0;
    totalPctSum += p;
    if (p > 0 && p < 100) {
      partialCount++;
      if (p >= 50) {
        partial50Count++;
      }
    }
    const computed = computeStatus(a, refDate);
    if (computed === 'Completed') completed++;
    else if (computed === 'In Progress') inProgress++;
    else if (computed === 'Overdue') overdue++;
    else if (computed === 'Due Soon') dueSoon++;
  });

  const phasesCount = new Set(activities.map(a => a.phase)).size;
  const overallPct = total > 0 ? Math.round(totalPctSum / total) : 0;
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const equivalentCompleted = Number((totalPctSum / 100).toFixed(1));

  return {
    total,
    completed,
    inProgress,
    overdue,
    dueSoon,
    overallPct,
    phasesCount,
    partialCount,
    partial50Count,
    equivalentCompleted,
    completedPct,
  };
}

export function exportActivitiesToCSV(activities: Activity[]): string {
  const headers = ['ID', 'Phase', 'Activity', 'Priority', 'Responsible', 'Start Date', 'Deadline', 'Duration (Days)', '% Complete', 'Status', 'Dependency', 'Remarks'];
  const rows = activities.map(a => {
    const dur = daysBetween(a.start, a.end);
    const status = computeStatus(a);
    return [
      a.id,
      `"${a.phase}"`,
      `"${a.name.replace(/"/g, '""')}"`,
      a.priority,
      `"${(a.resp || '').replace(/"/g, '""')}"`,
      a.start,
      a.end,
      dur,
      `${a.pct}%`,
      status,
      `"${(a.dep || '').replace(/"/g, '""')}"`,
      `"${(a.remarks || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function exportActivitiesToJSON(activities: Activity[], materials: MaterialItem[]): string {
  return JSON.stringify({
    projectName: 'Chakramsar Farmhouse — Master Schedule',
    exportedAt: new Date().toISOString(),
    activities,
    materials,
  }, null, 2);
}
