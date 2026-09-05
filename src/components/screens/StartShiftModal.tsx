import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GpsVerification, GpsSimulationMode } from '../../types';
import { MockGpsService } from '../../services/mockGpsService';

export const StartShiftModal: React.FC = () => {
  const {
    isStartShiftModalOpen,
    closeStartShiftModal,
    currentUser,
    students,
    hospitalGeofence,
    gpsMode,
    setGpsMode,
    performGpsVerification,
    startShift,
  } = useApp();

  const [step, setStep] = useState<'DETAILS' | 'VERIFYING' | 'RESULT'>('DETAILS');
  const [verificationResult, setVerificationResult] = useState<GpsVerification | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  if (!isStartShiftModalOpen) return null;

  const regNo = currentUser?.registerNumber || '23UCCT001';
  const student = students.find((s) => s.register_number === regNo) || students[0];

  const handleBeginVerification = async () => {
    if (!hasPermission || gpsMode === 'PERMISSION_DENIED') {
      // Simulate permission denied
      setStep('RESULT');
      const deniedResult: GpsVerification = {
        id: `v_denied_${Date.now()}`,
        register_number: student.register_number,
        student_name: student.name,
        department: student.department,
        timestamp: new Date().toISOString(),
        time_display: MockGpsService.getCurrentTimeString(),
        status: 'LOCATION PERMISSION REQUIRED',
        distance_meters: 0,
        accuracy_meters: 0,
        latitude: 0,
        longitude: 0,
        is_inside_geofence: false,
        verification_type: 'SHIFT_START',
      };
      setVerificationResult(deniedResult);
      return;
    }

    setStep('VERIFYING');
    try {
      // Attempt GPS verification
      const result = await performGpsVerification(gpsMode, MockGpsService.getCurrentTimeString(), 'SHIFT_START');
      setVerificationResult(result);
      setStep('RESULT');
    } catch {
      setStep('DETAILS');
    }
  };

  const handleConfirmActivation = async () => {
    await startShift(student.register_number);
    handleClose();
  };

  const handleClose = () => {
    setStep('DETAILS');
    setVerificationResult(null);
    closeStartShiftModal();
  };

  const handleTryAgain = () => {
    setStep('DETAILS');
    setVerificationResult(null);
  };

  return (
    <div
      id="start-shift-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-shift-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-outline-variant/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 py-3.5 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
            </div>
            <div>
              <h2 id="start-shift-title" className="text-sm font-bold text-on-surface leading-tight">
                Start Clinical Shift
              </h2>
              <p className="text-[10px] text-on-surface-variant leading-none mt-0.5">
                Physical Presence Pre-Verification
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {step === 'DETAILS' && (
            <>
              {/* Shift Information Summary */}
              <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Assigned Shift</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md">
                    {student.shift_name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Duty Hours</span>
                    <span className="font-bold text-on-surface font-mono">{student.shift_time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Department</span>
                    <span className="font-bold text-on-surface truncate block">{student.department}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-on-surface-variant block">Assigned Hospital</span>
                    <span className="font-bold text-on-surface truncate block">{student.hospital}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Clinical Mentor</span>
                    <span className="font-bold text-on-surface">{student.mentor_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Geofence Radius</span>
                    <span className="font-bold text-on-surface font-mono">{hospitalGeofence.radius_meters} meters</span>
                  </div>
                </div>
              </div>

              {/* Permission & Geofence Notice */}
              <div className="bg-surface-container rounded-xl p-3 border border-outline-variant/30 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                  location_searching
                </span>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-on-surface">Location Verification Required</p>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    InternTrack requires accurate GPS coordinates to verify your physical presence inside the designated hospital area before activating your clinical shift.
                  </p>
                </div>
              </div>

              {/* Prototype GPS Simulation Selector (For Testing) */}
              <div className="bg-surface-container-lowest rounded-xl p-2.5 border border-outline-variant/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                    GPS Test Location
                  </span>
                  <span className="text-[9px] text-primary font-mono font-bold">Simulator</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setGpsMode('INSIDE_HOSPITAL');
                      setHasPermission(true);
                    }}
                    className={`p-2 text-left rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                      gpsMode === 'INSIDE_HOSPITAL' && hasPermission
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                        : 'border-outline-variant/40 bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Inside Hospital</span>
                    </div>
                    <span className="text-[9px] text-on-surface-variant block mt-0.5">42m from center</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGpsMode('OUTSIDE_HOSPITAL');
                      setHasPermission(true);
                    }}
                    className={`p-2 text-left rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                      gpsMode === 'OUTSIDE_HOSPITAL'
                        ? 'border-error bg-error/10 text-error font-bold shadow-2xs'
                        : 'border-outline-variant/40 bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                      <span>Outside Hospital</span>
                    </div>
                    <span className="text-[9px] text-on-surface-variant block mt-0.5">420m away</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGpsMode('LOW_ACCURACY');
                      setHasPermission(true);
                    }}
                    className={`p-2 text-left rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                      gpsMode === 'LOW_ACCURACY'
                        ? 'border-amber-600 bg-amber-500/10 text-amber-700 font-bold shadow-2xs'
                        : 'border-outline-variant/40 bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Low Accuracy</span>
                    </div>
                    <span className="text-[9px] text-on-surface-variant block mt-0.5">±65m jitter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGpsMode('PERMISSION_DENIED');
                      setHasPermission(false);
                    }}
                    className={`p-2 text-left rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                      gpsMode === 'PERMISSION_DENIED' || !hasPermission
                        ? 'border-on-surface-variant bg-surface-container-highest text-on-surface font-bold shadow-2xs'
                        : 'border-outline-variant/40 bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      <span>No Permission</span>
                    </div>
                    <span className="text-[9px] text-on-surface-variant block mt-0.5">Denied in OS</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'VERIFYING' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <span className="material-symbols-outlined text-primary text-[24px] absolute inset-0 m-auto flex items-center justify-center">
                  share_location
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Acquiring GPS Fix</h3>
                <p className="text-xs text-on-surface-variant mt-1 max-w-[240px]">
                  Connecting to hospital geofence service ({hospitalGeofence.radius_meters}m perimeter)...
                </p>
              </div>
              <div className="text-[10px] font-mono text-outline uppercase tracking-wider">
                Status: VERIFYING...
              </div>
            </div>
          )}

          {step === 'RESULT' && verificationResult && (
            <div className="space-y-4 py-1">
              {verificationResult.status === 'VERIFIED' ? (
                /* SUCCESS: VERIFIED */
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                    <span className="material-symbols-outlined text-[32px]">check_circle</span>
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                      VERIFIED
                    </span>
                    <h3 className="text-base font-bold text-on-surface mt-1.5">
                      Presence Successfully Confirmed
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      You are physically present within {hospitalGeofence.name.split(' - ')[0]}.
                    </p>
                  </div>

                  {/* Verification Telemetry Card */}
                  <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/40 text-left space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-outline-variant/20">
                      <span className="text-on-surface-variant">Verification Time</span>
                      <span className="font-bold text-on-surface font-mono">{verificationResult.time_display}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-outline-variant/20">
                      <span className="text-on-surface-variant">Distance from Hospital</span>
                      <span className="font-bold text-emerald-600 font-mono">{verificationResult.distance_meters} meters</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-outline-variant/20">
                      <span className="text-on-surface-variant">GPS Accuracy</span>
                      <span className="font-bold text-on-surface font-mono">±{verificationResult.accuracy_meters} meters</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-outline-variant/20">
                      <span className="text-on-surface-variant">Hospital Geofence</span>
                      <span className="font-bold text-on-surface font-mono">{hospitalGeofence.radius_meters}m Perimeter</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-on-surface-variant">Verification Timestamp</span>
                      <span className="font-mono text-[11px] text-on-surface">{new Date(verificationResult.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* OUTSIDE GEOFENCE OR ERROR: NEEDS ATTENTION / PERMISSION / LOW ACCURACY */
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
                    <span className="material-symbols-outlined text-[32px]">warning</span>
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider">
                      {verificationResult.status === 'LOCATION PERMISSION REQUIRED'
                        ? 'PERMISSION DENIED'
                        : verificationResult.status}
                    </span>
                    <h3 className="text-sm font-bold text-on-surface mt-1.5">
                      Physical Verification Incomplete
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 px-2 leading-relaxed">
                      {verificationResult.status === 'LOCATION PERMISSION REQUIRED'
                        ? 'Location permission is required to confirm presence inside the hospital geofence.'
                        : 'Your current location could not be verified within the hospital area.'}
                    </p>
                  </div>

                  {/* Telemetry Card */}
                  <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/40 text-left space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-outline-variant/20">
                      <span className="text-on-surface-variant">Current Distance</span>
                      <span className="font-bold text-amber-700 font-mono">
                        {verificationResult.distance_meters > 0 ? `${verificationResult.distance_meters} meters` : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-outline-variant/20">
                      <span className="text-on-surface-variant">GPS Accuracy</span>
                      <span className="font-bold text-on-surface font-mono">
                        {verificationResult.accuracy_meters > 0 ? `±${verificationResult.accuracy_meters} meters` : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-outline-variant/20">
                      <span className="text-on-surface-variant">Required Perimeter</span>
                      <span className="font-bold text-on-surface font-mono">{hospitalGeofence.radius_meters}m</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-on-surface-variant">Shift Status</span>
                      <span className="font-bold text-outline-variant font-mono">NOT STARTED</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-on-surface-variant italic px-1">
                    Please move inside the hospital clinical perimeter or check location permissions to activate your shift.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-outline-variant/40 bg-surface-container-lowest shrink-0">
          {step === 'DETAILS' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-3 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-start-verification"
                type="button"
                onClick={handleBeginVerification}
                className="flex-2 py-2.5 px-3 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Verify & Start Shift
              </button>
            </div>
          )}

          {step === 'RESULT' && verificationResult && (
            <div>
              {verificationResult.status === 'VERIFIED' ? (
                <button
                  id="btn-activate-shift-final"
                  type="button"
                  onClick={handleConfirmActivation}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_clock</span>
                  Activate Clinical Shift Now
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    id="btn-try-again-start-shift"
                    type="button"
                    onClick={handleTryAgain}
                    className="flex-2 py-2.5 px-3 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
