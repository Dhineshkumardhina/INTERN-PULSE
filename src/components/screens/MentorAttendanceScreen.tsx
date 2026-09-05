import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const MentorAttendanceScreen: React.FC = () => {
  const {
    currentUser,
    getMentorStudents,
    attendanceRecords,
    setCurrentScreen,
    setSelectedStudent,
  } = useApp();

  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');

  const assignedStudents = getMentorStudents(currentUser?.id);
  const mentorStudentRegs = assignedStudents.map((s) => s.register_number);

  // Scope to mentor's assigned students only
  const mentorAttendance = attendanceRecords.filter((rec) =>
    mentorStudentRegs.includes(rec.register_number)
  );

  const filteredRecords = mentorAttendance.filter((rec) => {
    // Student filter
    if (selectedStudentFilter !== 'ALL' && rec.register_number !== selectedStudentFilter) {
      return false;
    }

    // Period filter
    if (period === 'DAILY') {
      return rec.date_display.includes('05 Sep');
    }
    if (period === 'WEEKLY') {
      return rec.period_group === 'THIS_WEEK';
    }
    return true; // MONTHLY
  });

  const totalShifts = filteredRecords.length;
  const completedCount = filteredRecords.filter((r) => r.status.includes('COMPLETED')).length;
  const endorsedCount = filteredRecords.filter((r) => r.status.includes('REVIEWED')).length;

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Department Attendance Matrix"
        showBack={true}
        onBack={() => setCurrentScreen('mentor_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Attendance Summary Overview */}
        <section className="bg-surface-container-low rounded-2xl p-3.5 border border-outline-variant/40 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                Clinical Supervision Attendance
              </span>
              <h3 className="font-bold text-sm text-on-surface">
                {currentUser?.department || 'Physiotherapy'} Department
              </h3>
            </div>
            <span className="text-xs font-bold text-primary px-2.5 py-1 bg-primary/10 rounded-lg">
              {assignedStudents.length} Supervised Interns
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline-variant/30 text-center">
            <div>
              <span className="text-[10px] text-on-surface-variant block font-medium">Logged Shifts</span>
              <span className="font-mono text-base font-bold text-on-surface">{totalShifts}</span>
            </div>
            <div className="border-x border-outline-variant/30">
              <span className="text-[10px] text-on-surface-variant block font-medium">Completed</span>
              <span className="font-mono text-base font-bold text-emerald-700">{completedCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block font-medium">Endorsed</span>
              <span className="font-mono text-base font-bold text-primary">{endorsedCount}</span>
            </div>
          </div>
        </section>

        {/* Filter Controls: Period Toggle & Student Selector */}
        <div className="space-y-2">
          {/* Period Toggle (Daily, Weekly, Monthly) */}
          <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/30">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === p
                    ? 'bg-surface text-primary shadow-2xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {p === 'DAILY' ? 'Daily' : p === 'WEEKLY' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>

          {/* Student Filter Dropdown */}
          <div className="flex items-center justify-between text-xs bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/30">
            <span className="text-on-surface-variant font-medium">Filter Student:</span>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant text-[11px] text-on-surface font-semibold focus:outline-none"
            >
              <option value="ALL">All Assigned Interns</option>
              {assignedStudents.map((s) => (
                <option key={s.register_number} value={s.register_number}>
                  {s.name} ({s.register_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance Records List */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Duty Attendance Records ({filteredRecords.length})
            </span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center space-y-1">
              <span className="material-symbols-outlined text-outline-variant text-[28px]">
                event_busy
              </span>
              <p className="text-xs text-on-surface-variant">No attendance logs found for this period.</p>
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const studentObj = assignedStudents.find((s) => s.register_number === rec.register_number);

              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    setSelectedStudent(rec.register_number);
                    setCurrentScreen('mentor_student_details');
                  }}
                  className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-2xs space-y-2.5 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-on-surface">
                          {studentObj?.name || 'Intern'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-primary px-1.5 py-0.2 bg-primary/10 rounded">
                          {rec.register_number}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        <span>{rec.date_display}</span> •{' '}
                        <span className="font-semibold text-secondary">{rec.shift_name} Shift</span>
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

                  {/* Timing Matrix */}
                  <div className="bg-surface-container-low rounded-lg p-2 text-xs grid grid-cols-2 gap-2 border border-outline-variant/30 font-mono">
                    <div>
                      <span className="text-[9px] text-on-surface-variant block font-sans">Check-in</span>
                      <span className="font-bold text-on-surface">{rec.start_time}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-on-surface-variant block font-sans">Check-out</span>
                      <span className="font-bold text-on-surface">{rec.end_time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-outline-variant/20 text-on-surface-variant">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-emerald-600">
                        verified
                      </span>
                      <span>
                        {rec.verified_checks}/{rec.total_checks} GPS Checks
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-bold text-on-surface">
                      <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                      <span>{rec.hours_logged}</span>
                    </div>
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
