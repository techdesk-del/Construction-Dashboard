'use client';

import React from 'react';
import { Activity, ActivityStatus } from '@/types';
import { computeStatus, fmtShort, daysBetween } from '@/lib/utils';
import { Clock, CheckCircle, AlertTriangle, PlayCircle, Edit2 } from 'lucide-react';

interface KanbanViewProps {
  activities: Activity[];
  onUpdateActivity: (id: number, updates: Partial<Activity>) => void;
  onEditActivityModal: (id: number) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  activities,
  onUpdateActivity,
  onEditActivityModal,
}) => {
  const columns: { title: string; key: ActivityStatus; color: string; icon: React.ReactNode }[] = [
    { title: 'Not Started', key: 'Not Started', color: '#94a3b8', icon: <Clock size={15} /> },
    { title: 'In Progress', key: 'In Progress', color: 'var(--blue)', icon: <PlayCircle size={15} /> },
    { title: 'Due Soon / Overdue', key: 'Due Soon', color: 'var(--amber)', icon: <AlertTriangle size={15} /> },
    { title: 'Completed', key: 'Completed', color: 'var(--green)', icon: <CheckCircle size={15} /> },
  ];

  const getActivitiesForColumn = (colKey: ActivityStatus) => {
    return activities.filter((a) => {
      const st = computeStatus(a);
      if (colKey === 'Due Soon') {
        return st === 'Due Soon' || st === 'Overdue';
      }
      return st === colKey;
    });
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '16px',
      marginBottom: '32px',
    }}>
      {columns.map((col) => {
        const items = getActivitiesForColumn(col.key);
        return (
          <div 
            key={col.title}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: `2px solid ${col.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13.5px' }}>
                <span style={{ color: col.color }}>{col.icon}</span>
                <span>{col.title}</span>
              </div>
              <span style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
              }}>
                {items.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: '200px' }}>
              {items.length === 0 ? (
                <div style={{
                  padding: '24px 12px',
                  textAlign: 'center',
                  color: 'var(--text-sub)',
                  fontSize: '12px',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  margin: 'auto 0',
                }}>
                  No activities in this stage
                </div>
              ) : (
                items.map((a) => {
                  const dur = daysBetween(a.start, a.end);
                  return (
                    <div 
                      key={a.id}
                      style={{
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        cursor: 'default',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-sub)' }}>
                          #{a.id} • {a.phase}
                        </span>
                        <button 
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 5px', fontSize: '10px' }}
                          onClick={() => onEditActivityModal(a.id)}
                          title="Edit Task"
                        >
                          <Edit2 size={10} />
                        </button>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)', marginBottom: '8px' }}>
                        {a.name}
                      </div>

                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <div><strong>Vendor:</strong> {a.resp || 'Unassigned'}</div>
                        <div><strong>Window:</strong> {fmtShort(a.start)} → {fmtShort(a.end)} ({dur}d)</div>
                      </div>

                      <div className="pct-progress" style={{ marginBottom: '8px' }}>
                        <div className="pct-track">
                          <div 
                            className={`pct-fill ${a.pct === 100 ? 'done' : a.pct > 0 ? 'prog' : ''}`}
                            style={{ width: `${a.pct}%` }}
                          />
                        </div>
                        <span className="pct-num" style={{ fontSize: '11px' }}>{a.pct}%</span>
                      </div>

                      {/* Quick stage mover */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
                        {a.pct < 100 && (
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '10.5px', padding: '3px 8px', flex: 1 }}
                            onClick={() => onUpdateActivity(a.id, { pct: 100, status: 'Completed' })}
                          >
                            Mark Done
                          </button>
                        )}
                        {a.pct === 0 && (
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '10.5px', padding: '3px 8px', flex: 1 }}
                            onClick={() => onUpdateActivity(a.id, { pct: 50, status: 'In Progress' })}
                          >
                            Start (50%)
                          </button>
                        )}
                        {a.pct === 100 && (
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '10.5px', padding: '3px 8px', flex: 1 }}
                            onClick={() => onUpdateActivity(a.id, { pct: 50, status: 'In Progress' })}
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
