export type UserRole = 'STUDENT' | 'MENTOR' | 'HOD' | 'ADMIN';

export type VerificationStatus =
  | 'VERIFIED'
  | 'FAILED'
  | 'NEEDS ATTENTION'
  | 'REVIEWED'
  | 'GPS UNAVAILABLE'
  | 'LOCATION PERMISSION REQUIRED'
  | 'PERMISSION DENIED'
  | 'LOW ACCURACY'
  | 'VERIFYING'
  | 'OFF SHIFT';

export type GpsSimulationMode =
  | 'INSIDE_HOSPITAL'
  | 'OUTSIDE_HOSPITAL'
  | 'GPS_UNAVAILABLE'
  | 'PERMISSION_DENIED'
  | 'LOW_ACCURACY';

export type ShiftStatus =
  | 'NOT STARTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'MISSED'
  | 'NEEDS ATTENTION';

export interface UserProfile {
  id: string;
  registerNumber?: string;
  name: string;
  role: UserRole;
  department: string;
  email?: string;
  avatar?: string;
  password?: string;
}

export interface StudentScheduleEntry {
  id: string;
  title: string;
  shift_id?: string;
  start_time: string; // "HH:MM" e.g. "22:00"
  end_time: string; // "HH:MM" e.g. "06:00"
  time_label: string; // e.g. "10:00 PM – 06:00 AM"
  category: 'PRIMARY_SHIFT' | 'ROTATIONAL_DUTY' | 'CLINICAL_TRAINING' | 'ON_CALL';
  is_active?: boolean;
}

export interface Student {
  register_number: string; // Unique Student College Register Number (e.g. 23UCCT001)
  enrollment_number?: string; // Student Enrollment Number (e.g. 230146)
  posting_area?: string; // e.g. ICU, GENERAL MEDICINE WARD, CATH LAB
  name: string;
  department: string;
  email?: string;
  phone?: string;
  academic_year?: string;
  mentor_id: string;
  mentor_name: string;
  hospital: string;
  internship_department?: string;
  internship_start_date?: string;
  internship_end_date?: string;
  internship_status?: string;
  shift_id: string;
  shift_name: string;
  shift_time: string; // e.g. "08:30 AM – 04:00 PM"
  shift_status?: ShiftStatus;
  is_night_shift: boolean;
  is_active_shift: boolean;
  shift_started_at?: string;
  shift_ended_at?: string;
  current_status: VerificationStatus;
  last_verified_at?: string;
  last_verification_distance?: number;
  last_verification_accuracy?: number;
  avatar?: string;
  is_active?: boolean;
  schedules?: StudentScheduleEntry[];
}

export interface StudentAttendanceRecord {
  id: string;
  register_number: string;
  date_display: string; // e.g. "05 Sep 2026"
  date_iso: string;
  shift_name: string; // e.g. "Night"
  time_window: string; // e.g. "10:00 PM – 06:00 AM"
  start_time: string; // e.g. "10:02 PM"
  end_time: string; // e.g. "06:01 AM"
  status: 'COMPLETED' | 'COMPLETED (REVIEWED)' | 'IN PROGRESS' | 'MISSED' | 'NEEDS ATTENTION';
  verified_checks: number;
  total_checks: number;
  hours_logged: string; // e.g. "8.0 hrs"
  mentor_name: string;
  period_group: 'THIS_WEEK' | 'THIS_MONTH' | 'PREVIOUS_MONTH';
}

export interface StudentNotification {
  id: string;
  register_number: string;
  type:
    | 'SHIFT_REMINDER'
    | 'VERIFICATION_REQUIRED'
    | 'VERIFICATION_RESULT'
    | 'SHIFT_COMPLETED'
    | 'ATTENDANCE_UPDATE'
    | 'MENTOR_REVIEW';
  title: string;
  message: string;
  timestamp: string;
  time_display: string;
  is_read: boolean;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface MentorNotification {
  id: string;
  mentor_id: string;
  type:
    | 'NEEDS_ATTENTION_ALERT'
    | 'MISSED_VERIFICATION'
    | 'SHIFT_ISSUE'
    | 'CHECK_IN_ISSUE'
    | 'CHECK_OUT_ISSUE'
    | 'STUDENT_CREATION';
  title: string;
  message: string;
  student_register_number?: string;
  student_name?: string;
  alert_id?: string;
  timestamp: string;
  time_display: string;
  is_read: boolean;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface Hod {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  hospital?: string;
  is_active: boolean;
  created_at?: string;
  created_by?: string;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  department: string;
  hospital: string;
  assigned_students_count: number;
  email?: string;
  phone?: string;
  is_active?: boolean;
  created_at?: string;
  created_by?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hod_name: string;
  total_students: number;
  active_interns: number;
  on_shift: number;
  verified_today: number;
  needs_attention: number;
  gps_unavailable: number;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  label: string; // e.g. "Night (10:00 PM - 06:00 AM)"
  is_continuous_night: boolean;
  department_scope?: string;
}

export interface GpsVerification {
  id: string;
  register_number: string;
  student_name: string;
  department: string;
  mentor_id?: string;
  mentor_name?: string;
  shift_name?: string;
  timestamp: string; // ISO string
  time_display: string; // e.g. "03:42 AM"
  status: VerificationStatus;
  distance_meters: number;
  accuracy_meters: number;
  latitude: number;
  longitude: number;
  is_inside_geofence: boolean;
  verification_type: 'SHIFT_START' | 'RANDOM_PROMPT' | 'MANUAL' | 'SCHEDULED';
  review_details?: {
    reviewer_name: string;
    reviewed_at: string;
    previous_status: VerificationStatus;
    review_notes: string;
  };
}

export interface DepartmentAlert {
  id: string;
  verification_id: string;
  register_number: string;
  student_name: string;
  department: string;
  mentor_id: string;
  mentor_name: string;
  shift_name?: string;
  triggered_at: string;
  time_display: string;
  status: 'NEEDS ATTENTION' | 'REVIEWED';
  distance_meters: number;
  accuracy_meters: number;
  reason: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  actor?: string;
  action?: string;
  action_type:
    | 'SHIFT_CHANGE'
    | 'MENTOR_REASSIGN'
    | 'STUDENT_ADD'
    | 'STUDENT_EDIT'
    | 'STUDENT_DEACTIVATE'
    | 'STUDENT_DELETE'
    | 'HOD_CREATE'
    | 'HOD_EDIT'
    | 'HOD_DEACTIVATE'
    | 'MENTOR_CREATE'
    | 'MENTOR_EDIT'
    | 'MENTOR_DEACTIVATE'
    | 'MENTOR_DEPT_CHANGE'
    | 'SHIFT_CREATE'
    | 'BULK_SHIFT_ASSIGN'
    | 'ALERT_REVIEW'
    | 'GEOFENCE_UPDATE'
    | 'HOSPITAL_CONFIG';
  target?: string;
  student_register_number?: string;
  student_name?: string;
  old_value?: string;
  new_value?: string;
  details: string;
  reason: string;
  performed_by: string;
}

export interface HospitalGeofence {
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  tolerance_meters?: number;
  department_zone?: string;
  address?: string;
  last_updated_at?: string;
  updated_by?: string;
}
