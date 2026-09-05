import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const MentorStudentsScreen: React.FC = () => {
  const {
    currentUser,
    getMentorStudents,
    setSelectedStudent,
    setCurrentScreen,
    openMentorAddStudentModal,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const assignedStudents = getMentorStudents(currentUser?.id);

  const filteredStudents = assignedStudents.filter((s) => {
    if (statusFilter === 'ACTIVE' && !s.is_active_shift) return false;
    if (statusFilter === 'NOT_STARTED' && s.shift_status !== 'NOT STARTED') return false;
    if (statusFilter === 'COMPLETED' && s.shift_status !== 'COMPLETED') return false;
    if (statusFilter === 'NEEDS_ATTENTION' && s.current_status !== 'NEEDS ATTENTION') return false;
    if (statusFilter === 'ABSENT' && s.shift_status !== 'MISSED') return false;

    if (shiftFilter !== 'ALL' && !s.shift_name.toLowerCase().includes(shiftFilter.toLowerCase())) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.name.toLowerCase().includes(q);
      const matchReg = s.register_number.toLowerCase().includes(q);
      if (!matchName && !matchReg) return false;
    }

    return true;
  });

  const handleOpenStudent = (regNumber: string) => {
    setSelectedStudent(regNumber);
    setCurrentScreen('mentor_student_details');
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="My Assigned Students"
        showBack={true}
        onBack={() => setCurrentScreen('mentor_dashboard')}
        actionButton={
          <button
            onClick={openMentorAddStudentModal}
            className="p-1.5 bg-primary/10 text-primary rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span className="hidden sm:inline">Add Student</span>
          </button>
        }
      />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Mentor Scope Banner */}
        <section className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/40 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Faculty Supervised Scope
            </span>
            <h3 className="font-bold text-sm text-on-surface">
              {currentUser?.name || 'Dr. Anitha'} • {currentUser?.department || 'Physiotherapy'}
            </h3>
          </div>
          <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md">
            {assignedStudents.length} Interns Total
          </span>
        </section>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search student by name or register number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary focus:outline-none placeholder:text-outline"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Multi-Filters: Status & Shift Type */}
        <div className="space-y-2">
          <div className="flex gap-1.5 text-xs overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Interns' },
              { id: 'ACTIVE', label: 'Active Now' },
              { id: 'NOT_STARTED', label: 'Not Started' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'NEEDS_ATTENTION', label: 'Needs Attention' },
              { id: 'ABSENT', label: 'Absent' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-colors shrink-0 cursor-pointer min-h-[32px] ${
                  statusFilter === tab.id
                    ? 'bg-primary text-on-primary shadow-2xs'
                    : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/30">
            <span className="text-on-surface-variant font-medium">Shift Type:</span>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant text-[11px] text-on-surface font-semibold focus:outline-none"
            >
              <option value="ALL">All Shift Types</option>
              <option value="Night">Night Shift</option>
              <option value="Morning">Morning Shift</option>
              <option value="Evening">Evening Shift</option>
              <option value="General">General Day</option>
              <option value="Twilight">Twilight ICU</option>
            </select>
          </div>
        </div>

        {/* Student Cards List */}
        <div className="space-y-2.5">
          {filteredStudents.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center space-y-2">
              <span className="material-symbols-outlined text-outline-variant text-[32px]">
                person_search
              </span>
              <p className="text-xs text-on-surface-variant">
                No students match your filter or search query in your department.
              </p>
            </div>
          ) : (
            filteredStudents.map((stud) => {
              const isAttention = stud.current_status === 'NEEDS ATTENTION';
              const isVerified = stud.current_status === 'VERIFIED';
              const isReviewed = stud.current_status === 'REVIEWED';

              return (
                <div
                  key={stud.register_number}
                  onClick={() => handleOpenStudent(stud.register_number)}
                  className={`bg-surface-container-lowest rounded-xl p-3.5 border transition-all shadow-2xs space-y-2.5 hover:border-primary/50 cursor-pointer ${
                    isAttention
                      ? 'border-error/40 bg-error-container/5'
                      : 'border-outline-variant/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={
                          stud.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={stud.name}
                        className="w-11 h-11 rounded-full object-cover border border-outline-variant shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-on-surface truncate">{stud.name}</h4>
                        <div className="text-[11px] text-on-surface-variant font-mono">
                          <span className="font-bold text-primary">{stud.register_number}</span> •{' '}
                          <span>{stud.department}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        stud.is_active_shift
                          ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                          : stud.shift_status === 'COMPLETED'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : stud.shift_status === 'MISSED'
                          ? 'bg-error/10 text-error border border-error/30'
                          : 'bg-surface-container text-on-surface-variant border border-outline-variant/30'
                      }`}
                    >
                      {stud.is_active_shift ? 'SHIFT ACTIVE' : stud.shift_status || 'NOT STARTED'}
                    </span>
                  </div>

                  <div className="bg-surface-container-low rounded-lg p-2.5 text-xs grid grid-cols-2 gap-2 border border-outline-variant/30">
                    <div>
                      <span className="text-[10px] text-on-surface-variant block font-medium">
                        Assigned Shift
                      </span>
                      <span className="font-semibold text-on-surface">{stud.shift_name}</span>
                      <span className="text-[10px] text-outline block font-mono">{stud.shift_time}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-on-surface-variant block font-medium">
                        Last GPS Telemetry
                      </span>
                      <span className="font-mono font-bold text-on-surface">
                        {stud.last_verified_at || 'Pending'}
                      </span>
                      <div className="mt-0.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            isAttention
                              ? 'bg-error text-on-error'
                              : isReviewed
                              ? 'bg-secondary text-on-secondary'
                              : isVerified
                              ? 'bg-emerald-700 text-white'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          GPS: {stud.current_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-xs">
                    <span className="text-[11px] text-on-surface-variant">{stud.hospital}</span>
                    <span className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
                      Full Dossier & Logs →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
