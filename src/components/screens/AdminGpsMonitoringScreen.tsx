import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const AdminGpsMonitoringScreen: React.FC = () => {
  const { verifications, departments, shifts, mentors, setCurrentScreen, setSelectedStudent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [mentorFilter, setMentorFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredVerifications = verifications.filter((v) => {
    const matchesSearch =
      v.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.register_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || v.department === deptFilter;
    const matchesMentor =
      mentorFilter === 'ALL' || v.mentor_id === mentorFilter || v.mentor_name === mentorFilter;
    const matchesShift = shiftFilter === 'ALL' || v.shift_name === shiftFilter;
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

    return matchesSearch && matchesDept && matchesMentor && matchesShift && matchesStatus;
  });

  const totalCount = verifications.length;
  const verifiedCount = verifications.filter((v) => v.status === 'VERIFIED').length;
  const attentionCount = verifications.filter((v) => v.status === 'NEEDS ATTENTION').length;
  const unavailableCount = verifications.filter(
    (v) => v.status === 'GPS UNAVAILABLE' || v.status === 'PERMISSION DENIED'
  ).length;

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="GPS Telemetry Monitoring"
        showBack={true}
        onBack={() => setCurrentScreen('admin_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* Telemetry Summary Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-on-surface-variant">
              Total Verifications
            </div>
            <div className="font-display-id text-xl font-bold text-primary mt-0.5">{totalCount}</div>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-emerald-500/30 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
              Verified In Geofence
            </div>
            <div className="font-display-id text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
              {verifiedCount}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-error/30 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-error">Needs Attention</div>
            <div className="font-display-id text-xl font-bold text-error mt-0.5">{attentionCount}</div>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-on-surface-variant">Signal Issues</div>
            <div className="font-display-id text-xl font-bold text-secondary mt-0.5">{unavailableCount}</div>
          </div>
        </section>

        {/* Search & Filters */}
        <div className="space-y-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search intern name or register number..."
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
              <option value="VERIFIED">VERIFIED</option>
              <option value="NEEDS ATTENTION">NEEDS ATTENTION</option>
              <option value="REVIEWED">REVIEWED</option>
              <option value="GPS UNAVAILABLE">GPS UNAVAILABLE</option>
              <option value="PERMISSION DENIED">PERMISSION DENIED</option>
            </select>
          </div>
        </div>

        {/* Telemetry Log Stream */}
        <div className="space-y-2.5">
          {filteredVerifications.map((v) => {
            const isAlert = v.status === 'NEEDS ATTENTION';
            const isVerified = v.status === 'VERIFIED';
            const isReviewed = v.status === 'REVIEWED';

            return (
              <div
                key={v.id}
                className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 hover:border-primary/40 transition-colors shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-on-surface">{v.student_name}</span>
                      <span className="font-mono text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded">
                        {v.register_number}
                      </span>
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {v.department} • <span className="font-semibold text-secondary">{v.mentor_name || 'Assigned Mentor'}</span>
                    </div>
                  </div>

                  <span
                    className={`font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      isAlert
                        ? 'bg-error-container text-error'
                        : isReviewed
                        ? 'bg-secondary-container text-on-secondary-container'
                        : isVerified
                        ? 'bg-tertiary-container/15 text-tertiary-container'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 text-on-surface-variant">
                  <div>Time: <span className="font-mono font-bold text-on-surface">{v.time_display}</span></div>
                  <div>Type: <span className="font-medium">{v.verification_type}</span></div>
                  <div>Distance: <span className="font-mono font-bold">{v.distance_meters}m</span></div>
                  <div>Accuracy: <span className="font-mono">±{v.accuracy_meters}m</span></div>
                </div>

                {/* Supervisor Review Notes if applicable */}
                {v.review_details && (
                  <div className="p-2 bg-secondary-container/20 border border-secondary/30 rounded-lg text-[11px] text-on-secondary-container space-y-0.5">
                    <div className="font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">rate_review</span>
                      <span>Supervisor Endorsement: {v.review_details.reviewer_name} ({v.review_details.reviewed_at})</span>
                    </div>
                    <p className="text-[10px] italic">"{v.review_details.review_notes}"</p>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setSelectedStudent(v.register_number);
                      setCurrentScreen('gps_history');
                    }}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Inspect Full Timeline</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredVerifications.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant text-xs">
              No verification events match the selected filters.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
