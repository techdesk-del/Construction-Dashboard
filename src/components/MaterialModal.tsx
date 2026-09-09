'use client';

import React, { useState, useEffect } from 'react';
import { MaterialItem, MaterialDeliveryStatus, MaterialWorkStatus, PhaseName } from '@/types';
import { 
  X, 
  Trash2, 
  PackageCheck, 
  Calendar, 
  User, 
  Layers,
  Plus
} from 'lucide-react';

interface MaterialModalProps {
  isOpen: boolean;
  material: MaterialItem | null;
  onClose: () => void;
  onSave: (data: Partial<MaterialItem>) => void;
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

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  material,
  onClose,
  onSave,
  onDelete,
  availablePhases = DEFAULT_PHASES,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    mat: 'To be Delivered' as MaterialDeliveryStatus,
    work: 'Pending' as MaterialWorkStatus,
    resp: '',
    deadline: '',
    phase: 'Critical Civil & External' as PhaseName,
    notes: '',
  });

  const [isCustomPhase, setIsCustomPhase] = useState<boolean>(false);
  const [customPhaseText, setCustomPhaseText] = useState<string>('');

  const phaseOptions = React.useMemo(() => {
    const set = new Set<string>(DEFAULT_PHASES);
    if (availablePhases) {
      availablePhases.forEach((p) => {
        if (p && p.trim()) set.add(p.trim());
      });
    }
    if (material?.phase) {
      set.add(material.phase.trim());
    }
    return Array.from(set);
  }, [availablePhases, material]);

  useEffect(() => {
    if (material) {
      setIsCustomPhase(false);
      setCustomPhaseText('');
      setFormData({
        name: material.name,
        mat: material.mat,
        work: material.work,
        resp: material.resp || '',
        deadline: material.deadline,
        phase: (material.phase || 'Critical Civil & External') as PhaseName,
        notes: material.notes || '',
      });
    } else {
      const initialPhase = (availablePhases && availablePhases.length > 0 ? availablePhases[0] : 'Critical Civil & External') as PhaseName;
      setIsCustomPhase(false);
      setCustomPhaseText('');
      setFormData({
        name: '',
        mat: 'To be Delivered',
        work: 'Pending',
        resp: '',
        deadline: '15 Sep 2026',
        phase: initialPhase,
        notes: '',
      });
    }
  }, [material, isOpen, availablePhases]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPhase = isCustomPhase ? customPhaseText.trim() : formData.phase?.trim();
    if (!formData.name.trim() || !formData.deadline.trim()) {
      alert('Material name and procurement deadline are required.');
      return;
    }
    onSave({
      ...formData,
      phase: (finalPhase || 'Critical Civil & External') as PhaseName,
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
              background: 'var(--emerald-light)',
              color: 'var(--emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--emerald-border)',
            }}>
              {material ? <PackageCheck size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <h2>{material ? 'Edit Procurement Material' : 'Add Procurement Material'}</h2>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {material ? `Item ID: #${material.id}` : 'Track delivery milestones and suppliers'}
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
            {/* Name */}
            <div className="form-group col-full">
              <label htmlFor="modal-mat-name">Material / Component Name *</label>
              <input 
                id="modal-mat-name"
                type="text"
                placeholder="e.g. Waterproofing Chemicals, Kota Stone"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            {/* Delivery Status */}
            <div className="form-group">
              <label htmlFor="modal-mat-status">Delivery Status *</label>
              <select 
                id="modal-mat-status"
                value={formData.mat}
                onChange={(e) => setFormData({ ...formData, mat: e.target.value as MaterialDeliveryStatus })}
              >
                <option value="Delivered">🟢 Delivered to Site</option>
                <option value="To be Delivered">🟣 To be Delivered</option>
                <option value="Selection Pending">🟡 Selection Pending</option>
                <option value="Partial">🔵 Partial Delivery</option>
              </select>
            </div>

            {/* Work Execution */}
            <div className="form-group">
              <label htmlFor="modal-work-status">Work Execution Status</label>
              <select 
                id="modal-work-status"
                value={formData.work}
                onChange={(e) => setFormData({ ...formData, work: e.target.value as MaterialWorkStatus })}
              >
                <option value="Not Started">⚪ Not Started</option>
                <option value="Pending">🟡 Pending</option>
                <option value="In Progress">🔵 In Progress</option>
                <option value="Complete">🟢 Complete</option>
              </select>
            </div>

            {/* Deadline */}
            <div className="form-group">
              <label htmlFor="modal-mat-deadline">Procurement Deadline *</label>
              <input 
                id="modal-mat-deadline"
                type="text"
                placeholder="e.g. 15 Sep 2026"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>

            {/* Vendor */}
            <div className="form-group">
              <label htmlFor="modal-mat-resp">Responsible Supplier / Vendor</label>
              <input 
                id="modal-mat-resp"
                type="text"
                placeholder="e.g. RS Construction, Kitchen Vendor"
                value={formData.resp}
                onChange={(e) => setFormData({ ...formData, resp: e.target.value })}
              />
            </div>

            {/* Phase */}
            {/* Phase */}
            <div className="form-group col-full">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label htmlFor="modal-mat-phase" style={{ margin: 0, fontWeight: 600 }}>
                  Associated Construction Phase
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
                  id="modal-mat-phase"
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
                    id="modal-mat-custom-phase"
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
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            {material && onDelete && (
              <button 
                type="button"
                className="btn btn-danger btn-sm"
                style={{ marginRight: 'auto' }}
                onClick={() => {
                  if (confirm(`Delete "${material.name}"?`)) {
                    onDelete(material.id);
                  }
                }}
              >
                <Trash2 size={13} /> Delete Material
              </button>
            )}

            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {material ? 'Update Material' : 'Save Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
