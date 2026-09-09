'use client';

import React from 'react';
import { 
  Building2, 
  Plus, 
  Download, 
  Printer, 
  RotateCcw, 
  Sun, 
  Moon, 
  FileSpreadsheet,
  Layers
} from 'lucide-react';

interface HeaderProps {
  lastUpdated: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenAddActivity: () => void;
  onDownloadJSON: () => void;
  onDownloadCSV: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  theme,
  onToggleTheme,
  onOpenAddActivity,
  onDownloadJSON,
  onDownloadCSV,
  onResetData,
}) => {
  return (
    <header className="executive-topbar">
      <div className="topbar-left">
        <div className="brand-badge">
          <Building2 size={12} /> Executive Construction Suite
        </div>
        <h1>Chakramsar Farmhouse — Master Schedule</h1>
        <p>
          <span>Interactive Gantt &amp; Procurement Engine</span>
          <span>•</span>
          <span>Last synchronized: <strong>{lastUpdated}</strong></span>
        </p>
      </div>

      <div className="topbar-right">
        <button 
          className="btn btn-outline btn-icon" 
          onClick={onToggleTheme} 
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        <button 
          className="btn btn-outline" 
          onClick={onResetData} 
          title="Reset to original blueprint benchmark dataset"
        >
          <RotateCcw size={14} /> Reset
        </button>

        <button 
          className="btn btn-outline" 
          onClick={onDownloadCSV} 
          title="Export CSV spreadsheet"
        >
          <FileSpreadsheet size={14} /> CSV
        </button>

        <button 
          className="btn btn-outline" 
          onClick={onDownloadJSON} 
          title="Download snapshot JSON"
        >
          <Download size={14} /> Snapshot
        </button>

        <button 
          className="btn btn-outline btn-icon" 
          onClick={() => window.print()} 
          title="Print / Executive PDF"
        >
          <Printer size={15} />
        </button>

        <button 
          className="btn btn-primary" 
          onClick={onOpenAddActivity}
        >
          <Plus size={15} /> Add Activity
        </button>
      </div>
    </header>
  );
};
