import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MockGpsService } from '../../services/mockGpsService';

export const VerificationRequestModal: React.FC = () => {
  const {
    isVerificationModalOpen,
    dismissVerificationModal,
    performGpsVerification,
    currentUser,
    students,
    hospitalGeofence,
    setCurrentScreen,
  } = useApp();

  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes window

  const regNo = currentUser?.registerNumber || '23UCCT001';
  const student = students.find((s) => s.register_number === regNo) || students[0];

  useEffect(() => {
    if (!isVerificationModalOpen) {
      setTimeLeft(120);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVerificationModalOpen]);

  const handleTimeExpired = async () => {
    dismissVerificationModal();
    // Status changes to NEEDS ATTENTION
    await performGpsVerification('OUTSIDE_HOSPITAL', MockGpsService.getCurrentTimeString(), 'RANDOM_PROMPT');
    setCurrentScreen('verification_result_needs_attention');
  };

  if (!isVerificationModalOpen) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    dismissVerificationModal();
    const result = await performGpsVerification(undefined, MockGpsService.getCurrentTimeString(), 'RANDOM_PROMPT');
    if (result.status === 'NEEDS ATTENTION' || result.status === 'LOCATION PERMISSION REQUIRED' || result.status === 'GPS UNAVAILABLE') {
      setCurrentScreen('verification_result_needs_attention');
    } else {
      setCurrentScreen('verification_result');
    }
  };

  return (
    <div
      id="verification-request-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-request-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-surface text-on-surface w-full max-w-sm rounded-2xl border border-outline-variant/60 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-surface-container-low p-4 text-center border-b border-outline-variant/30">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-xs mb-2">
            <span className="material-symbols-outlined text-2xl animate-pulse">
              share_location
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-secondary block">
            Random Presence Verification
          </span>
          <h2 id="verification-request-title" className="text-base font-bold text-on-surface leading-tight mt-0.5">
            GPS Verification Required
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Please verify your physical presence at the hospital.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 text-center">
          {/* Countdown Clock */}
          <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/40">
            <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              Time Remaining
            </div>
            <div
              className={`font-mono text-2xl font-bold mt-0.5 ${
                timeLeft < 30 ? 'text-error animate-pulse' : 'text-primary'
              }`}
            >
              {formatTimer(timeLeft)} remaining
            </div>
            <div className="text-[10px] text-outline mt-0.5">
              Response required within 2 minutes to confirm clinical attendance
            </div>
          </div>

          {/* Student & Hospital Info */}
          <div className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/30 text-left text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Student Intern:</span>
              <span className="font-bold text-on-surface font-mono">{student.register_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Host Hospital:</span>
              <span className="font-medium text-on-surface truncate max-w-[170px]">{student.hospital}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Required Perimeter:</span>
              <span className="font-bold text-primary font-mono">{hospitalGeofence.radius_meters} meters</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2 pt-1">
            <button
              id="btn-verify-now"
              type="button"
              onClick={handleVerify}
              className="w-full bg-primary text-on-primary rounded-xl py-3 font-bold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[48px]"
            >
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
              VERIFY NOW
            </button>

            <button
              id="btn-dismiss-verify-modal"
              type="button"
              onClick={dismissVerificationModal}
              className="w-full text-xs font-semibold text-on-surface-variant hover:text-on-surface py-1.5 cursor-pointer transition-colors"
            >
              Dismiss (Testing)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
