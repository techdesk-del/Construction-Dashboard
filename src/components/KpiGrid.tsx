'use client';

import React from 'react';
import { KpiSummary } from '@/types';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  CalendarClock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface KpiGridProps {
  kpis: KpiSummary;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
  const completionPct = kpis.total ? Math.round((kpis.completed / kpis.total) * 100) : 0;

  return (
    <div className="crm-kpi-grid">
      {/* 1. Master Scope */}
      <div className="crm-kpi-card">
        <div className="crm-kpi-header">
          <span className="crm-kpi-label">Master Scope</span>
          <div className="crm-kpi-icon-wrap" style={{ background: '#f1f5f9', color: '#475569' }}>
            <Briefcase size={16} />
          </div>
        </div>
        <div className="crm-kpi-val" style={{ color: 'var(--text-primary)' }}>
          {kpis.total}
        </div>
        <div className="crm-kpi-sub">
          Across <strong>{kpis.phasesCount}</strong> construction phases
        </div>
      </div>

      {/* 2. Completed */}
      <div className="crm-kpi-card">
        <div className="crm-kpi-header">
          <span className="crm-kpi-label">Completed</span>
          <div className="crm-kpi-icon-wrap" style={{ background: 'var(--emerald-light)', color: 'var(--emerald)' }}>
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="crm-kpi-val" style={{ color: 'var(--emerald)' }}>
          {kpis.completed}
        </div>
        <div className="crm-kpi-sub">
          <strong>{completionPct}%</strong> verified &amp; signed off
        </div>
      </div>

      {/* 3. Active On Site */}
      <div className="crm-kpi-card">
        <div className="crm-kpi-header">
          <span className="crm-kpi-label">Active On Site</span>
          <div className="crm-kpi-icon-wrap" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
            <Clock size={16} />
          </div>
        </div>
        <div className="crm-kpi-val" style={{ color: 'var(--blue)' }}>
          {kpis.inProgress}
        </div>
        <div className="crm-kpi-sub">
          Civil, masonry &amp; pool operations
        </div>
      </div>

      {/* 4. Due Soon */}
      <div className="crm-kpi-card">
        <div className="crm-kpi-header">
          <span className="crm-kpi-label">Due ≤ 7 Days</span>
          <div className="crm-kpi-icon-wrap" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
            <CalendarClock size={16} />
          </div>
        </div>
        <div className="crm-kpi-val" style={{ color: 'var(--amber)' }}>
          {kpis.dueSoon}
        </div>
        <div className="crm-kpi-sub">
          High-priority milestones pending
        </div>
      </div>

      {/* 5. Schedule Health */}
      <div className="crm-kpi-card">
        <div className="crm-kpi-header">
          <span className="crm-kpi-label">Schedule Health</span>
          <div className="crm-kpi-icon-wrap" style={{ 
            background: kpis.overdue > 0 ? 'var(--red-light)' : 'var(--emerald-light)', 
            color: kpis.overdue > 0 ? 'var(--red)' : 'var(--emerald)' 
          }}>
            {kpis.overdue > 0 ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
          </div>
        </div>
        <div className="crm-kpi-val" style={{ color: kpis.overdue > 0 ? 'var(--red)' : 'var(--emerald)' }}>
          {kpis.overdue > 0 ? `${kpis.overdue} Delays` : '0 Delays'}
        </div>
        <div className="crm-kpi-sub" style={{ color: kpis.overdue > 0 ? 'var(--red)' : 'var(--emerald)' }}>
          {kpis.overdue > 0 ? '⚠ Site intervention required' : '✓ On-time benchmark pace'}
        </div>
      </div>
    </div>
  );
};
