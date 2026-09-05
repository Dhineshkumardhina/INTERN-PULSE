import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const HodMentorsScreen: React.FC = () => {
  const {
    currentUser,
    getDepartmentMentors,
    getDepartmentStudents,
    getDepartmentAlerts,
    setSelectedStudent,
    setCurrentScreen,
    openHodAddMentorModal,
  } = useApp();

  const hodDept = currentUser?.department || 'Physiotherapy';
  const departmentMentors = getDepartmentMentors(hodDept);
  const departmentStudents = getDepartmentStudents(hodDept);
  const departmentAlerts = getDepartmentAlerts(hodDept);

  const [expandedMentorId, setExpandedMentorId] = useState<string | null>('mentor01');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredMentors = departmentMentors.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
  });

  const toggleExpand = (id: string) => {
    setExpandedMentorId((prev) => (prev === id ? null : id));
  };

  const handleOpenStudentDossier = (regNumber: string) => {
    setSelectedStudent(regNumber);
    setCurrentScreen('mentor_student_details');
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Department Faculty Mentors"
        showBack={true}
        onBack={() => setCurrentScreen('hod_dashboard')}
        actionButton={
          <button
            onClick={openHodAddMentorModal}
            className="p-1.5 bg-primary/10 text-primary rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span className="hidden sm:inline">Add Mentor</span>
          </button>
        }
      />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* Scope Banner */}
        <section className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/40 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Faculty Supervision Scope
            </span>
            <h3 className="font-bold text-sm text-on-surface">
              {hodDept} Mentors ({departmentMentors.length})
            </h3>
          </div>
          <button
            onClick={openHodAddMentorModal}
            className="px-3 py-1.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-container transition-all flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Mentor</span>
          </button>
        </section>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search faculty mentor name or ID..."
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

        {/* Mentors List with Expanded Details */}
        <div className="space-y-3">
          {filteredMentors.map((mentor) => {
            const mentorStudents = departmentStudents.filter(
              (s) => s.mentor_id === mentor.id || s.mentor_name === mentor.name
            );
            const activeCount = mentorStudents.filter((s) => s.is_active_shift).length;
            const attentionCount = mentorStudents.filter(
              (s) => s.current_status === 'NEEDS ATTENTION'
            ).length;
            const reviewedAlertsCount = departmentAlerts.filter(
              (a) => (a.mentor_id === mentor.id || a.mentor_name === mentor.name) && a.status === 'REVIEWED'
            ).length;

            const isExpanded = expandedMentorId === mentor.id;

            return (
              <div
                key={mentor.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-2xs overflow-hidden transition-all"
              >
                {/* Mentor Card Header (Click to expand/collapse) */}
                <div
                  onClick={() => toggleExpand(mentor.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-surface-container/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm shrink-0 border border-secondary/30">
                      {mentor.name.replace('Dr. ', '').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-on-surface truncate">{mentor.name}</h4>
                      <div className="text-[11px] text-on-surface-variant font-mono">
                        ID: <strong className="text-primary">{mentor.id}</strong> • {mentor.title || 'Clinical Supervisor'}
                      </div>
                      <div className="text-[10px] text-outline mt-0.5">
                        {mentor.department} • {mentor.hospital}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-xs text-on-surface">
                        {mentorStudents.length} Students
                      </div>
                      <div className="text-[10px] text-on-surface-variant">
                        <span className="text-primary font-semibold">{activeCount} Active</span>
                        {attentionCount > 0 && (
                          <span className="text-error font-bold ml-1">({attentionCount} alert)</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`material-symbols-outlined text-[20px] text-outline transition-transform ${
                        isExpanded ? 'rotate-180 text-primary' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Expanded Dossier & Assigned Students */}
                {isExpanded && (
                  <div className="p-3.5 pt-0 border-t border-outline-variant/30 space-y-3 bg-surface-container-low/30 animate-in fade-in">
                    {/* Workload & Supervision Statistics */}
                    <div className="grid grid-cols-4 gap-2 pt-3 text-center text-xs">
                      <div className="p-2 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
                        <span className="text-[9.5px] text-on-surface-variant block font-medium">Assigned</span>
                        <span className="font-mono font-bold text-on-surface text-sm">
                          {mentorStudents.length}
                        </span>
                      </div>
                      <div className="p-2 bg-surface-container-lowest rounded-xl border border-primary/30">
                        <span className="text-[9.5px] text-primary block font-medium">Active Shift</span>
                        <span className="font-mono font-bold text-primary text-sm">
                          {activeCount}
                        </span>
                      </div>
                      <div className="p-2 bg-surface-container-lowest rounded-xl border border-error/30">
                        <span className="text-[9.5px] text-error block font-medium">Attention</span>
                        <span className="font-mono font-bold text-error text-sm">
                          {attentionCount}
                        </span>
                      </div>
                      <div className="p-2 bg-surface-container-lowest rounded-xl border border-secondary/30">
                        <span className="text-[9.5px] text-secondary block font-medium">Reviewed</span>
                        <span className="font-mono font-bold text-secondary text-sm">
                          {reviewedAlertsCount}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Interns Sub-List */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs px-1">
                        <span className="font-bold text-on-surface-variant text-[11px] uppercase tracking-wider">
                          Assigned Students ({mentorStudents.length})
                        </span>
                      </div>

                      {mentorStudents.length === 0 ? (
                        <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-center text-xs text-on-surface-variant">
                          No students currently assigned to this mentor.
                        </div>
                      ) : (
                        mentorStudents.map((stud) => {
                          const isAtt = stud.current_status === 'NEEDS ATTENTION';

                          return (
                            <div
                              key={stud.register_number}
                              onClick={() => handleOpenStudentDossier(stud.register_number)}
                              className="p-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/40 flex items-center justify-between text-xs hover:border-primary/40 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={
                                    stud.avatar ||
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                                  }
                                  alt={stud.name}
                                  className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-on-surface truncate">{stud.name}</div>
                                  <div className="text-[10px] text-on-surface-variant font-mono">
                                    {stud.register_number} • {stud.shift_name}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    isAtt
                                      ? 'bg-error text-on-error'
                                      : stud.is_active_shift
                                      ? 'bg-emerald-500/15 text-emerald-800'
                                      : 'bg-surface-container text-on-surface-variant'
                                  }`}
                                >
                                  {stud.is_active_shift ? 'ON SHIFT' : stud.current_status}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
