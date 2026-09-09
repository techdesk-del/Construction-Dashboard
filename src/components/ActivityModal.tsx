'use client';

import React, { useState, useEffect } from 'react';
import { Activity, PhaseName, PriorityLevel } from '@/types';
import { 
  X, 
  Trash2, 
  Building2, 
  Calendar, 
  Flag, 
  User, 
  Link as LinkIcon, 
  CheckCircle2, 
  FileText,
  Plus
} from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  activity: Activity | null;
  onClose: () => void;
  onSave: (data: Partial<Activity>) => void;
  onDelete?: (id: number) => void;
  availablePhases?: string[];
}

const DEFAULT_PHASES = [
  'Critical Civil & External',
  'Swimming Pool',
  'Services',
  'Finishes',
  'Openings',
  'Interior',
];

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  activity,
  onClose,
  onSave,
  onDelete,
  availablePhases = DEFAULT_PHASES,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phase: 'Critical Civil & External' as PhaseName,
    priority: 'Medium' as PriorityLevel,
    start: '',
    end: '',
    resp: '',
    dep: '',
    status: 'Not Started' as 'Completed' | 'In Progress' | 'Not Started',
    pct: 0,
    remarks: '',
  });

  const [isCustomPhase, setIsCustomPhase] = useState<boolean>(false);
  const [customPhaseText, setCustomPhaseText] = useState<string>('');

  // Combined deduplicated phases list
  const phaseOptions = React.useMemo(() => {
    const set = new Set<string>(DEFAULT_PHASES);
    if (availablePhases) {
      availablePhases.forEach((p) => {
        if (p && p.trim()) set.add(p.trim());
      });
    }
    if (activity?.phase) {
      set.add(activity.phase.trim());
    }
    return Array.from(set);
  }, [availablePhases, activity]);

  useEffect(() => {
    if (activity) {
      setIsCustomPhase(false);
      setCustomPhaseText('');
      setFormData({
        name: activity.name,
        phase: activity.phase,
        priority: activity.priority,
        start: activity.start,
        end: activity.end,
        resp: activity.resp || '',
        dep: activity.dep || '',
        status: activity.status,
        pct: activity.pct || 0,
        remarks: activity.remarks || '',
      });
    } else {
      const todayStr = new Date().toISOString().slice(0, 10);
      const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      const initialPhase = (availablePhases && availablePhases.length > 0 ? availablePhases[0] : 'Critical Civil & External') as PhaseName;
      setIsCustomPhase(false);
      setCustomPhaseText('');
      setFormData({
        name: '',
        phase: initialPhase,
        priority: 'Medium',
        start: todayStr,
        end: nextWeekStr,
        resp: '',
        dep: '',
        status: 'Not Started',
        pct: 0,
        remarks: '',
      });
    }
  }, [activity, isOpen, availablePhases]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPhase = isCustomPhase ? customPhaseText.trim() : formData.phase?.trim();
    if (!formData.name.trim() || !formData.start || !formData.end) {
      alert('Activity name, start date, and deadline are required.');
      return;
    }
    if (!finalPhase) {
      alert('Please select or enter a valid Construction Phase title.');
      return;
    }
    onSave({
      ...formData,
      phase: finalPhase as PhaseName,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--blue-light)',
              color: 'var(--blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--blue-border)',
            }}>
              {activity ? <Building2 size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <h2>{activity ? 'Edit Schedule Activity' : 'Add New Schedule Activity'}</h2>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {activity ? `Activity ID: #${activity.id}` : 'Create a master schedule milestone'}
              </div>
            </div>
          </div>

          <button 
            type="button"
            className="btn btn-outline btn-sm btn-icon" 
            onClick={onClose}
            title="Close dialog"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Task Name */}
            <div className="form-group col-full">
              <label htmlFor="modal-act-name">Activity Name *</label>
              <input 
                id="modal-act-name"
                type="text"
                placeholder="e.g. Waterproofing Basement & Terrace"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            {/* Construction Phase */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label htmlFor="modal-act-phase" style={{ margin: 0, fontWeight: 600 }}>
                  Construction Phase *
                </label>
                {!isCustomPhase ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomPhase(true);
                      setCustomPhaseText('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--blue)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '0 2px',
                      textDecoration: 'underline',
                    }}
                  >
                    + Add Custom Title
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomPhase(false);
                      setCustomPhaseText('');
                      setFormData({ ...formData, phase: (phaseOptions[0] || 'Critical Civil & External') as PhaseName });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-sub)',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: '0 2px',
                    }}
                  >
                    ← Select from list
                  </button>
                )}
              </div>

              {!isCustomPhase ? (
                <select 
                  id="modal-act-phase"
                  value={formData.phase}
                  onChange={(e) => {
                    if (e.target.value === '__add_new_custom_phase__') {
                      setIsCustomPhase(true);
                      setCustomPhaseText('');
                    } else {
                      setFormData({ ...formData, phase: e.target.value as PhaseName });
                    }
                  }}
                >
                  {phaseOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option 
                    value="__add_new_custom_phase__" 
                    style={{ fontWeight: 700, color: 'var(--blue)' }}
                  >
                    ➕ + Add New Custom Phase...
                  </option>
                </select>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    id="modal-act-custom-phase"
                    type="text"
                    placeholder="Enter custom phase title (e.g. Landscaping, HVAC)..."
                    value={customPhaseText}
                    onChange={(e) => {
                      setCustomPhaseText(e.target.value);
                      setFormData({ ...formData, phase: e.target.value as PhaseName });
                    }}
                    style={{
                      borderColor: 'var(--blue)',
                      background: '#f8faff',
                      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
                      flex: 1,
                    }}
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ height: '38px', padding: '0 10px', fontSize: '11.5px' }}
                    onClick={() => {
                      setIsCustomPhase(false);
                      setCustomPhaseText('');
                      setFormData({ ...formData, phase: (phaseOptions[0] || 'Critical Civil & External') as PhaseName });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="form-group">
              <label htmlFor="modal-act-priority">Priority Level</label>
              <select 
                id="modal-act-priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
              >
                <option value="High">🔴 High Priority (Critical Path)</option>
                <option value="Medium">🟡 Medium Priority (Standard)</option>
                <option value="Low">🔵 Low Priority (Flexible)</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="form-group">
              <label htmlFor="modal-act-start">Start Date *</label>
              <input 
                id="modal-act-start"
                type="date"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                required
              />
            </div>

            {/* Deadline */}
            <div className="form-group">
              <label htmlFor="modal-act-end">Target Deadline *</label>
              <input 
                id="modal-act-end"
                type="date"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                required
              />
            </div>

            {/* Contractor */}
            <div className="form-group">
              <label htmlFor="modal-act-resp">Contractor / Assignee</label>
              <input 
                id="modal-act-resp"
                type="text"
                placeholder="e.g. RS Construction, Aditya Civil"
                value={formData.resp}
                onChange={(e) => setFormData({ ...formData, resp: e.target.value })}
              />
            </div>

            {/* Dependency */}
            <div className="form-group">
              <label htmlFor="modal-act-dep">Dependency Milestone</label>
              <input 
                id="modal-act-dep"
                type="text"
                placeholder="e.g. Brick Masonary"
                value={formData.dep}
                onChange={(e) => setFormData({ ...formData, dep: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="modal-act-status">Execution Status</label>
              <select 
                id="modal-act-status"
                value={formData.status}
                onChange={(e) => {
                  const s = e.target.value as any;
                  let newPct = formData.pct;
                  if (s === 'Completed') newPct = 100;
                  else if (s === 'In Progress' && newPct === 0) newPct = 50;
                  setFormData({ ...formData, status: s, pct: newPct });
                }}
              >
                <option value="Not Started">⚪ Not Started</option>
                <option value="In Progress">🔵 In Progress</option>
                <option value="Completed">🟢 Completed</option>
              </select>
            </div>

            {/* % Done */}
            <div className="form-group">
              <label htmlFor="modal-act-pct">Completion Percentage ({formData.pct}%)</label>
              <input 
                id="modal-act-pct"
                type="number"
                min="0"
                max="100"
                value={formData.pct}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
                  let newStatus = formData.status;
                  if (val === 100) newStatus = 'Completed';
                  else if (val > 0) newStatus = 'In Progress';
                  setFormData({ ...formData, pct: val, status: newStatus });
                }}
              />
            </div>

            {/* Remarks */}
            <div className="form-group col-full">
              <label htmlFor="modal-act-remarks">Site Notes &amp; Specifications</label>
              <textarea 
                id="modal-act-remarks"
                placeholder="Specify materials needed, technical notes, or critical lead times..."
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer">
            {activity && onDelete && (
              <button 
                type="button"
                className="btn btn-danger btn-sm"
                style={{ marginRight: 'auto' }}
                onClick={() => {
                  if (confirm(`Delete "${activity.name}"? This will permanently remove this activity from the schedule.`)) {
                    onDelete(activity.id);
                  }
                }}
              >
                <Trash2 size={13} /> Delete Activity
              </button>
            )}

            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {activity ? 'Update Activity' : 'Save to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
