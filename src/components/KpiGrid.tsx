'use client';

import React from 'react';
import { KpiSummary } from '@/types';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CalendarClock 
} from 'lucide-react';

interface KpiGridProps {
  kpis: KpiSummary;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
  return (
    <div className="kpi-grid">
      {/* Total Activities */}
      <div className="kpi-card c-total">
        <div className="kpi-header">
          <span className="kpi-label">Total Activities</span>
          <div className="kpi-icon-pill">
            <Briefcase size={14} />
          </div>
        </div>
        <div className="kpi-value">{kpis.total}</div>
        <div className="kpi-sub">
          across {kpis.phasesCount} project phases
        </div>
      </div>

      {/* Completed */}
      <div className="kpi-card c-green">
        <div className="kpi-header">
          <span className="kpi-label">Completed</span>
          <div className="kpi-icon-pill">
            <CheckCircle2 size={14} />
          </div>
        </div>
        <div className="kpi-value">{kpis.completed}</div>
        <div className="kpi-sub">
          {kpis.total ? Math.round((kpis.completed / kpis.total) * 100) : 0}% of master schedule
        </div>
      </div>

      {/* In Progress */}
      <div className="kpi-card c-blue">
        <div className="kpi-header">
          <span className="kpi-label">In Progress</span>
          <div className="kpi-icon-pill">
            <Clock size={14} />
          </div>
        </div>
        <div className="kpi-value">{kpis.inProgress}</div>
        <div className="kpi-sub">
          active on site now
        </div>
      </div>

      {/* Overdue */}
      <div className="kpi-card c-red">
        <div className="kpi-header">
          <span className="kpi-label">Overdue</span>
          <div className="kpi-icon-pill">
            <AlertTriangle size={14} />
          </div>
        </div>
        <div className="kpi-value">{kpis.overdue}</div>
        <div className="kpi-sub" style={{ color: kpis.overdue > 0 ? 'var(--red)' : 'var(--text-sub)' }}>
          {kpis.overdue > 0 ? '⚠ requires immediate intervention' : '✓ 100% on schedule'}
        </div>
      </div>

      {/* Due in <= 7 Days */}
      <div className="kpi-card c-amber">
        <div className="kpi-header">
          <span className="kpi-label">Due ≤ 7 Days</span>
          <div className="kpi-icon-pill">
            <CalendarClock size={14} />
          </div>
        </div>
        <div className="kpi-value">{kpis.dueSoon}</div>
        <div className="kpi-sub">
          high priority deadlines pending
        </div>
      </div>
    </div>
  );
};
