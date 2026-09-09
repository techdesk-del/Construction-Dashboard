'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Activity, MaterialItem, ActivityStatus } from '@/types';
import { INITIAL_ACTIVITIES, INITIAL_MATERIALS } from '@/lib/initialData';
import { computeKpis, computeStatus, exportActivitiesToCSV, exportActivitiesToJSON } from '@/lib/utils';
import { Header } from '@/components/Header';
import { KpiGrid } from '@/components/KpiGrid';
import { Toolbar, ViewMode } from '@/components/Toolbar';
import { GanttChart } from '@/components/GanttChart';
import { KanbanView } from '@/components/KanbanView';
import { MaterialTracker } from '@/components/MaterialTracker';
import { AnalyticsView } from '@/components/AnalyticsView';
import { ActivityModal } from '@/components/ActivityModal';
import { MaterialModal } from '@/components/MaterialModal';
import { LoginModal } from '@/components/LoginModal';
import { AuthScreen } from '@/components/AuthScreen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CheckCircle2 } from 'lucide-react';

function DashboardContent() {
  const { user, loading: authLoading, logout, continueAsGuest, isCeoOrAdmin } = useAuth();
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [loading, setLoading] = useState<boolean>(true);
  // Ensure clean Light Mode on mount
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('site_theme');
  }, []);

  // View & Filters
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
  const [selectedPhase, setSelectedPhase] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [activityModalOpen, setActivityModalOpen] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [materialModalOpen, setMaterialModalOpen] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);

  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Fetch from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [actRes, matRes] = await Promise.all([
          fetch('/api/activities').then((r) => r.json()),
          fetch('/api/materials').then((r) => r.json()),
        ]);

        if (actRes.success && Array.isArray(actRes.data) && actRes.data.length > 0) {
          setActivities(actRes.data);
        }
        if (matRes.success && Array.isArray(matRes.data) && matRes.data.length > 0) {
          setMaterials(matRes.data);
        }
      } catch (err) {
        console.warn('Using local blueprint dataset:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (selectedPhase && a.phase !== selectedPhase) return false;
      const status = computeStatus(a);
      if (selectedStatus) {
        if (selectedStatus === 'Overdue' && status !== 'Overdue') return false;
        if (selectedStatus === 'Due Soon' && status !== 'Due Soon') return false;
        if (selectedStatus !== 'Overdue' && selectedStatus !== 'Due Soon' && a.status !== selectedStatus) {
          return false;
        }
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesResp = a.resp?.toLowerCase().includes(q);
        const matchesDep = a.dep?.toLowerCase().includes(q);
        if (!matchesName && !matchesResp && !matchesDep) return false;
      }
      return true;
    });
  }, [activities, selectedPhase, selectedStatus, searchQuery]);

  // KPIs
  const kpis = useMemo(() => computeKpis(activities), [activities]);

  // Activity Handlers
  const handleUpdateActivity = async (id: number, updates: Partial<Activity>) => {
    // Optimistic local update
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    showToast('Activity updated');

    try {
      await fetch('/api/activities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (err) {
      console.error('Failed to sync activity update:', err);
    }
  };

  const handleSaveActivityModal = async (formData: Partial<Activity>) => {
    if (editingActivity) {
      // Edit
      await handleUpdateActivity(editingActivity.id, formData);
    } else {
      // Create new
      const tempId = activities.length ? Math.max(...activities.map((a) => a.id)) + 1 : 1;
      const newAct: Activity = {
        id: tempId,
        phase: formData.phase || 'Critical Civil & External',
        name: formData.name || 'Untitled Task',
        start: formData.start || new Date().toISOString().slice(0, 10),
        end: formData.end || new Date().toISOString().slice(0, 10),
        priority: formData.priority || 'Medium',
        resp: formData.resp || '',
        dep: formData.dep || '',
        status: formData.status || 'Not Started',
        pct: formData.pct || 0,
        remarks: formData.remarks || '',
      };

      setActivities((prev) => [...prev, newAct]);
      showToast('Activity added successfully');

      try {
        const res = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }).then((r) => r.json());

        if (res.success && res.data) {
          setActivities((prev) =>
            prev.map((a) => (a.id === tempId ? { ...a, id: res.data.id } : a))
          );
        }
      } catch (err) {
        console.error('Failed to sync new activity:', err);
      }
    }
    setActivityModalOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = async (id: number) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    showToast('Activity deleted');
    setActivityModalOpen(false);
    setEditingActivity(null);

    try {
      await fetch(`/api/activities?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete activity:', err);
    }
  };

  // Material Handlers
  const handleSaveMaterial = async (formData: Partial<MaterialItem>) => {
    if (editingMaterial) {
      setMaterials((prev) =>
        prev.map((m) => (m.id === editingMaterial.id ? { ...m, ...formData } : m))
      );
      showToast('Material updated');

      try {
        await fetch('/api/materials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingMaterial.id, ...formData }),
        });
      } catch (err) {
        console.error('Failed to sync material update:', err);
      }
    } else {
      const tempId = materials.length ? Math.max(...materials.map((m) => m.id)) + 1 : 1;
      const newMat: MaterialItem = {
        id: tempId,
        name: formData.name || 'New Material',
        mat: formData.mat || 'To be Delivered',
        work: formData.work || 'Pending',
        resp: formData.resp || '',
        deadline: formData.deadline || '15 Sep 2026',
        phase: formData.phase || 'Critical Civil & External',
        notes: formData.notes || '',
      };

      setMaterials((prev) => [...prev, newMat]);
      showToast('Material item added');

      try {
        const res = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }).then((r) => r.json());

        if (res.success && res.data) {
          setMaterials((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: res.data.id } : m))
          );
        }
      } catch (err) {
        console.error('Failed to sync new material:', err);
      }
    }
    setMaterialModalOpen(false);
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm('Are you sure you want to remove this procurement material item?')) return;
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast('Material item deleted');

    try {
      await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete material:', err);
    }
  };

  // Reset to Baseline
  const handleReset = async () => {
    if (!confirm('Reset entire dashboard to the original blueprint benchmark schedule? Any custom edits will be reverted.')) {
      return;
    }

    try {
      const res = await fetch('/api/reset', { method: 'POST' }).then((r) => r.json());
      if (res.success) {
        setActivities(res.data.activities);
        setMaterials(res.data.materials);
      } else {
        setActivities(JSON.parse(JSON.stringify(INITIAL_ACTIVITIES)));
        setMaterials(JSON.parse(JSON.stringify(INITIAL_MATERIALS)));
      }
    } catch {
      setActivities(JSON.parse(JSON.stringify(INITIAL_ACTIVITIES)));
      setMaterials(JSON.parse(JSON.stringify(INITIAL_MATERIALS)));
    }
    showToast('Dashboard restored to benchmark dataset');
  };

  // Export handlers
  const handleDownloadCSV = () => {
    const csvContent = exportActivitiesToCSV(activities);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Chakramsar_Schedule_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV master spreadsheet downloaded');
  };

  const handleDownloadJSON = () => {
    const jsonContent = exportActivitiesToJSON(activities, materials);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Chakramsar_Master_Snapshot_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Project snapshot JSON downloaded');
  };

  if (authLoading) {
    return (
      <div className="executive-loading-screen">
        <div className="loading-spinner-ring" />
        <div className="loading-brand-pill">Chakramsar Farmhouse Master Schedule</div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onSuccess={() => showToast('Authenticated as Executive')}
        onContinueAsGuest={() => {
          continueAsGuest();
          showToast('Browsing in Guest Stakeholder Mode');
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Executive Command Header */}
      <Header 
        lastUpdated={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        onOpenAddActivity={() => {
          setEditingActivity(null);
          setActivityModalOpen(true);
        }}
        onDownloadCSV={handleDownloadCSV}
        onDownloadJSON={handleDownloadJSON}
        onResetData={handleReset}
        user={user}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={async () => {
          await logout();
          showToast('Signed out of executive session');
        }}
      />

      <main className="main-content">
        {/* Executive KPI Suite */}
        <KpiGrid kpis={kpis} />

        {/* Dynamic Toolbar */}
        <Toolbar 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedPhase={selectedPhase}
          onPhaseChange={setSelectedPhase}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* View Switcher Engine */}
        {viewMode === 'gantt' && (
          <>
            <GanttChart 
              activities={filteredActivities}
              onUpdateActivity={handleUpdateActivity}
              onEditActivityModal={(id) => {
                const found = activities.find((a) => a.id === id);
                if (found) {
                  setEditingActivity(found);
                  setActivityModalOpen(true);
                }
              }}
            />

            {/* Material & Procurement Tracker embedded below Gantt */}
            <MaterialTracker 
              materials={materials}
              onAddMaterial={() => {
                setEditingMaterial(null);
                setMaterialModalOpen(true);
              }}
              onEditMaterial={(mat) => {
                setEditingMaterial(mat);
                setMaterialModalOpen(true);
              }}
              onDeleteMaterial={handleDeleteMaterial}
            />
          </>
        )}

        {viewMode === 'kanban' && (
          <KanbanView 
            activities={filteredActivities}
            onUpdateActivity={handleUpdateActivity}
            onEditActivityModal={(id) => {
              const found = activities.find((a) => a.id === id);
              if (found) {
                setEditingActivity(found);
                setActivityModalOpen(true);
              }
            }}
          />
        )}

        {viewMode === 'materials' && (
          <MaterialTracker 
            materials={materials}
            onAddMaterial={() => {
              setEditingMaterial(null);
              setMaterialModalOpen(true);
            }}
            onEditMaterial={(mat) => {
              setEditingMaterial(mat);
              setMaterialModalOpen(true);
            }}
            onDeleteMaterial={handleDeleteMaterial}
          />
        )}

        {viewMode === 'analytics' && (
          <AnalyticsView 
            activities={activities}
            materials={materials}
          />
        )}

        {/* Executive Minimal Footer */}
        <footer style={{
          marginTop: 'auto',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11.5px',
          color: 'var(--text-muted)',
        }}>
          <span>© 2026 Chakramsar Farmhouse • Master Capital Project Schedule</span>
          <span>⚡ Real-Time Project Sync Active</span>
        </footer>
      </main>

      {/* Activity Add/Edit Modal */}
      <ActivityModal 
        isOpen={activityModalOpen}
        activity={editingActivity}
        onClose={() => {
          setActivityModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivityModal}
        onDelete={handleDeleteActivity}
      />

      {/* Material Add/Edit Modal */}
      <MaterialModal 
        isOpen={materialModalOpen}
        material={editingMaterial}
        onClose={() => {
          setMaterialModalOpen(false);
          setEditingMaterial(null);
        }}
        onSave={handleSaveMaterial}
        onDelete={handleDeleteMaterial}
      />

      {/* Luxury Login & Signup Modal */}
      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => showToast('Authenticated successfully')}
      />

      {/* Toast Notice */}
      {toastMsg && (
        <div className="toast-notice">
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
