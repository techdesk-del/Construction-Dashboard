'use client';

import React, { useState, useEffect } from 'react';
import { MaterialItem, MaterialDeliveryStatus, MaterialWorkStatus, PhaseName } from '@/types';
import { X, Trash2 } from 'lucide-react';

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
        <div className="modal-header">
          <h2>{material ? 'Edit Material Item' : 'Add Procurement Material'}</h2>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group col-full">
              <label>Material / Component Name *</label>
              <input 
                type="text"
                placeholder="e.g. Waterproofing Chemicals"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Material Delivery Status *</label>
              <select 
                value={formData.mat}
                onChange={(e) => setFormData({ ...formData, mat: e.target.value as MaterialDeliveryStatus })}
              >
                <option value="Delivered">Delivered</option>
                <option value="To be Delivered">To be Delivered</option>
                <option value="Selection Pending">Selection Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

            <div className="form-group">
              <label>Work Status</label>
              <select 
                value={formData.work}
                onChange={(e) => setFormData({ ...formData, work: e.target.value as MaterialWorkStatus })}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Complete">Complete</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>

            <div className="form-group">
              <label>Procurement Deadline *</label>
              <input 
                type="text"
                placeholder="e.g. 15 Sep 2026"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Responsible Vendor / Supplier</label>
              <input 
                type="text"
                placeholder="e.g. RS Construction"
                value={formData.resp}
                onChange={(e) => setFormData({ ...formData, resp: e.target.value })}
              />
            </div>

            <div className="form-group col-full">
              <label>Associated Phase</label>
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
          </div>

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
              Save Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
