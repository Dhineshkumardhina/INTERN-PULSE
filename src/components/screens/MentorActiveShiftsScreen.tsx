import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const MentorActiveShiftsScreen: React.FC = () => {
  const {
    currentUser,
    getMentorStudents,
    setSelectedStudent,
    setSelectedAlert,
    setCurrentScreen,
  } = useApp();

  const assignedStudents = getMentorStudents(currentUser?.id);
  const activeStudents = assignedStudents.filter((s) => s.is_active_shift);
  const inactiveStudents = assignedStudents.filter((s) => !s.is_active_shift);

  const handleStudentClick = (regNumber: string) => {
    setSelectedStudent(regNumber);
    setCurrentScreen('mentor_student_details');
  };

  const handleReviewAlert = (regNumber: string) => {
    setSelectedAlert('alert_arun_01');
    setSelectedStudent(regNumber);
    setCurrentScreen('mentor_review_arun_kumar');
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Active Duty Shift Monitor"
        showBack={true}
        onBack={() => setCurrentScreen('mentor_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Real-time Telemetry Integrity Notice */}
        <div className="p-3 bg-secondary/5 rounded-2xl border border-secondary/20 flex items-start gap-2.5 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
            security
          </span>
          <div className="space-y-0.5">
            <span className="font-bold text-on-surface block">Clinical Presence Telemetry Standard</span>
            <p className="text-[11px] leading-relaxed">
              InternTrack does not claim a student is physically present unless an actual GPS verification supports it. All telemetry is recorded with timestamp and radial distance.
            </p>
          </div>
        </div>

        {/* ACTIVE NOW SECTION */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface">
                ACTIVE NOW ({activeStudents.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-outline font-semibold">
              Live Duty Roster
            </span>
          </div>

          {activeStudents.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center space-y-1">
              <span className="material-symbols-outlined text-outline-variant text-[28px]">
                bedtime
              </span>
              <p className="text-xs text-on-surface-variant">No interns currently on active duty shift.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeStudents.map((stud) => {
                const isNeedsAttention = stud.current_status === 'NEEDS ATTENTION';
                const isVerified = stud.current_status === 'VERIFIED';
                const isReviewed = stud.current_status === 'REVIEWED';

                return (
                  <div
                    key={stud.register_number}
                    onClick={() => handleStudentClick(stud.register_number)}
                    className={`bg-surface-container-lowest rounded-2xl p-4 border transition-all shadow-2xs space-y-3 hover:border-primary/50 cursor-pointer ${
                      isNeedsAttention
                        ? 'border-error/50 bg-error-container/5'
                        : 'border-outline-variant/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            stud.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={stud.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-on-surface truncate">{stud.name}</h4>
                          <div className="text-xs text-on-surface-variant font-mono">
                            <span className="font-bold text-primary">{stud.register_number}</span> •{' '}
                            <span>{stud.department}</span>
                          </div>
                        </div>
                      </div>

                      {/* GPS Verification Badge */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                          isNeedsAttention
                            ? 'bg-error text-on-error animate-pulse shadow-xs'
                            : isReviewed
                            ? 'bg-secondary-container text-on-secondary-container'
                            : isVerified
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {stud.current_status}
                      </span>
                    </div>

                    {/* Shift & Verification Details */}
                    <div className="bg-surface-container-low rounded-xl p-3 text-xs grid grid-cols-2 gap-2 border border-outline-variant/30">
                      <div>
                        <span className="text-[10px] text-on-surface-variant block font-medium">
                          Active Duty Shift
                        </span>
                        <span className="font-bold text-on-surface">{stud.shift_name}</span>
                        <span className="text-[10px] text-primary font-mono block">
                          {stud.shift_time}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-on-surface-variant block font-medium">
                          Latest Verification
                        </span>
                        <span className="font-mono font-bold text-on-surface">
                          {stud.last_verified_at || '10:02 PM'}
                        </span>
                        <span className="text-[10px] text-on-surface-variant block">
                          Dist: {stud.last_verification_distance || 42}m (±{stud.last_verification_accuracy || 12}m)
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-xs">
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Shift In Progress</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {isNeedsAttention && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReviewAlert(stud.register_number);
                            }}
                            className="px-3 py-1 bg-error text-on-error rounded-lg font-bold text-xs hover:bg-error-container transition-colors cursor-pointer shadow-xs"
                          >
                            Review Alert
                          </button>
                        )}
                        <span className="text-xs text-primary font-bold hover:underline">
                          Telemetry Dossier →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* OFF SHIFT / SCHEDULED INTERNS */}
        <section className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
              OFF DUTY / UPCOMING ROSTER ({inactiveStudents.length})
            </h3>
          </div>

          <div className="space-y-2">
            {inactiveStudents.map((stud) => (
              <div
                key={stud.register_number}
                onClick={() => handleStudentClick(stud.register_number)}
                className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/40 flex items-center justify-between text-xs hover:border-primary/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={
                      stud.avatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={stud.name}
                    className="w-9 h-9 rounded-full object-cover border border-outline-variant shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-on-surface truncate">{stud.name}</div>
                    <div className="text-[11px] text-on-surface-variant font-mono">
                      {stud.register_number} • {stud.shift_name} ({stud.shift_time})
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                    stud.shift_status === 'COMPLETED'
                      ? 'bg-primary/10 text-primary'
                      : stud.shift_status === 'MISSED'
                      ? 'bg-error/10 text-error'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {stud.shift_status || 'NOT STARTED'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
