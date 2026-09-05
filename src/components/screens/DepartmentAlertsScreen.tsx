import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const DepartmentAlertsScreen: React.FC = () => {
  const {
    currentUser,
    getDepartmentAlerts,
    getDepartmentMentors,
    setCurrentScreen,
    setSelectedAlert,
    setSelectedStudent,
  } = useApp();

  const hodDept = currentUser?.department || 'Physiotherapy';
  const departmentAlerts = getDepartmentAlerts(hodDept);
  const departmentMentors = getDepartmentMentors(hodDept);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [mentorFilter, setMentorFilter] = useState<string>('ALL');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');

  const filteredAlerts = departmentAlerts.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (mentorFilter !== 'ALL' && a.mentor_id !== mentorFilter && a.mentor_name !== mentorFilter) return false;
    return true;
  });

  const handleOpenAlert = (alert: any) => {
    setSelectedAlert(alert.id);
    setSelectedStudent(alert.register_number);
    setCurrentScreen('mentor_student_details');
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Department Incident Alerts"
        showBack={true}
        onBack={() => setCurrentScreen('hod_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* Scope Banner */}
        <section className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/40 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Department Presence Oversight
            </span>
            <h3 className="font-bold text-sm text-on-surface">
              {hodDept} Alerts ({departmentAlerts.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-error px-2.5 py-1 bg-error-container/20 rounded-lg">
            {departmentAlerts.filter((a) => a.status === 'NEEDS ATTENTION').length} Action Required
          </span>
        </section>

        {/* Filters: Status, Mentor, Shift */}
        <div className="space-y-2">
          {/* Status Pills */}
          <div className="flex gap-1.5 text-xs">
            {[
              { id: 'ALL', label: 'All Alerts' },
              { id: 'NEEDS ATTENTION', label: 'Needs Attention' },
              { id: 'REVIEWED', label: 'Reviewed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 py-1.5 rounded-full font-bold text-[11px] transition-colors cursor-pointer min-h-[32px] ${
                  statusFilter === tab.id
                    ? 'bg-primary text-on-primary shadow-2xs'
                    : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-lowest p-2.5 rounded-2xl border border-outline-variant/40">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant mb-1">
                Filter Mentor:
              </label>
              <select
                value={mentorFilter}
                onChange={(e) => setMentorFilter(e.target.value)}
                className="w-full bg-surface-container p-2 rounded-lg border border-outline-variant text-[11px] text-on-surface font-semibold focus:outline-none"
              >
                <option value="ALL">All Mentors</option>
                {departmentMentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant mb-1">
                Filter Shift:
              </label>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full bg-surface-container p-2 rounded-lg border border-outline-variant text-[11px] text-on-surface font-semibold focus:outline-none"
              >
                <option value="ALL">All Shifts</option>
                <option value="Night">Night Shift</option>
                <option value="Morning">Morning Shift</option>
                <option value="Evening">Evening Shift</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <section className="space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center space-y-1">
              <span className="material-symbols-outlined text-emerald-600 text-[32px]">
                verified_user
              </span>
              <p className="text-xs font-bold text-on-surface">No alerts matching criteria.</p>
              <p className="text-[11px] text-on-surface-variant">All departmental telemetry is in order.</p>
            </div>
          ) : (
            filteredAlerts.map((alt) => {
              const isNeedsAtt = alt.status === 'NEEDS ATTENTION';
              const isReviewed = alt.status === 'REVIEWED';

              return (
                <div
                  key={alt.id}
                  onClick={() => handleOpenAlert(alt)}
                  className={`bg-surface-container-lowest rounded-2xl p-4 border transition-all shadow-2xs space-y-3 hover:border-primary/50 cursor-pointer ${
                    isNeedsAtt
                      ? 'border-error/40 bg-error-container/5'
                      : 'border-secondary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-error tracking-wider block">
                        PRESENCE VERIFICATION
                      </span>
                      <h4 className="font-bold text-sm text-on-surface">{alt.student_name}</h4>
                      <div className="text-xs text-on-surface-variant font-mono">
                        <span className="font-bold text-primary">{alt.register_number}</span> •{' '}
                        <span>Mentor: <strong className="text-on-surface font-sans">{alt.mentor_name}</strong></span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
                        isNeedsAtt
                          ? 'bg-error text-on-error animate-pulse'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {alt.status}
                    </span>
                  </div>

                  {/* Anomaly Details */}
                  <div className="bg-surface-container-low rounded-xl p-3 text-xs space-y-1.5 border border-outline-variant/30">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-on-surface-variant">Duty Shift:</span>
                      <span className="font-bold text-primary">Night Shift (10:00 PM – 06:00 AM)</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-on-surface-variant">Time of Anomaly:</span>
                      <span className="font-mono font-bold text-error">{alt.time_display}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-on-surface-variant">Recorded Telemetry:</span>
                      <span className="font-mono font-semibold text-on-surface">
                        {alt.distance_meters}m from hospital (Accuracy ±{alt.accuracy_meters}m)
                      </span>
                    </div>
                    <div className="pt-1 border-t border-outline-variant/20 text-[11px] text-error font-medium">
                      {alt.reason}
                    </div>
                  </div>

                  {isReviewed && (
                    <div className="p-2.5 rounded-xl bg-secondary/10 text-xs text-secondary border border-secondary/20">
                      <div className="font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Reviewed by {alt.reviewed_by || 'Dr. Anitha'}
                      </div>
                      <p className="italic text-on-surface-variant mt-0.5 text-[11px]">
                        "{alt.review_notes || 'Clinical dispatch to Emergency trauma bay.'}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-1 border-t border-outline-variant/20 text-xs text-primary font-bold hover:underline">
                    <span>View Student Shift Timeline →</span>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};
