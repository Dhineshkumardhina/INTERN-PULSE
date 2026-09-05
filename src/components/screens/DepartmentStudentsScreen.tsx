import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const DepartmentStudentsScreen: React.FC = () => {
  const { students, mentors, setCurrentScreen, setSelectedStudent } = useApp();
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const filteredStudents = students.filter((s) => {
    if (selectedDept === 'ALL') return true;
    return s.department.toLowerCase().includes(selectedDept.toLowerCase());
  });

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Department Interns Roster"
        showBack={true}
        onBack={() => setCurrentScreen('hod_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* Filter Pills */}
        <div className="flex gap-2 text-xs overflow-x-auto pb-1">
          {['ALL', 'Radiology', 'Cardiology', 'Emergency'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedDept === dept
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Student Cards */}
        <div className="space-y-2.5">
          {filteredStudents.map((stud) => {
            const isAlert = stud.current_status === 'NEEDS ATTENTION';
            const isVerified = stud.current_status === 'VERIFIED';
            const isReviewed = stud.current_status === 'REVIEWED';

            return (
              <div
                key={stud.register_number}
                className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      stud.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={stud.name}
                    className="w-11 h-11 rounded-full object-cover border border-outline-variant"
                  />
                  <div>
                    <div className="font-bold text-sm text-on-surface">{stud.name}</div>
                    <div className="text-xs text-on-surface-variant">
                      Reg: <span className="font-mono font-bold text-primary">{stud.register_number}</span> • {stud.department}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">
                      Supervisor: <span className="font-semibold">{stud.mentor_name}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="mb-2">
                    {isAlert ? (
                      <span className="bg-error-container text-error font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                        NEEDS ATTENTION
                      </span>
                    ) : isReviewed ? (
                      <span className="bg-secondary-container text-on-secondary-container font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                        REVIEWED
                      </span>
                    ) : (
                      <span className="bg-tertiary-container/15 text-tertiary-container font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                        VERIFIED
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedStudent(stud.register_number);
                      setCurrentScreen('gps_history');
                    }}
                    className="text-xs text-primary font-bold hover:underline cursor-pointer"
                  >
                    View Logs →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
