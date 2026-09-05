import React from 'react';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentUser, currentScreen, setCurrentScreen, alerts } = useApp();

  if (!currentUser || currentScreen === 'login') return null;

  const role = currentUser.role || 'STUDENT';
  const pendingAlertsCount = alerts.filter((a) => a.status === 'NEEDS ATTENTION').length;

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline-variant/50 px-1 py-1 flex items-center justify-around shadow-lg max-w-md mx-auto"
    >
      {role === 'STUDENT' && (
        <>
          <button
            id="nav-student-dashboard"
            onClick={() => setCurrentScreen('student_dashboard')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'student_dashboard'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'student_dashboard' ? 'fill' : ''
              }`}
            >
              dashboard
            </span>
            <span className="text-[9px] tracking-tight truncate max-w-full text-center mt-0.5">Dashboard</span>
          </button>

          <button
            id="nav-student-shift"
            onClick={() => setCurrentScreen('active_shift')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'active_shift'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'active_shift' ? 'fill' : ''
              }`}
            >
              radar
            </span>
            <span className="text-[9px] tracking-tight truncate max-w-full text-center mt-0.5">Shift</span>
          </button>

          <button
            id="nav-student-attendance"
            onClick={() => setCurrentScreen('student_attendance')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'student_attendance'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'student_attendance' ? 'fill' : ''
              }`}
            >
              event_available
            </span>
            <span className="text-[9px] tracking-tight truncate max-w-full text-center mt-0.5">Attendance</span>
          </button>

          <button
            id="nav-student-gps-history"
            onClick={() => setCurrentScreen('gps_history')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'gps_history'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'gps_history' ? 'fill' : ''
              }`}
            >
              history
            </span>
            <span className="text-[9px] tracking-tight truncate max-w-full text-center mt-0.5">GPS Log</span>
          </button>

          <button
            id="nav-student-profile"
            onClick={() => setCurrentScreen('student_profile')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'student_profile'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'student_profile' ? 'fill' : ''
              }`}
            >
              account_circle
            </span>
            <span className="text-[9px] tracking-tight truncate max-w-full text-center mt-0.5">Profile</span>
          </button>
        </>
      )}

      {role === 'MENTOR' && (
        <>
          <button
            id="nav-mentor-dashboard"
            onClick={() => setCurrentScreen('mentor_dashboard')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'mentor_dashboard'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'mentor_dashboard' ? 'fill' : ''
              }`}
            >
              dashboard
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Dashboard</span>
          </button>

          <button
            id="nav-mentor-students"
            onClick={() => setCurrentScreen('mentor_students')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'mentor_students' || currentScreen === 'mentor_student_details'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'mentor_students' || currentScreen === 'mentor_student_details' ? 'fill' : ''
              }`}
            >
              group
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Students</span>
          </button>

          <button
            id="nav-mentor-active-shifts"
            onClick={() => setCurrentScreen('mentor_active_shifts')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'mentor_active_shifts'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'mentor_active_shifts' ? 'fill' : ''
              }`}
            >
              radar
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Active</span>
          </button>

          <button
            id="nav-mentor-attendance"
            onClick={() => setCurrentScreen('mentor_attendance')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'mentor_attendance'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'mentor_attendance' ? 'fill' : ''
              }`}
            >
              event_available
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Attendance</span>
          </button>

          <button
            id="nav-mentor-review"
            onClick={() => setCurrentScreen('mentor_review_arun_kumar')}
            className={`flex-1 min-w-0 relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'mentor_review_arun_kumar'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'mentor_review_arun_kumar' ? 'fill' : ''
              }`}
            >
              fact_check
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Review</span>
            {pendingAlertsCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-error text-on-error rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {pendingAlertsCount}
              </span>
            )}
          </button>
        </>
      )}

      {role === 'HOD' && (
        <>
          <button
            id="nav-hod-dashboard"
            onClick={() => setCurrentScreen('hod_dashboard')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'hod_dashboard'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'hod_dashboard' ? 'fill' : ''
              }`}
            >
              dashboard
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Dashboard</span>
          </button>

          <button
            id="nav-hod-students"
            onClick={() => setCurrentScreen('hod_students')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'hod_students' || currentScreen === 'department_students'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'hod_students' || currentScreen === 'department_students' ? 'fill' : ''
              }`}
            >
              groups
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Students</span>
          </button>

          <button
            id="nav-hod-mentors"
            onClick={() => setCurrentScreen('hod_mentors')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'hod_mentors'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'hod_mentors' ? 'fill' : ''
              }`}
            >
              badge
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Mentors</span>
          </button>

          <button
            id="nav-hod-alerts"
            onClick={() => setCurrentScreen('department_alerts')}
            className={`flex-1 min-w-0 relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'department_alerts'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'department_alerts' ? 'fill' : ''
              }`}
            >
              warning
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Alerts</span>
            {pendingAlertsCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-error text-on-error rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {pendingAlertsCount}
              </span>
            )}
          </button>

          <button
            id="nav-hod-analytics"
            onClick={() => setCurrentScreen('hod_analytics_dashboard')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'hod_analytics_dashboard'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'hod_analytics_dashboard' ? 'fill' : ''
              }`}
            >
              query_stats
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Reports</span>
          </button>
        </>
      )}

      {role === 'ADMIN' && (
        <>
          <button
            id="nav-admin-dashboard"
            onClick={() => setCurrentScreen('admin_dashboard')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'admin_dashboard'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'admin_dashboard' ? 'fill' : ''
              }`}
            >
              admin_panel_settings
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Admin</span>
          </button>

          <button
            id="nav-admin-students"
            onClick={() => setCurrentScreen('admin_students')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'admin_students' || currentScreen === 'admin_hods' || currentScreen === 'admin_mentors'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'admin_students' || currentScreen === 'admin_hods' || currentScreen === 'admin_mentors' ? 'fill' : ''
              }`}
            >
              groups
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Users</span>
          </button>

          <button
            id="nav-admin-shifts"
            onClick={() => setCurrentScreen('admin_shifts')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'admin_shifts' || currentScreen === 'admin_change_shift'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'admin_shifts' || currentScreen === 'admin_change_shift' ? 'fill' : ''
              }`}
            >
              calendar_clock
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Shifts</span>
          </button>

          <button
            id="nav-admin-alerts"
            onClick={() => setCurrentScreen('admin_alerts')}
            className={`flex-1 min-w-0 relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'admin_alerts'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'admin_alerts' ? 'fill' : ''
              }`}
            >
              warning
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Alerts</span>
            {pendingAlertsCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-error text-on-error rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {pendingAlertsCount}
              </span>
            )}
          </button>

          <button
            id="nav-admin-logs"
            onClick={() => setCurrentScreen('admin_activity_log')}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              currentScreen === 'admin_activity_log'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentScreen === 'admin_activity_log' ? 'fill' : ''
              }`}
            >
              receipt_long
            </span>
            <span className="text-[9.5px] tracking-tight truncate max-w-full text-center mt-0.5">Audit Log</span>
          </button>
        </>
      )}
    </nav>
  );
};
