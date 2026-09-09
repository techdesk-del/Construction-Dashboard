'use client';

import React from 'react';
import { 
  Building2, 
  Plus, 
  Download, 
  Printer, 
  RotateCcw, 
  FileSpreadsheet,
  LogIn,
  LogOut,
  Database,
  Sparkles
} from 'lucide-react';
import { User } from '@/types';

interface HeaderProps {
  lastUpdated: string;
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
        <div className="brand-emblem-wrap">
          <Building2 size={20} />
        </div>
        <div className="topbar-title-group">
          <h1>Chakramsar Farmhouse</h1>
          <p>
            <span>Master Schedule &amp; Capital Project ERP</span>
            <span>•</span>
            <span>Sync: <strong>{lastUpdated}</strong></span>
          </p>
        </div>
      </div>

      <div className="topbar-right">
        {/* Live MongoDB Status Pill */}
        <div className="mongo-status-chip">
          <span className="mongo-status-pulse" />
          <Database size={12} />
          <span>MongoDB Live</span>
        </div>

        {/* User Profile Pill */}
        {user ? (
          <div className="user-profile-badge">
            <span className="user-avatar-circle">{user.avatar || '👤'}</span>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span className="user-name-text">{user.name}</span>
              <span className="user-role-text">{user.role}</span>
            </div>
            <button 
              className="btn btn-outline btn-sm btn-signout" 
              onClick={onLogout}
              title="Sign Out of executive session"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary btn-sm" 
            onClick={onOpenLogin}
          >
            <LogIn size={13} /> Sign In
          </button>
        )}

        <button 
          className="btn btn-outline btn-sm" 
          onClick={onResetData} 
          title="Restore baseline benchmark schedule"
        >
          <RotateCcw size={13} /> Reset
        </button>

        <button 
          className="btn btn-outline btn-sm" 
          onClick={onDownloadCSV} 
          title="Export CSV spreadsheet"
        >
          <FileSpreadsheet size={13} /> CSV
        </button>

        <button 
          className="btn btn-outline btn-sm" 
          onClick={onDownloadJSON} 
          title="Export JSON snapshot"
        >
          <Download size={13} /> Snapshot
        </button>

        <button 
          className="btn btn-outline btn-sm btn-icon" 
          onClick={() => window.print()} 
          title="Print Executive PDF"
        >
          <Printer size={14} />
        </button>

        <button 
          className="btn btn-blue btn-sm" 
          onClick={onOpenAddActivity}
        >
          <Plus size={14} /> Add Activity
        </button>
      </div>
    </header>
  );
};
