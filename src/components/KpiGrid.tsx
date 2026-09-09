'use client';

import React, { useState } from 'react';
import { KpiSummary, Activity } from '@/types';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  CalendarClock, 
  ShieldCheck, 
  AlertTriangle,
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface KpiGridProps {
  kpis: KpiSummary;
  activities?: Activity[];
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis, activities = [] }) => {
  const [showPartialDetails, setShowPartialDetails] = useState(false);

  // Filter 50%+ in-progress activities and 100% completed activities
  const partial50Activities = activities.filter(a => (a.pct || 0) >= 50 && (a.pct || 0) < 100);
  const completedActivities = activities.filter(a => (a.pct || 0) === 100 || a.status === 'Completed');

  const completedPct = kpis.completedPct ?? (kpis.total ? Math.round((kpis.completed / kpis.total) * 100) : 0);
  const cumulativePct = kpis.overallPct;
  const partialCount = kpis.partial50Count ?? partial50Activities.length;

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

      {/* 2. Completed & 50% Partial Milestone Sync */}
      <div 
        className="crm-kpi-card" 
        style={{ position: 'relative' }}
      >
        <div className="crm-kpi-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="crm-kpi-label">Completed</span>
            <span 
              style={{ 
                fontSize: '10px', 
                fontWeight: 700, 
                color: '#047857', 
                background: '#dcfce7', 
                border: '1px solid #86efac', 
                borderRadius: '4px', 
                padding: '1px 5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
              title="Real-time MongoDB sync for both 100% completed and 50% active milestones"
            >
              <Sparkles size={10} /> 50% Synced
            </span>
          </div>
          <div className="crm-kpi-icon-wrap" style={{ background: 'var(--emerald-light)', color: 'var(--emerald)' }}>
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="crm-kpi-val" style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span>{kpis.completed}</span>
          {partialCount > 0 && (
            <span 
              style={{ 
                fontSize: '12px', 
                fontWeight: 700, 
                color: '#047857', 
                background: '#ecfdf5', 
                border: '1px solid #a7f3d0', 
                padding: '2px 8px', 
                borderRadius: '12px',
                letterSpacing: '0.01em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              +{partialCount} active @ 50%
            </span>
          )}
        </div>

        {/* Dual-Tone Mini Progress Bar showing 100% verified + 50% milestones */}
        <div 
          style={{ 
            width: '100%', 
            height: '6px', 
            background: '#f1f5f9', 
            borderRadius: '4px', 
            overflow: 'hidden', 
            margin: '8px 0 6px', 
            display: 'flex' 
          }}
          title={`Total Cumulative: ${cumulativePct}% (${completedPct}% signed off + ${Math.max(0, cumulativePct - completedPct)}% active milestones)`}
        >
          {/* 100% verified signed off */}
          <div 
            style={{ 
              width: `${(kpis.completed / (kpis.total || 1)) * 100}%`, 
              background: '#059669', 
              transition: 'width 0.3s ease' 
            }} 
          />
          {/* 50% milestone progress */}
          <div 
            style={{ 
              width: `${Math.max(0, cumulativePct - completedPct)}%`, 
              background: '#34d399', 
              backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, transparent 75%, transparent)',
              backgroundSize: '8px 8px',
              transition: 'width 0.3s ease' 
            }} 
          />
        </div>

        <div className="crm-kpi-sub" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <strong>{cumulativePct}%</strong> cumulative &bull; {completedPct}% signed off
          </span>
          {activities.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPartialDetails(!showPartialDetails);
              }}
              style={{ 
                fontSize: '11px', 
                color: '#059669', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '2px', 
                fontWeight: 700,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 2px'
              }}
            >
              List <ChevronDown size={12} style={{ transform: showPartialDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          )}
        </div>

        {/* Floating breakdown popup of all 50% & 100% tasks */}
        {showPartialDetails && (
          <div 
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '0',
              width: '280px',
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.15)',
              padding: '12px',
              zIndex: 100,
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Work Breakdown
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>
                {cumulativePct}% Physical Progress
              </span>
            </div>

            {/* 100% Verified */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#047857', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={11} /> Verified &amp; Signed Off (100%): {completedActivities.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {completedActivities.map(a => (
                  <div key={a.id} style={{ fontSize: '10.5px', color: '#334155', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{a.name}</span>
                    <span style={{ fontWeight: 700, color: '#059669' }}>100%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 50% Milestones */}
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0284c7', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} /> In Progress (@ 50%): {partial50Activities.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '140px', overflowY: 'auto' }}>
                {partial50Activities.map(a => (
                  <div key={a.id} style={{ fontSize: '10.5px', color: '#334155', display: 'flex', justifyContent: 'space-between', background: '#f0f9ff', padding: '2px 6px', borderRadius: '4px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{a.name}</span>
                    <span style={{ fontWeight: 700, color: '#0284c7' }}>{a.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
