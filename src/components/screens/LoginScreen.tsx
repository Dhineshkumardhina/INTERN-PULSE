import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Staff ID or Student Register Number.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const success = login(identifier.trim(), password);
    if (!success) {
      setErrorMsg('Invalid credentials or unregistered ID. Please verify your details.');
    }
  };

  return (
    <div className="bg-background min-h-screen w-full flex flex-col justify-between p-4 py-6 max-w-md mx-auto overflow-x-hidden">
      {/* Top Header & Hospital Branding */}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md mb-2.5 border border-primary-container">
          <span className="material-symbols-outlined text-3xl fill text-primary-fixed">local_hospital</span>
        </div>
        <h1 className="font-display-id text-2xl font-bold text-on-surface tracking-tight">InternTrack</h1>
        <p className="text-xs text-on-surface-variant font-medium mt-0.5">
          Allied Health Science Clinical Internship Monitoring
        </p>
      </div>

      {/* Main Form Area */}
      <div className="my-auto py-4">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="font-headline-md text-base font-bold text-on-surface">Institutional Sign In</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Enter your assigned institutional credentials to access your portal.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1"
                htmlFor="login-identifier"
              >
                Staff ID or Register Number
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                  badge
                </span>
                <input
                  id="login-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 23UCCT001, mentor01, hod01, admin01"
                  className="w-full pl-11 pr-3 py-3 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-[48px]"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
                  htmlFor="login-password"
                >
                  Password
                </label>
                <span className="text-[10px] text-outline font-medium">Role-Secured</span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter role password"
                  className="w-full pl-11 pr-11 py-3 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-[48px]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary p-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="w-full bg-primary text-on-primary rounded-xl py-3.5 font-bold text-sm hover:bg-primary-container transition-all min-h-[48px] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.99] mt-2"
            >
              <span>Sign In</span>
              <span className="material-symbols-outlined text-[18px]">login</span>
            </button>
          </form>

          {/* Quick Institutional Role Fill Badges */}
          <div className="mt-5 pt-4 border-t border-outline-variant/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-primary">key</span>
                Role Passwords Reference
              </span>
              <span className="text-[10px] text-primary font-medium">Tap to Autofill</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setIdentifier('admin01');
                  setPassword('Admin@smvmch2026');
                }}
                className="p-2 rounded-xl bg-surface-container border border-outline-variant/50 hover:border-primary/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1 font-bold text-on-surface group-hover:text-primary">
                  <span className="material-symbols-outlined text-[13px] text-primary">admin_panel_settings</span>
                  Admin
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant truncate mt-0.5">
                  ID: <span className="text-on-surface font-semibold">admin01</span>
                </div>
                <div className="font-mono text-[9px] text-primary truncate">
                  PW: Admin@smvmch2026
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier('hod01');
                  setPassword('Hod@cct2026');
                }}
                className="p-2 rounded-xl bg-surface-container border border-outline-variant/50 hover:border-primary/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1 font-bold text-on-surface group-hover:text-primary">
                  <span className="material-symbols-outlined text-[13px] text-secondary">domain</span>
                  HOD
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant truncate mt-0.5">
                  ID: <span className="text-on-surface font-semibold">hod01</span>
                </div>
                <div className="font-mono text-[9px] text-secondary truncate">
                  PW: Hod@cct2026
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier('mentor01');
                  setPassword('Mentor@priya2026');
                }}
                className="p-2 rounded-xl bg-surface-container border border-outline-variant/50 hover:border-primary/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1 font-bold text-on-surface group-hover:text-primary">
                  <span className="material-symbols-outlined text-[13px] text-tertiary">supervised_user_circle</span>
                  Mentor
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant truncate mt-0.5">
                  ID: <span className="text-on-surface font-semibold">mentor01</span>
                </div>
                <div className="font-mono text-[9px] text-tertiary truncate">
                  PW: Mentor@priya2026
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier('23UCCT001');
                  setPassword('Student@23ucct001');
                }}
                className="p-2 rounded-xl bg-surface-container border border-outline-variant/50 hover:border-primary/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1 font-bold text-on-surface group-hover:text-primary">
                  <span className="material-symbols-outlined text-[13px] text-primary">school</span>
                  Student
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant truncate mt-0.5">
                  ID: <span className="text-on-surface font-semibold">23UCCT001</span>
                </div>
                <div className="font-mono text-[9px] text-primary truncate">
                  PW: Student@23ucct001
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Hospital Affiliation */}
      <div className="text-center pt-2 border-t border-outline-variant/30 text-on-surface-variant">
        <p className="text-xs font-semibold text-primary">
          Sri Manakula Vinayagar Medical College & Hospital (SMVMCH)
        </p>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-outline mt-1">
          <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
          <span>School of Allied Health Sciences • Live Telemetry</span>
        </div>
      </div>
    </div>
  );
};
