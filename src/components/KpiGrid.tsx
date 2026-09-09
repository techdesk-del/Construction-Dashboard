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
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';

interface KpiGridProps {
  kpis: KpiSummary;
  activities?: Activity[];
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis, activities = [] }) => {
  const [showModal, setShowModal] = useState(false);

  // Filter 50%+ in-progress activities and 100% completed activities
  const partial50Activities = activities.filter(a => (a.pct || 0) >= 50 && (a.pct || 0) < 100);
  const completedActivities = activities.filter(a => (a.pct || 0) === 100 || a.status === 'Completed');

  const completedPct = kpis.completedPct ?? (kpis.total ? Math.round((kpis.completed / kpis.total) * 100) : 0);
  const cumulativePct = kpis.overallPct;
  const partialCount = kpis.partial50Count ?? partial50Activities.length;

  return (
    <>
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

        {/* 2. Completed & 50% Milestone Sync */}
        <div 
          className="crm-kpi-card" 
          style={{ cursor: 'pointer' }}
          onClick={() => setShowModal(true)}
          title="Click to view full synchronized work breakdown"
        >
          <div className="crm-kpi-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="crm-kpi-label">Completed</span>
              <span 
                style={{ 
                  fontSize: '9.5px', 
                  fontWeight: 700, 
                  color: '#047857', 
                  background: '#dcfce7', 
                  border: '1px solid #86efac', 
                  borderRadius: '4px', 
                  padding: '1px 5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
                title="Synchronized with live site data"
              >
                <Sparkles size={9} /> 50% Synced
              </span>
            </div>
            <div className="crm-kpi-icon-wrap" style={{ background: 'var(--emerald-light)', color: 'var(--emerald)' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>

          <div className="crm-kpi-val" style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
            <span>{kpis.completed}</span>
            {partialCount > 0 && (
              <span 
                style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  color: '#047857', 
                  background: '#ecfdf5', 
                  border: '1px solid #a7f3d0', 
                  padding: '1px 6px', 
                  borderRadius: '10px',
                  letterSpacing: '0.01em'
                }}
              >
                +{partialCount} @ 50%
              </span>
            )}
          </div>

          {/* Dual-Tone Mini Progress Bar */}
          <div 
            style={{ 
              width: '100%', 
              height: '5px', 
              background: '#f1f5f9', 
              borderRadius: '3px', 
              overflow: 'hidden', 
              margin: '6px 0', 
              display: 'flex' 
            }}
          >
            <div 
              style={{ 
                width: `${(kpis.completed / (kpis.total || 1)) * 100}%`, 
                background: '#059669', 
                transition: 'width 0.3s ease' 
              }} 
            />
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
            <span 
              style={{ 
                fontSize: '11px', 
                color: '#059669', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '3px', 
                fontWeight: 700 
              }}
            >
              Breakdown <ExternalLink size={11} />
            </span>
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

      {/* ── EXECUTIVE MODAL: WORK BREAKDOWN & PHYSICAL PROGRESS SYNC ── */}
      {showModal && (
        <div className="crm-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="crm-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="crm-modal-header">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="var(--emerald)" /> Work Breakdown &amp; Physical Progress Sync
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0' }}>
                  Live synchronized site data &bull; Chakramsar Farmhouse Master Schedule
                </p>
              </div>
              <button 
                type="button"
                className="crm-modal-close" 
                onClick={() => setShowModal(false)}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Summary Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cumulative Progress</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--emerald)', margin: '2px 0' }}>{cumulativePct}%</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Weighted physical completion</div>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>100% Verified Scope</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', margin: '2px 0' }}>{completedActivities.length} Tasks</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{completedPct}% of master schedule</div>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active 50% Milestones</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0284c7', margin: '2px 0' }}>{partial50Activities.length} Tasks</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Under active site execution</div>
              </div>
            </div>

            {/* Tables Container */}
            <div style={{ padding: '16px 20px', maxHeight: '440px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Section 1: Active 50% Milestones */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> Active Milestones (50% Completed): {partial50Activities.length}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Real-time site sync</span>
                </div>
                <div className="crm-breakdown-table-wrap">
                  <table className="crm-breakdown-table">
                    <thead>
                      <tr>
                        <th style={{ width: '45px' }}>ID</th>
                        <th>Activity</th>
                        <th>Phase</th>
                        <th>Responsible</th>
                        <th>Deadline</th>
                        <th style={{ textAlign: 'center', width: '75px' }}>% Done</th>
                        <th style={{ width: '100px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partial50Activities.map(act => (
                        <tr key={act.id}>
                          <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>#{act.id}</td>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.name}</td>
                          <td>
                            <span style={{ fontSize: '10.5px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              {act.phase}
                            </span>
                          </td>
                          <td>{act.resp || '—'}</td>
                          <td style={{ fontSize: '11.5px', color: '#64748b' }}>{act.end}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '10px', fontSize: '11.5px' }}>
                              {act.pct}%
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              ● In Progress
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: 100% Verified & Signed Off */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} /> Verified &amp; Signed Off (100%): {completedActivities.length}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Inspection approved</span>
                </div>
                <div className="crm-breakdown-table-wrap">
                  <table className="crm-breakdown-table">
                    <thead>
                      <tr>
                        <th style={{ width: '45px' }}>ID</th>
                        <th>Activity</th>
                        <th>Phase</th>
                        <th>Responsible</th>
                        <th>Deadline</th>
                        <th style={{ textAlign: 'center', width: '75px' }}>% Done</th>
                        <th style={{ width: '100px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedActivities.map(act => (
                        <tr key={act.id}>
                          <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>#{act.id}</td>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.name}</td>
                          <td>
                            <span style={{ fontSize: '10.5px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              {act.phase}
                            </span>
                          </td>
                          <td>{act.resp || '—'}</td>
                          <td style={{ fontSize: '11.5px', color: '#64748b' }}>{act.end}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 800, color: '#047857', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px', fontSize: '11.5px' }}>
                              100%
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              ✓ Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
              <button 
                type="button"
                className="crm-icon-btn" 
                style={{ width: 'auto', padding: '0 16px', height: '32px', fontSize: '12px', fontWeight: 700 }}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
