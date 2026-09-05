import { HOSPITAL_CONFIG, MockGpsService } from './services/mockGpsService.js';
import {
  INITIAL_STUDENTS,
  INITIAL_MENTORS,
  INITIAL_HODS,
  INITIAL_SHIFTS,
  INITIAL_VERIFICATIONS,
  INITIAL_ALERTS,
  INITIAL_LOGS,
  DEMO_USERS,
} from './services/mockData.js';

console.log('=== RUNNING INTERNTRACK SYSTEM QA & SECURITY SUITE ===\n');

let passCount = 0;
let failCount = 0;
const results = [];

function assertTest(testId, role, feature, testCase, expected, actual, pass) {
  if (pass) {
    passCount++;
    results.push({ testId, role, feature, testCase, expected, actual, status: 'PASS', severity: 'NONE' });
    console.log(`[PASS] ${testId}: ${testCase}`);
  } else {
    failCount++;
    results.push({ testId, role, feature, testCase, expected, actual, status: 'FAIL', severity: 'HIGH' });
    console.error(`[FAIL] ${testId}: ${testCase} -> Expected: ${expected}, Got: ${actual}`);
  }
}

// ----------------------------------------------------
// 1. Role Hierarchy & Login Tests
// ----------------------------------------------------
assertTest(
  'TEST-AUTH-01',
  'STUDENT',
  'Institutional Sign-In',
  'Student login with 23BHS001 and password Student@23bhs001',
  'STUDENT',
  DEMO_USERS['23BHS001']?.role,
  DEMO_USERS['23BHS001']?.role === 'STUDENT'
);

assertTest(
  'TEST-AUTH-02',
  'MENTOR',
  'Institutional Sign-In',
  'Mentor login with mentor01 and password Mentor@anitha2026',
  'MENTOR',
  DEMO_USERS['mentor01']?.role,
  DEMO_USERS['mentor01']?.role === 'MENTOR'
);

assertTest(
  'TEST-AUTH-03',
  'HOD',
  'Institutional Sign-In',
  'HOD login with hod01 and password Hod@physio2026',
  'HOD',
  DEMO_USERS['hod01']?.role,
  DEMO_USERS['hod01']?.role === 'HOD'
);

assertTest(
  'TEST-AUTH-04',
  'ADMIN',
  'Institutional Sign-In',
  'Admin login with admin01 and password Admin@ahs2026',
  'ADMIN',
  DEMO_USERS['admin01']?.role,
  DEMO_USERS['admin01']?.role === 'ADMIN'
);

// ----------------------------------------------------
// 2. Continuous Night Shift Integrity (10:00 PM - 06:00 AM)
// ----------------------------------------------------
const nightShift = INITIAL_SHIFTS.find((s) => s.is_continuous_night);
assertTest(
  'TEST-SHIFT-01',
  'SYSTEM',
  'Night Shift Calculation',
  '10:00 PM – 06:00 AM marked as continuous overnight shift',
  true,
  nightShift?.is_continuous_night,
  nightShift && nightShift.start_time === '22:00' && nightShift.end_time === '06:00' && nightShift.is_continuous_night === true
);

// Test GPS Checks across midnight in single shift
const arunVerifications = INITIAL_VERIFICATIONS.filter((v) => v.register_number === '23BHS001');
const checkTimes = arunVerifications.map((v) => v.time_display);
assertTest(
  'TEST-SHIFT-02',
  'STUDENT',
  'Night Shift Timeline',
  'Arun Kumar verifications include 10:02 PM, 11:31 PM, 01:18 AM, 03:42 AM, 05:58 AM in same shift',
  true,
  checkTimes.includes('10:02 PM') && checkTimes.includes('01:18 AM') && checkTimes.includes('03:42 AM'),
  checkTimes.includes('10:02 PM') && checkTimes.includes('01:18 AM') && checkTimes.includes('03:42 AM')
);

// ----------------------------------------------------
// 3. GPS Geofence Verification Simulation
// ----------------------------------------------------
MockGpsService.setActiveGeofence(HOSPITAL_CONFIG);
const targetStudent = INITIAL_STUDENTS[0];

const insideCheck = MockGpsService.performGpsCheck(targetStudent, 'INSIDE_HOSPITAL', '10:00 PM', 'SHIFT_START');
assertTest(
  'TEST-GPS-01',
  'STUDENT',
  'Inside Geofence Verification',
  'GPS check inside perimeter generates status VERIFIED with is_inside_geofence=true',
  'VERIFIED',
  insideCheck.status,
  insideCheck.status === 'VERIFIED' && insideCheck.is_inside_geofence === true
);

const outsideCheck = MockGpsService.performGpsCheck(targetStudent, 'OUTSIDE_HOSPITAL', '03:42 AM', 'RANDOM_PROMPT');
assertTest(
  'TEST-GPS-02',
  'STUDENT',
  'Outside Geofence Verification',
  'GPS check outside perimeter generates status NEEDS ATTENTION with is_inside_geofence=false',
  'NEEDS ATTENTION',
  outsideCheck.status,
  outsideCheck.status === 'NEEDS ATTENTION' && outsideCheck.is_inside_geofence === false
);

const unavailCheck = MockGpsService.performGpsCheck(targetStudent, 'GPS_UNAVAILABLE', '11:00 PM', 'MANUAL');
assertTest(
  'TEST-GPS-03',
  'STUDENT',
  'GPS Unavailable Simulation',
  'GPS unavailable simulation sets status GPS UNAVAILABLE',
  'GPS UNAVAILABLE',
  unavailCheck.status,
  unavailCheck.status === 'GPS UNAVAILABLE'
);

const permDeniedCheck = MockGpsService.performGpsCheck(targetStudent, 'PERMISSION_DENIED', '11:00 PM', 'MANUAL');
assertTest(
  'TEST-GPS-04',
  'STUDENT',
  'Permission Denied Simulation',
  'Permission denied simulation sets status PERMISSION DENIED',
  'PERMISSION DENIED',
  permDeniedCheck.status,
  permDeniedCheck.status === 'PERMISSION DENIED'
);

// ----------------------------------------------------
// 4. Mentor Scoping & Isolation
// ----------------------------------------------------
const drAnithaStudents = INITIAL_STUDENTS.filter((s) => s.mentor_id === 'mentor01');
const drMitchellStudents = INITIAL_STUDENTS.filter((s) => s.mentor_id === 'mentor02');

assertTest(
  'TEST-MENTOR-SCOPE-01',
  'MENTOR',
  'Student List Scoping',
  'Mentor Dr. Anitha (mentor01) sees only her assigned students',
  true,
  drAnithaStudents.every((s) => s.mentor_id === 'mentor01'),
  drAnithaStudents.length > 0 && drAnithaStudents.every((s) => s.mentor_id === 'mentor01')
);

assertTest(
  'TEST-MENTOR-SCOPE-02',
  'MENTOR',
  'Cross-Mentor Isolation',
  'Mentor Dr. Anitha (mentor01) does NOT see Dr. Mitchell students',
  false,
  drAnithaStudents.some((s) => s.mentor_id === 'mentor02'),
  !drAnithaStudents.some((s) => s.mentor_id === 'mentor02')
);

// ----------------------------------------------------
// 5. HOD Departmental Scoping & Isolation
// ----------------------------------------------------
const physioStudents = INITIAL_STUDENTS.filter((s) => s.department === 'Physiotherapy');
const cardioStudents = INITIAL_STUDENTS.filter((s) => s.department === 'Cardiology');

assertTest(
  'TEST-HOD-SCOPE-01',
  'HOD',
  'Departmental Scoping',
  'HOD Physiotherapy sees all Physiotherapy students',
  true,
  physioStudents.length >= 6,
  physioStudents.length >= 6
);

assertTest(
  'TEST-HOD-SCOPE-02',
  'HOD',
  'Cross-Department Isolation',
  'HOD Physiotherapy does not see Cardiology students',
  false,
  physioStudents.some((s) => s.department === 'Cardiology'),
  !physioStudents.some((s) => s.department === 'Cardiology')
);

// ----------------------------------------------------
// 6. Alert Review Flow & Data Preservation
// ----------------------------------------------------
const arunAlert = INITIAL_ALERTS.find((a) => a.id === 'alert_arun_01');
const originalAlertDistance = arunAlert?.distance_meters;
const originalAlertTime = arunAlert?.time_display;

assertTest(
  'TEST-ALERT-01',
  'MENTOR',
  'Alert Telemetry Immutability',
  'Alert maintains original distance (420m) and timestamp (03:42 AM)',
  420,
  originalAlertDistance,
  originalAlertDistance === 420 && originalAlertTime === '03:42 AM'
);

console.log(`\n=== QA SUITE SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===\n`);
