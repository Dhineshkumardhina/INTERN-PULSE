import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DepartmentAlert } from '../../types';

export const AdminAlertsScreen: React.FC = () => {
  const { alerts, departments, mentors, shifts, setCurrentScreen, setSelectedStudent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [mentorFilter, setMentorFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAlertForDetail, setSelectedAlertForDetail] = useState<DepartmentAlert | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.register_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || a.department === deptFilter;
    const matchesMentor =
      mentorFilter === 'ALL' || a.mentor_id === mentorFilter || a.mentor_name === mentorFilter;
    const matchesShift = shiftFilter === 'ALL' || a.shift_name === shiftFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

    return matchesSearch && matchesDept && matchesMentor && matchesShift && matchesStatus;
  });

  const totalAlertsCount = alerts.length;
  const needsAttentionCount = alerts.filter((a) => a.status === 'NEEDS ATTENTION').length;
  const reviewedCount = alerts.filter((a) => a.status === 'REVIEWED').length;

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Hospital Alert Dashboard"
        showBack={true}
        onBack={() => setCurrentScreen('admin_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* Alert Metric Cards */}
        <section className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-on-surface-variant">Total Alerts</div>
            <div className="font-display-id text-2xl font-bold text-primary mt-0.5">{totalAlertsCount}</div>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-xl border border-error/40 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-error">Needs Attention</div>
            <div className="font-display-id text-2xl font-bold text-error mt-0.5">{needsAttentionCount}</div>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-xl border border-emerald-500/30 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
              Reviewed
            </div>
            <div className="font-display-id text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
              {reviewedCount}
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="space-y-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search alert by student name or register number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="p-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={mentorFilter}
              onChange={(e) => setMentorFilter(e.target.value)}
              className="p-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs"
            >
              <option value="ALL">All Mentors</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="p-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs"
            >
              <option value="ALL">All Shifts</option>
              {shifts.map((sh) => (
                <option key={sh.id} value={sh.name}>
                  {sh.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEEDS ATTENTION">Needs Attention</option>
              <option value="REVIEWED">Reviewed</option>
            </select>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="space-y-2.5">
          {filteredAlerts.map((alert) => {
            const isAlert = alert.status === 'NEEDS ATTENTION';

            return (
              <div
                key={alert.id}
                className={`bg-surface-container-lowest rounded-xl p-3.5 border transition-colors shadow-xs space-y-2 ${
                  isAlert ? 'border-error/40' : 'border-outline-variant/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-on-surface">{alert.student_name}</span>
                      <span className="font-mono text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded">
                        {alert.register_number}
                      </span>
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {alert.department} • <span className="font-semibold text-secondary">Mentor: {alert.mentor_name}</span>
                    </div>
                  </div>

                  <span
                    className={`font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      isAlert
                        ? 'bg-error-container text-error animate-pulse'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>

                <div className="p-2 bg-surface-container-low rounded-lg text-xs space-y-1 border border-outline-variant/30">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant">Trigger Time:</span>
                    <span className="font-mono font-bold text-on-surface">{alert.time_display}</span>
                  </div>
                  <div className="text-[11px] text-error font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">distance</span>
                    <span>{alert.reason}</span>
                  </div>
                </div>

                {alert.reviewed_by && (
                  <div className="p-2 bg-secondary-container/20 border border-secondary/30 rounded-lg text-[11px] text-on-secondary-container">
                    <div className="font-bold">Reviewed By: {alert.reviewed_by} ({alert.reviewed_at})</div>
                    {alert.review_notes && <p className="text-[10px] italic">"{alert.review_notes}"</p>}
                  </div>
                )}

                <div className="flex justify-between items-center pt-1 text-xs">
                  <button
                    onClick={() => {
                      setSelectedStudent(alert.register_number);
                      setCurrentScreen('gps_history');
                    }}
                    className="text-on-surface-variant hover:text-primary font-medium cursor-pointer"
                  >
                    View Student Profile
                  </button>

                  <button
                    onClick={() => setSelectedAlertForDetail(alert)}
                    className="px-3 py-1 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>Inspect Timeline</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant text-xs">
              No hospital alerts match your filter criteria.
            </div>
          )}
        </div>
      </main>

      {/* Complete Shift Timeline Alert Detail Modal */}
      {selectedAlertForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-4 space-y-3.5 max-h-[88vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-error/10 text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-sm font-bold text-on-surface">
                    Shift Incident & Telemetry Timeline
                  </h3>
                  <p className="text-[10px] text-on-surface-variant">
                    {selectedAlertForDetail.student_name} ({selectedAlertForDetail.register_number})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlertForDetail(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {/* Alert Summary Card */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-on-surface">{selectedAlertForDetail.department}</span>
                  <span
                    className={`font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedAlertForDetail.status === 'NEEDS ATTENTION'
                        ? 'bg-error-container text-error'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {selectedAlertForDetail.status}
                  </span>
                </div>
                <div className="text-secondary font-medium">Supervisor: {selectedAlertForDetail.mentor_name}</div>
                <div className="text-[11px] text-error font-semibold pt-1">
                  Incident: {selectedAlertForDetail.reason}
                </div>
              </div>

              {/* Complete Shift Timeline Breakdown */}
              <div className="space-y-1.5">
                <div className="font-bold text-[11px] text-on-surface-variant uppercase tracking-wide">
                  Complete Shift Verification Timeline:
                </div>

                <div className="space-y-1 relative pl-3 border-l-2 border-primary/30 ml-2">
                  <div className="p-2 bg-surface-container rounded-lg border border-outline-variant/20 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-primary">10:02 PM</span>
                      <span className="text-[10px] text-on-surface-variant ml-2">• Shift Check-in (Ward A)</span>
                    </div>
                    <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      VERIFIED (42m)
                    </span>
                  </div>

                  <div className="p-2 bg-surface-container rounded-lg border border-outline-variant/20 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-primary">11:31 PM</span>
                      <span className="text-[10px] text-on-surface-variant ml-2">• Random Presence Check</span>
                    </div>
                    <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      VERIFIED (38m)
                    </span>
                  </div>

                  <div className="p-2 bg-surface-container rounded-lg border border-outline-variant/20 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-primary">01:18 AM</span>
                      <span className="text-[10px] text-on-surface-variant ml-2">• Inpatient Rounds Telemetry</span>
                    </div>
                    <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      VERIFIED (55m)
                    </span>
                  </div>

                  <div className="p-2 bg-error-container/25 border-2 border-error/50 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-error">03:42 AM</span>
                      <span className="text-[10px] text-error font-medium ml-2">• Geofence Anomaly</span>
                    </div>
                    <span className="bg-error-container text-error text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      NEEDS ATTENTION (420m)
                    </span>
                  </div>

                  <div className="p-2 bg-surface-container rounded-lg border border-outline-variant/20 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-primary">05:58 AM</span>
                      <span className="text-[10px] text-on-surface-variant ml-2">• Pre-Checkout Verification</span>
                    </div>
                    <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      VERIFIED (40m)
                    </span>
                  </div>
                </div>
              </div>

              {/* Reviewer Details */}
              {selectedAlertForDetail.reviewed_by ? (
                <div className="p-2.5 bg-secondary-container/20 border border-secondary/30 rounded-xl space-y-1">
                  <div className="font-bold text-secondary">
                    Review Status: Endorsed by {selectedAlertForDetail.reviewed_by}
                  </div>
                  <div className="text-[10px] text-on-surface-variant">Timestamp: {selectedAlertForDetail.reviewed_at}</div>
                  <p className="text-[11px] italic text-on-surface">"{selectedAlertForDetail.review_notes}"</p>
                </div>
              ) : (
                <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/30 text-on-surface-variant text-[11px]">
                  Pending supervisor clinical verification and ward endorsement.
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedAlertForDetail(null)}
              className="w-full py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer text-xs"
            >
              Close Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
