import React from 'react';
import { useApp } from '../../context/AppContext';
import { MockGpsService } from '../../services/mockGpsService';

export const CheckOutModal: React.FC = () => {
  const {
    isCheckOutModalOpen,
    closeCheckOutModal,
    confirmCheckOut,
    currentUser,
    students,
  } = useApp();

  if (!isCheckOutModalOpen) return null;

  const regNo = currentUser?.registerNumber || '23UCCT001';
  const student = students.find((s) => s.register_number === regNo) || students[0];
  const currentTime = MockGpsService.getCurrentTimeString();

  const handleConfirm = () => {
    confirmCheckOut(student.register_number);
  };

  return (
    <div
      id="checkout-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-outline-variant/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-error/10 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </div>
            <div>
              <h2 id="checkout-modal-title" className="text-sm font-bold text-on-surface leading-tight">
                End Clinical Shift
              </h2>
              <p className="text-[10px] text-on-surface-variant leading-none mt-0.5">
                Check-Out Confirmation
              </p>
            </div>
          </div>
          <button
            onClick={closeCheckOutModal}
            className="w-7 h-7 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="text-center space-y-1.5 py-1">
            <div className="w-12 h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center mx-auto mb-2 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[26px]">timer_off</span>
            </div>
            <h3 className="text-sm font-bold text-on-surface">
              Are you sure you want to end your shift?
            </h3>
            <p className="text-xs text-on-surface-variant max-w-[260px] mx-auto leading-relaxed">
              Your active shift session will be officially finalized and submitted to your internship attendance record.
            </p>
          </div>

          {/* Shift Details Display */}
          <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40 space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Shift Name</span>
              <span className="font-bold text-on-surface font-mono">{student.shift_name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Assigned Hours</span>
              <span className="font-medium text-on-surface">{student.shift_time}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Start Time</span>
              <span className="font-bold text-emerald-700 font-mono">10:02 PM</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Current Time (Check Out)</span>
              <span className="font-bold text-primary font-mono">{currentTime || '06:01 AM'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-on-surface-variant">Hospital & Ward</span>
              <span className="font-medium text-on-surface truncate max-w-[160px] text-right">
                {student.hospital.split(' - ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-outline-variant/40 bg-surface-container-lowest flex gap-2 shrink-0">
          <button
            type="button"
            onClick={closeCheckOutModal}
            className="flex-1 py-2.5 px-3 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-checkout"
            type="button"
            onClick={handleConfirm}
            className="flex-2 py-2.5 px-3 rounded-xl bg-error hover:bg-error/90 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            Confirm Check Out
          </button>
        </div>
      </div>
    </div>
  );
};
