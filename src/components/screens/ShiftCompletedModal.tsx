import React from 'react';
import { useApp } from '../../context/AppContext';

export const ShiftCompletedModal: React.FC = () => {
  const {
    activeCheckOutSummary,
    dismissCheckOutSummary,
    setCurrentScreen,
  } = useApp();

  if (!activeCheckOutSummary) return null;

  const handleViewAttendance = () => {
    dismissCheckOutSummary();
    setCurrentScreen('student_attendance');
  };

  const handleReturnDashboard = () => {
    dismissCheckOutSummary();
    setCurrentScreen('student_dashboard');
  };

  return (
    <div
      id="shift-completed-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shift-completed-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-outline-variant/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-5 text-center relative shrink-0">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2.5 backdrop-blur-xs ring-4 ring-white/10">
            <span className="material-symbols-outlined text-[32px] text-white">task_alt</span>
          </div>
          <h2 id="shift-completed-title" className="text-base font-bold leading-tight">
            SHIFT COMPLETED
          </h2>
          <p className="text-xs text-white/90 mt-0.5 font-medium">
            Clinical Shift Officially Concluded
          </p>
        </div>

        {/* Shift Summary Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-emerald-500/15 text-emerald-800 border border-emerald-500/25 rounded-full text-xs font-bold uppercase tracking-wider">
              {activeCheckOutSummary.finalStatus}
            </span>
            <p className="text-xs text-on-surface-variant mt-2 px-3 leading-relaxed">
              Your clinical hours and verification records have been synchronized with the department attendance ledger.
            </p>
          </div>

          {/* Structured Summary Table */}
          <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Clinical Shift</span>
              <span className="font-bold text-on-surface">{activeCheckOutSummary.shiftName}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Start Time</span>
              <span className="font-bold text-on-surface font-mono">{activeCheckOutSummary.startTime}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">End Time (Check Out)</span>
              <span className="font-bold text-on-surface font-mono">{activeCheckOutSummary.endTime}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Successful Verifications</span>
              <span className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {activeCheckOutSummary.successfulVerifications} Checks
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Needs Attention Events</span>
              <span className="font-bold text-amber-700 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {activeCheckOutSummary.needsAttentionEvents} Event
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Credited Hours</span>
              <span className="font-bold text-primary font-mono">{activeCheckOutSummary.hoursLogged}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-on-surface-variant">Final Attendance Status</span>
              <span className="font-bold text-emerald-700 font-mono uppercase">{activeCheckOutSummary.finalStatus}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-outline-variant/40 bg-surface-container-lowest flex gap-2 shrink-0">
          <button
            id="btn-return-dashboard-post-shift"
            type="button"
            onClick={handleReturnDashboard}
            className="flex-1 py-2.5 px-3 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <button
            id="btn-view-attendance-post-shift"
            type="button"
            onClick={handleViewAttendance}
            className="flex-2 py-2.5 px-3 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">event_available</span>
            View Attendance Log
          </button>
        </div>
      </div>
    </div>
  );
};
