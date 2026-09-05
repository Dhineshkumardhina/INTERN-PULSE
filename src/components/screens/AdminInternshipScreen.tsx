import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const AdminInternshipScreen: React.FC = () => {
  const { students, departments, setCurrentScreen, setSelectedStudent } = useApp();
  const [deptFilter, setDeptFilter] = useState('ALL');

  const filteredStudents = students.filter(
    (s) => deptFilter === 'ALL' || s.department === deptFilter
  );

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Internship Cohort Governance"
        showBack={true}
        onBack={() => setCurrentScreen('admin_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0 text-xs">
        {/* Cohort Header Card */}
        <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-primary/30 shadow-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm text-on-surface">2026–2027 Allied Health Sciences Batch</span>
            <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-[10px]">
              Active Term
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Official 6-month clinical rotation block (01 Aug 2026 – 31 Jan 2027). Tracking required core hospital ward competencies.
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setDeptFilter('ALL')}
            className={`px-3 py-1.5 rounded-full font-bold transition-colors shrink-0 cursor-pointer ${
              deptFilter === 'ALL'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
            }`}
          >
            All Cohorts ({students.length})
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setDeptFilter(d.name)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors shrink-0 cursor-pointer ${
                deptFilter === d.name
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
              }`}
            >
              {d.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Intern List */}
        <div className="space-y-2.5">
          {filteredStudents.map((stud) => (
            <div
              key={stud.register_number}
              className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-xs space-y-2"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      stud.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={stud.name}
                    className="w-9 h-9 rounded-full object-cover border border-outline-variant"
                  />
                  <div>
                    <div className="font-bold text-sm text-on-surface">{stud.name}</div>
                    <div className="text-[11px] text-on-surface-variant">
                      Reg: <span className="font-mono font-bold text-primary">{stud.register_number}</span> • {stud.department}
                    </div>
                  </div>
                </div>

                <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                  {stud.internship_status || 'Active Clinical Block'}
                </span>
              </div>

              <div className="bg-surface-container-low p-2 rounded-lg space-y-1 text-[11px] border border-outline-variant/30 text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Rotation Duration:</span>
                  <span className="font-semibold text-on-surface">
                    {stud.internship_start_date || '01 Aug 2026'} – {stud.internship_end_date || '31 Jan 2027'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Supervisor:</span>
                  <span className="font-semibold text-secondary">{stud.mentor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Primary Shift:</span>
                  <span className="font-semibold text-primary">{stud.shift_name} ({stud.shift_time})</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSelectedStudent(stud.register_number);
                    setCurrentScreen('gps_history');
                  }}
                  className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>View Clinical Telemetry</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
