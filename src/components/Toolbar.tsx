'use client';

import React from 'react';
import { 
  BarChart3, 
  Kanban, 
  PackageSearch, 
  PieChart, 
  Search, 
  Filter 
} from 'lucide-react';
import { PhaseName } from '@/types';

export type ViewMode = 'gantt' | 'kanban' | 'materials' | 'analytics';

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedPhase: string;
  onPhaseChange: (phase: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  viewMode,
  onViewModeChange,
  selectedPhase,
  onPhaseChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="toolbar-container">
      <div className="toolbar-left">
        {/* View Switcher */}
        <div className="view-tabs">
          <button 
            className={`view-tab-btn ${viewMode === 'gantt' ? 'active' : ''}`}
            onClick={() => onViewModeChange('gantt')}
          >
            <BarChart3 size={14} /> Gantt Schedule
          </button>
          <button 
            className={`view-tab-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => onViewModeChange('kanban')}
          >
            <Kanban size={14} /> Execution Board
          </button>
          <button 
            className={`view-tab-btn ${viewMode === 'materials' ? 'active' : ''}`}
            onClick={() => onViewModeChange('materials')}
          >
            <PackageSearch size={14} /> Procurement Matrix
          </button>
          <button 
            className={`view-tab-btn ${viewMode === 'analytics' ? 'active' : ''}`}
            onClick={() => onViewModeChange('analytics')}
          >
            <PieChart size={14} /> Analytics &amp; Load
          </button>
        </div>

        {/* Phase Filter */}
        <select 
          className="select-input"
          value={selectedPhase} 
          onChange={(e) => onPhaseChange(e.target.value)}
        >
          <option value="">All Phases</option>
          <option value="Critical Civil & External">Civil &amp; External</option>
          <option value="Swimming Pool">Swimming Pool</option>
          <option value="Services">Services</option>
          <option value="Finishes">Finishes</option>
          <option value="Openings">Openings</option>
          <option value="Interior">Interior</option>
        </select>

        {/* Status Filter */}
        <select 
          className="select-input"
          value={selectedStatus} 
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Due Soon">Due ≤ 7 Days</option>
          <option value="Overdue">Overdue</option>
          <option value="Not Started">Not Started</option>
        </select>

        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            className="text-input" 
            placeholder="Search activity, vendor, dep..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: '240px', paddingLeft: '28px' }}
          />
          <Search size={13} style={{ position: 'absolute', left: '9px', color: 'var(--text-sub)' }} />
        </div>
      </div>

      {/* Legend */}
      <div className="legend-row">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--green)' }}></span> Completed
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--blue)' }}></span> In Progress
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--amber)' }}></span> Due ≤ 7d
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--red)' }}></span> Overdue
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#94a3b8' }}></span> Not Started
        </div>
        <div className="legend-item" style={{ marginLeft: '4px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '2px', background: 'var(--red)', borderRadius: '1px' }}></span>
          Today
        </div>
      </div>
    </div>
  );
};
