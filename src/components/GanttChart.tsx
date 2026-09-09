'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Activity, ActivityStatus } from '@/types';
import { 
  parseDate, 
  fmtShort, 
  fmtFull, 
  daysBetween, 
  computeStatus, 
  getDateRange 
} from '@/lib/utils';
import { 
  Edit2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Calendar, 
  List, 
  MoveHorizontal,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { Pagination } from './Pagination';

interface GanttChartProps {
  activities: Activity[];
  onUpdateActivity: (id: number, updates: Partial<Activity>) => void;
  onEditActivityModal: (id: number) => void;
  onReorderActivities?: (newActivities: Activity[]) => void;
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
  onReorderActivities,
}) => {
  // Inline editing state: { id, field }
  const [editingCell, setEditingCell] = useState<{ id: number; field: 'name' | 'resp' | 'start' | 'end' | 'pct' } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // ── ROW DRAG & SLIDE REORDERING STATE ──
  const [draggedActId, setDraggedActId] = useState<number | null>(null);
  const [dragOverActId, setDragOverActId] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('above');
  const [justMovedId, setJustMovedId] = useState<number | null>(null);
  const [quickJumpId, setQuickJumpId] = useState<number | null>(null);
  const [quickJumpPos, setQuickJumpPos] = useState<string>('');

  const executeReorder = (sourceId: number, targetId: number, position: 'above' | 'below') => {
    if (sourceId === targetId) return;

    const sourceIndex = activities.findIndex((a) => a.id === sourceId);
    const targetIndex = activities.findIndex((a) => a.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const sourceAct = activities[sourceIndex];
    const targetAct = activities[targetIndex];

    const copy = [...activities];
    copy.splice(sourceIndex, 1);

    const newTargetIndex = copy.findIndex((a) => a.id === targetId);
    const insertIndex = position === 'above' ? newTargetIndex : newTargetIndex + 1;

    // Adopt target phase if dragged across phases
    const updatedSource = { ...sourceAct, phase: targetAct.phase };
    copy.splice(insertIndex, 0, updatedSource);

    // Resequence IDs so that moving an activity to position 2 assigns it ID #2
    const resequenced = copy.map((act, idx) => ({
      ...act,
      id: idx + 1,
    }));

    setJustMovedId(insertIndex + 1);
    setTimeout(() => setJustMovedId(null), 2500);

    if (onReorderActivities) {
      onReorderActivities(resequenced);
    }
  };

  const handleSlideRow = (id: number, direction: 'up' | 'down') => {
    const idx = activities.findIndex((a) => a.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === activities.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const targetAct = activities[targetIdx];
    executeReorder(id, targetAct.id, direction === 'up' ? 'above' : 'below');
  };

  const handleSlideToPosition = (id: number, targetPosStr: string) => {
    const targetNum = parseInt(targetPosStr, 10);
    if (isNaN(targetNum) || targetNum < 1 || targetNum > activities.length) {
      alert(`Please enter a valid position between 1 and ${activities.length}`);
      return;
    }

    const sourceIndex = activities.findIndex((a) => a.id === id);
    if (sourceIndex === -1) return;

    const targetIndex = targetNum - 1;
    if (sourceIndex === targetIndex) {
      setQuickJumpId(null);
      return;
    }

    const copy = [...activities];
    const [sourceAct] = copy.splice(sourceIndex, 1);
    const targetAct = copy[Math.min(targetIndex, copy.length - 1)] || copy[copy.length - 1];

    const updatedSource = { ...sourceAct, phase: targetAct ? targetAct.phase : sourceAct.phase };
    copy.splice(targetIndex, 0, updatedSource);

    const resequenced = copy.map((act, idx) => ({
      ...act,
      id: idx + 1,
    }));

    setJustMovedId(targetNum);
    setTimeout(() => setJustMovedId(null), 2500);
    setQuickJumpId(null);

    if (onReorderActivities) {
      onReorderActivities(resequenced);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedActId(id);
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    if (draggedActId === id) return;
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const midPoint = rect.top + rect.height / 2;
    const pos = e.clientY < midPoint ? 'above' : 'below';

    setDragOverActId(id);
    setDropPosition(pos);
  };

  const handleDragLeave = () => {
    setDragOverActId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedActId || draggedActId === targetId) {
      setDraggedActId(null);
      setDragOverActId(null);
      return;
    }

    executeReorder(draggedActId, targetId, dropPosition);
    setDraggedActId(null);
    setDragOverActId(null);
  };

  // ── HORIZONTAL SLIDE & SCROLL CONTROLLER STATE ──
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState<number>(0);

  // ── PAGINATION STATE ──
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { min, max } = useMemo(() => getDateRange(activities), [activities]);
  const totalSpan = useMemo(() => max.getTime() - min.getTime(), [min, max]);

  // Generate weekly timeline ticks for the chart header
  const ticks = useMemo(() => {
    const items: { dateStr: string; pct: number }[] = [];
    const cur = new Date(min);
    cur.setHours(0, 0, 0, 0);
    const day = cur.getDay();
    if (day !== 1) {
      cur.setDate(cur.getDate() + ((8 - day) % 7));
    }

    while (cur <= max) {
      const pct = ((cur.getTime() - min.getTime()) / totalSpan) * 100;
      if (pct >= 0 && pct <= 100) {
        items.push({
          dateStr: cur.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          pct,
        });
      }
      cur.setDate(cur.getDate() + 7);
    }
    return items;
  }, [min, max, totalSpan]);

  const todayPct = useMemo(() => {
    return Math.max(0, Math.min(100, ((today.getTime() - min.getTime()) / totalSpan) * 100));
  }, [today, min, totalSpan]);

  // ── HORIZONTAL SLIDE HANDLERS ──
  const handleContainerScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollPct(Math.round((scrollLeft / maxScroll) * 100));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPct = Number(e.target.value);
    setScrollPct(newPct);
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      scrollContainerRef.current.scrollLeft = (newPct / 100) * maxScroll;
    }
  };

  const slideBy = (pixels: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: pixels, behavior: 'smooth' });
    }
  };

  const jumpToView = (type: 'details' | 'today' | 'gantt' | 'end') => {
    if (!scrollContainerRef.current) return;
    const { scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;

    if (type === 'details') {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (type === 'gantt') {
      scrollContainerRef.current.scrollTo({ left: 750, behavior: 'smooth' });
    } else if (type === 'today') {
      const target = 750 + (todayPct / 100) * 950;
      scrollContainerRef.current.scrollTo({ left: Math.min(target, maxScroll), behavior: 'smooth' });
    } else if (type === 'end') {
      scrollContainerRef.current.scrollTo({ left: maxScroll, behavior: 'smooth' });
    }
  };

  // ── INLINE EDITING HANDLERS ──
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

  // ── PAGINATED DATA SLICE ──
  const totalActivities = activities.length;
  const isAll = pageSize === 0;
  const paginatedActivities = useMemo(() => {
    if (isAll) return activities;
    const start = (currentPage - 1) * pageSize;
    return activities.slice(start, start + pageSize);
  }, [activities, currentPage, pageSize, isAll]);

  // Group paginated activities by phase
  const groupedPhases = useMemo(() => {
    const groups: { phase: string; items: Activity[] }[] = [];
    paginatedActivities.forEach((act) => {
      let group = groups.find((g) => g.phase === act.phase);
      if (!group) {
        group = { phase: act.phase, items: [] };
        groups.push(group);
      }
      group.items.push(act);
    });
    return groups;
  }, [paginatedActivities]);

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
      {/* ── SCROLLABLE GANTT TABLE WITH FREEZE-PANES ── */}
      <div 
        className="gantt-scroll" 
        ref={scrollContainerRef} 
        onScroll={handleContainerScroll}
      >
        <table className="gantt-table">
          <colgroup>
            <col style={{ width: '72px' }} />
            <col style={{ width: '210px' }} />
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
              <th className="sticky-col-id" title="Drag row or click number to slide reorder"># Order</th>
              <th className="sticky-col-act">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span>Activity</span>
                  <div className="activity-slide-arrows" title="Slide Table / Timeline View">
                    <button
                      type="button"
                      className="col-slide-arrow-btn"
                      onClick={() => slideBy(-450)}
                      title="Slide Left"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <button
                      type="button"
                      className="col-slide-arrow-btn"
                      onClick={() => slideBy(450)}
                      title="Slide Right"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </th>
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
                <tr className="phase-row phase-header-row">
                  <td colSpan={10} className="sticky-col-id">{group.phase}</td>
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
                      className={`task-row ${draggedActId === act.id ? 'is-dragging' : ''} ${
                        dragOverActId === act.id ? (dropPosition === 'above' ? 'drag-over-above' : 'drag-over-below') : ''
                      } ${justMovedId === act.id ? 'row-just-slid' : ''}`}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, act.id)}
                      onDragOver={(e) => handleDragOver(e, act.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, act.id)}
                      onMouseEnter={(e) => {
                        if (!draggedActId) {
                          setTooltip({
                            activity: act,
                            status,
                            x: e.clientX + 16,
                            y: e.clientY - 12,
                          });
                        }
                      }}
                      onMouseMove={(e) => {
                        if (tooltip && !draggedActId) {
                          setTooltip((prev) => prev ? { ...prev, x: e.clientX + 16, y: e.clientY - 12 } : null);
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {/* Frozen ID Column with Drag & Slide Controls */}
                      <td 
                        className="id-col sticky-col-id"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="row-slide-control-cell">
                          <div 
                            className="row-grip-handle" 
                            title="Click & drag row to slide (e.g. move to 1 or 2)"
                          >
                            <GripVertical size={13} />
                          </div>

                          {quickJumpId === act.id ? (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSlideToPosition(act.id, quickJumpPos);
                              }}
                              className="quick-jump-form"
                            >
                              <input 
                                type="number" 
                                min={1} 
                                max={activities.length}
                                value={quickJumpPos}
                                onChange={(e) => setQuickJumpPos(e.target.value)}
                                autoFocus
                                className="quick-jump-input"
                                onBlur={() => setQuickJumpId(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') setQuickJumpId(null);
                                }}
                              />
                            </form>
                          ) : (
                            <span 
                              className="row-number-badge"
                              title="Click to jump to custom position (e.g. 1 or 2)"
                              onClick={() => {
                                setQuickJumpId(act.id);
                                setQuickJumpPos(String(act.id));
                              }}
                            >
                              {act.id}
                            </span>
                          )}

                          {/* Micro slide up/down arrows */}
                          <div className="row-micro-slide-arrows">
                            <button
                              type="button"
                              className="micro-arrow-btn"
                              title="Slide Up (1 level)"
                              onClick={() => handleSlideRow(act.id, 'up')}
                              disabled={act.id === 1}
                            >
                              <ChevronUp size={10} />
                            </button>
                            <button
                              type="button"
                              className="micro-arrow-btn"
                              title="Slide Down (1 level)"
                              onClick={() => handleSlideRow(act.id, 'down')}
                              disabled={act.id === activities.length}
                            >
                              <ChevronDown size={10} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Frozen Name */}
                      <td className="name-col sticky-col-act">
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
                            title="Click to inline edit"
                            onClick={() => startEditing(act.id, 'resp', act.resp)}
                          >
                            {act.resp || '—'}
                          </span>
                        )}
                      </td>

                      {/* Start Date */}
                      <td className="start-col">
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
                            title="Click to inline edit date"
                            onClick={() => startEditing(act.id, 'start', act.start)}
                          >
                            {fmtShort(act.start)}
                          </span>
                        )}
                      </td>

                      {/* Deadline Date */}
                      <td className="end-col">
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
                            title="Click to inline edit deadline"
                            onClick={() => startEditing(act.id, 'end', act.end)}
                          >
                            {fmtShort(act.end)}
                          </span>
                        )}
                      </td>

                      {/* Duration Days */}
                      <td className="days-col" style={{ textAlign: 'center' }}>
                        {dur}d
                      </td>

                      {/* % Done */}
                      <td className="pct-col" style={{ textAlign: 'center' }}>
                        {editingCell?.id === act.id && editingCell?.field === 'pct' ? (
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            className="editable-input" 
                            value={editValue} 
                            autoFocus
                            style={{ width: '55px', textAlign: 'center' }}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(act.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(act.id);
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                          />
                        ) : (
                          <div 
                            className="pct-bar-wrap editable"
                            title="Click to inline edit percentage"
                            onClick={() => startEditing(act.id, 'pct', act.pct)}
                          >
                            <div className="pct-track">
                              <div className="pct-fill" style={{ width: `${act.pct}%` }} />
                            </div>
                            <span className="pct-text">{act.pct}%</span>
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="status-col">
                        {getStatusBadge(status)}
                      </td>

                      {/* Edit Modal Action */}
                      <td className="action-col" style={{ textAlign: 'center' }}>
                        <button 
                          className="btn btn-outline btn-sm btn-icon"
                          onClick={() => onEditActivityModal(act.id)}
                          title="Full Edit Details"
                        >
                          <Edit2 size={12} />
                        </button>
                      </td>

                      {/* Gantt Bar Graphic */}
                      <td className="chart-col">
                        <div className="bar-track">
                          <div 
                            className={`gantt-bar ${barFillClass}`}
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                            }}
                          >
                            <div 
                              className="gantt-bar-fill"
                              style={{ width: `${act.pct}%` }}
                            />
                            <span className="gantt-bar-label">
                              {act.pct > 0 ? `${act.pct}%` : ''}
                            </span>
                          </div>
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

      {/* ── ENTERPRISE PAGINATION BAR ── */}
      <Pagination 
        currentPage={currentPage}
        totalItems={totalActivities}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[15, 25, 50, 0]}
        itemLabel="activities"
      />

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
