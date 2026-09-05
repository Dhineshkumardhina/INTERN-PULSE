import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const StudentAttendanceScreen: React.FC = () => {
  const { currentUser, attendanceRecords, setCurrentScreen, students } = useApp();
  const [filterPeriod, setFilterPeriod] = useState<'WEEK' | 'MONTH' | 'ALL'>('WEEK');

  const regNo = currentUser?.registerNumber || '23UCCT001';
  const student = students.find((s) => s.register_number === regNo) || students[0];
  // Student can ONLY view their own attendance records
  const myRecords = attendanceRecords.filter((r) => r.register_number === regNo);

  const filteredRecords = myRecords.filter((r) => {
    if (filterPeriod === 'WEEK') {
      return r.period_group === 'THIS_WEEK';
    }
    if (filterPeriod === 'MONTH') {
      return r.period_group === 'THIS_WEEK' || r.period_group === 'THIS_MONTH';
    }
    return true; // ALL (full internship period)
  });

  const totalShiftsCount = filteredRecords.length;
  const completedCount = filteredRecords.filter((r) => r.status.includes('COMPLETED')).length;
  const reviewedCount = filteredRecords.filter((r) => r.status.includes('REVIEWED')).length;

  return (
    <div className="flex-1 flex flex-col pb-28 min-h-screen bg-background text-on-surface">
      <Header title="Attendance Record" showBack onBack={() => setCurrentScreen('student_dashboard')} />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Student Identity Card */}
        <div className="bg-surface-container-low rounded-2xl p-3.5 border border-outline-variant/40 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                Personal Attendance Record
              </span>
              <h2 className="text-base font-bold text-on-surface leading-tight mt-0.5">
                {currentUser?.name || 'Arun Kumar'}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-on-surface-variant block">Register No</span>
              <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md">
                {regNo}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-outline-variant/30">
            <div className="text-center">
              <span className="text-[10px] text-on-surface-variant block">Total Shifts</span>
              <span className="text-sm font-bold text-on-surface font-mono">{totalShiftsCount}</span>
            </div>
            <div className="text-center border-x border-outline-variant/30">
              <span className="text-center text-[10px] text-on-surface-variant block">Completed</span>
              <span className="text-sm font-bold text-emerald-600 font-mono">{completedCount}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-on-surface-variant block">Endorsed</span>
              <span className="text-sm font-bold text-primary font-mono">{reviewedCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/30">
          <button
            id="filter-attendance-week"
            type="button"
            onClick={() => setFilterPeriod('WEEK')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterPeriod === 'WEEK'
                ? 'bg-surface text-primary shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            This Week
          </button>
          <button
            id="filter-attendance-month"
            type="button"
            onClick={() => setFilterPeriod('MONTH')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterPeriod === 'MONTH'
                ? 'bg-surface text-primary shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            This Month
          </button>
          <button
            id="filter-attendance-all"
            type="button"
            onClick={() => setFilterPeriod('ALL')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterPeriod === 'ALL'
                ? 'bg-surface text-primary shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Internship Period
          </button>
        </div>

        {/* Attendance Entries List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-outline-variant uppercase tracking-wider">
              Duty Log Entries ({filteredRecords.length})
            </span>
            <span className="text-[10px] text-secondary font-medium">Physiotherapy Dept</span>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center space-y-2">
              <span className="material-symbols-outlined text-outline-variant text-[32px]">
                event_busy
              </span>
              <p className="text-xs text-on-surface-variant">No attendance logs found for this period.</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/40 shadow-2xs space-y-2.5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-on-surface">{record.date_display}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-secondary/10 text-secondary uppercase">
                        {record.shift_name}
                      </span>
                    </div>
                    <div className="text-xs text-on-surface-variant font-mono mt-0.5">
                      {record.start_time} – {record.end_time}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      record.status.includes('REVIEWED')
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : record.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                    }`}
                  >
                    {record.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-outline-variant/20 text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                    <span>{record.verified_checks}/{record.total_checks} GPS Verifications</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                    <span>{record.hours_logged}</span>
                  </div>
                </div>

                {record.status.includes('REVIEWED') && (
                  <div className="bg-surface-container rounded-lg p-2 text-[10px] text-on-surface-variant flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-primary shrink-0 mt-0.5">
                      clinical_notes
                    </span>
                    <span>Supervisor review confirmed: Duty attendance credited without penalty.</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
