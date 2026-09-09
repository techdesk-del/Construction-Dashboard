'use client';

import React from 'react';
import { 
  LayoutGrid, 
  Trello, 
  Package, 
  BarChart3, 
  Layers, 
  Users, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { User } from '@/types';

export type ViewMode = 'gantt' | 'kanban' | 'materials' | 'analytics';

interface SidebarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  user: User | null;
  onLogout: () => void;
  onOpenSettings?: () => void;
  onResetData?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  viewMode,
  onViewModeChange,
  user,
  onLogout,
  onOpenSettings,
  onResetData,
}) => {
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'gantt', label: 'Dashboard', icon: <LayoutGrid size={18} /> },
    { id: 'kanban', label: 'Execution Board', icon: <Trello size={18} /> },
    { id: 'materials', label: 'Procurement Matrix', icon: <Package size={18} /> },
    { id: 'analytics', label: 'Analytics & Load', icon: <BarChart3 size={18} /> },
  ];

  return (
    <aside className="crm-sidebar">
      {/* ── 1. BRAND HEADER ── */}
      <div className="crm-brand-header">
        <img 
          src="/favicon.jpg" 
          alt="UrbanGaon" 
          className="crm-brand-logo"
        />
        <div className="crm-brand-text">
          <div className="crm-brand-title">UrbanGaon</div>
          <div className="crm-brand-role">{user ? `${user.role}` : 'Admin / CEO'}</div>
        </div>
      </div>

      {/* ── 2. MAIN NAVIGATION MENU ── */}
      <div className="crm-nav-section">
        <div className="crm-nav-list">
          {navItems.map((item) => {
            const isActive = viewMode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`crm-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onViewModeChange(item.id)}
              >
                <span className="crm-nav-icon">{item.icon}</span>
                <span className="crm-nav-label">{item.label}</span>
                {item.badge && (
                  <span className="crm-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. SECONDARY PROJECT WORKSPACES ── */}
      <div className="crm-nav-section" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="crm-nav-heading">PROJECT WORKSPACES</div>
        <div className="crm-project-chip">
          <Building2 size={15} color="var(--blue)" />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>Chakramsar Farmhouse</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Capital Project ERP</div>
          </div>
        </div>

        {onResetData && (
          <button
            type="button"
            className="crm-nav-item"
            style={{ marginTop: '8px' }}
            onClick={onResetData}
            title="Reset to benchmark baseline"
          >
            <span className="crm-nav-icon"><Settings size={17} /></span>
            <span className="crm-nav-label">Settings &amp; Baseline</span>
          </button>
        )}
      </div>

      {/* ── 4. USER PROFILE & SIGN OUT PINNED AT BOTTOM ── */}
      <div className="crm-sidebar-footer">
        <div className="crm-user-info">
          <span className="crm-user-avatar">{user?.avatar || '👤'}</span>
          <div className="crm-user-meta">
            <div className="crm-user-name">{user?.name || 'Executive CEO'}</div>
            <div className="crm-user-email">{user?.email || 'ceo@chakramsar.com'}</div>
          </div>
        </div>

        <button 
          type="button" 
          className="crm-signout-btn" 
          onClick={onLogout}
          title="Sign out of enterprise session"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};
