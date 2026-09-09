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
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  material,
  onClose,
  onSave,
  onDelete,
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

  useEffect(() => {
    if (material) {
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
      setFormData({
        name: '',
        mat: 'To be Delivered',
        work: 'Pending',
        resp: '',
        deadline: '15 Sep 2026',
        phase: 'Critical Civil & External',
        notes: '',
      });
    }
  }, [material, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.deadline.trim()) {
      alert('Material name and procurement deadline are required.');
      return;
    }
    onSave(formData);
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
            <div className="form-group col-full">
              <label htmlFor="modal-mat-phase">Associated Construction Phase</label>
              <select 
                id="modal-mat-phase"
                value={formData.phase}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value as PhaseName })}
              >
                <option value="Critical Civil & External">Critical Civil &amp; External</option>
                <option value="Swimming Pool">Swimming Pool</option>
                <option value="Services">Services (Plumbing &amp; Electrical)</option>
                <option value="Finishes">Finishes (Ceiling, Tiling, Paint)</option>
                <option value="Openings">Openings (Doors, Windows, Stairs)</option>
                <option value="Interior">Interior (Furniture, ELV)</option>
              </select>
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
