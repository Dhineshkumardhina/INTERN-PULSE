import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const StudentProfileScreen: React.FC = () => {
  const { currentUser, students, setCurrentScreen, logout } = useApp();

  const regNo = currentUser?.registerNumber || '23UCCT001';
  const student = students.find((s) => s.register_number === regNo) || students[0];

  return (
    <div className="flex-1 flex flex-col pb-28 min-h-screen bg-background text-on-surface">
      <Header title="Internship Profile" showBack onBack={() => setCurrentScreen('student_dashboard')} />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Profile Card */}
        <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/40 shadow-2xs text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-2.5 overflow-hidden ring-4 ring-primary/15">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">
                {student.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="text-base font-bold text-on-surface leading-tight">
            {student.name}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full font-mono text-xs font-bold">
              <span className="material-symbols-outlined text-[14px]">badge</span>
              <span>Reg: {student.register_number}</span>
            </div>
            {student.enrollment_number && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-secondary/10 text-secondary rounded-full font-mono text-xs font-bold">
                <span>Enroll: {student.enrollment_number}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-on-surface-variant mt-2">
            {student.academic_year || 'Final Year (2025–2026)'} • {student.department}
          </p>

          <div className="mt-3 pt-3 border-t border-outline-variant/30 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-700">
              {student.internship_status || 'Active Clinical Internship'}
            </span>
          </div>
        </div>

        {/* Assigned Internship Details */}
        <div className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/40 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-[18px]">local_hospital</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Hospital Clinical Placement
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant">Host Hospital</span>
              <span className="font-bold text-on-surface text-right max-w-[200px]">
                {student.hospital}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Clinical Department</span>
              <span className="font-bold text-on-surface">
                {student.internship_department || student.department}
              </span>
            </div>
            {student.posting_area && (
              <div className="flex justify-between items-start">
                <span className="text-on-surface-variant">Posting Area</span>
                <span className="font-bold text-primary text-right max-w-[220px]">
                  {student.posting_area}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Assigned Clinical Mentor</span>
              <span className="font-bold text-primary">
                {student.mentor_name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Internship Duration</span>
              <span className="font-medium text-on-surface font-mono">
                {student.internship_start_date || '01 Aug 2026'} – {student.internship_end_date || '31 Jan 2027'}
              </span>
            </div>
          </div>
        </div>

        {/* Shift Assignment Card */}
        <div className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/40 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-secondary text-[18px]">schedule</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">
              Clinical Shift Assignment
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Current Shift</span>
              <span className="font-bold px-2 py-0.5 rounded-md bg-secondary/10 text-secondary">
                {student.shift_name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Standard Duty Window</span>
              <span className="font-bold text-on-surface font-mono">{student.shift_time}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Rotation Type</span>
              <span className="font-medium text-on-surface">Continuous Cross-Midnight Duty</span>
            </div>
          </div>
        </div>

        {/* Contact & Institutional Info */}
        <div className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/40 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-outline-variant text-[18px]">contact_mail</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-outline-variant">
              Student Information
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Institutional Email</span>
              <span className="font-medium text-on-surface font-mono text-[11px]">
                {student.email || 'arun.kumar@student.ahs.edu'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Contact Phone</span>
              <span className="font-medium text-on-surface font-mono">
                {student.phone || '+91 98401 23456'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('student_attendance')}
            className="w-full py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">event_available</span>
            View My Attendance History
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl border border-error/30 text-error hover:bg-error-container/30 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out of Portal
          </button>
        </div>
      </main>
    </div>
  );
};
