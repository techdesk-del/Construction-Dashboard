'use client';

import React from 'react';
import { Activity, MaterialItem } from '@/types';
import { Users, CheckCircle, Clock, AlertTriangle, Layers, ShieldAlert } from 'lucide-react';

interface AnalyticsViewProps {
  activities: Activity[];
  materials: MaterialItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ activities, materials }) => {
  // 1. Calculate contractor distribution
  const contractorMap: { [key: string]: { total: number; completed: number; inProgress: number } } = {};
  activities.forEach((a) => {
    const contractor = a.resp?.trim() || 'Unassigned';
    if (!contractorMap[contractor]) {
      contractorMap[contractor] = { total: 0, completed: 0, inProgress: 0 };
    }
    contractorMap[contractor].total++;
    if (a.pct === 100 || a.status === 'Completed') contractorMap[contractor].completed++;
    else if (a.pct > 0 || a.status === 'In Progress') contractorMap[contractor].inProgress++;
  });

  const contractors = Object.entries(contractorMap).sort((a, b) => b[1].total - a[1].total);

  // 2. Phase progress breakdown
  const phaseMap: { [key: string]: { count: number; totalPct: number } } = {};
  activities.forEach((a) => {
    if (!phaseMap[a.phase]) {
      phaseMap[a.phase] = { count: 0, totalPct: 0 };
    }
    phaseMap[a.phase].count++;
    phaseMap[a.phase].totalPct += a.pct || 0;
  });

  const phases = Object.entries(phaseMap).map(([phase, data]) => ({
    phase,
    count: data.count,
    avgPct: Math.round(data.totalPct / data.count),
  }));

  // 3. Material readiness
  const totalMats = materials.length;
  const deliveredMats = materials.filter((m) => m.mat === 'Delivered').length;
  const pendingMats = materials.filter((m) => m.mat === 'To be Delivered' || m.mat === 'Selection Pending').length;
  const partialMats = materials.filter((m) => m.mat === 'Partial').length;

  const matDeliveryRate = totalMats ? Math.round((deliveredMats / totalMats) * 100) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '32px' }}>
      {/* Contractor Workload */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 700, fontSize: '14.5px' }}>
          <Users size={16} color="var(--blue)" />
          <span>Contractor Velocity &amp; Load</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {contractors.map(([name, stats]) => {
            const completionPct = Math.round((stats.completed / stats.total) * 100);
            return (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  <span>{name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {stats.completed}/{stats.total} done ({completionPct}%)
                  </span>
                </div>
                <div className="pct-track" style={{ height: '7px' }}>
                  <div 
                    className="pct-fill done" 
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Completion */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 700, fontSize: '14.5px' }}>
          <Layers size={16} color="var(--green)" />
          <span>Phase Milestone Progress</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {phases.map((p) => (
            <div key={p.phase}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                <span>{p.phase}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {p.avgPct}% ({p.count} tasks)
                </span>
              </div>
              <div className="pct-track" style={{ height: '7px' }}>
                <div 
                  className={`pct-fill ${p.avgPct === 100 ? 'done' : 'prog'}`} 
                  style={{ width: `${p.avgPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Procurement Health */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 700, fontSize: '14.5px' }}>
          <ShieldAlert size={16} color="var(--amber)" />
          <span>Procurement Delivery Readiness</span>
        </div>

        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '42px', fontWeight: 800, color: 'var(--green)', letterSpacing: '-0.03em' }}>
            {matDeliveryRate}%
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
            Overall Site Material Readiness
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
          <div style={{ background: 'var(--surface-alt)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green)' }}>{deliveredMats}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Delivered On-Site</div>
          </div>
          <div style={{ background: 'var(--surface-alt)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--red)' }}>{pendingMats}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Pending / Selection</div>
          </div>
        </div>
      </div>
    </div>
  );
};
