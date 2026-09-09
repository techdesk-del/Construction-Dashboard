'use client';

import React from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Sparkles, 
  Bell, 
  Building2, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { User } from '@/types';

interface TopNavHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddActivity: () => void;
  onOpenAddMaterial: () => void;
  onDownloadCSV: () => void;
  onDownloadJSON: () => void;
  onResetData: () => void;
  user: User | null;
}

export const TopNavHeader: React.FC<TopNavHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddActivity,
  onOpenAddMaterial,
  onDownloadCSV,
  onDownloadJSON,
  onResetData,
  user,
}) => {
  return (
    <header className="crm-topbar">
      {/* Left: Project Selector Chip & Search Bar */}
      <div className="crm-topbar-left">
        <div className="crm-project-indicator-chip" title="Active Project">
          <Building2 size={15} color="var(--blue)" />
          <span>Chakramsar Farmhouse</span>
        </div>

        <div className="crm-search-box">
          <Search size={15} className="crm-search-icon" />
          <input
            type="text"
            placeholder="Search activities, materials, contractors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="crm-search-input"
          />
          <span className="crm-kbd-badge">⌘K</span>
        </div>
      </div>

      {/* Right: Actions, Role & Quick Tools */}
      <div className="crm-topbar-right">
        {/* Quick Export Tools */}
        <div className="crm-export-actions">
          <button 
            type="button" 
            className="crm-icon-btn" 
            onClick={onDownloadCSV}
            title="Export CSV Spreadsheet"
          >
            <FileSpreadsheet size={15} />
          </button>

          <button 
            type="button" 
            className="crm-icon-btn" 
            onClick={onDownloadJSON}
            title="Export Snapshot JSON"
          >
            <Download size={15} />
          </button>

          <button 
            type="button" 
            className="crm-icon-btn" 
            onClick={() => window.print()}
            title="Print Executive Schedule"
          >
            <Printer size={15} />
          </button>
        </div>

        {/* Action Buttons: Add Material & Add Activity */}
        <button
          type="button"
          className="btn btn-emerald btn-sm crm-action-btn"
          onClick={onOpenAddMaterial}
        >
          <Plus size={14} /> Add Material
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm crm-action-btn"
          onClick={onOpenAddActivity}
        >
          <Plus size={14} /> Add Activity
        </button>

        {/* Role Badge */}
        <div className="crm-role-badge">
          <span className="crm-role-dot" />
          <span>Role: <strong>{user ? user.role : 'Admin / CEO'}</strong></span>
          <Sparkles size={12} color="var(--blue)" />
        </div>
      </div>
    </header>
  );
};
