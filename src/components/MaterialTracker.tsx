'use client';

import React, { useState } from 'react';
import { MaterialItem, MaterialDeliveryStatus, MaterialWorkStatus } from '@/types';
import { Plus, Edit2, Trash2, PackageCheck, Filter, AlertCircle } from 'lucide-react';

interface MaterialTrackerProps {
  materials: MaterialItem[];
  onAddMaterial: () => void;
  onEditMaterial: (mat: MaterialItem) => void;
  onDeleteMaterial: (id: number) => void;
}

export const MaterialTracker: React.FC<MaterialTrackerProps> = ({
  materials,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getMatClass = (mat: MaterialDeliveryStatus) => {
    switch (mat) {
      case 'Delivered':
        return 'ms-del';
      case 'To be Delivered':
      case 'Selection Pending':
        return 'ms-pend';
      case 'Partial':
        return 'ms-tbd';
      default:
        return '';
    }
  };

  const getWorkClass = (work: MaterialWorkStatus) => {
    switch (work) {
      case 'Complete':
        return 'ms-del';
      case 'In Progress':
        return 'ms-tbd';
      case 'Pending':
      case 'Not Started':
        return 'ms-pend';
      default:
        return '';
    }
  };

  const filteredMaterials = materials.filter((m) => {
    if (filterStatus && m.mat !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.resp.toLowerCase().includes(q) ||
        (m.phase && m.phase.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div style={{ marginTop: '20px' }}>
      <div className="section-head">
        <h2>
          <PackageCheck size={18} /> Material &amp; Procurement Tracker
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-sub)' }}>
            ({filteredMaterials.length} items)
          </span>
        </h2>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            className="select-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Delivery Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="To be Delivered">To be Delivered</option>
            <option value="Selection Pending">Selection Pending</option>
            <option value="Partial">Partial</option>
          </select>

          <input 
            type="text"
            className="text-input"
            placeholder="Search materials or vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '200px' }}
          />

          <button className="btn btn-outline btn-sm" onClick={onAddMaterial}>
            <Plus size={13} /> Add Material
          </button>
        </div>
      </div>

      <div className="mat-grid">
        {filteredMaterials.map((m) => (
          <div key={m.id} className="mat-card">
            <div className="mat-name">
              <span>{m.name}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className="btn btn-outline btn-sm" 
                  style={{ padding: '2px 5px', fontSize: '10px' }}
                  onClick={() => onEditMaterial(m)}
                  title="Edit Material"
                >
                  <Edit2 size={10} />
                </button>
                <button 
                  className="btn btn-danger btn-sm" 
                  style={{ padding: '2px 5px', fontSize: '10px' }}
                  onClick={() => onDeleteMaterial(m.id)}
                  title="Delete Material"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>

            <div className="mat-row">
              <span>Material Status</span>
              <span className={`mat-val ${getMatClass(m.mat)}`}>{m.mat}</span>
            </div>

            <div className="mat-row">
              <span>Work Execution</span>
              <span className={`mat-val ${getWorkClass(m.work)}`}>{m.work}</span>
            </div>

            <div className="mat-row">
              <span>Responsible</span>
              <span className="mat-val">{m.resp || '—'}</span>
            </div>

            <div className="mat-row">
              <span>Procurement Deadline</span>
              <span className="mat-val">{m.deadline}</span>
            </div>

            {m.phase && (
              <div className="mat-row" style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
                <span>Phase</span>
                <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{m.phase}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
