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
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { User } from '@/types';

interface HeaderProps {
  lastUpdated: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenAddActivity: () => void;
  onDownloadJSON: () => void;
  onDownloadCSV: () => void;
  onResetData: () => void;
  user: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  theme,
  onToggleTheme,
  onOpenAddActivity,
  onDownloadJSON,
  onDownloadCSV,
  onResetData,
  user,
  onOpenLogin,
  onLogout,
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
        {/* User Profile Pill */}
        {user ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '3px 10px',
            background: 'var(--surface-alt)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            marginRight: '2px',
          }}>
            <span style={{ fontSize: '15px' }}>{user.avatar || '👤'}</span>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '9.5px', color: 'var(--blue)', fontWeight: 700 }}>
                {user.role}
              </span>
            </div>
            <button 
              className="btn btn-outline btn-sm" 
              style={{ padding: '3px 7px', fontSize: '10px', marginLeft: '6px' }}
              onClick={onLogout}
              title="Sign Out"
            >
              <LogOut size={11} /> Exit
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-outline" 
            onClick={onOpenLogin}
            style={{ borderColor: 'var(--blue)', color: 'var(--blue)' }}
          >
            <LogIn size={14} /> Sign In
          </button>
        )}

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
