import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GpsSimulationMode, UserRole } from '../../types';

export const SimulationBar: React.FC = () => {
  const {
    currentUser,
    gpsMode,
    setGpsMode,
    switchRoleQuickly,
    runDemonstrationStep,
    triggerRandomVerificationPrompt,
    alerts,
    currentScreen,
    setCurrentScreen,
    hospitalGeofence,
  } = useApp();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!currentUser || currentScreen === 'login') return null;

  const activeAlertsCount = alerts.filter((a) => a.status === 'NEEDS ATTENTION').length;

  return (
    <>
      {/* Discrete Floating Toggle Button - Anchored to mobile viewport shell */}
      <div className="fixed bottom-18 left-1/2 -translate-x-1/2 w-full max-w-md pointer-events-none z-40 flex justify-end px-3.5">
        <button
          id="btn-open-simulation-panel"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface hover:bg-inverse-surface rounded-full shadow-lg border border-outline/30 text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
          title="Open Prototype Scenario Simulator"
        >
          <span className="material-symbols-outlined text-[16px] text-tertiary-fixed fill animate-pulse">
            satellite_alt
          </span>
          <span>Simulator</span>
          {activeAlertsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
          )}
        </button>
      </div>

      {/* Slide-Up Mobile Simulation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-inverse-surface text-inverse-on-surface w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-outline/40 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-3.5 bg-primary text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-tertiary-fixed fill">
                  satellite_alt
                </span>
                <div>
                  <h3 className="font-bold text-sm text-on-primary">
                    CLINICAL SCENARIO SIMULATOR
                  </h3>
                  <p className="text-[10px] text-primary-fixed-dim uppercase tracking-wider font-semibold">
                    Interactive Prototype Controls
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close simulator"
                className="text-on-primary/80 hover:text-on-primary p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 space-y-4 overflow-y-auto text-xs">
              {/* Geofence Perimeter Quick Launcher (Mentor, HOD, and Admin only) */}
              {currentUser?.role !== 'STUDENT' && (
                <div className="bg-primary/20 border border-primary/40 rounded-xl p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                        share_location
                      </span>
                      <span className="font-bold text-inverse-on-surface">Hospital Geofence</span>
                      <span className="text-[10px] font-mono font-bold bg-primary text-on-primary px-1.5 py-0.2 rounded">
                        {hospitalGeofence.radius_meters}m
                      </span>
                    </div>
                    <p className="text-[10px] text-outline-variant">
                      Boundary coordinates & radar perimeter calibration
                    </p>
                  </div>
                  <button
                    id="btn-simulator-set-geofence"
                    onClick={() => {
                      setCurrentScreen('geofence_setup');
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary/90 transition-all cursor-pointer text-xs flex items-center gap-1 shadow-xs"
                  >
                    <span>Set Geofence</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              )}

              {/* Guided Demonstration Steps */}
              <div>
                <div className="text-[10px] uppercase font-bold text-outline-variant tracking-wider mb-2 flex justify-between items-center">
                  <span>Examiner Test Scenarios (Prompt Section 7 & 8)</span>
                  <span className="text-[9px] text-tertiary-fixed">Tap to simulate</span>
                </div>
                <div className="space-y-1.5">
                  <button
                    id="btn-demo-scenario-a"
                    onClick={() => {
                      setGpsMode('INSIDE_HOSPITAL');
                      runDemonstrationStep('NORMAL_VERIFIED');
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-surface/10 hover:bg-surface/20 border border-outline/20 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-primary-fixed-dim">
                        check_circle
                      </span>
                      <span className="font-medium text-inverse-on-surface">
                        A. Inside Hospital (75m)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-tertiary-fixed bg-tertiary-container/30 px-2 py-0.5 rounded">
                      VERIFIED
                    </span>
                  </button>

                  <button
                    id="btn-demo-scenario-b"
                    onClick={() => {
                      setGpsMode('OUTSIDE_HOSPITAL');
                      triggerRandomVerificationPrompt('03:42 AM');
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-error-container/20 hover:bg-error-container/30 border border-error/40 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-error">
                        warning
                      </span>
                      <span className="font-medium text-error-container font-semibold">
                        B. Outside Hospital (850m)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-error bg-error/20 px-2 py-0.5 rounded">
                      NEEDS ATTENTION
                    </span>
                  </button>

                  <button
                    id="btn-demo-scenario-c"
                    onClick={() => {
                      setGpsMode('GPS_UNAVAILABLE');
                      runDemonstrationStep('GPS_UNAVAILABLE');
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-surface/10 hover:bg-surface/20 border border-outline/20 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-outline-variant">
                        location_off
                      </span>
                      <span className="font-medium text-inverse-on-surface">
                        C. GPS Unavailable
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-outline-variant bg-surface-variant/30 px-2 py-0.5 rounded">
                      NO SIGNAL
                    </span>
                  </button>

                  <button
                    id="btn-demo-scenario-d"
                    onClick={() => {
                      setGpsMode('PERMISSION_DENIED');
                      runDemonstrationStep('PERMISSION_DENIED');
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-surface/10 hover:bg-surface/20 border border-outline/20 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
                        block
                      </span>
                      <span className="font-medium text-inverse-on-surface">
                        D. Location Permission Denied
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-secondary-fixed bg-secondary-container/30 px-2 py-0.5 rounded">
                      PERMISSION REQUIRED
                    </span>
                  </button>

                  <button
                    id="btn-demo-mentor-review"
                    onClick={() => {
                      runDemonstrationStep('REVIEW_ALERT');
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-surface/10 hover:bg-surface/20 border border-outline/20 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
                        fact_check
                      </span>
                      <span className="font-medium text-inverse-on-surface">
                        E. Mentor Review Arun's Alert (03:42 AM)
                      </span>
                    </div>
                    {activeAlertsCount > 0 ? (
                      <span className="bg-error text-on-error text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {activeAlertsCount} Pending
                      </span>
                    ) : (
                      <span className="text-[10px] text-outline-variant">Resolved</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Simulated GPS Geofence State */}
              <div>
                <div className="text-[10px] uppercase font-bold text-outline-variant tracking-wider mb-2">
                  Active GPS Condition Preset ({hospitalGeofence.radius_meters}m Perimeter)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <button
                    id="gps-mode-inside"
                    onClick={() => setGpsMode('INSIDE_HOSPITAL')}
                    className={`p-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      gpsMode === 'INSIDE_HOSPITAL'
                        ? 'bg-tertiary-container text-tertiary-fixed ring-1 ring-tertiary-fixed'
                        : 'bg-surface/10 text-outline-variant hover:bg-surface/15'
                    }`}
                  >
                    Inside Hospital (42m)
                  </button>
                  <button
                    id="gps-mode-outside"
                    onClick={() => setGpsMode('OUTSIDE_HOSPITAL')}
                    className={`p-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      gpsMode === 'OUTSIDE_HOSPITAL'
                        ? 'bg-error text-on-error ring-1 ring-error-container'
                        : 'bg-surface/10 text-outline-variant hover:bg-surface/15'
                    }`}
                  >
                    Outside (420m Breach)
                  </button>
                  <button
                    id="gps-mode-low-accuracy"
                    onClick={() => setGpsMode('LOW_ACCURACY')}
                    className={`p-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      gpsMode === 'LOW_ACCURACY'
                        ? 'bg-amber-600 text-white ring-1 ring-amber-400'
                        : 'bg-surface/10 text-outline-variant hover:bg-surface/15'
                    }`}
                  >
                    Low Accuracy (±65m)
                  </button>
                  <button
                    id="gps-mode-unavailable"
                    onClick={() => setGpsMode('GPS_UNAVAILABLE')}
                    className={`p-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                      gpsMode === 'GPS_UNAVAILABLE'
                        ? 'bg-surface-variant text-on-surface ring-1 ring-outline'
                        : 'bg-surface/10 text-outline-variant hover:bg-surface/15'
                    }`}
                  >
                    GPS Unavailable
                  </button>
                  <button
                    id="gps-mode-denied"
                    onClick={() => setGpsMode('PERMISSION_DENIED')}
                    className={`p-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                      gpsMode === 'PERMISSION_DENIED'
                        ? 'bg-secondary-container text-on-secondary-container ring-1 ring-secondary'
                        : 'bg-surface/10 text-outline-variant hover:bg-surface/15'
                    }`}
                  >
                    Permission Denied
                  </button>
                </div>
              </div>

              {/* Switch Role Quickly */}
              <div>
                <div className="text-[10px] uppercase font-bold text-outline-variant tracking-wider mb-2">
                  Switch Active User Role
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['STUDENT', 'MENTOR', 'HOD', 'ADMIN'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        switchRoleQuickly(role);
                        setIsOpen(false);
                      }}
                      className={`py-2 px-1 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                        currentUser?.role === role
                          ? 'bg-primary text-on-primary ring-1 ring-primary-fixed'
                          : 'bg-surface/10 text-outline-variant hover:bg-surface/20'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Immediate Prompt Trigger */}
              <div className="pt-2 border-t border-outline/20">
                <button
                  id="btn-trigger-prompt-now"
                  onClick={() => {
                    triggerRandomVerificationPrompt('03:42 AM');
                    setIsOpen(false);
                  }}
                  className="w-full py-2.5 bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">notification_important</span>
                  Trigger 03:42 AM Verification Prompt Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
