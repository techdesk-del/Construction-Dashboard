'use client';

import React from 'react';
import { Activity, MaterialItem } from '@/types';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Layers, 
  ShieldAlert, 
  TrendingUp, 
  Calendar, 
  Package, 
  CheckCheck, 
  AlertCircle,
  HardHat,
  ArrowUpRight
} from 'lucide-react';
import { computeStatus, fmtShort, daysBetween } from '@/lib/utils';

interface AnalyticsViewProps {
  activities: Activity[];
  materials: MaterialItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ activities, materials }) => {
  // 1. Executive Summary Metrics
  const totalTasks = activities.length;
  const completedTasks = activities.filter((a) => a.pct === 100 || a.status === 'Completed').length;
  const inProgressTasks = activities.filter((a) => a.status === 'In Progress' && a.pct < 100).length;
  const notStartedTasks = activities.filter((a) => a.status === 'Not Started').length;
  const overallProgress = totalTasks ? Math.round(activities.reduce((acc, a) => acc + (a.pct || 0), 0) / totalTasks) : 0;

  // 2. Contractor Distribution
  const contractorMap: { [key: string]: { total: number; completed: number; inProgress: number; notStarted: number } } = {};
  activities.forEach((a) => {
    const contractor = a.resp?.trim() || 'Unassigned';
    if (!contractorMap[contractor]) {
      contractorMap[contractor] = { total: 0, completed: 0, inProgress: 0, notStarted: 0 };
    }
    contractorMap[contractor].total++;
    if (a.pct === 100 || a.status === 'Completed') contractorMap[contractor].completed++;
    else if (a.pct > 0 || a.status === 'In Progress') contractorMap[contractor].inProgress++;
    else contractorMap[contractor].notStarted++;
  });

  const contractors = Object.entries(contractorMap).sort((a, b) => b[1].total - a[1].total);

  // 3. Phase Progress Breakdown
  const phaseMap: { [key: string]: { count: number; totalPct: number; completed: number } } = {};
  activities.forEach((a) => {
    if (!phaseMap[a.phase]) {
      phaseMap[a.phase] = { count: 0, totalPct: 0, completed: 0 };
    }
    phaseMap[a.phase].count++;
    phaseMap[a.phase].totalPct += a.pct || 0;
    if (a.pct === 100 || a.status === 'Completed') phaseMap[a.phase].completed++;
  });

  const phases = Object.entries(phaseMap).map(([phase, data]) => ({
    phase,
    count: data.count,
    avgPct: Math.round(data.totalPct / data.count),
    completed: data.completed,
  })).sort((a, b) => b.avgPct - a.avgPct);

  // 4. Material Readiness
  const totalMats = materials.length;
  const deliveredMats = materials.filter((m) => m.mat === 'Delivered').length;
  const pendingMats = materials.filter((m) => m.mat === 'To be Delivered' || m.mat === 'Selection Pending').length;
  const partialMats = materials.filter((m) => m.mat === 'Partial').length;
  const matDeliveryRate = totalMats ? Math.round((deliveredMats / totalMats) * 100) : 0;

  // 5. Critical Path & Urgent Attention Items (High Priority / In Progress)
  const urgentTasks = activities
    .filter((a) => a.priority === 'High' && a.status !== 'Completed')
    .slice(0, 5);

  // 6. Upcoming Procurement Deadlines
  const pendingDeliveries = materials
    .filter((m) => m.mat !== 'Delivered')
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
      {/* ── 1. EXECUTIVE KPI SUMMARY RIBBON ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
      }}>
        <div className="kpi-card" style={{ padding: '14px 18px', background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11.5px', fontWeight: 600 }}>
            <span>OVERALL SITE PROGRESS</span>
            <TrendingUp size={15} color="var(--blue)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--blue)', marginTop: '4px' }}>
            {overallProgress}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {completedTasks} of {totalTasks} activities completed
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px', background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11.5px', fontWeight: 600 }}>
            <span>ACTIVE TRADES &amp; TEAMS</span>
            <Users size={15} color="var(--purple)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--purple)', marginTop: '4px' }}>
            {contractors.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {inProgressTasks} tasks currently in execution
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px', background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11.5px', fontWeight: 600 }}>
            <span>MATERIAL READINESS</span>
            <Package size={15} color="var(--emerald)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--emerald)', marginTop: '4px' }}>
            {matDeliveryRate}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {deliveredMats} delivered, {pendingMats} pending selection
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px 18px', background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11.5px', fontWeight: 600 }}>
            <span>CRITICAL CIVIL LOAD</span>
            <HardHat size={15} color="var(--amber)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--amber)', marginTop: '4px' }}>
            {urgentTasks.length} Urgent
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            High-priority milestones demanding focus
          </div>
        </div>
      </div>

      {/* ── 2. PRIMARY 3-COLUMN ANALYTICS GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px',
        alignItems: 'stretch',
      }}>
        {/* Card 1: Contractor Velocity & Workload */}
        <div style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
              <Users size={16} color="var(--blue)" />
              <span>Contractor Velocity &amp; Load</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--blue-light)', color: 'var(--blue)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
              {contractors.length} Trade Vendors
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '340px',
            overflowY: 'auto',
            paddingRight: '6px',
          }}>
            {contractors.map(([name, stats]) => {
              const completionPct = Math.round((stats.completed / stats.total) * 100);
              return (
                <div key={name} style={{ background: 'var(--surface-alt)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{name}</span>
                    <span style={{ color: completionPct === 100 ? 'var(--emerald)' : 'var(--text-muted)', fontSize: '11.5px' }}>
                      {stats.completed}/{stats.total} done ({completionPct}%)
                    </span>
                  </div>
                  <div className="pct-track" style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
                    <div 
                      className={`pct-fill ${completionPct === 100 ? 'done' : 'prog'}`} 
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Phase Milestone Progress */}
        <div style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
              <Layers size={16} color="var(--emerald)" />
              <span>Phase Milestones &amp; Execution</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--emerald-light)', color: 'var(--emerald)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
              {phases.length} Phases
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '340px',
            overflowY: 'auto',
            paddingRight: '6px',
          }}>
            {phases.map((p) => (
              <div key={p.phase} style={{ background: 'var(--surface-alt)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{p.phase}</span>
                  <span style={{ color: p.avgPct === 100 ? 'var(--emerald)' : 'var(--blue)', fontSize: '11.5px' }}>
                    {p.avgPct}% ({p.completed}/{p.count} done)
                  </span>
                </div>
                <div className="pct-track" style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
                  <div 
                    className={`pct-fill ${p.avgPct === 100 ? 'done' : p.avgPct > 0 ? 'prog' : 'ns'}`} 
                    style={{ width: `${p.avgPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Procurement Readiness & Logistics */}
        <div style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                <ShieldAlert size={16} color="var(--amber)" />
                <span>Procurement Logistics Readiness</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--amber-light)', color: 'var(--amber)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
                {totalMats} Line Items
              </span>
            </div>

            <div style={{ textAlign: 'center', padding: '14px 0' }}>
              <div style={{ fontSize: '46px', fontWeight: 800, color: 'var(--emerald)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {matDeliveryRate}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '6px' }}>
                On-Site Material Availability
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
              <div style={{ background: 'var(--emerald-light)', border: '1px solid var(--emerald-border)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--emerald)' }}>{deliveredMats}</div>
                <div style={{ fontSize: '11px', color: 'var(--emerald)', fontWeight: 700, marginTop: '2px' }}>Delivered On-Site</div>
              </div>
              <div style={{ background: 'var(--red-light)', border: '1px solid var(--red-border)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--red)' }}>{pendingMats}</div>
                <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 700, marginTop: '2px' }}>Pending Selection</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border)', fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Partial Shipments: <strong>{partialMats}</strong></span>
            <span>Total Logged Items: <strong>{totalMats}</strong></span>
          </div>
        </div>
      </div>

      {/* ── 3. EXECUTIVE RISK RADAR & PROCUREMENT WATCHLIST (Fills the bottom elegantly) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '20px',
      }}>
        {/* Critical Path Immediate Focus */}
        <div style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>
              <AlertCircle size={15} color="var(--red)" />
              <span>High-Priority Site Milestones</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Civil Directives</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {urgentTasks.map((act) => (
              <div 
                key={act.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-primary)' }}>
                    {act.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {act.phase} • Resp: <strong>{act.resp || 'Site Engineer'}</strong> • Deadline: <strong>{fmtShort(act.end)}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge b-soon" style={{ fontSize: '10px' }}>
                    {act.pct}% Complete
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Material Logistics Delivery Watchlist */}
        <div style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>
              <Clock size={15} color="var(--amber)" />
              <span>Procurement Action &amp; Delivery Watchlist</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Dispatch</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingDeliveries.map((mat) => (
              <div 
                key={mat.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--surface-alt)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-primary)' }}>
                    {mat.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Vendor: <strong>{mat.resp || 'Procurement Team'}</strong> • Due: <strong>{mat.deadline}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${mat.mat === 'Selection Pending' ? 'b-over' : 'b-soon'}`} style={{ fontSize: '10px' }}>
                    {mat.mat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
