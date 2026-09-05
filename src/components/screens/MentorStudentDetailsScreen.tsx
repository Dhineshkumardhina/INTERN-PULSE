import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const MentorStudentDetailsScreen: React.FC = () => {
  const {
    students,
    selectedStudentRegisterNumber,
    verifications,
    attendanceRecords,
    alerts,
    currentUser,
    setCurrentScreen,
    setSelectedAlert,
    markAlertAsReviewed,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTENDANCE' | 'GPS' | 'ALERTS'>('OVERVIEW');
  const [attendancePeriod, setAttendancePeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [gpsFilter, setGpsFilter] = useState<string>('ALL');

  const regNo = selectedStudentRegisterNumber || '23UCCT001';
  const student = students.find((s) => s.register_number === regNo) || students[0];

  // RBAC Data Isolation Check: Verify mentor / HOD scope permissions
  const isAuthorized = (() => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'HOD') {
      return student.department.toLowerCase().trim() === currentUser.department.toLowerCase().trim();
    }
    if (currentUser.role === 'MENTOR') {
      return student.mentor_id === currentUser.id;
    }
    return false;
  })();

  const studentVerifications = verifications.filter((v) => v.register_number === student.register_number);
  const studentAttendance = attendanceRecords.filter((r) => r.register_number === student.register_number);
  const studentAlerts = alerts.filter((a) => a.register_number === student.register_number);

  // Attendance filtering
  const filteredAttendance = studentAttendance.filter((rec) => {
    if (attendancePeriod === 'DAILY') {
      return rec.date_display.includes('05 Sep');
    }
    if (attendancePeriod === 'WEEKLY') {
      return rec.period_group === 'THIS_WEEK';
    }
    return true; // MONTHLY or full period
  });

  // GPS Log filtering
  const filteredGpsLogs = studentVerifications.filter((v) => {
    if (gpsFilter === 'ALL') return true;
    return v.status === gpsFilter;
  });

  const totalChecks = studentVerifications.length;
  const verifiedChecks = studentVerifications.filter((v) => v.status === 'VERIFIED' || v.status === 'REVIEWED').length;
  const complianceRate = totalChecks > 0 ? Math.round((verifiedChecks / totalChecks) * 100) : 100;

  const handleReviewFromAlertTab = (alertId: string) => {
    setSelectedAlert(alertId);
    setCurrentScreen('mentor_review_arun_kumar');
  };

  if (!isAuthorized) {
    return (
      <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
        <Header
          title="Access Denied"
          showBack={true}
          onBack={() => setCurrentScreen(currentUser?.role === 'HOD' ? 'hod_dashboard' : 'mentor_dashboard')}
        />
        <main className="p-4 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-3xl">gpp_bad</span>
          </div>
          <h2 className="text-base font-bold text-on-surface">Data Isolation Restricted</h2>
          <p className="text-xs text-on-surface-variant max-w-xs mt-1">
            You do not have supervisory permission to inspect dossier records for student{' '}
            <span className="font-semibold text-on-surface">{student.name}</span> ({student.register_number}).
          </p>
          <button
            onClick={() => setCurrentScreen(currentUser?.role === 'HOD' ? 'hod_dashboard' : 'mentor_dashboard')}
            className="mt-5 px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Return to Dashboard
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Student Clinical Dossier"
        showBack={true}
        onBack={() => setCurrentScreen(currentUser?.role === 'HOD' ? 'hod_dashboard' : 'mentor_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Student Dossier Header Card */}
        <section
          id="student-header-dossier"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={
                  student.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={student.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
                  Allied Health Intern
                </span>
                <h2 className="font-bold text-base text-on-surface truncate">{student.name}</h2>
                <div className="text-xs text-on-surface-variant font-mono">
                  <span className="font-bold text-primary">{student.register_number}</span> •{' '}
                  <span>{student.department}</span>
                </div>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                student.is_active_shift
                  ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 animate-pulse'
                  : student.current_status === 'NEEDS ATTENTION'
                  ? 'bg-error-container text-error'
                  : 'bg-surface-container text-on-surface-variant border border-outline-variant/40'
              }`}
            >
              {student.is_active_shift ? 'SHIFT ACTIVE' : student.current_status}
            </span>
          </div>

          {/* Key Facts Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-outline-variant/30 text-xs">
            <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
              <span className="text-[10px] text-on-surface-variant block">Academic Year</span>
              <span className="font-semibold text-on-surface truncate block">
                {student.academic_year || 'Final Year (2025–2026)'}
              </span>
            </div>

            <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
              <span className="text-[10px] text-on-surface-variant block">Assigned Mentor</span>
              <span className="font-semibold text-secondary truncate block">
                {student.mentor_name}
              </span>
            </div>

            <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
              <span className="text-[10px] text-on-surface-variant block">Current Shift</span>
              <span className="font-semibold text-primary truncate block">{student.shift_name}</span>
            </div>

            <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
              <span className="text-[10px] text-on-surface-variant block">GPS Compliance</span>
              <span className="font-mono font-bold text-emerald-700 truncate block">
                {complianceRate}% Verified
              </span>
            </div>
          </div>
        </section>

        {/* 4 Tabs: Overview, Attendance, GPS Verification, Alerts */}
        <div className="flex border-b border-outline-variant/40 gap-1 text-xs">
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: 'badge' },
            { id: 'ATTENDANCE', label: 'Attendance', icon: 'event_available' },
            { id: 'GPS', label: 'GPS Log', icon: 'share_location' },
            { id: 'ALERTS', label: `Alerts (${studentAlerts.length})`, icon: 'warning' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-1 text-center font-bold flex items-center justify-center gap-1 transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <section className="space-y-3 animate-in fade-in">
            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">clinical_notes</span>
                Clinical Internship Profile
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Internship Unit:</span>
                  <span className="font-bold text-on-surface">
                    {student.internship_department || 'Physiotherapy & Rehabilitation'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Hospital Facility:</span>
                  <span className="font-semibold text-on-surface">{student.hospital}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Internship Dates:</span>
                  <span className="font-mono text-on-surface">
                    {student.internship_start_date || '01 Aug 2026'} –{' '}
                    {student.internship_end_date || '31 Jan 2027'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Email Contact:</span>
                  <span className="font-mono text-primary">{student.email || 'student@ahs.edu'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Phone:</span>
                  <span className="font-mono text-on-surface">{student.phone || '+91 98401 23456'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-on-surface-variant">Assigned Duty Window:</span>
                  <span className="font-mono font-bold text-primary">{student.shift_time}</span>
                </div>
              </div>
            </div>

            {/* Shift Duty Schedule Slots */}
            {student.schedules && student.schedules.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-2.5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
                  Assigned Duty Rosters
                </h3>
                <div className="space-y-2">
                  {student.schedules.map((sch) => (
                    <div
                      key={sch.id}
                      className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-on-surface">{sch.title}</div>
                        <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                          {sch.time_label}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                        {sch.category.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: ATTENDANCE (Daily, Weekly, Monthly) */}
        {activeTab === 'ATTENDANCE' && (
          <section className="space-y-3 animate-in fade-in">
            {/* Period Filter Toggle */}
            <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/30">
              {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setAttendancePeriod(period)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    attendancePeriod === period
                      ? 'bg-surface text-primary shadow-2xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {period === 'DAILY' ? 'Daily' : period === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                </button>
              ))}
            </div>

            {/* Attendance List */}
            <div className="space-y-2.5">
              {filteredAttendance.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center space-y-1">
                  <span className="material-symbols-outlined text-outline-variant text-[28px]">
                    event_busy
                  </span>
                  <p className="text-xs text-on-surface-variant">No attendance records for this period.</p>
                </div>
              ) : (
                filteredAttendance.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-on-surface">{rec.date_display}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-secondary/10 text-secondary uppercase">
                            {rec.shift_name}
                          </span>
                        </div>
                        <div className="text-xs text-on-surface-variant font-mono mt-0.5">
                          Check-in: <strong className="text-on-surface">{rec.start_time}</strong> • Check-out:{' '}
                          <strong className="text-on-surface">{rec.end_time}</strong>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                          rec.status.includes('REVIEWED')
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : rec.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-outline-variant/20 text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">
                          verified
                        </span>
                        <span>
                          {rec.verified_checks}/{rec.total_checks} GPS Verifications
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-mono font-bold text-on-surface">
                        <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                        <span>{rec.hours_logged}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* TAB 3: GPS VERIFICATION */}
        {activeTab === 'GPS' && (
          <section className="space-y-3 animate-in fade-in">
            {/* Filter Pills */}
            <div className="flex gap-1 text-xs overflow-x-auto pb-0.5">
              {['ALL', 'VERIFIED', 'NEEDS ATTENTION', 'REVIEWED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setGpsFilter(f)}
                  className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-colors shrink-0 cursor-pointer ${
                    gpsFilter === f
                      ? 'bg-primary text-on-primary shadow-2xs'
                      : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* GPS Events List */}
            <div className="space-y-2.5">
              {filteredGpsLogs.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center text-xs text-on-surface-variant">
                  No GPS verification telemetry matching "{gpsFilter}".
                </div>
              ) : (
                filteredGpsLogs.map((log) => {
                  const isBreach = log.status === 'NEEDS ATTENTION';
                  const isReviewed = log.status === 'REVIEWED';

                  return (
                    <div
                      key={log.id}
                      className={`bg-surface-container-lowest rounded-xl p-3.5 border shadow-2xs transition-all space-y-2.5 ${
                        isBreach
                          ? 'border-error/40 bg-error-container/5'
                          : isReviewed
                          ? 'border-secondary/40'
                          : 'border-outline-variant/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              isBreach
                                ? 'bg-error-container text-error'
                                : isReviewed
                                ? 'bg-secondary/15 text-secondary'
                                : 'bg-emerald-500/15 text-emerald-700'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isBreach ? 'warning' : isReviewed ? 'fact_check' : 'check'}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                              <span className="font-mono">{log.time_display}</span>
                              <span className="text-[10px] text-on-surface-variant">
                                ({log.verification_type.replace('_', ' ')})
                              </span>
                            </div>
                            <div className="text-[10px] text-secondary font-medium">
                              Shift: {student.shift_name}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            isBreach
                              ? 'bg-error text-on-error animate-pulse'
                              : isReviewed
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/30'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>

                      {/* Distance & GPS Accuracy */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
                        <div>
                          <span className="text-[10px] text-on-surface-variant block">Distance</span>
                          <span
                            className={`font-mono font-bold ${
                              isBreach ? 'text-error' : 'text-emerald-700'
                            }`}
                          >
                            {log.distance_meters} meters
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-on-surface-variant block">GPS Accuracy</span>
                          <span className="font-mono font-bold text-on-surface">
                            ±{log.accuracy_meters} meters
                          </span>
                        </div>
                      </div>

                      {isReviewed && log.review_details && (
                        <div className="bg-secondary/10 rounded-lg p-2 text-[11px] text-secondary border border-secondary/20">
                          <div className="font-bold">Endorsed by {log.review_details.reviewer_name}</div>
                          <p className="italic text-on-surface-variant mt-0.5">
                            "{log.review_details.review_notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* TAB 4: ALERTS & CONTEXTUAL TIMELINE */}
        {activeTab === 'ALERTS' && (
          <section className="space-y-3 animate-in fade-in">
            {studentAlerts.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center space-y-1">
                <span className="material-symbols-outlined text-emerald-600 text-[32px]">
                  verified_user
                </span>
                <p className="text-xs font-bold text-on-surface">No Unresolved GPS Alerts</p>
                <p className="text-[11px] text-on-surface-variant">
                  All presence verifications meet institutional geofence compliance standards.
                </p>
              </div>
            ) : (
              studentAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="bg-surface-container-lowest rounded-2xl p-4 border border-error/40 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-error tracking-wider block">
                        Presence Verification Event
                      </span>
                      <h4 className="font-bold text-sm text-on-surface">{alt.student_name}</h4>
                      <p className="text-xs text-on-surface-variant font-mono">
                        Triggered at: <strong>{alt.time_display}</strong>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        alt.status === 'REVIEWED'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-error text-on-error animate-pulse'
                      }`}
                    >
                      {alt.status}
                    </span>
                  </div>

                  <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs space-y-1">
                    <div className="font-semibold text-error">{alt.reason}</div>
                    <div className="text-on-surface-variant text-[11px]">
                      Recorded Distance: <strong className="font-mono">{alt.distance_meters}m</strong> •
                      Accuracy: <strong className="font-mono">±{alt.accuracy_meters}m</strong>
                    </div>
                  </div>

                  {/* Contextual Shift Timeline Box */}
                  <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/40 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">timeline</span>
                      Contextual Shift Timeline (Non-punitive view)
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                        <span className="font-mono font-bold text-on-surface">10:02 PM</span>
                        <span className="text-emerald-700 font-semibold">VERIFIED (Check-in, 42m)</span>
                      </div>
                      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                        <span className="font-mono font-bold text-on-surface">11:31 PM</span>
                        <span className="text-emerald-700 font-semibold">VERIFIED (Ward duty, 35m)</span>
                      </div>
                      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                        <span className="font-mono font-bold text-on-surface">01:18 AM</span>
                        <span className="text-emerald-700 font-semibold">VERIFIED (Scheduled, 28m)</span>
                      </div>
                      <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20 bg-error/10 p-1 rounded-md text-error font-bold">
                        <span className="font-mono">03:42 AM</span>
                        <span>NEEDS ATTENTION (420m, 18m acc)</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700 font-semibold">
                        <span className="font-mono font-bold text-on-surface">05:58 AM</span>
                        <span>VERIFIED (Scheduled, 38m)</span>
                      </div>
                    </div>
                  </div>

                  {alt.status === 'NEEDS ATTENTION' ? (
                    <button
                      onClick={() => handleReviewFromAlertTab(alt.id)}
                      className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[40px]"
                    >
                      <span className="material-symbols-outlined text-[18px]">fact_check</span>
                      <span>Review & Endorse Incident [ MARK AS REVIEWED ]</span>
                    </button>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-xs text-secondary">
                      <div className="font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Reviewed by {alt.reviewed_by} at {alt.reviewed_at}
                      </div>
                      <p className="italic text-on-surface-variant mt-1">"{alt.review_notes}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
};
