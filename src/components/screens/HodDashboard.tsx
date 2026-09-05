import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const HodDashboard: React.FC = () => {
  const {
    currentUser,
    hospitalGeofence,
    getDepartmentStudents,
    getDepartmentMentors,
    getDepartmentAlerts,
    getDepartmentVerifications,
    setCurrentScreen,
    setSelectedStudent,
    setSelectedAlert,
    openHodAddMentorModal,
  } = useApp();

  const hodDept = currentUser?.department || 'Physiotherapy';
  const hodName = currentUser?.name || 'Dr. Sarah Mitchell';

  const departmentStudents = getDepartmentStudents(hodDept);
  const departmentMentors = getDepartmentMentors(hodDept);
  const departmentAlerts = getDepartmentAlerts(hodDept);
  const departmentVerifications = getDepartmentVerifications(hodDept);

  const totalStudents = departmentStudents.length;
  const activeInterns = departmentStudents.filter((s) => s.is_active_shift).length;
  const totalMentors = departmentMentors.length;
  const verifiedToday = departmentVerifications.filter(
    (v) => v.status === 'VERIFIED' || v.status === 'REVIEWED'
  ).length;
  const needsAttentionCount = departmentStudents.filter(
    (s) => s.current_status === 'NEEDS ATTENTION'
  ).length;
  const pendingAlerts = departmentAlerts.filter((a) => a.status === 'NEEDS ATTENTION');

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header title="Department Head Oversight" />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* HOD Profile & Department Identity Card */}
        <section
          id="hod-profile-card"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
              }
              alt="HOD Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary block truncate">
                Head of Department
              </span>
              <h2 className="font-bold text-base text-on-surface leading-tight truncate">
                {hodName}
              </h2>
              <p className="text-xs text-on-surface-variant truncate">
                Department: <strong className="text-on-surface">{hodDept}</strong>
              </p>
            </div>
          </div>

          <button
            id="btn-hod-add-mentor"
            onClick={openHodAddMentorModal}
            className="px-3.5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Add Mentor</span>
          </button>
        </section>

        {/* Institutional & Department Geofence Configuration Card */}
        <section
          id="hod-geofence-banner"
          className="bg-gradient-to-r from-primary/10 via-surface-container-low to-secondary/10 border border-primary/30 rounded-2xl p-3.5 shadow-2xs relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-primary text-on-primary text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Hospital Geofence
                </span>
                <span className="text-[11px] font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  {hospitalGeofence.radius_meters}m Perimeter
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  {activeInterns} Active Interns Enforced
                </span>
              </div>
              <h3 className="font-bold text-sm text-on-surface truncate">
                {hospitalGeofence.name}
              </h3>
              <p className="text-[11px] text-on-surface-variant flex items-center gap-1.5 flex-wrap">
                <span className="material-symbols-outlined text-[14px] text-primary">pin_drop</span>
                <span>{hospitalGeofence.latitude.toFixed(4)}° N, {hospitalGeofence.longitude.toFixed(4)}° E</span>
                <span className="text-outline">|</span>
                <span>Zone: <strong className="text-on-surface">{hospitalGeofence.department_zone || hodDept}</strong></span>
                <span className="text-outline">|</span>
                <span>Buffer: ±{hospitalGeofence.tolerance_meters || 15}m</span>
              </p>
            </div>

            <button
              id="btn-hod-config-geofence"
              onClick={() => setCurrentScreen('geofence_setup')}
              className="px-3.5 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Geofence Settings</span>
            </button>
          </div>
        </section>

        {/* 6 Executive Summary Cards (Exact Prompt Requirement) */}
        <section className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <div
            onClick={() => setCurrentScreen('hod_students')}
            className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/50 text-center shadow-2xs cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="text-[9.5px] text-on-surface-variant font-bold uppercase truncate">
              Total Students
            </div>
            <div className="font-mono text-lg font-bold text-on-surface mt-0.5">
              {totalStudents}
            </div>
          </div>

          <div
            onClick={() => setCurrentScreen('hod_students')}
            className="bg-surface-container-lowest p-2.5 rounded-xl border border-primary/30 text-center shadow-2xs cursor-pointer hover:bg-primary/5 transition-colors"
          >
            <div className="text-[9.5px] text-primary font-bold uppercase truncate">
              Active Interns
            </div>
            <div className="font-mono text-lg font-bold text-primary mt-0.5">
              {activeInterns}
            </div>
          </div>

          <div
            onClick={() => setCurrentScreen('hod_mentors')}
            className="bg-surface-container-lowest p-2.5 rounded-xl border border-secondary/30 text-center shadow-2xs cursor-pointer hover:bg-secondary/5 transition-colors"
          >
            <div className="text-[9.5px] text-secondary font-bold uppercase truncate">
              Total Mentors
            </div>
            <div className="font-mono text-lg font-bold text-secondary mt-0.5">
              {totalMentors}
            </div>
          </div>

          <div
            onClick={() => setCurrentScreen('hod_gps_monitoring')}
            className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/50 text-center shadow-2xs cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="text-[9.5px] text-tertiary-container font-bold uppercase truncate">
              Verified Today
            </div>
            <div className="font-mono text-lg font-bold text-tertiary-container mt-0.5">
              {verifiedToday}
            </div>
          </div>

          <div
            onClick={() => setCurrentScreen('hod_alerts')}
            className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/50 text-center shadow-2xs cursor-pointer hover:border-error/40 transition-colors"
          >
            <div className="text-[9.5px] text-amber-700 font-bold uppercase truncate">
              Needs Attention
            </div>
            <div className="font-mono text-lg font-bold text-amber-700 mt-0.5">
              {needsAttentionCount}
            </div>
          </div>

          <div
            onClick={() => setCurrentScreen('hod_alerts')}
            className={`bg-surface-container-lowest p-2.5 rounded-xl border text-center shadow-2xs transition-colors cursor-pointer ${
              pendingAlerts.length > 0
                ? 'border-error/40 bg-error-container/10'
                : 'border-outline-variant/50'
            }`}
          >
            <div className="text-[9.5px] text-error font-bold uppercase truncate">
              Unresolved Alerts
            </div>
            <div className="font-mono text-lg font-bold text-error mt-0.5">
              {pendingAlerts.length}
            </div>
          </div>
        </section>

        {/* Department Modules Navigation Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => setCurrentScreen('hod_students')}
            className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">group</span>
              </div>
              <div>
                <div className="font-bold text-xs text-on-surface">Dept Students</div>
                <div className="text-[10px] text-on-surface-variant">{totalStudents} Interns</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-[16px]">chevron_right</span>
          </button>

          <button
            onClick={() => setCurrentScreen('hod_mentors')}
            className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">school</span>
              </div>
              <div>
                <div className="font-bold text-xs text-on-surface">Dept Mentors</div>
                <div className="text-[10px] text-on-surface-variant">{totalMentors} Faculty</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-[16px]">chevron_right</span>
          </button>

          <button
            onClick={() => setCurrentScreen('hod_gps_monitoring')}
            className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-tertiary-container/10 text-tertiary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">share_location</span>
              </div>
              <div>
                <div className="font-bold text-xs text-on-surface">GPS Monitoring</div>
                <div className="text-[10px] text-on-surface-variant">Telemetry Metrics</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-[16px]">chevron_right</span>
          </button>

          <button
            onClick={() => setCurrentScreen('hod_alerts')}
            className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-error-container/20 text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
              <div>
                <div className="font-bold text-xs text-on-surface">Dept Alerts</div>
                <div className="text-[10px] text-on-surface-variant">{departmentAlerts.length} Events</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-[16px]">chevron_right</span>
          </button>

          <button
            id="btn-hod-module-geofence"
            onClick={() => setCurrentScreen('geofence_setup')}
            className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">share_location</span>
              </div>
              <div>
                <div className="font-bold text-xs text-on-surface">Campus Geofence</div>
                <div className="text-[10px] text-on-surface-variant">{hospitalGeofence.radius_meters}m Perimeter</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-[16px]">chevron_right</span>
          </button>

          <button
            onClick={() => setCurrentScreen('hod_analytics_dashboard')}
            className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs col-span-2 sm:col-span-1"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">analytics</span>
              </div>
              <div>
                <div className="font-bold text-xs text-on-surface">Internship Reports</div>
                <div className="text-[10px] text-on-surface-variant">Attendance & Workload</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-[16px]">chevron_right</span>
          </button>
        </section>

        {/* Faculty Mentors Supervised Roster Preview */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">school</span>
              Faculty Supervision Workload ({departmentMentors.length})
            </h3>
            <button
              onClick={() => setCurrentScreen('hod_mentors')}
              className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              Manage Mentors →
            </button>
          </div>

          <div className="space-y-2">
            {departmentMentors.map((m) => {
              const mentorStudents = departmentStudents.filter((s) => s.mentor_id === m.id);
              const mActive = mentorStudents.filter((s) => s.is_active_shift).length;
              const mAttention = mentorStudents.filter((s) => s.current_status === 'NEEDS ATTENTION').length;

              return (
                <div
                  key={m.id}
                  onClick={() => setCurrentScreen('hod_mentors')}
                  className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between text-xs hover:border-secondary/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                      {m.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-on-surface truncate">{m.name}</div>
                      <div className="text-[11px] text-on-surface-variant font-mono">
                        ID: {m.id} • {m.title}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-on-surface">
                      {mentorStudents.length} Students
                    </div>
                    <div className="text-[10px] text-on-surface-variant">
                      <span className="text-primary font-semibold">{mActive} Active</span>
                      {mAttention > 0 && (
                        <span className="text-error font-bold ml-1.5">({mAttention} alert)</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Department Alert Stream */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-error">warning</span>
              Department Incident Alerts ({departmentAlerts.length})
            </h3>
            <button
              onClick={() => setCurrentScreen('hod_alerts')}
              className="text-xs text-primary font-bold hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>

          <div className="space-y-2">
            {departmentAlerts.map((a) => {
              const isNeedsAtt = a.status === 'NEEDS ATTENTION';

              return (
                <div
                  key={a.id}
                  onClick={() => setCurrentScreen('hod_alerts')}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isNeedsAtt
                      ? 'bg-error-container/10 border-error/40'
                      : 'bg-surface-container-low border-outline-variant/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[18px] shrink-0 ${
                        isNeedsAtt ? 'text-error' : 'text-secondary'
                      }`}
                    >
                      {isNeedsAtt ? 'warning' : 'check_circle'}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-on-surface truncate">
                        {a.student_name} ({a.register_number})
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-mono">
                        Mentor: {a.mentor_name} • {a.time_display}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      isNeedsAtt
                        ? 'bg-error text-on-error animate-pulse'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
