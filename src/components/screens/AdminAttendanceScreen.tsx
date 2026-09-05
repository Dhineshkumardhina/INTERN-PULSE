import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const AdminAttendanceScreen: React.FC = () => {
  const { attendanceRecords, departments, mentors, shifts, students, setCurrentScreen, setSelectedStudent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [mentorFilter, setMentorFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredRecords = attendanceRecords.filter((rec) => {
    const student = students.find((s) => s.register_number === rec.register_number);
    const matchesSearch =
      rec.register_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student && student.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = deptFilter === 'ALL' || (student && student.department === deptFilter);
    const matchesMentor =
      mentorFilter === 'ALL' ||
      rec.mentor_name === mentorFilter ||
      (student && student.mentor_id === mentorFilter);
    const matchesShift = shiftFilter === 'ALL' || rec.shift_name === shiftFilter;
    const matchesStatus = statusFilter === 'ALL' || rec.status.includes(statusFilter);

    return matchesSearch && matchesDept && matchesMentor && matchesShift && matchesStatus;
  });

  const totalSessions = attendanceRecords.length;
  const completedCount = attendanceRecords.filter((r) => r.status.includes('COMPLETED')).length;
  const reviewedCount = attendanceRecords.filter((r) => r.status.includes('REVIEWED')).length;
  const attentionCount = attendanceRecords.filter((r) => r.status.includes('NEEDS ATTENTION')).length;

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Hospital Attendance Registry"
        showBack={true}
        onBack={() => setCurrentScreen('admin_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* Metric Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-on-surface-variant">Sessions Logged</div>
            <div className="font-display-id text-xl font-bold text-primary mt-0.5">{totalSessions}</div>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-emerald-500/30 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
              Completed
            </div>
            <div className="font-display-id text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
              {completedCount}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-secondary/30 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-secondary">Endorsed</div>
            <div className="font-display-id text-xl font-bold text-secondary mt-0.5">{reviewedCount}</div>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-error/30 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-error">Needs Review</div>
            <div className="font-display-id text-xl font-bold text-error mt-0.5">{attentionCount}</div>
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
              placeholder="Search by intern name or register number..."
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
              <option value="COMPLETED">Completed</option>
              <option value="REVIEWED">Completed (Reviewed)</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="NEEDS ATTENTION">Needs Attention</option>
            </select>
          </div>
        </div>

        {/* Attendance Records List */}
        <div className="space-y-2.5">
          {filteredRecords.map((rec) => {
            const student = students.find((s) => s.register_number === rec.register_number);
            const isAlert = rec.status.includes('NEEDS ATTENTION');
            const isCompleted = rec.status.includes('COMPLETED');

            return (
              <div
                key={rec.id}
                className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 hover:border-primary/40 transition-colors shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-on-surface">
                        {student?.name || 'Intern Student'}
                      </span>
                      <span className="font-mono text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded">
                        {rec.register_number}
                      </span>
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {rec.date_display} • {rec.shift_name} ({rec.time_window})
                    </div>
                  </div>

                  <span
                    className={`font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      isAlert
                        ? 'bg-error-container text-error'
                        : isCompleted
                        ? 'bg-tertiary-container/15 text-tertiary-container'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 text-on-surface-variant">
                  <div>Check-In: <span className="font-mono font-bold text-on-surface">{rec.start_time}</span></div>
                  <div>Check-Out: <span className="font-mono font-bold text-on-surface">{rec.end_time}</span></div>
                  <div>GPS Verified: <span className="font-bold text-primary">{rec.verified_checks}/{rec.total_checks}</span></div>
                  <div>Hours: <span className="font-bold text-tertiary-container">{rec.hours_logged}</span></div>
                </div>

                <div className="flex justify-between items-center pt-1 text-xs">
                  <span className="text-on-surface-variant text-[11px]">
                    Supervisor: <span className="font-semibold text-secondary">{rec.mentor_name}</span>
                  </span>

                  <button
                    onClick={() => {
                      setSelectedStudent(rec.register_number);
                      setCurrentScreen('gps_history');
                    }}
                    className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Inspect Log</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant text-xs">
              No attendance records found for the selected criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
