'use client';

import React from 'react';
import { KpiSummary } from '@/types';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CalendarClock,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface KpiGridProps {
  kpis: KpiSummary;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
  const completionPct = kpis.total ? Math.round((kpis.completed / kpis.total) * 100) : 0;

  return (
    <div className="kpi-grid">
      {/* 1. Total Scope */}
      <div className="kpi-card c-total">
        <div className="kpi-card-top-bar" />
        <div>
          <div className="kpi-header">
            <span className="kpi-label">Master Scope</span>
            <div className="kpi-icon-pill">
              <Briefcase size={15} />
            </div>
          </div>
          <div className="kpi-value">{kpis.total}</div>
        </div>
        <div className="kpi-sub">
          Across <strong>{kpis.phasesCount}</strong> construction phases
        </div>
      </div>

      {/* 2. Completed */}
      <div className="kpi-card c-green">
        <div className="kpi-card-top-bar" />
        <div>
          <div className="kpi-header">
            <span className="kpi-label">Completed</span>
            <div className="kpi-icon-pill">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="kpi-value">{kpis.completed}</div>
        </div>
        <div>
          <div style={{
            height: '4px',
            width: '100%',
            background: 'var(--border)',
            borderRadius: 'var(--radius-pill)',
            overflow: 'hidden',
            marginBottom: '6px',
            marginTop: '4px',
          }}>
            <div style={{
              height: '100%',
              width: `${completionPct}%`,
              background: 'var(--emerald)',
              borderRadius: 'var(--radius-pill)',
            }} />
          </div>
          <div className="kpi-sub">
            <strong>{completionPct}%</strong> verified &amp; signed off
          </div>
        </div>
      </div>

      {/* 3. In Progress */}
      <div className="kpi-card c-blue">
        <div className="kpi-card-top-bar" />
        <div>
          <div className="kpi-header">
            <span className="kpi-label">Active On Site</span>
            <div className="kpi-icon-pill">
              <Clock size={15} />
            </div>
          </div>
          <div className="kpi-value">{kpis.inProgress}</div>
        </div>
        <div className="kpi-sub">
          Civil, masonry &amp; pool operations
        </div>
      </div>

      {/* 4. Due Soon */}
      <div className="kpi-card c-amber">
        <div className="kpi-card-top-bar" />
        <div>
          <div className="kpi-header">
            <span className="kpi-label">Due ≤ 7 Days</span>
            <div className="kpi-icon-pill">
              <CalendarClock size={15} />
            </div>
          </div>
          <div className="kpi-value">{kpis.dueSoon}</div>
        </div>
        <div className="kpi-sub">
          High-priority milestones pending
        </div>
      </div>

      {/* 5. Schedule Health / Overdue */}
      <div className="kpi-card c-red">
        <div className="kpi-card-top-bar" />
        <div>
          <div className="kpi-header">
            <span className="kpi-label">Schedule Health</span>
            <div className="kpi-icon-pill">
              {kpis.overdue > 0 ? <AlertTriangle size={15} /> : <ShieldCheck size={15} />}
            </div>
          </div>
          <div className="kpi-value" style={{ color: kpis.overdue > 0 ? 'var(--red)' : 'var(--emerald)' }}>
            {kpis.overdue > 0 ? `${kpis.overdue} Critical` : '0 Delays'}
          </div>
        </div>
        <div className="kpi-sub" style={{ color: kpis.overdue > 0 ? 'var(--red)' : 'var(--emerald)' }}>
          {kpis.overdue > 0 ? '⚠ Attention required on site' : '✓ 100% on target schedule'}
        </div>
      </div>
    </div>
  );
};
