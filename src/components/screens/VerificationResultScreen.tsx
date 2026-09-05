import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

interface VerificationResultScreenProps {
  forceAttention?: boolean;
}

export const VerificationResultScreen: React.FC<VerificationResultScreenProps> = ({
  forceAttention = false,
}) => {
  const {
    currentUser,
    students,
    verifications,
    hospitalGeofence,
    setCurrentScreen,
    switchRoleQuickly,
    setSelectedAlert,
    performGpsVerification,
  } = useApp();

  const student =
    students.find((s) => s.register_number === currentUser?.registerNumber) ||
    students[0];

  const latestVerification = verifications[0];
  const isBreach =
    forceAttention ||
    student.current_status === 'NEEDS ATTENTION' ||
    latestVerification?.status === 'NEEDS ATTENTION';

  const isNoGps =
    !isBreach &&
    (student.current_status === 'GPS UNAVAILABLE' ||
      latestVerification?.status === 'GPS UNAVAILABLE');

  const isPermissionDenied =
    !isBreach &&
    !isNoGps &&
    (student.current_status === 'LOCATION PERMISSION REQUIRED' ||
      latestVerification?.status === 'LOCATION PERMISSION REQUIRED');

  const isVerified = !isBreach && !isNoGps && !isPermissionDenied;

  const timeDisplay = latestVerification?.time_display || '03:42 AM';
  const distance = isBreach ? 850 : isVerified ? 75 : 0;
  const accuracy = isBreach ? 18 : isVerified ? 5 : 0;
  const allowedRadius = hospitalGeofence.radius_meters;

  const handleReviewAsMentor = () => {
    setSelectedAlert('alert_arun_01');
    switchRoleQuickly('MENTOR');
    setCurrentScreen('mentor_review_arun_kumar');
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Presence Verification"
        showBack={true}
        onBack={() => setCurrentScreen('student_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Section 11 Header Block: PRESENCE VERIFICATION */}
        <div className="text-center pt-2">
          <div className="text-[11px] font-mono tracking-widest text-on-surface-variant uppercase font-semibold">
            Presence Verification
          </div>
          <div
            className={`text-2xl font-bold tracking-tight uppercase mt-1 ${
              isBreach
                ? 'text-error'
                : isNoGps
                ? 'text-outline-variant'
                : isPermissionDenied
                ? 'text-secondary-fixed'
                : 'text-tertiary-container'
            }`}
          >
            {isBreach
              ? 'NEEDS ATTENTION'
              : isNoGps
              ? 'GPS UNAVAILABLE'
              : isPermissionDenied
              ? 'LOCATION PERMISSION REQUIRED'
              : 'VERIFIED'}
          </div>
        </div>

        {/* Clinical Result Card matching Section 11 */}
        <section
          id="verification-result-card"
          className={`rounded-2xl p-5 border shadow-sm ${
            isBreach
              ? 'bg-error-container/15 border-error/40'
              : isNoGps
              ? 'bg-surface-variant/30 border-outline'
              : isPermissionDenied
              ? 'bg-secondary-container/20 border-secondary'
              : 'bg-tertiary-container/15 border-tertiary-container/40'
          }`}
        >
          {/* Status Icon */}
          <div
            className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-xs mb-3 ${
              isBreach
                ? 'bg-error text-on-error'
                : isNoGps
                ? 'bg-surface-variant text-on-surface'
                : isPermissionDenied
                ? 'bg-secondary text-on-secondary'
                : 'bg-tertiary-container text-on-tertiary'
            }`}
          >
            <span className="material-symbols-outlined text-3xl fill">
              {isBreach ? 'warning' : isNoGps ? 'location_off' : isPermissionDenied ? 'block' : 'verified'}
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 text-xs space-y-2 mb-3">
            <div className="flex justify-between items-center py-0.5 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">Time:</span>
              <span className="font-mono font-bold text-on-surface">{timeDisplay}</span>
            </div>

            {isBreach || isVerified ? (
              <>
                <div className="flex justify-between items-center py-0.5 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant font-medium">Distance:</span>
                  <span
                    className={`font-mono font-bold ${
                      isBreach ? 'text-error' : 'text-primary'
                    }`}
                  >
                    {distance} m
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant font-medium">Allowed radius:</span>
                  <span className="font-mono font-bold text-on-surface">{allowedRadius} m</span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="text-on-surface-variant font-medium">GPS Accuracy:</span>
                  <span className="font-mono font-semibold text-secondary">{accuracy} m</span>
                </div>
              </>
            ) : null}
          </div>

          {/* Prompt Section 11 exact message format */}
          <div
            className={`p-3 rounded-xl text-xs font-medium border ${
              isBreach
                ? 'bg-error/10 text-error border-error/30'
                : isNoGps
                ? 'bg-surface text-on-surface-variant border-outline-variant/40'
                : isPermissionDenied
                ? 'bg-secondary-container/30 text-on-secondary-container border-secondary/30'
                : 'bg-tertiary-container/20 text-on-tertiary-container border-tertiary-container/30'
            }`}
          >
            <div className="font-semibold mb-0.5">Message:</div>
            {isBreach && (
              <>
                <p>"Your current location could not be verified within the hospital geofence."</p>
                <div className="mt-2 text-[11px] text-error/90 font-normal">
                  • The event has been recorded in the clinical telemetry database.<br />
                  • The student's mentor ({student.mentor_name}) receives an alert.
                </div>
              </>
            )}
            {isVerified && (
              <p>"Your physical presence within the hospital perimeter has been verified."</p>
            )}
            {isNoGps && (
              <p>"Unable to acquire accurate GPS fix. Please ensure location services are enabled."</p>
            )}
            {isPermissionDenied && (
              <p>"Location permission is required to verify your presence at the hospital."</p>
            )}
          </div>
        </section>

        {/* Student & Shift Info Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-xs text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Student:</span>
            <span className="font-bold text-on-surface">{student.name} ({student.register_number})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Department:</span>
            <span className="text-on-surface font-medium">{student.department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Assigned Shift:</span>
            <span className="text-primary font-semibold">{student.shift_time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Assigned Mentor:</span>
            <span className="text-on-surface font-medium">{student.mentor_name}</span>
          </div>
        </section>

        {/* Action CTAs */}
        <section className="space-y-2 pt-1">
          {isBreach && currentUser?.role !== 'STUDENT' && (
            <button
              id="btn-goto-mentor-review"
              onClick={handleReviewAsMentor}
              className="w-full bg-error text-on-error rounded-xl py-3.5 font-bold text-sm hover:bg-error-container hover:text-on-error-container transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[48px] active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px] fill">fact_check</span>
              View as Mentor ({student.mentor_name})
            </button>
          )}

          {isBreach && (
            <button
              id="btn-try-again-verification"
              onClick={async () => {
                const res = await performGpsVerification(undefined, undefined, 'MANUAL');
                if (res.status === 'VERIFIED') {
                  setCurrentScreen('verification_result');
                }
              }}
              className="w-full bg-primary text-on-primary rounded-xl py-3.5 font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[48px] active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Try Again
            </button>
          )}

          <button
            id="btn-return-shift-screen"
            onClick={() => setCurrentScreen('active_shift')}
            className={`w-full rounded-xl py-3 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
              isBreach
                ? 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/50'
                : 'bg-primary text-on-primary shadow-xs hover:bg-primary/90'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">radar</span>
            Return to Active Shift Monitor
          </button>

          <button
            id="btn-goto-student-dashboard"
            onClick={() => setCurrentScreen('student_dashboard')}
            className="w-full bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant/50 rounded-xl py-2.5 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Back to Student Dashboard
          </button>
        </section>
      </main>
    </div>
  );
};
