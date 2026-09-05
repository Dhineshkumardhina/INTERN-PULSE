import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Student,
  StudentScheduleEntry,
  Mentor,
  Hod,
  Department,
  Shift,
  GpsVerification,
  DepartmentAlert,
  AdminActivityLog,
  UserProfile,
  GpsSimulationMode,
  UserRole,
  HospitalGeofence,
  StudentAttendanceRecord,
  StudentNotification,
  MentorNotification,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_MENTORS,
  INITIAL_HODS,
  INITIAL_DEPARTMENTS,
  INITIAL_SHIFTS,
  INITIAL_VERIFICATIONS,
  INITIAL_ALERTS,
  INITIAL_LOGS,
  INITIAL_MENTOR_NOTIFICATIONS,
  DEMO_USERS,
  HOSPITAL_CONFIG,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_STUDENT_NOTIFICATIONS,
} from '../services/mockData';
import { MockGpsService } from '../services/mockGpsService';

export interface CheckOutSummaryData {
  startTime: string;
  endTime: string;
  successfulVerifications: number;
  needsAttentionEvents: number;
  finalStatus: string;
  shiftName: string;
  hoursLogged: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  currentRole: UserRole | null;
  students: Student[];
  mentors: Mentor[];
  hods: Hod[];
  departments: Department[];
  shifts: Shift[];
  verifications: GpsVerification[];
  alerts: DepartmentAlert[];
  activityLogs: AdminActivityLog[];
  attendanceRecords: StudentAttendanceRecord[];
  studentNotifications: StudentNotification[];
  mentorNotifications: MentorNotification[];
  gpsMode: GpsSimulationMode;
  currentScreen: string;
  selectedStudentRegisterNumber: string | null;
  selectedAlertId: string | null;
  isVerificationModalOpen: boolean;
  isStartShiftModalOpen: boolean;
  isCheckOutModalOpen: boolean;
  isMentorAddStudentModalOpen: boolean;
  activeCheckOutSummary: CheckOutSummaryData | null;
  isVerifying: boolean;
  lastVerification: GpsVerification | null;
  pendingRandomRequest: boolean;
  hospitalGeofence: HospitalGeofence;

  // Actions
  login: (id: string, password?: string) => boolean;
  logout: () => void;
  switchRoleQuickly: (role: UserRole) => void;
  setCurrentScreen: (screen: string) => void;
  setSelectedStudent: (regNumber: string | null) => void;
  setSelectedAlert: (alertId: string | null) => void;
  setGpsMode: (mode: GpsSimulationMode) => void;
  updateHospitalGeofence: (newGeofence: Partial<HospitalGeofence>, reason?: string) => void;
  resetHospitalGeofence: () => void;
  
  // Student Actions
  startShift: (regNumber: string) => Promise<GpsVerification>;
  endShift: (regNumber: string) => void;
  openStartShiftModal: () => void;
  closeStartShiftModal: () => void;
  openCheckOutModal: () => void;
  closeCheckOutModal: () => void;
  confirmCheckOut: (regNumber: string) => void;
  dismissCheckOutSummary: () => void;
  performGpsVerification: (forcedMode?: GpsSimulationMode, customTime?: string, type?: GpsVerification['verification_type']) => Promise<GpsVerification>;
  triggerRandomVerificationPrompt: (customTime?: string) => void;
  dismissVerificationModal: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Mentor Actions
  markAlertAsReviewed: (alertId: string, notes: string) => void;
  openMentorAddStudentModal: () => void;
  closeMentorAddStudentModal: () => void;
  mentorAddStudent: (newStudent: {
    register_number: string;
    name: string;
    email?: string;
    phone?: string;
    academic_year?: string;
    internship_department?: string;
    internship_start_date?: string;
    internship_end_date?: string;
    shift_id: string;
    shift_name: string;
    shift_time: string;
    is_night_shift: boolean;
  }) => { success: boolean; message: string };
  markMentorNotificationAsRead: (id: string) => void;
  markAllMentorNotificationsAsRead: () => void;
  getMentorStudents: (mentorId?: string) => Student[];

  // HOD Actions & Department Scoping
  isHodAddMentorModalOpen: boolean;
  openHodAddMentorModal: () => void;
  closeHodAddMentorModal: () => void;
  hodAddMentor: (newMentor: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    title?: string;
  }) => { success: boolean; message: string };
  getDepartmentStudents: (dept?: string) => Student[];
  getDepartmentMentors: (dept?: string) => Mentor[];
  getDepartmentAlerts: (dept?: string) => DepartmentAlert[];
  getDepartmentVerifications: (dept?: string) => GpsVerification[];

  // Admin Actions & Full System Oversight
  createHod: (data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    reason?: string;
  }) => { success: boolean; message: string };
  editHod: (id: string, data: Partial<Hod>, reason: string) => { success: boolean; message: string };
  toggleHodStatus: (id: string, reason: string) => void;
  adminCreateMentor: (data: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    title?: string;
    department: string;
    reason?: string;
  }) => { success: boolean; message: string };
  adminEditMentor: (id: string, data: Partial<Mentor>, reason: string) => { success: boolean; message: string };
  adminToggleMentorStatus: (id: string, reason: string) => void;
  adminReassignMentorDepartment: (mentorId: string, newDept: string, reason: string) => void;
  adminEditStudent: (regNumber: string, data: Partial<Student>, reason: string) => { success: boolean; message: string };
  adminToggleStudentStatus: (regNumber: string, reason: string) => void;
  adminChangeStudentDepartment: (regNumber: string, newDept: string, newMentorId?: string, reason?: string) => void;
  createShift: (shiftData: Omit<Shift, 'id'>, reason?: string) => { success: boolean; message: string };
  bulkAssignShift: (studentRegs: string[], shiftId: string, reason: string) => { success: boolean; count: number };
  changeStudentShift: (
    regNumber: string,
    newShiftId: string,
    reason: string,
    resolveConflictingScheduleIds?: string[]
  ) => void;
  changeStudentMentor: (regNumber: string, newMentorId: string, reason: string) => void;
  addStudent: (student: Omit<Student, 'is_active_shift' | 'current_status'>, reason: string) => void;
  deleteStudent: (regNumber: string, reason: string) => void;
  
  // Demo helper
  runDemonstrationStep: (
    step:
      | 'NIGHT_START'
      | 'RANDOM_0342_ALERT'
      | 'REVIEW_ALERT'
      | 'NORMAL_VERIFIED'
      | 'GPS_UNAVAILABLE'
      | 'PERMISSION_DENIED'
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('interntrack_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('interntrack_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });
  const [mentors, setMentors] = useState<Mentor[]>(() => INITIAL_MENTORS);
  const [hods, setHods] = useState<Hod[]>(() => INITIAL_HODS);
  const [departments, setDepartments] = useState<Department[]>(() => INITIAL_DEPARTMENTS);
  const [shifts, setShifts] = useState<Shift[]>(() => INITIAL_SHIFTS);
  const [verifications, setVerifications] = useState<GpsVerification[]>(() => {
    try {
      const saved = localStorage.getItem('interntrack_verifications');
      return saved ? JSON.parse(saved) : INITIAL_VERIFICATIONS;
    } catch {
      return INITIAL_VERIFICATIONS;
    }
  });
  const [alerts, setAlerts] = useState<DepartmentAlert[]>(() => {
    try {
      const saved = localStorage.getItem('interntrack_alerts');
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('interntrack_activity_logs');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('interntrack_attendance');
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_RECORDS;
    } catch {
      return INITIAL_ATTENDANCE_RECORDS;
    }
  });
  const [studentNotifications, setStudentNotifications] = useState<StudentNotification[]>(() => INITIAL_STUDENT_NOTIFICATIONS);
  const [mentorNotifications, setMentorNotifications] = useState<MentorNotification[]>(() => INITIAL_MENTOR_NOTIFICATIONS);
  
  const [gpsMode, setGpsModeState] = useState<GpsSimulationMode>('INSIDE_HOSPITAL');
  const [currentScreen, setRawCurrentScreen] = useState<string>('login');
  const [selectedStudentRegisterNumber, setSelectedStudentState] = useState<string | null>('23UCCT001');
  const [selectedAlertId, setSelectedAlert] = useState<string | null>('alert_lourdhe_01');

  // Guarded setCurrentScreen strictly enforcing role hierarchy access
  const setCurrentScreen = (screen: string) => {
    if (screen === 'login' || !currentUser) {
      setRawCurrentScreen('login');
      return;
    }

    const STUDENT_ALLOWED = new Set([
      'student_dashboard',
      'active_shift',
      'verification_result',
      'verification_result_needs_attention',
      'gps_history',
      'student_attendance',
      'student_profile',
      'student_notifications',
    ]);

    const MENTOR_ALLOWED = new Set([
      'mentor_dashboard',
      'mentor_review_arun_kumar',
      'mentor_student_details',
      'mentor_students',
      'mentor_active_shifts',
      'mentor_attendance',
      'mentor_notifications',
      ...STUDENT_ALLOWED,
    ]);

    const HOD_ALLOWED = new Set([
      'hod_dashboard',
      'department_alerts',
      'hod_alerts',
      'hod_students',
      'department_students',
      'hod_mentors',
      'hod_gps_monitoring',
      'hod_analytics_dashboard',
      ...MENTOR_ALLOWED,
    ]);

    if (currentUser.role === 'STUDENT') {
      if (!STUDENT_ALLOWED.has(screen)) {
        console.warn(`[Access Denied] Student (${currentUser.id}) cannot access screen "${screen}". Redirecting to Student Dashboard.`);
        setRawCurrentScreen('student_dashboard');
        return;
      }
    } else if (currentUser.role === 'MENTOR') {
      if (!MENTOR_ALLOWED.has(screen)) {
        console.warn(`[Access Denied] Mentor (${currentUser.id}) cannot access screen "${screen}". Redirecting to Mentor Dashboard.`);
        setRawCurrentScreen('mentor_dashboard');
        return;
      }
    } else if (currentUser.role === 'HOD') {
      if (!HOD_ALLOWED.has(screen)) {
        console.warn(`[Access Denied] HOD (${currentUser.id}) cannot access screen "${screen}". Redirecting to HOD Dashboard.`);
        setRawCurrentScreen('hod_dashboard');
        return;
      }
    }

    setRawCurrentScreen(screen);
  };

  // Sync state to localStorage for robust app restart & night-shift continuity
  useEffect(() => {
    try {
      localStorage.setItem('interntrack_students', JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('interntrack_verifications', JSON.stringify(verifications));
    } catch {}
  }, [verifications]);

  useEffect(() => {
    try {
      localStorage.setItem('interntrack_alerts', JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem('interntrack_attendance', JSON.stringify(attendanceRecords));
    } catch {}
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('interntrack_activity_logs', JSON.stringify(activityLogs));
    } catch {}
  }, [activityLogs]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('interntrack_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('interntrack_current_user');
      }
    } catch {}
  }, [currentUser]);

  const setSelectedStudent = (regNumber: string | null) => {
    if (currentUser?.role === 'STUDENT') {
      setSelectedStudentState(currentUser.registerNumber || '23UCCT001');
      return;
    }
    if (currentUser?.role === 'MENTOR' && regNumber) {
      const isAssigned = students.some((s) => s.register_number === regNumber && s.mentor_id === currentUser.id);
      if (!isAssigned) {
        const firstAssigned = students.find((s) => s.mentor_id === currentUser.id);
        setSelectedStudentState(firstAssigned ? firstAssigned.register_number : null);
        return;
      }
    }
    if (currentUser?.role === 'HOD' && regNumber) {
      const inDept = students.some(
        (s) => s.register_number === regNumber && s.department.toLowerCase().trim() === currentUser.department.toLowerCase().trim()
      );
      if (!inDept) {
        const firstInDept = students.find(
          (s) => s.department.toLowerCase().trim() === currentUser.department.toLowerCase().trim()
        );
        setSelectedStudentState(firstInDept ? firstInDept.register_number : null);
        return;
      }
    }
    setSelectedStudentState(regNumber);
  };
  
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [isStartShiftModalOpen, setIsStartShiftModalOpen] = useState<boolean>(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState<boolean>(false);
  const [isMentorAddStudentModalOpen, setIsMentorAddStudentModalOpen] = useState<boolean>(false);
  const [isHodAddMentorModalOpen, setIsHodAddMentorModalOpen] = useState<boolean>(false);
  const [activeCheckOutSummary, setActiveCheckOutSummary] = useState<CheckOutSummaryData | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [lastVerification, setLastVerification] = useState<GpsVerification | null>(null);
  const [pendingRandomRequest, setPendingRandomRequest] = useState<boolean>(false);

  const [hospitalGeofence, setHospitalGeofence] = useState<HospitalGeofence>(() => {
    try {
      const saved = localStorage.getItem('interntrack_hospital_geofence');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return HOSPITAL_CONFIG;
  });

  useEffect(() => {
    MockGpsService.setActiveGeofence(hospitalGeofence);
    try {
      localStorage.setItem('interntrack_hospital_geofence', JSON.stringify(hospitalGeofence));
    } catch {
      // ignore
    }
  }, [hospitalGeofence]);

  const updateHospitalGeofence = (newConfig: Partial<HospitalGeofence>, reason = 'Institutional geofence recalibration') => {
    if (currentUser?.role !== 'ADMIN') {
      console.warn(`[Access Denied] User with role ${currentUser?.role} is not authorized to modify Hospital Geofence.`);
      return;
    }

    const updated: HospitalGeofence = {
      ...hospitalGeofence,
      ...newConfig,
      last_updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updated_by: currentUser?.name || 'Hospital Administration',
    };

    setHospitalGeofence(updated);
    MockGpsService.setActiveGeofence(updated);

    // Update students hospital field if name changed
    if (newConfig.name && newConfig.name !== hospitalGeofence.name) {
      setStudents((prev) =>
        prev.map((s) => ({
          ...s,
          hospital: newConfig.name!,
        }))
      );
    }

    const logEntry: AdminActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action_type: 'GEOFENCE_UPDATE',
      student_register_number: 'CAMPUS-ALL',
      student_name: 'All Interns',
      details: `Geofence perimeter set to ${updated.radius_meters}m around (${updated.latitude.toFixed(4)}, ${updated.longitude.toFixed(4)}) - "${updated.name}"`,
      reason,
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [logEntry, ...prev]);
  };

  const resetHospitalGeofence = () => {
    if (currentUser?.role !== 'ADMIN') {
      console.warn(`[Access Denied] User with role ${currentUser?.role} is not authorized to reset Hospital Geofence.`);
      return;
    }

    setHospitalGeofence(HOSPITAL_CONFIG);
    MockGpsService.setActiveGeofence(HOSPITAL_CONFIG);
    try {
      localStorage.removeItem('interntrack_hospital_geofence');
    } catch {
      // ignore
    }

    const logEntry: AdminActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action_type: 'GEOFENCE_UPDATE',
      student_register_number: 'CAMPUS-ALL',
      student_name: 'All Interns',
      details: `Geofence restored to default 150m perimeter (${HOSPITAL_CONFIG.name})`,
      reason: 'Factory reset to default institutional boundaries',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [logEntry, ...prev]);
  };

  const setGpsMode = (mode: GpsSimulationMode) => {
    setGpsModeState(mode);
    MockGpsService.setSimulationMode(mode);
  };

  const login = (identifier: string, password?: string): boolean => {
    const trimmed = identifier.trim().toLowerCase();
    const cleanPwd = (password || '').trim();

    if (!trimmed || !cleanPwd) return false;

    // Helper to validate role password strictly
    const isPasswordValidForRole = (role: UserRole): boolean => {
      const lowerPwd = cleanPwd.toLowerCase();
      if (role === 'ADMIN') {
        return lowerPwd === 'admin@2026' || lowerPwd === 'admin123';
      }
      if (role === 'HOD') {
        return lowerPwd === 'hod@2026' || lowerPwd === 'hod123';
      }
      if (role === 'MENTOR') {
        return lowerPwd === 'mentor@2026' || lowerPwd === 'mentor123';
      }
      if (role === 'STUDENT') {
        return lowerPwd === 'student@2026' || lowerPwd === 'student123';
      }
      return false;
    };

    // Alias mapping for quick access
    let matchedKey = Object.keys(DEMO_USERS).find((k) => k.toLowerCase() === trimmed);
    if (!matchedKey) {
      if (trimmed === 'admin' || trimmed === 'administrator' || trimmed.includes('admin')) {
        matchedKey = 'admin01';
      } else if (trimmed === 'hod' || trimmed === 'head' || trimmed.includes('hod')) {
        matchedKey = 'hod01';
      } else if (trimmed === 'mentor' || trimmed === 'priya' || trimmed.includes('mentor')) {
        matchedKey = 'mentor01';
      } else if (trimmed === 'student' || trimmed === 'intern' || trimmed === '23ucct001' || trimmed === '23bhs001') {
        matchedKey = '23UCCT001';
      }
    }

    if (matchedKey && DEMO_USERS[matchedKey]) {
      const user = DEMO_USERS[matchedKey];
      
      if (!isPasswordValidForRole(user.role)) {
        return false;
      }

      setCurrentUser(user);
      if (user.role === 'STUDENT') {
        setCurrentScreen('student_dashboard');
        setSelectedStudent(user.registerNumber || '23UCCT001');
      } else if (user.role === 'MENTOR') {
        setCurrentScreen('mentor_dashboard');
      } else if (user.role === 'HOD') {
        setCurrentScreen('hod_dashboard');
      } else if (user.role === 'ADMIN') {
        setCurrentScreen('admin_dashboard');
      }
      return true;
    }

    // Check student by register number or name
    const foundStudent = students.find(
      (s) => s.register_number.toLowerCase() === trimmed || s.name.toLowerCase().includes(trimmed)
    );
    if (foundStudent) {
      if (!isPasswordValidForRole('STUDENT')) {
        return false;
      }

      const studentUser: UserProfile = {
        id: foundStudent.register_number,
        registerNumber: foundStudent.register_number,
        name: foundStudent.name,
        role: 'STUDENT',
        department: foundStudent.department,
        avatar: foundStudent.avatar,
        password: 'Student@2026',
      };
      setCurrentUser(studentUser);
      setSelectedStudent(foundStudent.register_number);
      setCurrentScreen('student_dashboard');
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  const switchRoleQuickly = (role: UserRole) => {
    if (currentUser) {
      const ROLE_RANK: Record<UserRole, number> = {
        STUDENT: 1,
        MENTOR: 2,
        HOD: 3,
        ADMIN: 4,
      };
      if (ROLE_RANK[role] > ROLE_RANK[currentUser.role]) {
        console.warn(`[Access Denied] User with role ${currentUser.role} cannot switch upward to ${role}.`);
        return;
      }
    }

    if (role === 'STUDENT') {
      setCurrentUser(DEMO_USERS['23UCCT001']);
      setSelectedStudent('23UCCT001');
      setCurrentScreen('student_dashboard');
    } else if (role === 'MENTOR') {
      setCurrentUser(DEMO_USERS['mentor01']);
      setCurrentScreen('mentor_dashboard');
    } else if (role === 'HOD') {
      setCurrentUser(DEMO_USERS['hod01']);
      setCurrentScreen('hod_dashboard');
    } else if (role === 'ADMIN') {
      setCurrentUser(DEMO_USERS['admin01']);
      setCurrentScreen('admin_dashboard');
    }
  };

  // Perform a simulated GPS check
  const performGpsVerification = async (
    forcedMode?: GpsSimulationMode,
    customTime?: string,
    verificationType: GpsVerification['verification_type'] = 'MANUAL'
  ): Promise<GpsVerification> => {
    // Prevent duplicate rapid calls (debouncing / in-flight protection)
    if (isVerifying) {
      if (lastVerification) return lastVerification;
    }

    setIsVerifying(true);

    // Security RBAC validation: students can only verify for their own register number
    const targetReg =
      currentUser?.role === 'STUDENT'
        ? currentUser.registerNumber || '23UCCT001'
        : selectedStudentRegisterNumber || '23UCCT001';
    const targetStudent = students.find((s) => s.register_number === targetReg) || students[0];

    // Internet connectivity check
    const isOffline = typeof navigator !== 'undefined' && navigator && !navigator.onLine;
    let result: GpsVerification;

    if (isOffline) {
      const now = new Date();
      result = {
        id: `v_${targetStudent.register_number}_${Date.now()}`,
        register_number: targetStudent.register_number,
        student_name: targetStudent.name,
        department: targetStudent.department,
        mentor_id: targetStudent.mentor_id,
        mentor_name: targetStudent.mentor_name,
        shift_name: targetStudent.shift_name,
        timestamp: now.toISOString(),
        time_display: customTime || MockGpsService.getCurrentTimeString(),
        status: 'GPS UNAVAILABLE',
        distance_meters: 0,
        accuracy_meters: 0,
        latitude: 0,
        longitude: 0,
        is_inside_geofence: false,
        verification_type: verificationType,
      };
    } else {
      // Simulated processing delay for scanning clinical GPS
      await new Promise((resolve) => setTimeout(resolve, 500));
      result = MockGpsService.performGpsCheck(targetStudent, forcedMode || gpsMode, customTime, verificationType);
    }

    // Update verifications log - prepend new record so full timeline is preserved!
    setVerifications((prev) => [result, ...prev]);
    setLastVerification(result);

    // Update student status - preserve their active shift state!
    setStudents((prev) =>
      prev.map((s) => {
        if (s.register_number === targetStudent.register_number) {
          return {
            ...s,
            current_status: result.status,
            last_verified_at: result.time_display,
            last_verification_distance: result.distance_meters,
            last_verification_accuracy: result.accuracy_meters,
          };
        }
        return s;
      })
    );

    // If outside geofence (NEEDS ATTENTION), automatically push an alert to mentor/HOD/admin
    if (result.status === 'NEEDS ATTENTION') {
      const newAlert: DepartmentAlert = {
        id: `alert_${Date.now()}`,
        verification_id: result.id,
        register_number: targetStudent.register_number,
        student_name: targetStudent.name,
        department: targetStudent.department,
        mentor_id: targetStudent.mentor_id,
        mentor_name: targetStudent.mentor_name,
        shift_name: targetStudent.shift_name,
        triggered_at: result.timestamp,
        time_display: result.time_display,
        status: 'NEEDS ATTENTION',
        distance_meters: result.distance_meters,
        accuracy_meters: result.accuracy_meters,
        reason: `Geofence Breach: ${result.distance_meters}m outside hospital perimeter during ${targetStudent.shift_name || 'Active Clinical Shift'}.`,
      };
      setAlerts((prev) => [newAlert, ...prev]);
      setSelectedAlert(newAlert.id);

      // Also trigger mentor notification for this mentor
      const mentorNotif: MentorNotification = {
        id: `mnotif_${Date.now()}`,
        mentor_id: targetStudent.mentor_id,
        type: 'NEEDS_ATTENTION_ALERT',
        title: `Geofence Anomaly - ${targetStudent.name}`,
        message: `Intern ${targetStudent.name} (${targetStudent.register_number}) recorded a ${result.distance_meters}m distance check during ${targetStudent.shift_name}. Contextual review required.`,
        student_register_number: targetStudent.register_number,
        student_name: targetStudent.name,
        alert_id: newAlert.id,
        timestamp: result.timestamp,
        time_display: result.time_display,
        is_read: false,
        priority: 'HIGH',
      };
      setMentorNotifications((prev) => [mentorNotif, ...prev]);
    }

    setIsVerifying(false);
    setPendingRandomRequest(false);
    return result;
  };

  const openStartShiftModal = () => {
    setIsStartShiftModalOpen(true);
  };

  const closeStartShiftModal = () => {
    setIsStartShiftModalOpen(false);
  };

  const openCheckOutModal = () => {
    setIsCheckOutModalOpen(true);
  };

  const closeCheckOutModal = () => {
    setIsCheckOutModalOpen(false);
  };

  const dismissCheckOutSummary = () => {
    setActiveCheckOutSummary(null);
  };

  const markNotificationAsRead = (id: string) => {
    setStudentNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setStudentNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const startShift = async (regNumber: string): Promise<GpsVerification> => {
    // RBAC Security: Student cannot start shift for another register number
    const targetReg = currentUser?.role === 'STUDENT' ? (currentUser.registerNumber || regNumber) : regNumber;
    const student = students.find((s) => s.register_number === targetReg) || students[0];
    
    const result = await performGpsVerification(gpsMode, student.is_night_shift ? '10:02 PM' : '08:30 AM', 'SHIFT_START');
    
    // Strict requirement: Shift ONLY activates if GPS verification succeeds (VERIFIED)
    if (result.status === 'VERIFIED') {
      setStudents((prev) =>
        prev.map((s) =>
          s.register_number === student.register_number
            ? {
                ...s,
                is_active_shift: true,
                shift_status: 'ACTIVE',
                shift_started_at: new Date().toISOString(),
                current_status: 'VERIFIED',
                last_verified_at: result.time_display,
                last_verification_distance: result.distance_meters,
                last_verification_accuracy: result.accuracy_meters,
              }
            : s
        )
      );
      closeStartShiftModal();
      setCurrentScreen('active_shift');
    }
    return result;
  };

  const endShift = (regNumber: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.register_number === regNumber
          ? { ...s, is_active_shift: false, shift_status: 'COMPLETED', current_status: 'OFF SHIFT' }
          : s
      )
    );
  };

  const confirmCheckOut = (regNumber: string) => {
    const student = students.find((s) => s.register_number === regNumber) || students[0];
    const nowTimeStr = MockGpsService.getCurrentTimeString();
    
    // Count successful vs needs attention verifications for this student
    const studentVerifications = verifications.filter((v) => v.register_number === student.register_number);
    const successful = studentVerifications.filter((v) => v.status === 'VERIFIED').length;
    const attention = studentVerifications.filter((v) => v.status === 'NEEDS ATTENTION').length;

    const summary: CheckOutSummaryData = {
      startTime: '10:02 PM',
      endTime: nowTimeStr || '06:01 AM',
      successfulVerifications: successful || 3,
      needsAttentionEvents: attention || 1,
      finalStatus: 'COMPLETED',
      shiftName: student.shift_name || 'Night Shift',
      hoursLogged: '8.0 hrs',
    };

    // Update student state
    setStudents((prev) =>
      prev.map((s) =>
        s.register_number === student.register_number
          ? {
              ...s,
              is_active_shift: false,
              shift_status: 'COMPLETED',
              current_status: 'OFF SHIFT',
            }
          : s
      )
    );

    // Create a new attendance record
    const newRecord: StudentAttendanceRecord = {
      id: `att_${Date.now()}`,
      register_number: student.register_number,
      date_display: '05 Sep 2026',
      date_iso: new Date().toISOString().split('T')[0],
      shift_name: student.shift_name.replace(' Shift', '') || 'Night',
      time_window: student.shift_time || '10:00 PM – 06:00 AM',
      start_time: '10:02 PM',
      end_time: summary.endTime,
      status: 'COMPLETED',
      verified_checks: successful || 3,
      total_checks: (successful || 3) + (attention || 1),
      hours_logged: '8.0 hrs',
      mentor_name: student.mentor_name,
      period_group: 'THIS_WEEK',
    };
    setAttendanceRecords((prev) => [newRecord, ...prev]);

    // Create a completion notification
    const completionNotif: StudentNotification = {
      id: `notif_${Date.now()}`,
      register_number: student.register_number,
      type: 'SHIFT_COMPLETED',
      title: 'Shift Successfully Completed & Checked Out',
      message: `Your ${student.shift_name} has concluded at ${summary.endTime}. Attendance logged as COMPLETED (8.0 hours credited).`,
      timestamp: new Date().toISOString(),
      time_display: summary.endTime,
      is_read: false,
      priority: 'NORMAL',
    };
    setStudentNotifications((prev) => [completionNotif, ...prev]);

    setIsCheckOutModalOpen(false);
    setActiveCheckOutSummary(summary);
  };

  const triggerRandomVerificationPrompt = (customTime = '03:42 AM') => {
    setPendingRandomRequest(true);
    setIsVerificationModalOpen(true);
  };

  const dismissVerificationModal = () => {
    setIsVerificationModalOpen(false);
  };

  const openMentorAddStudentModal = () => {
    setIsMentorAddStudentModalOpen(true);
  };

  const closeMentorAddStudentModal = () => {
    setIsMentorAddStudentModalOpen(false);
  };

  const markMentorNotificationAsRead = (id: string) => {
    setMentorNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllMentorNotificationsAsRead = () => {
    setMentorNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getMentorStudents = (mentorId?: string): Student[] => {
    if (!currentUser) return [];

    // STUDENT: Only access own record
    if (currentUser.role === 'STUDENT') {
      const ownReg = currentUser.registerNumber || currentUser.id;
      return students.filter((s) => s.register_number.toLowerCase() === ownReg.toLowerCase());
    }

    // MENTOR: Can only view their own assigned students
    if (currentUser.role === 'MENTOR') {
      return students.filter(
        (s) =>
          s.mentor_id === currentUser.id ||
          s.mentor_name?.toLowerCase() === currentUser.name?.toLowerCase()
      );
    }

    // HOD: Can view students of mentors within their department
    if (currentUser.role === 'HOD') {
      const deptMentors = mentors
        .filter((m) => m.department.toLowerCase().trim() === currentUser.department.toLowerCase().trim())
        .map((m) => m.id);
      
      const targetMentorId = mentorId || currentUser.id;
      if (deptMentors.includes(targetMentorId) || targetMentorId === currentUser.id) {
        return students.filter(
          (s) =>
            (s.mentor_id === targetMentorId || s.department.toLowerCase().trim() === currentUser.department.toLowerCase().trim()) &&
            s.department.toLowerCase().trim() === currentUser.department.toLowerCase().trim()
        );
      }
      return students.filter(
        (s) => s.department.toLowerCase().trim() === currentUser.department.toLowerCase().trim()
      );
    }

    // ADMIN: Full access to any mentor's students
    const targetMentorId = mentorId || currentUser.id || 'mentor01';
    return students.filter((s) => s.mentor_id === targetMentorId);
  };

  const mentorAddStudent = (newStudentData: {
    register_number: string;
    name: string;
    email?: string;
    phone?: string;
    academic_year?: string;
    internship_department?: string;
    internship_start_date?: string;
    internship_end_date?: string;
    shift_id: string;
    shift_name: string;
    shift_time: string;
    is_night_shift: boolean;
  }): { success: boolean; message: string } => {
    // RBAC Security check: Only MENTOR, HOD, and ADMIN can register students
    if (currentUser?.role === 'STUDENT') {
      return { success: false, message: 'Unauthorized: Students cannot enroll or register students.' };
    }

    const mentorId = currentUser?.id || 'mentor01';
    const mentorName = currentUser?.name || 'Dr. Anitha';
    const mentorDept = currentUser?.department || 'Physiotherapy';

    // Check if register number is already registered
    const existing = students.find(
      (s) => s.register_number.toLowerCase() === newStudentData.register_number.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, message: `Student with Register Number ${newStudentData.register_number} already exists.` };
    }

    const createdStudent: Student = {
      register_number: newStudentData.register_number.trim(),
      name: newStudentData.name.trim(),
      email: newStudentData.email || `${newStudentData.name.toLowerCase().replace(/\s+/g, '.')}@student.ahs.edu`,
      phone: newStudentData.phone || '+91 98400 00000',
      department: mentorDept, // strictly locked to mentor's permitted department
      academic_year: newStudentData.academic_year || 'Final Year (2025–2026)',
      mentor_id: mentorId, // strictly locked to creating mentor
      mentor_name: mentorName,
      hospital: 'InternPulse General Hospital',
      internship_department: newStudentData.internship_department || `${mentorDept} & Rehabilitation`,
      internship_start_date: newStudentData.internship_start_date || '01 Sep 2026',
      internship_end_date: newStudentData.internship_end_date || '28 Feb 2027',
      internship_status: 'Active Clinical Internship',
      shift_id: newStudentData.shift_id,
      shift_name: newStudentData.shift_name,
      shift_time: newStudentData.shift_time,
      shift_status: 'NOT STARTED',
      is_night_shift: newStudentData.is_night_shift,
      is_active_shift: false,
      current_status: 'OFF SHIFT',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      schedules: [
        {
          id: `sch_${newStudentData.register_number.toLowerCase()}_1`,
          title: `${newStudentData.shift_name} (Primary Duty)`,
          shift_id: newStudentData.shift_id,
          start_time: newStudentData.shift_time.split(' – ')[0] || '08:00',
          end_time: newStudentData.shift_time.split(' – ')[1] || '16:00',
          time_label: newStudentData.shift_time,
          category: 'PRIMARY_SHIFT',
          is_active: false,
        },
      ],
    };

    setStudents((prev) => [createdStudent, ...prev]);

    // Record Immutable Audit Log
    const auditLog: AdminActivityLog = {
      id: `log_stud_create_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action_type: 'STUDENT_ADD',
      student_register_number: createdStudent.register_number,
      student_name: createdStudent.name,
      details: `Student registered in ${createdStudent.department} and automatically bound to ${mentorName} (Mentor ID: ${mentorId})`,
      reason: 'New clinical intern intake by Faculty Mentor',
      performed_by: `${mentorName} (${mentorId})`,
    };
    setActivityLogs((prev) => [auditLog, ...prev]);

    return { success: true, message: 'Student registered successfully.' };
  };

  const openHodAddMentorModal = () => {
    if (currentUser?.role === 'STUDENT' || currentUser?.role === 'MENTOR') return;
    setIsHodAddMentorModalOpen(true);
  };

  const closeHodAddMentorModal = () => {
    setIsHodAddMentorModalOpen(false);
  };

  const getDepartmentStudents = (dept?: string): Student[] => {
    if (!currentUser) return [];

    // STUDENT: Only access own record
    if (currentUser.role === 'STUDENT') {
      const ownReg = currentUser.registerNumber || currentUser.id;
      return students.filter((s) => s.register_number.toLowerCase() === ownReg.toLowerCase());
    }

    // MENTOR: Can only view their assigned students
    if (currentUser.role === 'MENTOR') {
      return students.filter(
        (s) =>
          s.mentor_id === currentUser.id ||
          s.mentor_name?.toLowerCase() === currentUser.name?.toLowerCase()
      );
    }

    // HOD: Locked strictly to HOD's own department
    if (currentUser.role === 'HOD') {
      const targetDept = currentUser.department || 'Physiotherapy';
      return students.filter(
        (s) => s.department.toLowerCase().trim() === targetDept.toLowerCase().trim()
      );
    }

    // ADMIN: System-wide or specific requested department
    const targetDept = dept || currentUser.department || 'Physiotherapy';
    return students.filter(
      (s) => !dept || s.department.toLowerCase().trim() === targetDept.toLowerCase().trim()
    );
  };

  const getDepartmentMentors = (dept?: string): Mentor[] => {
    if (!currentUser) return [];

    // STUDENT: Cannot access mentor list
    if (currentUser.role === 'STUDENT') {
      return [];
    }

    // MENTOR: Only own mentor record
    if (currentUser.role === 'MENTOR') {
      return mentors.filter((m) => m.id === currentUser.id);
    }

    // HOD: Mentors belonging strictly to HOD's department
    if (currentUser.role === 'HOD') {
      const targetDept = currentUser.department || 'Physiotherapy';
      return mentors.filter(
        (m) => m.department.toLowerCase().trim() === targetDept.toLowerCase().trim()
      );
    }

    // ADMIN: Full system access
    const targetDept = dept || currentUser.department || 'Physiotherapy';
    return mentors.filter(
      (m) => !dept || m.department.toLowerCase().trim() === targetDept.toLowerCase().trim()
    );
  };

  const getDepartmentAlerts = (dept?: string): DepartmentAlert[] => {
    if (!currentUser) return [];

    // STUDENT: Cannot access alerts
    if (currentUser.role === 'STUDENT') {
      return [];
    }

    // MENTOR: Only alerts for assigned students
    if (currentUser.role === 'MENTOR') {
      const assignedRegs = students
        .filter(
          (s) =>
            s.mentor_id === currentUser.id ||
            s.mentor_name?.toLowerCase() === currentUser.name?.toLowerCase()
        )
        .map((s) => s.register_number.toLowerCase());
      return alerts.filter((a) => assignedRegs.includes(a.register_number.toLowerCase()));
    }

    // HOD: Alerts strictly for HOD's department
    if (currentUser.role === 'HOD') {
      const targetDept = currentUser.department || 'Physiotherapy';
      return alerts.filter(
        (a) => a.department.toLowerCase().trim() === targetDept.toLowerCase().trim()
      );
    }

    // ADMIN: Full system access
    const targetDept = dept || currentUser.department || 'Physiotherapy';
    return alerts.filter(
      (a) => !dept || a.department.toLowerCase().trim() === targetDept.toLowerCase().trim()
    );
  };

  const getDepartmentVerifications = (dept?: string): GpsVerification[] => {
    if (!currentUser) return [];

    // STUDENT: Only own verifications
    if (currentUser.role === 'STUDENT') {
      const ownReg = currentUser.registerNumber || currentUser.id;
      return verifications.filter((v) => v.register_number.toLowerCase() === ownReg.toLowerCase());
    }

    // MENTOR: Only verifications for assigned students
    if (currentUser.role === 'MENTOR') {
      const assignedRegs = students
        .filter(
          (s) =>
            s.mentor_id === currentUser.id ||
            s.mentor_name?.toLowerCase() === currentUser.name?.toLowerCase()
        )
        .map((s) => s.register_number.toLowerCase());
      return verifications.filter((v) => assignedRegs.includes(v.register_number.toLowerCase()));
    }

    // HOD: Verifications strictly for HOD's department
    if (currentUser.role === 'HOD') {
      const targetDept = currentUser.department || 'Physiotherapy';
      return verifications.filter(
        (v) => v.department.toLowerCase().trim() === targetDept.toLowerCase().trim()
      );
    }

    // ADMIN: Full system access
    const targetDept = dept || currentUser.department || 'Physiotherapy';
    return verifications.filter(
      (v) => !dept || v.department.toLowerCase().trim() === targetDept.toLowerCase().trim()
    );
  };

  const hodAddMentor = (newMentorData: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    title?: string;
  }): { success: boolean; message: string } => {
    // RBAC Security check: Only HOD and ADMIN can create mentors
    if (currentUser?.role === 'STUDENT' || currentUser?.role === 'MENTOR') {
      return { success: false, message: 'Unauthorized: Only Head of Department or Administrators can create mentors.' };
    }

    const hodDept = currentUser?.department || 'Physiotherapy';
    const hodName = currentUser?.name || 'Dr. Sarah Mitchell';
    const hodId = currentUser?.id || 'hod01';

    const cleanId = newMentorData.id.trim().toLowerCase();
    const existing = mentors.find((m) => m.id.toLowerCase() === cleanId);
    if (existing) {
      return { success: false, message: `Mentor ID "${newMentorData.id}" is already assigned to ${existing.name}.` };
    }

    const createdMentor: Mentor = {
      id: newMentorData.id.trim(),
      name: newMentorData.name.trim(),
      title: newMentorData.title?.trim() || 'Clinical Faculty Supervisor',
      department: hodDept, // strictly locked to HOD's department
      hospital: 'InternPulse General Hospital',
      assigned_students_count: 0,
    };

    setMentors((prev) => [...prev, createdMentor]);

    // Record Immutable Activity Log
    const auditLog: AdminActivityLog = {
      id: `log_mentor_create_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action_type: 'STUDENT_ADD',
      student_register_number: `MENTOR-${createdMentor.id}`,
      student_name: createdMentor.name,
      details: `Created new Faculty Mentor "${createdMentor.name}" (${createdMentor.id}) in ${hodDept} Department`,
      reason: 'Department faculty expansion by Head of Department',
      performed_by: `${hodName} (HOD ID: ${hodId})`,
    };
    setActivityLogs((prev) => [auditLog, ...prev]);

    return { success: true, message: 'Mentor created successfully.' };
  };

  const markAlertAsReviewed = (alertId: string, notes: string) => {
    if (currentUser?.role === 'STUDENT') {
      console.warn('[Access Denied] Students cannot review alerts.');
      return;
    }

    const reviewer = currentUser?.name || 'Dr. Anitha (Clinical Supervisor)';
    const timeStr = MockGpsService.getCurrentTimeString();

    // 1. Update Alert item
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            status: 'REVIEWED',
            reviewed_by: reviewer,
            reviewed_at: `${timeStr} (Today)`,
            review_notes: notes || 'Location verified with ward supervisor on night duty.',
          };
        }
        return a;
      })
    );

    // 2. Find associated verification and update
    const targetAlert = alerts.find((a) => a.id === alertId);
    if (targetAlert) {
      setVerifications((prev) =>
        prev.map((v) => {
          if (
            v.id === targetAlert.verification_id ||
            (v.register_number === targetAlert.register_number && v.time_display === targetAlert.time_display)
          ) {
            return {
              ...v,
              status: 'REVIEWED',
              review_details: {
                reviewer_name: reviewer,
                reviewed_at: timeStr,
                previous_status: 'NEEDS ATTENTION',
                review_notes: notes || 'Location verified with ward supervisor.',
              },
            };
          }
          return v;
        })
      );

      // 3. Update student status to REVIEWED or VERIFIED
      setStudents((prev) =>
        prev.map((s) => {
          if (s.register_number === targetAlert.register_number) {
            return {
              ...s,
              current_status: 'REVIEWED',
            };
          }
          return s;
        })
      );

      // 4. Log in admin activity
      const newLog: AdminActivityLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action_type: 'ALERT_REVIEW',
        student_register_number: targetAlert.register_number,
        student_name: targetAlert.student_name,
        details: `Alert marked as REVIEWED by ${reviewer}`,
        reason: notes || 'Supervisor manual verification',
        performed_by: reviewer,
      };
      setActivityLogs((prev) => [newLog, ...prev]);
    }
  };

  const createHod = (data: {
    id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    reason?: string;
  }): { success: boolean; message: string } => {
    if (currentUser?.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized: Only Institutional Administrators can create HOD accounts.' };
    }

    const cleanId = data.id.trim().toLowerCase();
    const existing = hods.find((h) => h.id.toLowerCase() === cleanId);
    if (existing) {
      return { success: false, message: `HOD ID "${data.id}" already exists.` };
    }

    const newHod: Hod = {
      id: data.id.trim(),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      department: data.department.trim(),
      hospital: hospitalGeofence.name,
      is_active: true,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      created_by: currentUser?.name || 'Hospital Administration (admin01)',
    };

    setHods((prev) => [...prev, newHod]);

    setDepartments((prev) =>
      prev.map((d) => {
        if (d.name.toLowerCase().includes(data.department.toLowerCase())) {
          return { ...d, hod_name: newHod.name };
        }
        return d;
      })
    );

    const log: AdminActivityLog = {
      id: `log_hod_create_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'HOD_CREATED',
      action_type: 'HOD_CREATE',
      target: `${newHod.name} (${newHod.id})`,
      old_value: 'None',
      new_value: newHod.department,
      details: `Created Head of Department profile for ${newHod.department}`,
      reason: data.reason || 'Institutional department leadership appointment',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);

    return { success: true, message: 'HOD created successfully.' };
  };

  const editHod = (
    id: string,
    data: Partial<Hod>,
    reason: string
  ): { success: boolean; message: string } => {
    if (currentUser?.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized: Only Institutional Administrators can modify HOD accounts.' };
    }

    const existing = hods.find((h) => h.id === id);
    if (!existing) return { success: false, message: 'HOD not found.' };

    setHods((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          return { ...h, ...data };
        }
        return h;
      })
    );

    const log: AdminActivityLog = {
      id: `log_hod_edit_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'HOD_EDITED',
      action_type: 'HOD_EDIT',
      target: `${existing.name} (${existing.id})`,
      old_value: `${existing.name} • ${existing.department}`,
      new_value: `${data.name || existing.name} • ${data.department || existing.department}`,
      details: `Updated HOD profile records`,
      reason: reason || 'Administrative record update',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);

    return { success: true, message: 'HOD updated successfully.' };
  };

  const toggleHodStatus = (id: string, reason: string) => {
    if (currentUser?.role !== 'ADMIN') return;

    const existing = hods.find((h) => h.id === id);
    if (!existing) return;

    const newStatus = !existing.is_active;

    setHods((prev) =>
      prev.map((h) => (h.id === id ? { ...h, is_active: newStatus } : h))
    );

    const log: AdminActivityLog = {
      id: `log_hod_status_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: newStatus ? 'HOD_ACTIVATED' : 'HOD_DEACTIVATED',
      action_type: 'HOD_DEACTIVATE',
      target: `${existing.name} (${existing.id})`,
      old_value: existing.is_active ? 'ACTIVE' : 'DEACTIVATED',
      new_value: newStatus ? 'ACTIVE' : 'DEACTIVATED',
      details: `HOD account status set to ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}`,
      reason: reason || 'Administrative status lifecycle toggle',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);
  };

  const adminCreateMentor = (data: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    title?: string;
    department: string;
    reason?: string;
  }): { success: boolean; message: string } => {
    if (currentUser?.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized: Admin privileges required.' };
    }

    const cleanId = data.id.trim().toLowerCase();
    const existing = mentors.find((m) => m.id.toLowerCase() === cleanId);
    if (existing) {
      return { success: false, message: `Mentor ID "${data.id}" already exists.` };
    }

    const newMentor: Mentor = {
      id: data.id.trim(),
      name: data.name.trim(),
      email: data.email?.trim(),
      phone: data.phone?.trim(),
      title: data.title?.trim() || 'Clinical Faculty Supervisor',
      department: data.department.trim(),
      hospital: hospitalGeofence.name,
      assigned_students_count: 0,
      is_active: true,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      created_by: currentUser?.name || 'Hospital Administration',
    };

    setMentors((prev) => [...prev, newMentor]);

    const log: AdminActivityLog = {
      id: `log_mentor_create_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'MENTOR_CREATED',
      action_type: 'MENTOR_CREATE',
      target: `${newMentor.name} (${newMentor.id})`,
      old_value: 'None',
      new_value: newMentor.department,
      details: `Created new Faculty Mentor in ${newMentor.department}`,
      reason: data.reason || 'Clinical faculty appointment',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);

    return { success: true, message: 'Mentor created successfully.' };
  };

  const adminEditMentor = (
    id: string,
    data: Partial<Mentor>,
    reason: string
  ): { success: boolean; message: string } => {
    if (currentUser?.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized: Admin privileges required.' };
    }

    const existing = mentors.find((m) => m.id === id);
    if (!existing) return { success: false, message: 'Mentor not found.' };

    setMentors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data } : m))
    );

    const log: AdminActivityLog = {
      id: `log_mentor_edit_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'MENTOR_EDITED',
      action_type: 'MENTOR_EDIT',
      target: `${existing.name} (${existing.id})`,
      old_value: `${existing.name} • ${existing.department}`,
      new_value: `${data.name || existing.name} • ${data.department || existing.department}`,
      details: `Updated Mentor profile details`,
      reason: reason || 'Administrative record update',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);

    return { success: true, message: 'Mentor updated successfully.' };
  };

  const adminToggleMentorStatus = (id: string, reason: string) => {
    if (currentUser?.role !== 'ADMIN') return;

    const existing = mentors.find((m) => m.id === id);
    if (!existing) return;

    const newStatus = existing.is_active === false ? true : false;

    setMentors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_active: newStatus } : m))
    );

    const log: AdminActivityLog = {
      id: `log_mentor_status_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: newStatus ? 'MENTOR_ACTIVATED' : 'MENTOR_DEACTIVATED',
      action_type: 'MENTOR_DEACTIVATE',
      target: `${existing.name} (${existing.id})`,
      old_value: existing.is_active !== false ? 'ACTIVE' : 'DEACTIVATED',
      new_value: newStatus ? 'ACTIVE' : 'DEACTIVATED',
      details: `Mentor status toggled to ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}`,
      reason: reason || 'Faculty roster maintenance',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);
  };

  const adminReassignMentorDepartment = (mentorId: string, newDept: string, reason: string) => {
    if (currentUser?.role !== 'ADMIN') return;

    const existing = mentors.find((m) => m.id === mentorId);
    if (!existing) return;

    const oldDept = existing.department;

    setMentors((prev) =>
      prev.map((m) => (m.id === mentorId ? { ...m, department: newDept } : m))
    );

    const log: AdminActivityLog = {
      id: `log_mentor_dept_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'MENTOR_DEPARTMENT_REASSIGNED',
      action_type: 'MENTOR_DEPT_CHANGE',
      target: `${existing.name} (${existing.id})`,
      old_value: oldDept,
      new_value: newDept,
      details: `Admin override: Reassigned mentor department from ${oldDept} to ${newDept}`,
      reason: reason || 'Departmental reorganization override',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);
  };

  const adminEditStudent = (
    regNumber: string,
    data: Partial<Student>,
    reason: string
  ): { success: boolean; message: string } => {
    if (currentUser?.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized: Admin privileges required.' };
    }

    const existing = students.find((s) => s.register_number === regNumber);
    if (!existing) return { success: false, message: 'Student not found.' };

    setStudents((prev) =>
      prev.map((s) => (s.register_number === regNumber ? { ...s, ...data } : s))
    );

    const log: AdminActivityLog = {
      id: `log_stud_edit_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'STUDENT_EDITED',
      action_type: 'STUDENT_EDIT',
      target: `${existing.name} (${existing.register_number})`,
      student_register_number: regNumber,
      student_name: existing.name,
      old_value: `${existing.name} • ${existing.department}`,
      new_value: `${data.name || existing.name} • ${data.department || existing.department}`,
      details: `Updated student registration details`,
      reason: reason || 'Administrative record update',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);

    return { success: true, message: 'Student details updated successfully.' };
  };

  const adminToggleStudentStatus = (regNumber: string, reason: string) => {
    if (currentUser?.role !== 'ADMIN') return;

    const existing = students.find((s) => s.register_number === regNumber);
    if (!existing) return;

    const newStatus = existing.shift_status === 'MISSED' ? 'NOT STARTED' : 'MISSED';

    setStudents((prev) =>
      prev.map((s) => (s.register_number === regNumber ? { ...s, shift_status: newStatus } : s))
    );

    const log: AdminActivityLog = {
      id: `log_stud_status_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'STUDENT_STATUS_TOGGLED',
      action_type: 'STUDENT_DEACTIVATE',
      target: `${existing.name} (${existing.register_number})`,
      student_register_number: regNumber,
      student_name: existing.name,
      old_value: existing.shift_status || 'ACTIVE',
      new_value: newStatus,
      details: `Student roster status modified to ${newStatus}`,
      reason: reason || 'Administrative cohort lifecycle update',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);
  };

  const adminChangeStudentDepartment = (
    regNumber: string,
    newDept: string,
    newMentorId?: string,
    reason?: string
  ) => {
    if (currentUser?.role !== 'ADMIN') return;

    const student = students.find((s) => s.register_number === regNumber);
    if (!student) return;

    const oldDept = student.department;
    let mentorName = student.mentor_name;
    let mentorId = student.mentor_id;

    if (newMentorId) {
      const targetMentor = mentors.find((m) => m.id === newMentorId);
      if (targetMentor) {
        mentorName = targetMentor.name;
        mentorId = targetMentor.id;
      }
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.register_number === regNumber) {
          return {
            ...s,
            department: newDept,
            mentor_id: mentorId,
            mentor_name: mentorName,
          };
        }
        return s;
      })
    );

    const log: AdminActivityLog = {
      id: `log_stud_dept_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'STUDENT_DEPARTMENT_CHANGED',
      action_type: 'STUDENT_EDIT',
      target: `${student.name} (${student.register_number})`,
      student_register_number: regNumber,
      student_name: student.name,
      old_value: oldDept,
      new_value: `${newDept} (Supervisor: ${mentorName})`,
      details: `Transferred student from ${oldDept} to ${newDept}`,
      reason: reason || 'Rotational clinical curriculum transfer',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);
  };

  const createShift = (
    shiftData: Omit<Shift, 'id'>,
    reason?: string
  ): { success: boolean; message: string } => {
    if (currentUser?.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized: Only Institutional Administrators can create shifts.' };
    }

    const newId = `shift_${Date.now()}`;
    const newShift: Shift = {
      id: newId,
      ...shiftData,
    };

    setShifts((prev) => [...prev, newShift]);

    const log: AdminActivityLog = {
      id: `log_shift_create_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'SHIFT_CREATED',
      action_type: 'SHIFT_CREATE',
      target: `${newShift.name} (${newShift.label})`,
      old_value: 'None',
      new_value: newShift.label,
      details: `Created new hospital clinical shift duty slot`,
      reason: reason || 'Department operational schedule expansion',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);

    return { success: true, message: 'Shift created successfully.' };
  };

  const bulkAssignShift = (
    studentRegs: string[],
    shiftId: string,
    reason: string
  ): { success: boolean; count: number } => {
    if (currentUser?.role !== 'ADMIN') return { success: false, count: 0 };

    const targetShift = shifts.find((sh) => sh.id === shiftId);
    if (!targetShift || studentRegs.length === 0) return { success: false, count: 0 };

    setStudents((prev) =>
      prev.map((s) => {
        if (studentRegs.includes(s.register_number)) {
          let updatedSchedules = s.schedules ? [...s.schedules] : [];
          const primaryIdx = updatedSchedules.findIndex((sch) => sch.category === 'PRIMARY_SHIFT');
          const newPrimaryEntry: StudentScheduleEntry = {
            id: primaryIdx >= 0 ? updatedSchedules[primaryIdx].id : `sch_${s.register_number}_primary`,
            title: `${targetShift.name} (Primary Duty)`,
            shift_id: targetShift.id,
            start_time: targetShift.start_time,
            end_time: targetShift.end_time,
            time_label: targetShift.label,
            category: 'PRIMARY_SHIFT',
            is_active: s.is_active_shift,
          };

          if (primaryIdx >= 0) {
            updatedSchedules[primaryIdx] = newPrimaryEntry;
          } else {
            updatedSchedules.unshift(newPrimaryEntry);
          }

          return {
            ...s,
            shift_id: targetShift.id,
            shift_name: targetShift.name,
            shift_time: targetShift.label,
            is_night_shift: targetShift.is_continuous_night,
            schedules: updatedSchedules,
          };
        }
        return s;
      })
    );

    const log: AdminActivityLog = {
      id: `log_bulk_shift_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'BULK_SHIFT_ASSIGNED',
      action_type: 'BULK_SHIFT_ASSIGN',
      target: `${studentRegs.length} Interns`,
      old_value: 'Multiple Previous Shifts',
      new_value: targetShift.label,
      details: `Bulk reassigned ${studentRegs.length} interns to "${targetShift.name}" (${targetShift.label})`,
      reason: reason || 'Cohort rotational shift synchronization',
      performed_by: currentUser?.name || 'Hospital Administration',
    };
    setActivityLogs((prev) => [log, ...prev]);

    return { success: true, count: studentRegs.length };
  };

  const changeStudentShift = (
    regNumber: string,
    newShiftId: string,
    reason: string,
    resolveConflictingScheduleIds: string[] = []
  ) => {
    if (currentUser?.role !== 'ADMIN') return;

    const selectedShift = shifts.find((sh) => sh.id === newShiftId);
    if (!selectedShift) return;

    const student = students.find((s) => s.register_number === regNumber);
    if (!student) return;

    const oldShiftLabel = student.shift_time;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.register_number === regNumber) {
          let updatedSchedules = s.schedules ? [...s.schedules] : [];

          // If resolving conflicting schedules, filter out or update the resolved conflicting slots
          if (resolveConflictingScheduleIds && resolveConflictingScheduleIds.length > 0) {
            updatedSchedules = updatedSchedules.filter(
              (sch) => !resolveConflictingScheduleIds.includes(sch.id)
            );
          }

          // Check if primary shift exists in schedules
          const primaryIdx = updatedSchedules.findIndex((sch) => sch.category === 'PRIMARY_SHIFT');
          const newPrimaryEntry: StudentScheduleEntry = {
            id: primaryIdx >= 0 ? updatedSchedules[primaryIdx].id : `sch_${s.register_number}_primary`,
            title: `${selectedShift.name} (Primary Duty)`,
            shift_id: selectedShift.id,
            start_time: selectedShift.start_time,
            end_time: selectedShift.end_time,
            time_label: selectedShift.label,
            category: 'PRIMARY_SHIFT',
            is_active: s.is_active_shift,
          };

          if (primaryIdx >= 0) {
            updatedSchedules[primaryIdx] = newPrimaryEntry;
          } else {
            updatedSchedules.unshift(newPrimaryEntry);
          }

          return {
            ...s,
            shift_id: selectedShift.id,
            shift_name: selectedShift.name,
            shift_time: selectedShift.label,
            is_night_shift: selectedShift.is_continuous_night,
            schedules: updatedSchedules,
          };
        }
        return s;
      })
    );

    const hasResolvedConflicts =
      resolveConflictingScheduleIds && resolveConflictingScheduleIds.length > 0;

    const newLog: AdminActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'SHIFT_CHANGED',
      action_type: 'SHIFT_CHANGE',
      target: `${student.name} (${regNumber})`,
      student_register_number: regNumber,
      student_name: student.name,
      old_value: oldShiftLabel,
      new_value: selectedShift.label,
      details: `Shift changed from "${oldShiftLabel}" to "${selectedShift.label}"${
        hasResolvedConflicts
          ? ' (Reconciled overlapping duty schedules to ensure timing consistency)'
          : ''
      }`,
      reason: reason || 'Rotational department scheduling requirement',
      performed_by: currentUser?.name || 'Admin Operations',
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const changeStudentMentor = (regNumber: string, newMentorId: string, reason: string) => {
    if (currentUser?.role !== 'ADMIN') return;

    const targetMentor = mentors.find((m) => m.id === newMentorId);
    if (!targetMentor) return;

    const student = students.find((s) => s.register_number === regNumber);
    if (!student) return;

    const oldMentorName = student.mentor_name;
    const oldMentorId = student.mentor_id;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.register_number === regNumber) {
          return {
            ...s,
            mentor_id: targetMentor.id,
            mentor_name: targetMentor.name,
          };
        }
        return s;
      })
    );

    // Update supervisory workload counts on mentors
    setMentors((prev) =>
      prev.map((m) => {
        if (m.id === targetMentor.id) {
          return { ...m, assigned_students_count: (m.assigned_students_count || 0) + 1 };
        }
        if (m.id === oldMentorId || m.name === oldMentorName) {
          return { ...m, assigned_students_count: Math.max(0, (m.assigned_students_count || 0) - 1) };
        }
        return m;
      })
    );

    const newLog: AdminActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'MENTOR_REASSIGNED',
      action_type: 'MENTOR_REASSIGN',
      target: `${student.name} (${regNumber})`,
      student_register_number: regNumber,
      student_name: student.name,
      old_value: oldMentorName,
      new_value: targetMentor.name,
      details: `Mentor reassigned from ${oldMentorName} to ${targetMentor.name}`,
      reason: reason || 'Supervision balancing across clinical wards',
      performed_by: currentUser?.name || 'Admin Operations',
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const addStudent = (newStudent: Omit<Student, 'is_active_shift' | 'current_status'>, reason: string) => {
    if (currentUser?.role !== 'ADMIN') return;

    const cleanReg = newStudent.register_number.trim().toUpperCase();
    const existing = students.find((s) => s.register_number.toUpperCase() === cleanReg);
    if (existing) {
      console.warn(`Student with register number ${cleanReg} already exists.`);
      return;
    }

    const studentWithDefaults: Student = {
      ...newStudent,
      register_number: cleanReg,
      is_active_shift: false,
      current_status: 'OFF SHIFT',
      avatar: newStudent.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    setStudents((prev) => [...prev, studentWithDefaults]);

    // Update mentor's assigned student count
    setMentors((prev) =>
      prev.map((m) =>
        m.id === newStudent.mentor_id
          ? { ...m, assigned_students_count: (m.assigned_students_count || 0) + 1 }
          : m
      )
    );

    const newLog: AdminActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'STUDENT_ENROLLED',
      action_type: 'STUDENT_ADD',
      target: `${newStudent.name} (${cleanReg})`,
      student_register_number: cleanReg,
      student_name: newStudent.name,
      old_value: 'None',
      new_value: `${newStudent.department} • ${newStudent.mentor_name}`,
      details: `Enrolled new student in ${newStudent.department} under ${newStudent.mentor_name}`,
      reason: reason || 'New internship cohort intake',
      performed_by: currentUser?.name || 'Admin Operations',
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const deleteStudent = (regNumber: string, reason: string) => {
    if (currentUser?.role !== 'ADMIN') return;

    const student = students.find((s) => s.register_number === regNumber);
    if (!student) return;

    setStudents((prev) => prev.filter((s) => s.register_number !== regNumber));

    const newLog: AdminActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: currentUser?.name || 'Admin Operations',
      action: 'STUDENT_DELETED',
      action_type: 'STUDENT_DELETE',
      target: `${student.name} (${regNumber})`,
      student_register_number: regNumber,
      student_name: student.name,
      old_value: student.name,
      new_value: 'Deleted Record',
      details: `Removed student registration record`,
      reason: reason || 'Internship completion or withdrawal',
      performed_by: currentUser?.name || 'Admin Operations',
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const runDemonstrationStep = async (
    step:
      | 'NIGHT_START'
      | 'RANDOM_0342_ALERT'
      | 'REVIEW_ALERT'
      | 'NORMAL_VERIFIED'
      | 'GPS_UNAVAILABLE'
      | 'PERMISSION_DENIED'
  ) => {
    if (step === 'NIGHT_START') {
      switchRoleQuickly('STUDENT');
      setGpsMode('INSIDE_HOSPITAL');
      await startShift('23UCCT001');
    } else if (step === 'RANDOM_0342_ALERT') {
      setGpsMode('OUTSIDE_HOSPITAL');
      triggerRandomVerificationPrompt('03:42 AM');
    } else if (step === 'REVIEW_ALERT') {
      switchRoleQuickly('MENTOR');
      setSelectedAlert('alert_lourdhe_01');
      setCurrentScreen('mentor_review');
    } else if (step === 'NORMAL_VERIFIED') {
      setGpsMode('INSIDE_HOSPITAL');
      await performGpsVerification('INSIDE_HOSPITAL', undefined, 'MANUAL');
      setCurrentScreen('verification_result');
    } else if (step === 'GPS_UNAVAILABLE') {
      setGpsMode('GPS_UNAVAILABLE');
      await performGpsVerification('GPS_UNAVAILABLE', undefined, 'RANDOM_PROMPT');
      setCurrentScreen('verification_result');
    } else if (step === 'PERMISSION_DENIED') {
      setGpsMode('PERMISSION_DENIED');
      await performGpsVerification('PERMISSION_DENIED', undefined, 'RANDOM_PROMPT');
      setCurrentScreen('verification_result');
    }
  };

  // ==========================================
  // SCOPED DATA ARRAYS BASED ON USER ROLE
  // ==========================================
  const scopedStudents = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return students;
    if (currentUser.role === 'HOD') {
      const dept = (currentUser.department || 'Physiotherapy').toLowerCase().trim();
      return students.filter((s) => s.department.toLowerCase().trim() === dept);
    }
    if (currentUser.role === 'MENTOR') {
      return students.filter(
        (s) =>
          s.mentor_id === currentUser.id ||
          s.mentor_name?.toLowerCase() === currentUser.name?.toLowerCase()
      );
    }
    // STUDENT: Only own student record
    const ownReg = (currentUser.registerNumber || currentUser.id).toLowerCase().trim();
    return students.filter((s) => s.register_number.toLowerCase().trim() === ownReg);
  }, [students, currentUser]);

  const scopedMentors = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return mentors;
    if (currentUser.role === 'HOD') {
      const dept = (currentUser.department || 'Physiotherapy').toLowerCase().trim();
      return mentors.filter((m) => m.department.toLowerCase().trim() === dept);
    }
    if (currentUser.role === 'MENTOR') {
      return mentors.filter((m) => m.id === currentUser.id);
    }
    // STUDENT: No mentors list access
    return [];
  }, [mentors, currentUser]);

  const scopedHods = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return hods;
    if (currentUser.role === 'HOD') {
      const dept = (currentUser.department || 'Physiotherapy').toLowerCase().trim();
      return hods.filter((h) => h.department.toLowerCase().trim() === dept);
    }
    // MENTOR, STUDENT: No HOD list access
    return [];
  }, [hods, currentUser]);

  const scopedAlerts = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return alerts;
    if (currentUser.role === 'HOD') {
      const dept = (currentUser.department || 'Physiotherapy').toLowerCase().trim();
      return alerts.filter((a) => a.department.toLowerCase().trim() === dept);
    }
    if (currentUser.role === 'MENTOR') {
      const assignedRegs = students
        .filter(
          (s) =>
            s.mentor_id === currentUser.id ||
            s.mentor_name?.toLowerCase() === currentUser.name?.toLowerCase()
        )
        .map((s) => s.register_number.toLowerCase());
      return alerts.filter((a) => assignedRegs.includes(a.register_number.toLowerCase()));
    }
    // STUDENT: No alerts access
    return [];
  }, [alerts, students, currentUser]);

  const scopedVerifications = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return verifications;
    if (currentUser.role === 'HOD') {
      const dept = (currentUser.department || 'Physiotherapy').toLowerCase().trim();
      return verifications.filter((v) => v.department.toLowerCase().trim() === dept);
    }
    if (currentUser.role === 'MENTOR') {
      const assignedRegs = students
        .filter(
          (s) =>
            s.mentor_id === currentUser.id ||
            s.mentor_name?.toLowerCase() === currentUser.name?.toLowerCase()
        )
        .map((s) => s.register_number.toLowerCase());
      return verifications.filter((v) => assignedRegs.includes(v.register_number.toLowerCase()));
    }
    // STUDENT: Only own verifications
    const ownReg = (currentUser.registerNumber || currentUser.id).toLowerCase().trim();
    return verifications.filter((v) => v.register_number.toLowerCase().trim() === ownReg);
  }, [verifications, students, currentUser]);

  const scopedAttendanceRecords = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return attendanceRecords;
    if (currentUser.role === 'HOD') {
      const dept = (currentUser.department || 'Physiotherapy').toLowerCase().trim();
      const deptRegs = students
        .filter((s) => s.department.toLowerCase().trim() === dept)
        .map((s) => s.register_number.toLowerCase());
      return attendanceRecords.filter((r) => deptRegs.includes(r.register_number.toLowerCase()));
    }
    if (currentUser.role === 'MENTOR') {
      const assignedRegs = students
        .filter(
          (s) =>
            s.mentor_id === currentUser.id ||
            s.mentor_name?.toLowerCase() === currentUser.name?.toLowerCase()
        )
        .map((s) => s.register_number.toLowerCase());
      return attendanceRecords.filter((r) => assignedRegs.includes(r.register_number.toLowerCase()));
    }
    // STUDENT: Only own attendance records
    const ownReg = (currentUser.registerNumber || currentUser.id).toLowerCase().trim();
    return attendanceRecords.filter((r) => r.register_number.toLowerCase().trim() === ownReg);
  }, [attendanceRecords, students, currentUser]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || null,
        students: scopedStudents,
        mentors: scopedMentors,
        hods: scopedHods,
        departments,
        shifts,
        verifications: scopedVerifications,
        alerts: scopedAlerts,
        activityLogs: currentUser?.role === 'ADMIN' ? activityLogs : [],
        attendanceRecords: scopedAttendanceRecords,
        studentNotifications,
        mentorNotifications,
        gpsMode,
        currentScreen,
        selectedStudentRegisterNumber,
        selectedAlertId,
        isVerificationModalOpen,
        isStartShiftModalOpen,
        isCheckOutModalOpen,
        isMentorAddStudentModalOpen,
        activeCheckOutSummary,
        isVerifying,
        lastVerification,
        pendingRandomRequest,
        hospitalGeofence,
        login,
        logout,
        switchRoleQuickly,
        setCurrentScreen,
        setSelectedStudent,
        setSelectedAlert,
        setGpsMode,
        updateHospitalGeofence,
        resetHospitalGeofence,
        startShift,
        endShift,
        openStartShiftModal,
        closeStartShiftModal,
        openCheckOutModal,
        closeCheckOutModal,
        confirmCheckOut,
        dismissCheckOutSummary,
        performGpsVerification,
        triggerRandomVerificationPrompt,
        dismissVerificationModal,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        markAlertAsReviewed,
        openMentorAddStudentModal,
        closeMentorAddStudentModal,
        mentorAddStudent,
        markMentorNotificationAsRead,
        markAllMentorNotificationsAsRead,
        getMentorStudents,
        isHodAddMentorModalOpen,
        openHodAddMentorModal,
        closeHodAddMentorModal,
        hodAddMentor,
        getDepartmentStudents,
        getDepartmentMentors,
        getDepartmentAlerts,
        getDepartmentVerifications,
        createHod,
        editHod,
        toggleHodStatus,
        adminCreateMentor,
        adminEditMentor,
        adminToggleMentorStatus,
        adminReassignMentorDepartment,
        adminEditStudent,
        adminToggleStudentStatus,
        adminChangeStudentDepartment,
        createShift,
        bulkAssignShift,
        changeStudentShift,
        changeStudentMentor,
        addStudent,
        deleteStudent,
        runDemonstrationStep,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
