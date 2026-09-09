'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Building2, KeyRound, Mail, User, ShieldCheck, X, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('CEO / Executive');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // 1-Click Fast Demo Login
  const handleQuickDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setSubmitting(true);
    const res = await login(demoEmail, demoPass);
    setSubmitting(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError(res.error || 'Demo login failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (isSignup) {
      if (!name.trim()) {
        setError('Please enter your full name');
        setSubmitting(false);
        return;
      }
      const res = await signup(name, email, password, role);
      setSubmitting(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.error || 'Account creation failed');
      }
    } else {
      const res = await login(email, password);
      setSubmitting(false);
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '440px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '24px 24px 20px',
          position: 'relative',
        }}>
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '16px',
              top: '16px',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--blue)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            <Building2 size={13} />
            <span>Executive Authentication</span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            {isSignup ? 'Create Project Account' : 'Executive Portal Sign In'}
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
            Chakramsar Farmhouse Master Schedule &amp; ERP
          </p>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {/* Quick Demo Logins */}
          {!isSignup && (
            <div style={{
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '18px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={12} color="var(--amber)" /> 1-Click Fast Executive Demo:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'flex-start' }}
                  onClick={() => handleQuickDemo('ceo@chakramsar.com', 'Ceo@2026!')}
                >
                  <span>👔</span> <strong>CEO Portal</strong>
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'flex-start' }}
                  onClick={() => handleQuickDemo('engineer@chakramsar.com', 'Site@2026!')}
                >
                  <span>👷‍♂️</span> <strong>Site Engineer</strong>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: 'var(--red-light)',
              border: '1px solid var(--red-border)',
              color: 'var(--red)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isSignup && (
              <div className="form-group">
                <label>Full Name *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Akash Das"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '32px' }}
                  />
                  <User size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-sub)' }} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Work Email *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="email"
                  required
                  placeholder="name@chakramsar.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
                <Mail size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-sub)' }} />
              </div>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
                <KeyRound size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-sub)' }} />
              </div>
            </div>

            {isSignup && (
              <div className="form-group">
                <label>Project Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="CEO / Executive">CEO / Executive (Full Control)</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Site Engineer">Site Engineer</option>
                  <option value="Contractor / Viewer">Contractor / Viewer (Read Only)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', marginTop: '6px', height: '40px', fontSize: '13px' }}
            >
              {submitting ? 'Authenticating...' : isSignup ? 'Create Account' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            {isSignup ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  onClick={() => { setIsSignup(false); setError(null); }}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Need access to this site?{' '}
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  onClick={() => { setIsSignup(true); setError(null); }}
                >
                  Register Team Member
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
