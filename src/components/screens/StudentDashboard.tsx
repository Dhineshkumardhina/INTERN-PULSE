import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    openStartShiftModal,
    openCheckOutModal,
    triggerRandomVerificationPrompt,
    setCurrentScreen,
    verifications,
    hospitalGeofence,
    gpsMode,
    isVerifying,
    attendanceRecords,
  } = useApp();

  const regNo = currentUser?.registerNumber || '23UCCT001';
  const student = students.find((s) => s.register_number === regNo) || students[0];

  const studentVerifications = verifications
    .filter((v) => v.register_number === student.register_number)
    .slice(0, 4);

  const recentVerification = studentVerifications[0] || null;

  // Calculate dynamic greeting based on hour
  const currentHour = new Date().getHours();
  let greeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good Afternoon';
  } else if (currentHour >= 17 || currentHour < 4) {
    greeting = 'Good Evening';
  }

  // Determine current shift status badge
  const shiftStatus = student.is_active_shift
    ? 'ACTIVE'
    : student.shift_status === 'COMPLETED'
    ? 'COMPLETED'
    : 'NOT STARTED';

  // Compute live GPS status text and badge
  const getGpsStateInfo = () => {
    if (isVerifying) {
      return {
        label: 'VERIFYING',
        color: 'bg-primary/10 text-primary border-primary/20',
        dot: 'bg-primary animate-ping',
        description: 'GPS verification is currently being processed.',
      };
    }
    if (gpsMode === 'PERMISSION_DENIED') {
      return {
        label: 'PERMISSION DENIED',
        color: 'bg-surface-variant text-on-surface-variant border-outline',
        dot: 'bg-slate-400',
        description: 'Location permission is not available.',
      };
    }
    if (gpsMode === 'GPS_UNAVAILABLE') {
      return {
        label: 'GPS UNAVAILABLE',
        color: 'bg-surface-variant text-on-surface-variant border-outline',
        dot: 'bg-slate-400',
        description: 'Device location cannot currently be obtained.',
      };
    }
    if (gpsMode === 'LOW_ACCURACY') {
      return {
        label: 'LOW ACCURACY',
        color: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
        dot: 'bg-amber-500',
        description: 'Location obtained but accuracy is insufficient (±65m).',
      };
    }
    if (student.current_status === 'NEEDS ATTENTION' || gpsMode === 'OUTSIDE_HOSPITAL') {
      return {
        label: 'NEEDS ATTENTION',
        color: 'bg-amber-500/10 text-amber-800 border-amber-500/30',
        dot: 'bg-amber-600 animate-pulse',
        description: 'Student is outside the geofence or verification requires review.',
      };
    }
    return {
      label: 'VERIFIED',
      color: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30',
      dot: 'bg-emerald-500',
      description: 'Student is within the configured hospital geofence.',
    };
  };

  const gpsState = getGpsStateInfo();

  // Find today's attendance record
  const todayAttendance = attendanceRecords.find(
    (r) => r.register_number === student.register_number
  );

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header title="Student Portal" />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Header Greeting & Identity */}
        <section
          id="student-header-greeting"
          className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/50 shadow-2xs"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-secondary block">
                {greeting},
              </span>
              <h1 className="text-lg font-bold text-on-surface leading-snug truncate">
                {student.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md">
                  Reg No: {student.register_number}
                </span>
                <span className="text-outline-variant">•</span>
                <span className="text-xs text-on-surface-variant truncate">
                  {student.department}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('student_profile')}
              title="View Internship Profile"
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 cursor-pointer hover:border-primary transition-colors"
            >
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  AK
                </div>
              )}
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-outline-variant/30 flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Internship Status</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {student.internship_status || 'Active Clinical Internship'}
            </span>
          </div>
        </section>

        {/* Card 1: Today's Shift Card */}
        <section
          id="today-shift-card"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">clinical_notes</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Today's Assigned Shift
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                shiftStatus === 'ACTIVE'
                  ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                  : shiftStatus === 'COMPLETED'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-surface-container text-on-surface-variant border border-outline-variant'
              }`}
            >
              {shiftStatus}
            </span>
          </div>

          {/* Shift Details */}
          <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/40 space-y-2 text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-on-surface-variant">Department</span>
              <span className="font-bold text-on-surface">{student.department}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-on-surface-variant">Shift Window</span>
              <span className="font-bold text-primary font-mono">{student.shift_name} ({student.shift_time})</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-on-surface-variant">Clinical Mentor</span>
              <span className="font-bold text-on-surface">{student.mentor_name}</span>
            </div>
            <div className="flex justify-between items-start py-0.5">
              <span className="text-on-surface-variant">Host Hospital</span>
              <span className="font-medium text-on-surface text-right max-w-[180px] truncate">
                {student.hospital}
              </span>
            </div>
          </div>

          {/* Main Actions based on shift state */}
          <div className="space-y-2 pt-1">
            {!student.is_active_shift ? (
              <button
                id="btn-start-shift-dashboard"
                type="button"
                onClick={openStartShiftModal}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                START SHIFT
              </button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-verify-presence-dashboard"
                    type="button"
                    onClick={() => triggerRandomVerificationPrompt()}
                    className="py-2.5 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                  >
                    <span className="material-symbols-outlined text-[18px]">share_location</span>
                    VERIFY PRESENCE
                  </button>

                  <button
                    id="btn-checkout-dashboard"
                    type="button"
                    onClick={openCheckOutModal}
                    className="py-2.5 px-3 rounded-xl bg-error/10 hover:bg-error/15 text-error border border-error/25 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    CHECK OUT
                  </button>
                </div>

                <button
                  id="btn-open-active-shift-screen"
                  type="button"
                  onClick={() => setCurrentScreen('active_shift')}
                  className="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">radar</span>
                  Open Active Shift Monitor
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Card 2: Current Shift Card (Continuous Cross-Midnight Duty) */}
        <section
          id="shift-protocol-card"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Duty Schedule & Rotation
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary/10 text-secondary">
              Cross-Midnight Duty
            </span>
          </div>

          <p className="text-xs text-on-surface leading-relaxed">
            Your night clinical rotation runs from <strong>10:00 PM</strong> across midnight until <strong>06:00 AM</strong>. Attendance is consolidated into one continuous rotation record.
          </p>

          <div className="bg-surface-container-low rounded-xl p-2.5 border border-outline-variant/30 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant block">Shift Commencement</span>
              <span className="font-bold text-on-surface font-mono">10:02 PM</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">Active Timer</span>
              <span className="font-bold text-primary font-mono">
                {student.is_active_shift ? '05h 42m elapsed' : 'Duty Inactive'}
              </span>
            </div>
          </div>
        </section>

        {/* Card 3: GPS Status Card */}
        <section
          id="gps-status-card"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">satellite_alt</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                GPS Verification Status
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1.5 ${gpsState.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${gpsState.dot}`}></span>
              {gpsState.label}
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            {gpsState.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low rounded-xl p-3 border border-outline-variant/30">
            <div>
              <span className="text-[10px] text-on-surface-variant block">Hospital Geofence</span>
              <span className="font-bold text-on-surface font-mono">{hospitalGeofence.radius_meters}m Perimeter</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">Current Accuracy</span>
              <span className="font-bold text-on-surface font-mono">±{student.last_verification_accuracy || 12} meters</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">Current Distance</span>
              <span className="font-bold text-on-surface font-mono">{student.last_verification_distance || 42}m from Center</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">GPS Protocol</span>
              <span className="font-bold text-emerald-700 font-mono">Clinical High Precision</span>
            </div>
          </div>
        </section>

        {/* Card 4: Recent Verification Card */}
        <section
          id="recent-verification-card"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Recent GPS Checks
            </h3>
            <button
              id="btn-view-gps-history"
              type="button"
              onClick={() => setCurrentScreen('gps_history')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View Full History</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>

          {recentVerification ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      recentVerification.status === 'VERIFIED'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : recentVerification.status === 'NEEDS ATTENTION'
                        ? 'bg-amber-500/10 text-amber-700'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {recentVerification.status === 'VERIFIED' ? 'verified' : 'warning'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-on-surface font-mono">
                      {recentVerification.time_display}
                    </div>
                    <div className="text-[10px] text-on-surface-variant truncate">
                      Dist: {recentVerification.distance_meters}m • Acc: ±{recentVerification.accuracy_meters}m
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    recentVerification.status === 'VERIFIED'
                      ? 'bg-emerald-500/10 text-emerald-700'
                      : 'bg-amber-500/10 text-amber-800'
                  }`}
                >
                  {recentVerification.status}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant italic">No verification records logged yet.</p>
          )}

          {/* Quick link to Attendance */}
          <button
            type="button"
            onClick={() => setCurrentScreen('student_attendance')}
            className="w-full py-2.5 px-3 rounded-xl border border-outline-variant/50 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">event_available</span>
            View Attendance Records ({todayAttendance ? 'Logged' : 'Pending'})
          </button>
        </section>
      </main>
    </div>
  );
};
