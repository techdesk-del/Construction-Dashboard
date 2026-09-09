'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { 
  Building2, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Database, 
  Eye, 
  EyeOff, 
  Lock, 
  Briefcase
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
  onContinueAsGuest?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onContinueAsGuest,
}) => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('CEO / Executive');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fast 1-Click Demo Login
  const handleQuickDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setSubmitting(true);
    const res = await login(demoEmail, demoPass);
    setSubmitting(false);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Demo authentication failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (isSignup) {
      if (!name.trim()) {
        setError('Please provide your full name');
        setSubmitting(false);
        return;
      }
      const res = await signup(name, email, password, role);
      setSubmitting(false);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Account creation failed');
      }
    } else {
      const res = await login(email, password);
      setSubmitting(false);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Invalid email or password');
      }
    }
  };

  return (
    <div className="auth-gateway-screen">
      {/* Background Decorative Mesh */}
      <div className="auth-bg-gradient" />
      <div className="auth-grid-pattern" />

      {/* Top Brand Bar */}
      <header className="auth-topbar">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Building2 size={20} />
          </div>
          <div>
            <div className="auth-brand-title">Chakramsar Farmhouse</div>
            <div className="auth-brand-subtitle">Master Schedule &amp; ERP Suite</div>
          </div>
        </div>

        <div className="auth-mongo-badge">
          <span className="mongo-pulse-dot" />
          <Database size={13} />
          <span>MongoDB Atlas Live</span>
        </div>
      </header>

      {/* Central Login Card */}
      <main className="auth-center-container">
        <div className="auth-card">
          {/* Card Header */}
          <div className="auth-card-header">
            <div className="auth-pill-tag">
              <ShieldCheck size={13} />
              <span>Executive Access Portal</span>
            </div>
            <h1 className="auth-heading">
              {isSignup ? 'Create Project Account' : 'Sign in to Dashboard'}
            </h1>
            <p className="auth-subtext">
              {isSignup 
                ? 'Register an executive profile to manage construction timelines and materials.'
                : 'Access the interactive Master Gantt, procurement matrix, and site analytics.'
              }
            </p>
          </div>

          {/* Quick 1-Click Fast Demo Logins */}
          {!isSignup && (
            <div className="auth-quick-demo-section">
              <div className="quick-demo-label">
                <Sparkles size={13} color="var(--amber)" />
                <span>Instant 1-Click Executive Access</span>
              </div>
              <div className="quick-demo-grid">
                <button
                  type="button"
                  className="quick-demo-btn ceo"
                  disabled={submitting}
                  onClick={() => handleQuickDemo('ceo@chakramsar.com', 'Ceo@2026!')}
                >
                  <div className="demo-avatar">👔</div>
                  <div className="demo-info">
                    <div className="demo-title">Executive CEO</div>
                    <div className="demo-sub">Full Master Control</div>
                  </div>
                  <ArrowRight size={14} className="demo-arrow" />
                </button>

                <button
                  type="button"
                  className="quick-demo-btn engineer"
                  disabled={submitting}
                  onClick={() => handleQuickDemo('engineer@chakramsar.com', 'Site@2026!')}
                >
                  <div className="demo-avatar">👷‍♂️</div>
                  <div className="demo-info">
                    <div className="demo-title">Lead Site Engineer</div>
                    <div className="demo-sub">Site Operations</div>
                  </div>
                  <ArrowRight size={14} className="demo-arrow" />
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="auth-divider">
            <span>{isSignup ? 'ENTER CREDENTIALS' : 'OR SIGN IN WITH EMAIL'}</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error-banner">
              <span>{error}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {isSignup && (
              <>
                <div className="auth-input-group">
                  <label htmlFor="auth-name">Full Name</label>
                  <div className="auth-input-wrapper">
                    <UserIcon size={16} className="input-icon" />
                    <input
                      id="auth-name"
                      type="text"
                      placeholder="e.g. Akash Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="auth-role">Project Role</label>
                  <div className="auth-input-wrapper">
                    <Briefcase size={16} className="input-icon" />
                    <select
                      id="auth-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                    >
                      <option value="CEO / Executive">CEO / Executive (Owner)</option>
                      <option value="Site Engineer">Site Engineer (Operations)</option>
                      <option value="Project Manager">Project Manager (Planning)</option>
                      <option value="Contractor / Viewer">Contractor / Viewer (Field)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="auth-input-group">
              <label htmlFor="auth-email">Corporate Email</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="name@chakramsar.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="auth-password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-auth-submit"
              disabled={submitting}
            >
              {submitting ? (
                <span>Authenticating with MongoDB...</span>
              ) : isSignup ? (
                <>Create Executive Account <ArrowRight size={15} /></>
              ) : (
                <>Sign In to Schedule <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Switch Form / Guest Option */}
          <div className="auth-footer-links">
            <button
              type="button"
              className="auth-switch-btn"
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
              }}
            >
              {isSignup 
                ? 'Already have an account? Sign In'
                : "Don't have an account? Register new user"}
            </button>

            {onContinueAsGuest && (
              <button
                type="button"
                className="auth-guest-link"
                onClick={onContinueAsGuest}
              >
                Continue as Guest / Stakeholder (Read Only)
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="auth-footer">
        <span>© 2026 Chakramsar Farmhouse Project • Enterprise Construction Management Suite</span>
        <span>Secured with JWT &amp; Live MongoDB Atlas</span>
      </footer>
    </div>
  );
};
