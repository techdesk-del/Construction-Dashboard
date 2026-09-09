'use client';

import React, { useState, useEffect } from 'react';
import { Activity, PhaseName, PriorityLevel } from '@/types';
import { X, Trash2 } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  activity: Activity | null;
  onClose: () => void;
  onSave: (data: Partial<Activity>) => void;
  onDelete?: (id: number) => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  activity,
  onClose,
  onSave,
  onDelete,
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

  useEffect(() => {
    if (activity) {
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
      setFormData({
        name: '',
        phase: 'Critical Civil & External',
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
  }, [activity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.start || !formData.end) {
      alert('Activity name, start date, and deadline are required.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{activity ? 'Edit Activity' : 'Add New Activity'}</h2>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group col-full">
              <label>Activity Name *</label>
              <input 
                type="text"
                placeholder="e.g. Waterproofing"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Phase *</label>
              <select 
                value={formData.phase}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value as PhaseName })}
              >
                <option value="Critical Civil & External">Critical Civil &amp; External</option>
                <option value="Swimming Pool">Swimming Pool</option>
                <option value="Services">Services</option>
                <option value="Finishes">Finishes</option>
                <option value="Openings">Openings</option>
                <option value="Interior">Interior</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-group">
              <label>Start Date *</label>
              <input 
                type="date"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Deadline *</label>
              <input 
                type="date"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Responsible Contractor / Team</label>
              <input 
                type="text"
                placeholder="e.g. RS Construction"
                value={formData.resp}
                onChange={(e) => setFormData({ ...formData, resp: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Dependency (Activity Name)</label>
              <input 
                type="text"
                placeholder="e.g. Brick Masonary"
                value={formData.dep}
                onChange={(e) => setFormData({ ...formData, dep: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Current Status</label>
              <select 
                value={formData.status}
                onChange={(e) => {
                  const s = e.target.value as any;
                  let newPct = formData.pct;
                  if (s === 'Completed') newPct = 100;
                  else if (s === 'In Progress' && newPct === 0) newPct = 50;
                  setFormData({ ...formData, status: s, pct: newPct });
                }}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>% Complete (0–100)</label>
              <input 
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

            <div className="form-group col-full">
              <label>Remarks &amp; Site Notes</label>
              <textarea 
                placeholder="Any site obstacles, lead times, or specifications..."
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            {activity && onDelete && (
              <button 
                type="button"
                className="btn btn-danger btn-sm"
                style={{ marginRight: 'auto' }}
                onClick={() => {
                  if (confirm(`Delete "${activity.name}"? This action cannot be undone.`)) {
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
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
