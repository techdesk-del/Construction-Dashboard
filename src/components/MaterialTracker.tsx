'use client';

import React, { useState, useMemo } from 'react';
import { MaterialItem, MaterialDeliveryStatus, MaterialWorkStatus, PhaseName } from '@/types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  PackageCheck, 
  LayoutList, 
  LayoutGrid, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { Pagination } from './Pagination';

interface MaterialTrackerProps {
  materials: MaterialItem[];
  onAddMaterial: () => void;
  onEditMaterial: (mat: MaterialItem) => void;
  onDeleteMaterial: (id: number) => void;
  availablePhases?: string[];
}

export const MaterialTracker: React.FC<MaterialTrackerProps> = ({
  materials,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  availablePhases,
}) => {
  const [filterPhase, setFilterPhase] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewStyle, setViewStyle] = useState<'table' | 'cards'>('table');

  // ── PAGINATION STATE ──
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Status Classes
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

  // High-Level Procurement Aggregates
  const totalCount = materials.length;
  const deliveredCount = materials.filter((m) => m.mat === 'Delivered').length;
  const toDeliverCount = materials.filter((m) => m.mat === 'To be Delivered').length;
  const selectionPendingCount = materials.filter((m) => m.mat === 'Selection Pending').length;
  const partialCount = materials.filter((m) => m.mat === 'Partial').length;

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (filterPhase && m.phase !== filterPhase) return false;
      if (filterStatus && m.mat !== filterStatus) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          (m.notes && m.notes.toLowerCase().includes(q)) ||
          m.resp.toLowerCase().includes(q) ||
          (m.phase && m.phase.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [materials, filterPhase, filterStatus, searchTerm]);

  // Paginated slice
  const isAll = pageSize === 0;
  const paginatedMaterials = useMemo(() => {
    if (isAll) return filteredMaterials;
    const start = (currentPage - 1) * pageSize;
    return filteredMaterials.slice(start, start + pageSize);
  }, [filteredMaterials, currentPage, pageSize, isAll]);

  const phases = useMemo(() => {
    const defaultList = [
      'Critical Civil & External',
      'Swimming Pool',
      'Services',
      'Finishes',
      'Openings',
      'Interior',
    ];
    const set = new Set<string>(defaultList);
    if (availablePhases) {
      availablePhases.forEach((p) => {
        if (p && p.trim()) set.add(p.trim());
      });
    }
    materials.forEach((m) => {
      if (m.phase && m.phase.trim()) set.add(m.phase.trim());
    });
    return Array.from(set);
  }, [availablePhases, materials]);

  return (
    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ── TOP EXECUTIVE PROCUREMENT SUMMARY BAR ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
      }}>
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL MATERIALS</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{totalCount} Items</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--emerald-light)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--emerald)', fontWeight: 700 }}>DELIVERED ON SITE</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--emerald)' }}>{deliveredCount} Items</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: 700 }}>IN TRANSIT / TO DELIVER</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--blue)' }}>{toDeliverCount} Items</div>
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--red-light)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 700 }}>SELECTION PENDING</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--red)' }}>{selectionPendingCount} Items</div>
          </div>
        </div>
      </div>

      {/* ── CONTROLS TOOLBAR ── */}
      <div className="section-head" style={{ flexWrap: 'wrap', gap: '12px', background: 'var(--surface-card)', padding: '12px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <PackageCheck size={18} color="var(--blue)" /> Procurement Matrix
          </h2>
          <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
            ({filteredMaterials.length} matching)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto' }}>
          {/* Phase Filter */}
          <select 
            className="select-input"
            value={filterPhase}
            onChange={(e) => {
              setFilterPhase(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: '12px', height: '34px' }}
          >
            <option value="">All Project Phases</option>
            {phases.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Delivery Status Filter */}
          <select 
            className="select-input"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{ fontSize: '12px', height: '34px' }}
          >
            <option value="">All Delivery Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="To be Delivered">To be Delivered</option>
            <option value="Selection Pending">Selection Pending</option>
            <option value="Partial">Partial</option>
          </select>

          {/* Search */}
          <input 
            type="text"
            className="text-input"
            placeholder="Search material, brand, supplier..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '220px', height: '34px', fontSize: '12px' }}
          >
          </input>

          {/* Table / Card View Toggle */}
          <div style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <button
              type="button"
              className={`preset-jump-btn ${viewStyle === 'table' ? 'active' : ''}`}
              onClick={() => setViewStyle('table')}
              title="Table Matrix View"
              style={{ borderRadius: 0, border: 'none', height: '32px' }}
            >
              <LayoutList size={13} /> Table
            </button>
            <button
              type="button"
              className={`preset-jump-btn ${viewStyle === 'cards' ? 'active' : ''}`}
              onClick={() => setViewStyle('cards')}
              title="Card Grid View"
              style={{ borderRadius: 0, border: 'none', borderLeft: '1px solid var(--border)', height: '32px' }}
            >
              <LayoutGrid size={13} /> Cards
            </button>
          </div>

          <button className="btn btn-primary btn-sm" onClick={onAddMaterial} style={{ height: '34px' }}>
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      {/* ── 1. MATRIX TABULAR VIEW (EXECUTIVE SAAS TIER) ── */}
      {viewStyle === 'table' ? (
        <div style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="gantt-table" style={{ minWidth: '1100px', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                  <th style={{ minWidth: '280px' }}>Material Specification &amp; Brand</th>
                  <th style={{ width: '190px' }}>Project Phase</th>
                  <th style={{ width: '170px' }}>Supplier / Contractor</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Delivery Status</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Site Execution</th>
                  <th style={{ width: '120px' }}>Target Due Date</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-sub)' }}>
                      No procurement items match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedMaterials.map((m) => (
                    <tr key={m.id} className="task-row">
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: '11px' }}>
                        {m.id}
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-primary)' }}>
                          {m.name}
                        </div>
                        {m.notes && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                            {m.notes}
                          </div>
                        )}
                      </td>

                      <td>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          background: 'var(--surface-alt)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-xs)',
                          color: 'var(--text-secondary)'
                        }}>
                          {m.phase || 'General Civil'}
                        </span>
                      </td>

                      <td style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                        {m.resp || '—'}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`mat-val ${getMatClass(m.mat)}`} style={{ display: 'inline-block', minWidth: '100px' }}>
                          {m.mat}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`mat-val ${getWorkClass(m.work)}`} style={{ display: 'inline-block', minWidth: '90px' }}>
                          {m.work}
                        </span>
                      </td>

                      <td style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {m.deadline}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button 
                            className="btn btn-outline btn-sm btn-icon"
                            onClick={() => onEditMaterial(m)}
                            title="Edit Material"
                            style={{ padding: '4px 6px' }}
                          >
                            <Edit2 size={11} />
                          </button>
                          <button 
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => onDeleteMaterial(m.id)}
                            title="Delete Material"
                            style={{ padding: '4px 6px' }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredMaterials.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 15, 25, 0]}
            itemLabel="procurement items"
          />
        </div>
      ) : (
        /* ── 2. CARDS GRID VIEW ── */
        <div>
          <div className="mat-grid">
            {paginatedMaterials.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                padding: '36px 16px',
                textAlign: 'center',
                color: 'var(--text-sub)',
                background: 'var(--surface-card)',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius-lg)'
              }}>
                No procurement materials match the current filters.
              </div>
            ) : (
              paginatedMaterials.map((m) => (
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

                  {m.notes && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontStyle: 'italic' }}>
                      {m.notes}
                    </div>
                  )}

                  <div className="mat-row">
                    <span>Material Status</span>
                    <span className={`mat-val ${getMatClass(m.mat)}`}>{m.mat}</span>
                  </div>

                  <div className="mat-row">
                    <span>Work Execution</span>
                    <span className={`mat-val ${getWorkClass(m.work)}`}>{m.work}</span>
                  </div>

                  <div className="mat-row">
                    <span>Supplier / Resp</span>
                    <span className="mat-val">{m.resp || '—'}</span>
                  </div>

                  <div className="mat-row">
                    <span>Target Due Date</span>
                    <span className="mat-val">{m.deadline}</span>
                  </div>

                  {m.phase && (
                    <div className="mat-row" style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
                      <span>Phase</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{m.phase}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '16px' }}>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredMaterials.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[12, 24, 48, 0]}
              itemLabel="procurement items"
            />
          </div>
        </div>
      )}
    </div>
  );
};
