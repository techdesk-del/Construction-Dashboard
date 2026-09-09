'use client';

import React, { useState, useRef } from 'react';
import { Activity, ActivityStatus } from '@/types';
import { 
  parseDate, 
  fmtShort, 
  fmtFull, 
  daysBetween, 
  computeStatus, 
  getDateRange 
} from '@/lib/utils';
import { Edit2, AlertCircle } from 'lucide-react';

interface GanttChartProps {
  activities: Activity[];
  onUpdateActivity: (id: number, updates: Partial<Activity>) => void;
  onEditActivityModal: (id: number) => void;
}

interface TooltipData {
  activity: Activity;
  status: ActivityStatus;
  x: number;
  y: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  activities,
  onUpdateActivity,
  onEditActivityModal,
}) => {
  // Inline editing state: { id, field }
  const [editingCell, setEditingCell] = useState<{ id: number; field: 'name' | 'resp' | 'start' | 'end' | 'pct' } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { min, max } = getDateRange(activities);
  const totalSpan = max.getTime() - min.getTime();

  // Generate weekly timeline ticks for the chart header
  const generateTicks = () => {
    const ticks: { dateStr: string; pct: number }[] = [];
    const cur = new Date(min);
    cur.setHours(0, 0, 0, 0);
    // Align to Monday (August 3, 2026)
    const day = cur.getDay();
    if (day !== 1) {
      cur.setDate(cur.getDate() + ((8 - day) % 7));
    }

    while (cur <= max) {
      const pct = ((cur.getTime() - min.getTime()) / totalSpan) * 100;
      if (pct >= 0 && pct <= 100) {
        ticks.push({
          dateStr: cur.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          pct,
        });
      }
      cur.setDate(cur.getDate() + 7);
    }
    return ticks;
  };

  const ticks = generateTicks();
  const todayPct = Math.max(0, Math.min(100, ((today.getTime() - min.getTime()) / totalSpan) * 100));

  // Inline editing handlers
  const startEditing = (id: number, field: 'name' | 'resp' | 'start' | 'end' | 'pct', initialVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(initialVal || ''));
  };

  const commitEdit = (id: number) => {
    if (!editingCell) return;
    const { field } = editingCell;
    const trimmed = editValue.trim();

    if (field === 'pct') {
      const num = Math.min(100, Math.max(0, parseInt(trimmed, 10) || 0));
      const statusUpdate: Partial<Activity> = { pct: num };
      if (num === 100) statusUpdate.status = 'Completed';
      else if (num > 0) statusUpdate.status = 'In Progress';
      onUpdateActivity(id, statusUpdate);
    } else if (field === 'start' || field === 'end') {
      if (trimmed) {
        onUpdateActivity(id, { [field]: trimmed });
      }
    } else {
      if (trimmed) {
        onUpdateActivity(id, { [field]: trimmed });
      }
    }
    setEditingCell(null);
  };

  // Group activities by phase
  const groupedPhases: { phase: string; items: Activity[] }[] = [];
  activities.forEach((act) => {
    let group = groupedPhases.find((g) => g.phase === act.phase);
    if (!group) {
      group = { phase: act.phase, items: [] };
      groupedPhases.push(group);
    }
    group.items.push(act);
  });

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'Completed':
        return <span className="badge b-done">Completed</span>;
      case 'In Progress':
        return <span className="badge b-prog">In Progress</span>;
      case 'Due Soon':
        return <span className="badge b-soon">Due Soon</span>;
      case 'Overdue':
        return <span className="badge b-over">Overdue</span>;
      default:
        return <span className="badge b-ns">Not Started</span>;
    }
  };

  const getPriorityBadge = (prio: string) => {
    const cls = prio === 'High' ? 'p-h' : prio === 'Medium' ? 'p-m' : 'p-l';
    const initial = prio.charAt(0);
    return <span className={`prio-tag ${cls}`}>{initial}</span>;
  };

  const getBarFillClass = (status: ActivityStatus) => {
    switch (status) {
      case 'Completed': return 'done';
      case 'In Progress': return 'prog';
      case 'Due Soon': return 'soon';
      case 'Overdue': return 'over';
      default: return 'ns';
    }
  };

  return (
    <div className="gantt-wrap">
      <div className="gantt-scroll">
        <table className="gantt-table">
          <colgroup>
            <col style={{ width: '45px' }} />
            <col style={{ width: '200px' }} />
            <col style={{ width: '135px' }} />
            <col style={{ width: '105px' }} />
            <col style={{ width: '105px' }} />
            <col style={{ width: '60px' }} />
            <col style={{ width: '95px' }} />
            <col style={{ width: '110px' }} />
            <col style={{ width: '75px' }} />
            <col style={{ minWidth: '950px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>ID</th>
              <th>Activity</th>
              <th>Responsible</th>
              <th>Start</th>
              <th>Deadline</th>
              <th style={{ textAlign: 'center' }}>Days</th>
              <th style={{ textAlign: 'center' }}>% Done</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
              <th className="chart-col">
                <div className="chart-header">
                  {/* Top Tier: Month Bands */}
                  <div className="month-band">
                    <div className="month-cell" style={{ left: '0%', width: '34%' }}>
                      August 2026
                    </div>
                    <div className="month-cell" style={{ left: '34%', width: '33%' }}>
                      September 2026
                    </div>
                    <div className="month-cell" style={{ left: '67%', width: '33%' }}>
                      October 2026
                    </div>
                  </div>

                  {/* Bottom Tier: Weekly Milestone Ticks */}
                  <div className="ticks-band">
                    {ticks.map((t, idx) => (
                      <React.Fragment key={idx}>
                        <span className="tick-label" style={{ left: `${t.pct}%` }}>
                          {t.dateStr}
                        </span>
                        <span className="gridline" style={{ left: `${t.pct}%` }} />
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Today Marker */}
                  <span className="today-lbl" style={{ left: `${todayPct}%` }}>
                    Today (9 Sep)
                  </span>
                  <span className="today-line" style={{ left: `${todayPct}%` }} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {groupedPhases.map((group) => (
              <React.Fragment key={group.phase}>
                <tr className="phase-row">
                  <td colSpan={10}>{group.phase}</td>
                </tr>
                {group.items.map((act) => {
                  const status = computeStatus(act);
                  const dur = daysBetween(act.start, act.end);

                  // Calculate Gantt bar positions
                  const startD = parseDate(act.start);
                  const endD = parseDate(act.end);
                  const leftPct = Math.max(0, Math.min(100, ((startD.getTime() - min.getTime()) / totalSpan) * 100));
                  const widthPct = Math.max(1, Math.min(100 - leftPct, ((endD.getTime() - startD.getTime()) / totalSpan) * 100));
                  const fillPct = (act.pct / 100) * widthPct;

                  const barFillClass = getBarFillClass(status);

                  return (
                    <tr 
                      key={act.id} 
                      className="task-row"
                      onMouseEnter={(e) => {
                        setTooltip({
                          activity: act,
                          status,
                          x: e.clientX + 16,
                          y: e.clientY - 12,
                        });
                      }}
                      onMouseMove={(e) => {
                        if (tooltip) {
                          setTooltip((prev) => prev ? { ...prev, x: e.clientX + 16, y: e.clientY - 12 } : null);
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {/* ID */}
                      <td className="id-col">{act.id}</td>

                      {/* Name */}
                      <td className="name-col">
                        {editingCell?.id === act.id && editingCell?.field === 'name' ? (
                          <input 
                            type="text" 
                            className="editable-input" 
                            value={editValue} 
                            autoFocus
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(act.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(act.id);
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                          />
                        ) : (
                          <span 
                            className="editable"
                            title="Click to inline edit"
                            onClick={() => startEditing(act.id, 'name', act.name)}
                          >
                            {act.name}
                          </span>
                        )}
                        {getPriorityBadge(act.priority)}
                      </td>

                      {/* Responsible */}
                      <td className="resp-col">
                        {editingCell?.id === act.id && editingCell?.field === 'resp' ? (
                          <input 
                            type="text" 
                            className="editable-input" 
                            value={editValue} 
                            autoFocus
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(act.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(act.id);
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                          />
                        ) : (
                          <span 
                            className="editable"
                            title="Click to inline edit vendor"
                            onClick={() => startEditing(act.id, 'resp', act.resp)}
                          >
                            {act.resp || '—'}
                          </span>
                        )}
                      </td>

                      {/* Start Date */}
                      <td className="dates-col">
                        {editingCell?.id === act.id && editingCell?.field === 'start' ? (
                          <input 
                            type="date" 
                            className="editable-input" 
                            value={editValue} 
                            autoFocus
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(act.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(act.id);
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                          />
                        ) : (
                          <span 
                            className="editable"
                            title="Click to change start date"
                            onClick={() => startEditing(act.id, 'start', act.start)}
                          >
                            {fmtShort(act.start)}
                          </span>
                        )}
                      </td>

                      {/* Deadline Date */}
                      <td className="dates-col">
                        {editingCell?.id === act.id && editingCell?.field === 'end' ? (
                          <input 
                            type="date" 
                            className="editable-input" 
                            value={editValue} 
                            autoFocus
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(act.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(act.id);
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                          />
                        ) : (
                          <span 
                            className="editable"
                            title="Click to change deadline"
                            onClick={() => startEditing(act.id, 'end', act.end)}
                          >
                            {fmtShort(act.end)}
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="dur-col">{dur}d</td>

                      {/* % Done */}
                      <td className="pct-col">
                        <div className="pct-progress">
                          <div className="pct-track">
                            <div 
                              className={`pct-fill ${barFillClass}`}
                              style={{ width: `${act.pct}%` }}
                            />
                          </div>
                          {editingCell?.id === act.id && editingCell?.field === 'pct' ? (
                            <input 
                              type="number" 
                              min="0" 
                              max="100" 
                              className="editable-input" 
                              style={{ width: '48px', padding: '1px 3px' }}
                              value={editValue} 
                              autoFocus
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => commitEdit(act.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit(act.id);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                            />
                          ) : (
                            <span 
                              className="pct-num editable"
                              title="Click to edit percentage"
                              onClick={() => startEditing(act.id, 'pct', act.pct)}
                            >
                              {act.pct}%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="status-col">{getStatusBadge(status)}</td>

                      {/* Action */}
                      <td className="action-col">
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => onEditActivityModal(act.id)}
                          title="Full Edit Activity"
                        >
                          <Edit2 size={11} />
                        </button>
                      </td>

                      {/* Gantt Timeline Bar */}
                      <td className="chart-col">
                        <div className="bar-wrap">
                          <span className="today-line" style={{ left: `${todayPct}%`, height: '100%', top: 0 }} />
                          <div 
                            className="bar-bg" 
                            style={{ 
                              left: `calc(${leftPct}% + 4px)`, 
                              width: `calc(${widthPct}% - 8px)` 
                            }} 
                          />
                          <div 
                            className={`bar-fill ${barFillClass}`} 
                            style={{ 
                              left: `calc(${leftPct}% + 4px)`, 
                              width: `calc(${fillPct}% - ${fillPct > 0 ? '8' : '0'}px)` 
                            }} 
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Tooltip */}
      {tooltip && (
        <div 
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '11.5px',
            lineHeight: '1.6',
            zIndex: 999,
            pointerEvents: 'none',
            minWidth: '220px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: '#f8fafc' }}>
            {tooltip.activity.name}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: '#94a3b8' }}>Phase</span>
            <span style={{ fontWeight: 600 }}>{tooltip.activity.phase}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: '#94a3b8' }}>Responsible</span>
            <span style={{ fontWeight: 600 }}>{tooltip.activity.resp || '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: '#94a3b8' }}>Start</span>
            <span style={{ fontWeight: 600 }}>{fmtFull(tooltip.activity.start)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: '#94a3b8' }}>Deadline</span>
            <span style={{ fontWeight: 600 }}>{fmtFull(tooltip.activity.end)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: '#94a3b8' }}>Duration</span>
            <span style={{ fontWeight: 600 }}>{daysBetween(tooltip.activity.start, tooltip.activity.end)} days</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span style={{ color: '#94a3b8' }}>Progress</span>
            <span style={{ fontWeight: 600 }}>{tooltip.activity.pct}%</span>
          </div>
          {tooltip.activity.dep && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span style={{ color: '#94a3b8' }}>Depends on</span>
              <span style={{ fontWeight: 600 }}>{tooltip.activity.dep}</span>
            </div>
          )}
          {tooltip.activity.remarks && (
            <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
              <span style={{ color: '#fbbf24', fontStyle: 'italic' }}>
                Note: {tooltip.activity.remarks}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
