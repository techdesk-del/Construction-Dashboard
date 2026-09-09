export type PriorityLevel = 'High' | 'Medium' | 'Low';

export type ActivityStatus = 'Completed' | 'In Progress' | 'Not Started' | 'Overdue' | 'Due Soon';

export type PhaseName = 
  | 'Critical Civil & External'
  | 'Swimming Pool'
  | 'Services'
  | 'Finishes'
  | 'Openings'
  | 'Interior';

export interface Activity {
  id: number;
  phase: PhaseName;
  name: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  priority: PriorityLevel;
  resp: string;
  dep: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  pct: number; // 0 - 100
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MaterialDeliveryStatus = 'Delivered' | 'To be Delivered' | 'Selection Pending' | 'Partial';
export type MaterialWorkStatus = 'Pending' | 'In Progress' | 'Complete' | 'Not Started';

export interface MaterialItem {
  id: number;
  name: string;
  mat: MaterialDeliveryStatus;
  work: MaterialWorkStatus;
  resp: string;
  deadline: string; // e.g. "07 Sep 2026"
  phase?: PhaseName;
  notes?: string;
}

export interface KpiSummary {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  dueSoon: number;
  overallPct: number;
  phasesCount: number;
}
