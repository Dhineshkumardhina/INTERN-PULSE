import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/screens/LoginScreen';
import { StudentDashboard } from './components/screens/StudentDashboard';
import { ActiveShiftScreen } from './components/screens/ActiveShiftScreen';
import { VerificationRequestModal } from './components/screens/VerificationRequestModal';
import { VerificationResultScreen } from './components/screens/VerificationResultScreen';
import { GpsHistoryScreen } from './components/screens/GpsHistoryScreen';
import { StudentAttendanceScreen } from './components/screens/StudentAttendanceScreen';
import { StudentProfileScreen } from './components/screens/StudentProfileScreen';
import { StudentNotificationsScreen } from './components/screens/StudentNotificationsScreen';
import { StartShiftModal } from './components/screens/StartShiftModal';
import { CheckOutModal } from './components/screens/CheckOutModal';
import { ShiftCompletedModal } from './components/screens/ShiftCompletedModal';
import { MentorDashboard } from './components/screens/MentorDashboard';
import { MentorReviewScreen } from './components/screens/MentorReviewScreen';
import { MentorStudentDetailsScreen } from './components/screens/MentorStudentDetailsScreen';
import { MentorStudentsScreen } from './components/screens/MentorStudentsScreen';
import { MentorActiveShiftsScreen } from './components/screens/MentorActiveShiftsScreen';
import { MentorAttendanceScreen } from './components/screens/MentorAttendanceScreen';
import { MentorNotificationsScreen } from './components/screens/MentorNotificationsScreen';
import { MentorAddStudentModal } from './components/screens/MentorAddStudentModal';
import { HodDashboard } from './components/screens/HodDashboard';
import { DepartmentAlertsScreen } from './components/screens/DepartmentAlertsScreen';
import { HodStudentsScreen } from './components/screens/HodStudentsScreen';
import { HodMentorsScreen } from './components/screens/HodMentorsScreen';
import { HodGpsMonitoringScreen } from './components/screens/HodGpsMonitoringScreen';
import { HodAnalyticsScreen } from './components/screens/HodAnalyticsScreen';
import { HodAddMentorModal } from './components/screens/HodAddMentorModal';
import { AdminDashboard } from './components/screens/AdminDashboard';
import { AdminHodManagementScreen } from './components/screens/AdminHodManagementScreen';
import { AdminMentorManagementScreen } from './components/screens/AdminMentorManagementScreen';
import { AdminStudentManagementScreen } from './components/screens/AdminStudentManagementScreen';
import { AdminShiftManagementScreen } from './components/screens/AdminShiftManagementScreen';
import { AdminInternshipScreen } from './components/screens/AdminInternshipScreen';
import { AdminAttendanceScreen } from './components/screens/AdminAttendanceScreen';
import { AdminGpsMonitoringScreen } from './components/screens/AdminGpsMonitoringScreen';
import { AdminAlertsScreen } from './components/screens/AdminAlertsScreen';
import { AdminReportsScreen } from './components/screens/AdminReportsScreen';
import { AdminActivityLogScreen } from './components/screens/AdminActivityLogScreen';
import { GeofenceSettingsScreen } from './components/screens/GeofenceSettingsScreen';
import { BottomNav } from './components/common/BottomNav';
import { SimulationBar } from './components/common/SimulationBar';

// Allowed screens per role
const ADMIN_ONLY_SCREENS = new Set([
  'admin_dashboard',
  'admin_hods',
  'admin_mentors',
  'admin_students',
  'admin_shifts',
  'admin_change_shift',
  'admin_internships',
  'admin_attendance',
  'admin_gps_monitoring',
  'admin_alerts',
  'admin_reports',
  'admin_activity_log',
  'geofence_setup',
]);

const STUDENT_ALLOWED_SCREENS = new Set([
  'student_dashboard',
  'active_shift',
  'verification_result',
  'verification_result_needs_attention',
  'gps_history',
  'student_attendance',
  'student_profile',
  'student_notifications',
]);

const MENTOR_ALLOWED_SCREENS = new Set([
  'mentor_dashboard',
  'mentor_review_arun_kumar',
  'mentor_student_details',
  'mentor_students',
  'mentor_active_shifts',
  'mentor_attendance',
  'mentor_notifications',
]);

const HOD_ALLOWED_SCREENS = new Set([
  'hod_dashboard',
  'department_alerts',
  'hod_alerts',
  'hod_students',
  'department_students',
  'hod_mentors',
  'hod_gps_monitoring',
  'hod_analytics_dashboard',
  'mentor_student_details',
]);

const ADMIN_ALLOWED_SCREENS = new Set([
  'admin_dashboard',
  'admin_hods',
  'admin_mentors',
  'admin_students',
  'admin_shifts',
  'admin_change_shift',
  'admin_internships',
  'admin_attendance',
  'admin_gps_monitoring',
  'admin_alerts',
  'admin_reports',
  'admin_activity_log',
  'geofence_setup',
  'mentor_student_details',
  'mentor_review_arun_kumar',
  'student_attendance',
  'gps_history',
  'student_profile',
]);

const AppRouter: React.FC = () => {
  const { currentScreen, currentUser, setCurrentScreen } = useApp();

  if (!currentUser || currentScreen === 'login') {
    return (
      <div className="w-full min-h-screen bg-surface-dim/30 flex justify-center overflow-x-hidden">
        <div className="w-full max-w-md min-h-screen bg-background text-on-surface flex flex-col font-body-md antialiased relative shadow-2xl overflow-x-hidden">
          <LoginScreen />
        </div>
      </div>
    );
  }

  // Security Role Guard: Verify that the current user has permission to access the requested screen
  const isAuthorized = (() => {
    switch (currentUser.role) {
      case 'STUDENT':
        return STUDENT_ALLOWED_SCREENS.has(currentScreen) && !ADMIN_ONLY_SCREENS.has(currentScreen);
      case 'MENTOR':
        return MENTOR_ALLOWED_SCREENS.has(currentScreen) && !ADMIN_ONLY_SCREENS.has(currentScreen);
      case 'HOD':
        return HOD_ALLOWED_SCREENS.has(currentScreen) && !ADMIN_ONLY_SCREENS.has(currentScreen);
      case 'ADMIN':
        return ADMIN_ALLOWED_SCREENS.has(currentScreen);
      default:
        return false;
    }
  })();

  // Synchronize state if unauthorized route attempted (e.g. HOD attempting direct Admin route)
  React.useEffect(() => {
    if (!isAuthorized && currentUser) {
      if (currentUser.role === 'HOD') {
        setCurrentScreen('hod_dashboard');
      } else if (currentUser.role === 'MENTOR') {
        setCurrentScreen('mentor_dashboard');
      } else if (currentUser.role === 'STUDENT') {
        setCurrentScreen('student_dashboard');
      }
    }
  }, [isAuthorized, currentUser, currentScreen, setCurrentScreen]);

  // Render authorized screen or secure default fallback (Do NOT expose any Admin UI/data to HOD)
  const renderScreenContent = () => {
    if (!isAuthorized) {
      // Return safe role-specific dashboard fallback if an unauthorized screen was attempted
      if (currentUser.role === 'STUDENT') return <StudentDashboard />;
      if (currentUser.role === 'MENTOR') return <MentorDashboard />;
      if (currentUser.role === 'HOD') return <HodDashboard />;
      return <AdminDashboard />;
    }

    // Student Screens
    if (currentScreen === 'student_dashboard') return <StudentDashboard />;
    if (currentScreen === 'active_shift') return <ActiveShiftScreen />;
    if (currentScreen === 'verification_result') return <VerificationResultScreen />;
    if (currentScreen === 'verification_result_needs_attention') {
      return <VerificationResultScreen forceAttention={true} />;
    }
    if (currentScreen === 'gps_history') return <GpsHistoryScreen />;
    if (currentScreen === 'student_attendance') return <StudentAttendanceScreen />;
    if (currentScreen === 'student_profile') return <StudentProfileScreen />;
    if (currentScreen === 'student_notifications') return <StudentNotificationsScreen />;

    // Mentor Screens
    if (currentScreen === 'mentor_dashboard') return <MentorDashboard />;
    if (currentScreen === 'mentor_review_arun_kumar') return <MentorReviewScreen />;
    if (currentScreen === 'mentor_student_details') return <MentorStudentDetailsScreen />;
    if (currentScreen === 'mentor_students') return <MentorStudentsScreen />;
    if (currentScreen === 'mentor_active_shifts') return <MentorActiveShiftsScreen />;
    if (currentScreen === 'mentor_attendance') return <MentorAttendanceScreen />;
    if (currentScreen === 'mentor_notifications') return <MentorNotificationsScreen />;

    // HOD Screens
    if (currentScreen === 'hod_dashboard') return <HodDashboard />;
    if (currentScreen === 'department_alerts' || currentScreen === 'hod_alerts') return <DepartmentAlertsScreen />;
    if (currentScreen === 'hod_students' || currentScreen === 'department_students') return <HodStudentsScreen />;
    if (currentScreen === 'hod_mentors') return <HodMentorsScreen />;
    if (currentScreen === 'hod_gps_monitoring') return <HodGpsMonitoringScreen />;
    if (currentScreen === 'hod_analytics_dashboard') return <HodAnalyticsScreen />;

    // Admin Screens
    if (currentScreen === 'admin_dashboard') return <AdminDashboard />;
    if (currentScreen === 'admin_hods') return <AdminHodManagementScreen />;
    if (currentScreen === 'admin_mentors') return <AdminMentorManagementScreen />;
    if (currentScreen === 'admin_students') return <AdminStudentManagementScreen />;
    if (currentScreen === 'admin_shifts' || currentScreen === 'admin_change_shift') return <AdminShiftManagementScreen />;
    if (currentScreen === 'admin_internships') return <AdminInternshipScreen />;
    if (currentScreen === 'admin_attendance') return <AdminAttendanceScreen />;
    if (currentScreen === 'admin_gps_monitoring') return <AdminGpsMonitoringScreen />;
    if (currentScreen === 'admin_alerts') return <AdminAlertsScreen />;
    if (currentScreen === 'admin_reports') return <AdminReportsScreen />;
    if (currentScreen === 'admin_activity_log') return <AdminActivityLogScreen />;
    if (currentScreen === 'geofence_setup') return <GeofenceSettingsScreen />;

    return <StudentDashboard />;
  };

  return (
    <div className="w-full min-h-screen bg-surface-dim/30 flex justify-center overflow-x-hidden">
      {/* Target Mobile Shell (390px-440px max width on desktop, 100% on mobile) */}
      <div className="w-full max-w-md min-h-screen bg-background text-on-surface flex flex-col font-body-md antialiased relative shadow-2xl overflow-x-hidden">
        {/* Dynamic Screen Routing with Role Authorization Guard */}
        {renderScreenContent()}

        {/* Global Modals & Fixed Overlays */}
        <StartShiftModal />
        <CheckOutModal />
        <ShiftCompletedModal />
        <VerificationRequestModal />
        <MentorAddStudentModal />
        <HodAddMentorModal />
        <SimulationBar />
        <BottomNav />
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
