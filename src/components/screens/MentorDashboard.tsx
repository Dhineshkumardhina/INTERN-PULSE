import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const MentorDashboard: React.FC = () => {
  const {
    currentUser,
    getMentorStudents,
    verifications,
    alerts,
    mentorNotifications,
    setCurrentScreen,
    setSelectedStudent,
    setSelectedAlert,
    openMentorAddStudentModal,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const assignedStudents = getMentorStudents(currentUser?.id);

  const mentorAlerts = alerts.filter(
    (a) =>
      a.mentor_id === currentUser?.id ||
      a.mentor_name?.toLowerCase().includes('anitha') ||
      assignedStudents.some((s) => s.register_number === a.register_number)
  );

  const pendingAlerts = mentorAlerts.filter((a) => a.status === 'NEEDS ATTENTION');
  const unreadNotifCount = mentorNotifications.filter((n) => !n.is_read).length;

  const activeStudentsCount = assignedStudents.filter((s) => s.is_active_shift).length;
  const needsAttentionCount = assignedStudents.filter(
    (s) => s.current_status === 'NEEDS ATTENTION'
  ).length;

  // Count verified checks today for mentor's students
  const verifiedTodayCount = verifications.filter(
    (v) =>
      (v.status === 'VERIFIED' || v.status === 'REVIEWED') &&
      assignedStudents.some((s) => s.register_number === v.register_number)
  ).length;

  // Filter students based on filter pills, shift type, and search query
  const filteredStudents = assignedStudents.filter((s) => {
    // Status Filter
    if (statusFilter === 'ACTIVE' && !s.is_active_shift) return false;
    if (statusFilter === 'NOT_STARTED' && s.shift_status !== 'NOT STARTED') return false;
    if (statusFilter === 'COMPLETED' && s.shift_status !== 'COMPLETED') return false;
    if (statusFilter === 'NEEDS_ATTENTION' && s.current_status !== 'NEEDS ATTENTION') return false;
    if (statusFilter === 'ABSENT' && s.shift_status !== 'MISSED') return false;

    // Shift Type Filter
    if (shiftFilter !== 'ALL' && !s.shift_name.toLowerCase().includes(shiftFilter.toLowerCase())) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.name.toLowerCase().includes(q);
      const matchReg = s.register_number.toLowerCase().includes(q);
      if (!matchName && !matchReg) return false;
    }

    return true;
  });

  const handleOpenStudentDetails = (regNumber: string) => {
    setSelectedStudent(regNumber);
    setCurrentScreen('mentor_student_details');
  };

  const handleReviewIncident = (alertId: string, registerNumber: string) => {
    setSelectedAlert(alertId);
    setSelectedStudent(registerNumber);
    setCurrentScreen('mentor_review_arun_kumar');
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Mentor Portal"
        actionButton={
          <button
            id="btn-mentor-notifications-header"
            onClick={() => setCurrentScreen('mentor_notifications')}
            className="relative p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>
        }
      />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Mentor Profile Card */}
        <section
          id="mentor-profile-card"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1594824813580-b228b3a0e676?w=150&auto=format&fit=crop&q=80'
              }
              alt="Mentor Avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-secondary shadow-2xs shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-secondary tracking-wider block">
                Clinical Faculty Supervisor
              </span>
              <h2 className="font-bold text-base text-on-surface truncate">
                {currentUser?.name || 'Dr. Anitha'}
              </h2>
              <p className="text-xs text-on-surface-variant truncate">
                Department of {currentUser?.department || 'Physiotherapy'}
              </p>
            </div>
          </div>

          <button
            id="btn-mentor-create-student"
            onClick={openMentorAddStudentModal}
            className="px-3.5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 min-h-[40px]"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Add Student</span>
          </button>
        </section>

        {/* 5 Summary Cards */}
        <section className="grid grid-cols-5 gap-1.5 sm:gap-2">
          <div className="bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/50 text-center shadow-2xs">
            <div className="text-[9px] sm:text-[10px] text-on-surface-variant font-bold uppercase truncate">
              Total
            </div>
            <div className="font-mono text-base sm:text-lg font-bold text-on-surface mt-0.5">
              {assignedStudents.length}
            </div>
          </div>

          <div
            onClick={() => setCurrentScreen('mentor_active_shifts')}
            className="bg-surface-container-lowest p-2 rounded-xl border border-primary/30 text-center shadow-2xs cursor-pointer hover:bg-primary/5 transition-colors"
          >
            <div className="text-[9px] sm:text-[10px] text-primary font-bold uppercase truncate">
              Active
            </div>
            <div className="font-mono text-base sm:text-lg font-bold text-primary mt-0.5">
              {activeStudentsCount}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/50 text-center shadow-2xs">
            <div className="text-[9px] sm:text-[10px] text-tertiary-container font-bold uppercase truncate">
              Verified
            </div>
            <div className="font-mono text-base sm:text-lg font-bold text-tertiary-container mt-0.5">
              {verifiedTodayCount}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/50 text-center shadow-2xs">
            <div className="text-[9px] sm:text-[10px] text-amber-700 font-bold uppercase truncate">
              Attention
            </div>
            <div className="font-mono text-base sm:text-lg font-bold text-amber-700 mt-0.5">
              {needsAttentionCount}
            </div>
          </div>

          <div
            onClick={() => {
              if (pendingAlerts.length > 0) {
                handleReviewIncident(pendingAlerts[0].id, pendingAlerts[0].register_number);
              }
            }}
            className={`bg-surface-container-lowest p-2 rounded-xl border text-center shadow-2xs transition-colors ${
              pendingAlerts.length > 0
                ? 'border-error/40 bg-error-container/10 cursor-pointer'
                : 'border-outline-variant/50'
            }`}
          >
            <div className="text-[9px] sm:text-[10px] text-error font-bold uppercase truncate">
              Alerts
            </div>
            <div className="font-mono text-base sm:text-lg font-bold text-error mt-0.5">
              {pendingAlerts.length}
            </div>
          </div>
        </section>

        {/* Quick Access Quick Tabs */}
        <section className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setCurrentScreen('mentor_active_shifts')}
            className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">radar</span>
              </div>
              <div>
                <div className="font-bold text-xs text-on-surface">Active Duty Monitor</div>
                <div className="text-[10px] text-on-surface-variant">
                  {activeStudentsCount} on shift now
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-[18px]">
              chevron_right
            </span>
          </button>

          <button
            onClick={() => setCurrentScreen('mentor_attendance')}
            className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 hover:border-primary/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">event_available</span>
              </div>
              <div>
                <div className="font-bold text-xs text-on-surface">Attendance Matrix</div>
                <div className="text-[10px] text-on-surface-variant">Daily / Weekly / Monthly</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-[18px]">
              chevron_right
            </span>
          </button>
        </section>

        {/* Urgent Action Banner: Pending Needs Attention Alert */}
        {pendingAlerts.length > 0 && (
          <section
            id="pending-alerts-banner"
            className="bg-error-container/20 rounded-2xl p-3.5 border border-error/50 shadow-xs space-y-2.5 animate-in fade-in"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-xl animate-pulse shrink-0">
                  warning
                </span>
                <div>
                  <h3 className="font-bold text-xs text-error">
                    Presence Verification Alert Requiring Review
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    {pendingAlerts.length} unresolved GPS anomaly logged
                  </p>
                </div>
              </div>

              <span className="bg-error text-on-error font-bold text-[9px] px-2 py-0.5 rounded-full uppercase shrink-0">
                ACTION REQUIRED
              </span>
            </div>

            {pendingAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-surface-container-lowest rounded-xl p-3 border border-error/30 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-on-surface">
                    {alert.student_name} ({alert.register_number})
                  </span>
                  <span className="font-mono text-error font-bold">{alert.time_display}</span>
                </div>

                <div className="text-[11px] text-on-surface-variant bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
                  <div className="font-semibold text-error">
                    {alert.reason} (Distance: {alert.distance_meters}m, Accuracy: ±{alert.accuracy_meters}m)
                  </div>
                </div>

                <button
                  id={`btn-review-${alert.id}`}
                  onClick={() => handleReviewIncident(alert.id, alert.register_number)}
                  className="w-full bg-error text-on-error rounded-xl py-2 font-bold text-xs hover:bg-error-container hover:text-on-error-container transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[38px]"
                >
                  <span className="material-symbols-outlined text-[16px]">fact_check</span>
                  Review Contextual Shift Timeline
                </button>
              </div>
            ))}
          </section>
        )}

        {/* Supervised Students Section Header with Search and Multi-Filtering */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">group</span>
              Assigned Students ({filteredStudents.length})
            </h3>
            <span className="text-[11px] text-secondary font-semibold">
              Department: {currentUser?.department || 'Physiotherapy'}
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search assigned student name or register no..."
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

          {/* Filter Pills */}
          <div className="flex gap-1.5 text-xs overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'ACTIVE', label: 'Active' },
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

          {/* Shift Type Filter */}
          <div className="flex items-center justify-between text-xs bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/30">
            <span className="text-on-surface-variant font-medium">Filter Shift Type:</span>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="bg-surface-container px-2.5 py-1 rounded-lg border border-outline-variant text-[11px] text-on-surface font-semibold focus:outline-none"
            >
              <option value="ALL">All Shifts</option>
              <option value="Night">Night Shift</option>
              <option value="Morning">Morning Shift</option>
              <option value="Evening">Evening Shift</option>
              <option value="General">General Day Duty</option>
              <option value="Twilight">Twilight ICU</option>
            </select>
          </div>

          {/* Student Cards List */}
          <div className="space-y-2.5">
            {filteredStudents.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center space-y-2">
                <span className="material-symbols-outlined text-outline-variant text-[32px]">
                  person_search
                </span>
                <p className="text-xs text-on-surface-variant">
                  No assigned students matching selected filter criteria.
                </p>
              </div>
            ) : (
              filteredStudents.map((stud) => {
                const isAttention = stud.current_status === 'NEEDS ATTENTION';
                const isVerified = stud.current_status === 'VERIFIED';
                const isReviewed = stud.current_status === 'REVIEWED';
                const isGpsUnavailable = stud.current_status === 'GPS UNAVAILABLE';

                return (
                  <div
                    key={stud.register_number}
                    className={`bg-surface-container-lowest rounded-xl p-3.5 border transition-all shadow-2xs space-y-2.5 hover:border-primary/50 cursor-pointer ${
                      isAttention
                        ? 'border-error/40 bg-error-container/5'
                        : 'border-outline-variant/50'
                    }`}
                    onClick={() => handleOpenStudentDetails(stud.register_number)}
                  >
                    {/* Top row: Avatar, Name, Register No, Department & Status Badge */}
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
                          <h4 className="font-bold text-sm text-on-surface truncate">
                            {stud.name}
                          </h4>
                          <div className="text-[11px] text-on-surface-variant font-mono">
                            <span className="font-bold text-primary">{stud.register_number}</span> •{' '}
                            <span>{stud.department}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shift Status Badge */}
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

                    {/* Middle row: Shift info & Times */}
                    <div className="bg-surface-container-low rounded-lg p-2.5 text-xs grid grid-cols-2 gap-2 border border-outline-variant/30">
                      <div>
                        <span className="text-[10px] text-on-surface-variant block font-medium">
                          Current Shift
                        </span>
                        <span className="font-semibold text-on-surface">
                          {stud.shift_name.replace(' Shift', '')}
                        </span>
                        <span className="text-[10px] text-outline block font-mono">
                          {stud.shift_time}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-on-surface-variant block font-medium">
                          Last GPS Verification
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
                                : isGpsUnavailable
                                ? 'bg-amber-700 text-white'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            GPS: {stud.current_status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Quick Action Links */}
                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-xs">
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-secondary">
                          apartment
                        </span>
                        <span>{stud.hospital}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {isAttention && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReviewIncident('alert_arun_01', stud.register_number);
                            }}
                            className="px-2.5 py-1 bg-error text-on-error rounded-lg font-bold text-[11px] hover:bg-error-container transition-colors cursor-pointer"
                          >
                            Review Alert
                          </button>
                        )}
                        <span className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
                          Student Dossier →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
