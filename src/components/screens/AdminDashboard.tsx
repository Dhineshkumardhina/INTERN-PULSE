import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const AdminDashboard: React.FC = () => {
  const {
    students,
    mentors,
    hods,
    shifts,
    alerts,
    verifications,
    attendanceRecords,
    activityLogs,
    hospitalGeofence,
    setCurrentScreen,
    setSelectedStudent,
  } = useApp();

  const totalStudentsCount = students.length;
  const activeInternsCount = students.filter((s) => s.is_active_shift).length;
  const totalMentorsCount = mentors.length;
  const totalHodsCount = hods.length;
  const activeShiftsCount = shifts.length;
  const needsAttentionCount = alerts.filter((a) => a.status === 'NEEDS ATTENTION').length;
  const unresolvedAlertsCount = alerts.filter((a) => a.status === 'NEEDS ATTENTION').length;

  const verifiedTodayCount = verifications.filter((v) => v.status === 'VERIFIED').length;
  const gpsComplianceRate = useMemo(() => {
    if (verifications.length === 0) return 100;
    return Math.round((verifiedTodayCount / verifications.length) * 100);
  }, [verifications, verifiedTodayCount]);

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header title="Hospital System Administration" />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* Hospital Banner & Single Hospital Scope Indicator */}
        <section className="bg-surface-container-lowest rounded-xl p-card-padding border border-primary/30 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                  Single-Hospital Geofence Enforcement
                </span>
                <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.2 rounded">
                  {hospitalGeofence.radius_meters}m Perimeter
                </span>
              </div>
              <h2 className="font-headline-md text-sm font-bold text-on-surface leading-snug">
                {hospitalGeofence.name}
              </h2>
              <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">pin_drop</span>
                <span>Coordinates: {hospitalGeofence.latitude.toFixed(4)}° N, {hospitalGeofence.longitude.toFixed(4)}° E</span>
                <span className="text-outline">|</span>
                <span>Campus Buffer: ±{hospitalGeofence.tolerance_meters || 15}m</span>
              </p>
            </div>

            <button
              id="btn-admin-config-geofence"
              onClick={() => setCurrentScreen('geofence_setup')}
              className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Geofence Settings</span>
            </button>
          </div>
        </section>

        {/* 7 Summary Metric Cards */}
        <section className="space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider px-1">
            Institutional Roster & Incident Overview
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            {/* Total Students */}
            <div
              onClick={() => setCurrentScreen('admin_students')}
              className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50 shadow-xs hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="text-on-surface-variant text-[10px] uppercase font-bold">Total Students</div>
              <div className="font-display-id text-2xl font-bold text-primary mt-0.5">{totalStudentsCount}</div>
              <div className="text-[10px] text-primary/80 font-medium">All Departments</div>
            </div>

            {/* Active Interns */}
            <div
              onClick={() => setCurrentScreen('admin_students')}
              className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50 shadow-xs hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="text-on-surface-variant text-[10px] uppercase font-bold">Active Interns</div>
              <div className="font-display-id text-2xl font-bold text-tertiary-container mt-0.5">
                {activeInternsCount}
              </div>
              <div className="text-[10px] text-tertiary-container font-medium">On Shift Now</div>
            </div>

            {/* Total Mentors */}
            <div
              onClick={() => setCurrentScreen('admin_mentors')}
              className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50 shadow-xs hover:border-secondary/40 transition-colors cursor-pointer"
            >
              <div className="text-on-surface-variant text-[10px] uppercase font-bold">Total Mentors</div>
              <div className="font-display-id text-2xl font-bold text-secondary mt-0.5">
                {totalMentorsCount}
              </div>
              <div className="text-[10px] text-secondary font-medium">Clinical Supervisors</div>
            </div>

            {/* Total HODs */}
            <div
              onClick={() => setCurrentScreen('admin_hods')}
              className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50 shadow-xs hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="text-on-surface-variant text-[10px] uppercase font-bold">Total HODs</div>
              <div className="font-display-id text-2xl font-bold text-primary mt-0.5">{totalHodsCount}</div>
              <div className="text-[10px] text-primary font-medium">Academic Chairs</div>
            </div>

            {/* Active Shifts */}
            <div
              onClick={() => setCurrentScreen('admin_shifts')}
              className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50 shadow-xs hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="text-on-surface-variant text-[10px] uppercase font-bold">Active Shifts</div>
              <div className="font-display-id text-2xl font-bold text-on-surface mt-0.5">
                {activeShiftsCount}
              </div>
              <div className="text-[10px] text-on-surface-variant font-medium">Timings Catalog</div>
            </div>

            {/* Needs Attention */}
            <div
              onClick={() => setCurrentScreen('admin_alerts')}
              className="bg-surface-container-lowest p-3 rounded-xl border border-error/40 shadow-xs hover:border-error transition-colors cursor-pointer"
            >
              <div className="text-error text-[10px] uppercase font-bold">Needs Attention</div>
              <div className="font-display-id text-2xl font-bold text-error mt-0.5">
                {needsAttentionCount}
              </div>
              <div className="text-[10px] text-error font-medium">Geofence Flags</div>
            </div>

            {/* Unresolved Alerts */}
            <div
              onClick={() => setCurrentScreen('admin_alerts')}
              className="bg-surface-container-lowest p-3 rounded-xl border border-error/40 shadow-xs hover:border-error transition-colors cursor-pointer col-span-2 sm:col-span-2"
            >
              <div className="text-error text-[10px] uppercase font-bold">Unresolved Alerts</div>
              <div className="font-display-id text-2xl font-bold text-error mt-0.5">
                {unresolvedAlertsCount}
              </div>
              <div className="text-[10px] text-on-surface-variant">Pending supervisor endorsement</div>
            </div>
          </div>
        </section>

        {/* System Health Section */}
        <section className="bg-surface-container-lowest rounded-xl p-card-padding border border-outline-variant/50 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">monitor_heart</span>
            <div>
              <h3 className="font-headline-md text-sm font-bold text-on-surface">System Health Telemetry</h3>
              <p className="text-[10px] text-on-surface-variant">Live clinical infrastructure and compliance indicators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* GPS Verification Activity */}
            <div
              onClick={() => setCurrentScreen('admin_gps_monitoring')}
              className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface">GPS Compliance</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.2 rounded text-[10px]">
                  {gpsComplianceRate}% Pass
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${gpsComplianceRate}%` }}></div>
              </div>
              <div className="text-[10px] text-on-surface-variant">
                {verifiedTodayCount} of {verifications.length} checks verified inside geofence
              </div>
            </div>

            {/* Attendance Activity */}
            <div
              onClick={() => setCurrentScreen('admin_attendance')}
              className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface">Attendance Register</span>
                <span className="font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded text-[10px]">
                  {attendanceRecords.length} Sessions
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '94%' }}></div>
              </div>
              <div className="text-[10px] text-on-surface-variant">
                Continuous night and morning shifts logged accurately
              </div>
            </div>

            {/* Active Internships */}
            <div
              onClick={() => setCurrentScreen('admin_internships')}
              className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface">Active Internships</span>
                <span className="font-mono font-bold text-secondary bg-secondary/10 px-1.5 py-0.2 rounded text-[10px]">
                  100% Active
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="text-[10px] text-on-surface-variant">
                6-month rotational curriculum in progress across wards
              </div>
            </div>
          </div>
        </section>

        {/* Administrative Command Navigation Grid (All 10 Modules) */}
        <section className="space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider px-1">
            Administrative Modules & Governance
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <button
              id="btn-nav-admin-hods"
              onClick={() => setCurrentScreen('admin_hods')}
              className="p-3 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl text-left transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
                <span>HOD Governance</span>
              </div>
              <p className="text-[10px] text-on-surface-variant">Create & manage Department Chairs</p>
            </button>

            <button
              id="btn-nav-admin-mentors"
              onClick={() => setCurrentScreen('admin_mentors')}
              className="p-3 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl text-left transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 text-secondary font-bold">
                <span className="material-symbols-outlined text-[20px]">badge</span>
                <span>Mentor Faculty</span>
              </div>
              <p className="text-[10px] text-on-surface-variant">Create, edit & override departments</p>
            </button>

            <button
              id="btn-nav-admin-students"
              onClick={() => setCurrentScreen('admin_students')}
              className="p-3 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl text-left transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">groups</span>
                <span>Intern Roster</span>
              </div>
              <p className="text-[10px] text-on-surface-variant">Enroll, edit & manage assignments</p>
            </button>

            <button
              id="btn-nav-admin-shifts"
              onClick={() => setCurrentScreen('admin_shifts')}
              className="p-3 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl text-left transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
                <span>Shift Management</span>
              </div>
              <p className="text-[10px] text-on-surface-variant">Create shifts & bulk assignments</p>
            </button>

            <button
              id="btn-nav-admin-internships"
              onClick={() => setCurrentScreen('admin_internships')}
              className="p-3 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl text-left transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 text-secondary font-bold">
                <span className="material-symbols-outlined text-[20px]">school</span>
                <span>Internship Cohort</span>
              </div>
              <p className="text-[10px] text-on-surface-variant">Track milestones & ward blocks</p>
            </button>

            <button
              id="btn-nav-admin-attendance"
              onClick={() => setCurrentScreen('admin_attendance')}
              className="p-3 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl text-left transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 text-tertiary-container font-bold">
                <span className="material-symbols-outlined text-[20px]">event_available</span>
                <span>Attendance Log</span>
              </div>
              <p className="text-[10px] text-on-surface-variant">System-wide check-in registry</p>
            </button>

            <button
              id="btn-nav-admin-gps"
              onClick={() => setCurrentScreen('admin_gps_monitoring')}
              className="p-3 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl text-left transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">radar</span>
                <span>GPS Telemetry</span>
              </div>
              <p className="text-[10px] text-on-surface-variant">Live physical presence stream</p>
            </button>

            <button
              id="btn-nav-admin-alerts"
              onClick={() => setCurrentScreen('admin_alerts')}
              className="p-3 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl text-left transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 text-error font-bold">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                <span>Alert Dashboard</span>
              </div>
              <p className="text-[10px] text-on-surface-variant">System-wide anomaly resolution</p>
            </button>

            <button
              id="btn-nav-admin-reports"
              onClick={() => setCurrentScreen('admin_reports')}
              className="p-3 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl text-left transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">query_stats</span>
                <span>Analytics Reports</span>
              </div>
              <p className="text-[10px] text-on-surface-variant">Institutional compliance metrics</p>
            </button>

            <button
              id="btn-nav-admin-geofence-setup"
              onClick={() => setCurrentScreen('geofence_setup')}
              className="p-3 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl text-left transition-all cursor-pointer shadow-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">share_location</span>
                <span>Hospital Perimeter</span>
              </div>
              <p className="text-[10px] text-on-surface-variant">Configure hospital geofence</p>
            </button>

            <button
              id="btn-nav-admin-activity-log"
              onClick={() => setCurrentScreen('admin_activity_log')}
              className="p-3 bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl text-left transition-all cursor-pointer shadow-xs space-y-1 col-span-2 sm:col-span-2"
            >
              <div className="flex items-center gap-1.5 text-secondary font-bold">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                <span>Activity Audit Trail ({activityLogs.length} Events)</span>
              </div>
              <p className="text-[10px] text-on-surface-variant">Immutable administrative action history</p>
            </button>
          </div>
        </section>

        {/* Live Recent Alerts Snapshot */}
        {needsAttentionCount > 0 && (
          <section className="bg-surface-container-lowest rounded-xl p-card-padding border border-error/40 shadow-xs space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-sm font-bold text-error flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">emergency</span>
                <span>Active Anomalies Awaiting Endorsement</span>
              </h3>
              <button
                onClick={() => setCurrentScreen('admin_alerts')}
                className="text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                View All Alerts →
              </button>
            </div>

            <div className="space-y-1.5">
              {alerts
                .filter((a) => a.status === 'NEEDS ATTENTION')
                .slice(0, 3)
                .map((alt) => (
                  <div
                    key={alt.id}
                    className="p-2 bg-error-container/20 border border-error/30 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-on-surface">
                        {alt.student_name} ({alt.register_number})
                      </div>
                      <div className="text-[10px] text-error font-medium">
                        {alt.time_display} • {alt.reason}
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentScreen('admin_alerts')}
                      className="px-2 py-1 bg-error text-on-error rounded-lg font-bold text-[10px] cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
