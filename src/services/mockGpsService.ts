import { GpsSimulationMode, GpsVerification, HospitalGeofence, Student, VerificationStatus, ShiftSession, ScheduledRandomCheck } from '../types';
import { HOSPITAL_CONFIG } from './mockData';

export const GPS_ACCURACY_THRESHOLD_METERS = 50; // Maximum acceptable GPS accuracy in meters

export interface GpsCheckResult {
  status: VerificationStatus;
  distance_meters: number;
  accuracy_meters: number;
  latitude: number;
  longitude: number;
  is_inside_geofence: boolean;
  timestamp: string;
  time_display: string;
  message: string;
}

/**
 * Calculates Great-Circle distance in meters using Haversine formula
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 && !lon1) return 0;
  if (!lat2 && !lon2) return 0;
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371e3; // Earth radius in meters (6,371,000 m)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Evaluates whether coordinates fall within hospital geofence perimeter + tolerance
 */
export function isInsideGeofence(
  lat: number,
  lon: number,
  geofence: HospitalGeofence,
  toleranceMeters: number = 0
): boolean {
  if (lat === 0 && lon === 0) return false;
  if (isNaN(lat) || isNaN(lon)) return false;
  const distance = calculateDistanceMeters(lat, lon, geofence.latitude, geofence.longitude);
  const allowedRadius = geofence.radius_meters + (toleranceMeters || geofence.tolerance_meters || 0);
  return distance <= allowedRadius;
}

export class MockGpsService {
  private static currentSimulationMode: GpsSimulationMode = 'INSIDE_HOSPITAL';
  private static activeGeofence: HospitalGeofence = HOSPITAL_CONFIG;

  public static setSimulationMode(mode: GpsSimulationMode) {
    this.currentSimulationMode = mode;
  }

  public static getSimulationMode(): GpsSimulationMode {
    return this.currentSimulationMode;
  }

  public static setActiveGeofence(geofence: HospitalGeofence) {
    this.activeGeofence = { ...geofence };
  }

  public static getActiveGeofence(): HospitalGeofence {
    return this.activeGeofence || HOSPITAL_CONFIG;
  }

  public static getCurrentTimeString(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  /**
   * Parses time strings such as "10:00 PM", "22:00", "09:00 AM" into hours and minutes (24-hour format)
   */
  public static parseTimeStrToHoursMinutes(timeStr: string): { hours: number; minutes: number } {
    const trimmed = (timeStr || '').trim().toUpperCase();
    const isPM = trimmed.includes('PM');
    const isAM = trimmed.includes('AM');
    const clean = trimmed.replace(/[^\d:]/g, '');
    const parts = clean.split(':');
    let hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return { hours, minutes };
  }

  /**
   * Calculates continuous datetime range for a shift.
   * If night shift or end time is earlier than start time, end datetime rolls over to the next day as ONE continuous shift.
   */
  public static calculateShiftDateTimeRange(
    scheduledStartStr: string = '10:00 PM',
    scheduledEndStr: string = '06:00 AM',
    isNightShift: boolean = true,
    baseDate: Date = new Date()
  ): { startDateTime: Date; endDateTime: Date; startIso: string; endIso: string } {
    const startHM = this.parseTimeStrToHoursMinutes(scheduledStartStr);
    const endHM = this.parseTimeStrToHoursMinutes(scheduledEndStr);

    const startDateTime = new Date(baseDate);
    startDateTime.setHours(startHM.hours, startHM.minutes, 0, 0);

    const endDateTime = new Date(baseDate);
    endDateTime.setHours(endHM.hours, endHM.minutes, 0, 0);

    // If night shift or end time is less than or equal to start time, add 1 full day (cross midnight)
    if (isNightShift || endDateTime.getTime() <= startDateTime.getTime()) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    return {
      startDateTime,
      endDateTime,
      startIso: startDateTime.toISOString(),
      endIso: endDateTime.toISOString(),
    };
  }

  /**
   * Computes human-readable duration (e.g. "8.0 hrs")
   */
  public static calculateShiftDuration(startInput: Date | string, endInput: Date | string): string {
    const startDate = typeof startInput === 'string' ? new Date(startInput) : startInput;
    const endDate = typeof endInput === 'string' ? new Date(endInput) : endInput;

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return '8.0 hrs';
    }

    const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
    const totalMinutes = Math.round(diffMs / 60000);
    const hours = (totalMinutes / 60).toFixed(1);
    return `${hours} hrs`;
  }

  /**
   * Checks if a scheduled shift has reached its expiration time
   */
  public static isShiftExpired(endInput: Date | string, currentInput: Date = new Date()): boolean {
    const endDate = typeof endInput === 'string' ? new Date(endInput) : endInput;
    if (isNaN(endDate.getTime())) return false;
    return currentInput.getTime() >= endDate.getTime();
  }

  /**
   * Generates EXACTLY 5 RANDOM GPS VERIFICATION CHECKS during the student's configured shift window.
   * Handles night shifts crossing midnight correctly as one continuous interval.
   */
  public static generateFiveRandomCheckTimes(
    startTimeStr: string = '22:00',
    endTimeStr: string = '06:00',
    isNightShift: boolean = true
  ): string[] {
    let startHour = 22;
    let startMin = 0;
    if (startTimeStr && startTimeStr.includes(':')) {
      const parts = startTimeStr.split(':');
      startHour = parseInt(parts[0], 10) || 22;
      startMin = parseInt(parts[1], 10) || 0;
    }

    const durationMins = isNightShift ? 8 * 60 : 7.5 * 60;
    const checkTimes: string[] = [];
    const segmentSize = durationMins / 6.0;

    for (let i = 1; i <= 5; i++) {
      const minOffset = Math.floor(segmentSize * (i - 1) + segmentSize * 0.2 + Math.random() * (segmentSize * 0.6));
      const totalMins = startMin + minOffset;
      const totalHours = startHour + Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      const hour24 = totalHours % 24;

      const h12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      const formattedMin = mins < 10 ? `0${mins}` : `${mins}`;
      checkTimes.push(`${h12}:${formattedMin} ${ampm}`);
    }

    return checkTimes;
  }

  /**
   * Generates EXACTLY 5 RANDOM SCHEDULED CHECKS for an active shift session.
   * Ensures:
   * 1. Strictly inside the shift window (start_datetime to end_datetime)
   * 2. Exactly 5 unique check records (check_number: 1..5)
   * 3. Reasonably distributed with minimum spacing
   * 4. Night shifts spanning midnight handled continuously across dates
   * 5. Initial status: SCHEDULED
   */
  public static generateFiveRandomScheduledChecks(
    shiftSession: ShiftSession,
    options?: { minSpacingMinutes?: number }
  ): ScheduledRandomCheck[] {
    const startDate = new Date(shiftSession.start_datetime || shiftSession.created_at || new Date());
    const endDate = new Date(shiftSession.end_datetime || new Date(startDate.getTime() + 8 * 60 * 60 * 1000));

    let durationMs = endDate.getTime() - startDate.getTime();
    if (durationMs <= 0) {
      durationMs = 8 * 60 * 60 * 1000;
    }

    const durationMinutes = durationMs / (60 * 1000);
    const segmentMinutes = (durationMinutes * 0.88) / 5;
    const minSpacingMinutes = options?.minSpacingMinutes || Math.max(12, Math.floor(segmentMinutes * 0.4));

    const scheduledChecks: ScheduledRandomCheck[] = [];
    const usedTimestamps: number[] = [];

    for (let i = 1; i <= 5; i++) {
      const segmentStartMin = durationMinutes * 0.06 + (i - 1) * segmentMinutes;
      const randomOffset = segmentMinutes * (0.15 + Math.random() * 0.7);
      let checkOffsetMin = Math.round(segmentStartMin + randomOffset);

      if (checkOffsetMin < 5) checkOffsetMin = 5 + i * 2;
      if (checkOffsetMin >= durationMinutes - 5) checkOffsetMin = durationMinutes - 10 + i;

      let checkTimestamp = startDate.getTime() + checkOffsetMin * 60 * 1000;

      if (usedTimestamps.length > 0) {
        const lastTs = usedTimestamps[usedTimestamps.length - 1];
        if (checkTimestamp - lastTs < minSpacingMinutes * 60 * 1000) {
          checkTimestamp = lastTs + minSpacingMinutes * 60 * 1000;
        }
      }

      if (checkTimestamp >= endDate.getTime()) {
        checkTimestamp = endDate.getTime() - (6 - i) * 6 * 60 * 1000;
      }

      usedTimestamps.push(checkTimestamp);
      const checkDate = new Date(checkTimestamp);
      const timeStr = checkDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      const checkRecord: ScheduledRandomCheck = {
        id: `scheduled_check_${shiftSession.shift_session_id}_${i}`,
        shift_session_id: shiftSession.shift_session_id,
        register_number: shiftSession.register_number,
        student_id: shiftSession.register_number,
        student_name: shiftSession.student_name,
        mentor_id: shiftSession.mentor_id,
        mentor_name: shiftSession.mentor_name,
        department: shiftSession.department,
        check_number: i as 1 | 2 | 3 | 4 | 5,
        scheduled_time: timeStr,
        scheduled_datetime: checkDate.toISOString(),
        status: 'SCHEDULED',
        created_at: new Date().toISOString(),
      };

      scheduledChecks.push(checkRecord);
    }

    return scheduledChecks;
  }

  /**
   * Executes a scheduled check: transitions SCHEDULED -> EXECUTING -> Result,
   * binds GPS telemetry, geofence evaluation and returns the updated check & verification record.
   */
  public static executeScheduledCheck(
    check: ScheduledRandomCheck,
    student: Student,
    forcedMode?: GpsSimulationMode,
    geofenceConfig?: HospitalGeofence
  ): { check: ScheduledRandomCheck; verification: GpsVerification } {
    const geofence = geofenceConfig || this.activeGeofence || HOSPITAL_CONFIG;
    const now = new Date();
    const isoTimestamp = now.toISOString();
    const timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    // Transition to EXECUTING and obtain GPS verification
    const verification = this.performGpsCheck(student, forcedMode, timeDisplay, 'RANDOM_CHECK');

    const updatedCheck: ScheduledRandomCheck = {
      ...check,
      status: verification.status,
      executed_at: isoTimestamp,
      latitude: verification.latitude,
      longitude: verification.longitude,
      accuracy: verification.accuracy_meters,
      distance_from_hospital: verification.distance_meters,
      geofence_radius: geofence.radius_meters,
      gps_state: forcedMode || this.currentSimulationMode,
      permission_state: forcedMode === 'PERMISSION_DENIED' ? 'DENIED' : 'GRANTED',
      result: verification.status,
    };

    return { check: updatedCheck, verification };
  }

  /**
   * Generates unpredictable, random verification check times for an 8-hour shift
   * Night shift: 11:18 PM, 01:42 AM, 03:15 AM, 04:50 AM
   */
  public static generateShiftVerificationSchedule(
    isNightShift: boolean = true,
    _count: number = 4
  ): string[] {
    if (isNightShift) {
      return ['11:18 PM', '01:42 AM', '03:15 AM', '04:50 AM'];
    }
    return ['07:45 AM', '09:50 AM', '11:35 AM', '01:15 PM'];
  }

  /**
   * Performs GPS presence check based on simulated or forced mode
   */
  public static performGpsCheck(
    student: Student,
    forcedMode?: GpsSimulationMode,
    customTime?: string,
    verificationType: GpsVerification['verification_type'] = 'MANUAL'
  ): GpsVerification {
    const mode = forcedMode || this.currentSimulationMode;
    const now = new Date();
    const isoTimestamp = now.toISOString();
    const timeDisplay = customTime || this.getCurrentTimeString();
    const geofence = this.activeGeofence || HOSPITAL_CONFIG;

    let status: VerificationStatus = 'VERIFIED';
    let distance = 75;
    let accuracy = 5.0;
    let lat = geofence.latitude;
    let lng = geofence.longitude;
    let inside = true;

    // Conditions:
    // A. INSIDE HOSPITAL: Distance ~35-75 meters, Status = VERIFIED
    // B. OUTSIDE HOSPITAL: Distance = 850 meters, Status = NEEDS ATTENTION, Accuracy = 18m
    // C. LOW ACCURACY: Accuracy = 65m (> 50m threshold), Status = LOW ACCURACY
    // D. GPS UNAVAILABLE: Status = GPS UNAVAILABLE
    // E. PERMISSION DENIED: Status = PERMISSION DENIED
    if (mode === 'INSIDE_HOSPITAL') {
      const targetDist = 50; // meters inside perimeter
      accuracy = 6.0;
      
      const cosLat = Math.cos((geofence.latitude * Math.PI) / 180);
      const dLat = (targetDist * Math.SQRT1_2) / 111320;
      const dLon = (targetDist * Math.SQRT1_2) / (111320 * cosLat);
      lat = geofence.latitude + dLat;
      lng = geofence.longitude + dLon;
      
      // Compute actual ground distance
      distance = calculateDistanceMeters(lat, lng, geofence.latitude, geofence.longitude);
      inside = isInsideGeofence(lat, lng, geofence);
      status = inside && accuracy <= GPS_ACCURACY_THRESHOLD_METERS ? 'VERIFIED' : 'NEEDS ATTENTION';
    } else if (mode === 'OUTSIDE_HOSPITAL') {
      const targetDist = 850; // meters outside perimeter
      accuracy = 18.0;
      
      const cosLat = Math.cos((geofence.latitude * Math.PI) / 180);
      const dLat = (targetDist * Math.SQRT1_2) / 111320;
      const dLon = (targetDist * Math.SQRT1_2) / (111320 * cosLat);
      lat = geofence.latitude + dLat;
      lng = geofence.longitude + dLon;
      
      distance = calculateDistanceMeters(lat, lng, geofence.latitude, geofence.longitude);
      inside = isInsideGeofence(lat, lng, geofence);
      status = 'NEEDS ATTENTION';
    } else if (mode === 'LOW_ACCURACY') {
      status = 'LOW ACCURACY';
      const targetDist = 42;
      accuracy = 65.0; // High inaccuracy exceeding 50m threshold
      const cosLat = Math.cos((geofence.latitude * Math.PI) / 180);
      lat = geofence.latitude + (targetDist * Math.SQRT1_2) / 111320;
      lng = geofence.longitude + (targetDist * Math.SQRT1_2) / (111320 * cosLat);
      distance = calculateDistanceMeters(lat, lng, geofence.latitude, geofence.longitude);
      inside = true;
    } else if (mode === 'GPS_UNAVAILABLE') {
      status = 'GPS UNAVAILABLE';
      distance = 0;
      accuracy = 0;
      lat = 0;
      lng = 0;
      inside = false;
    } else if (mode === 'PERMISSION_DENIED') {
      status = 'PERMISSION DENIED';
      distance = 0;
      accuracy = 0;
      lat = 0;
      lng = 0;
      inside = false;
    }

    const verificationId = `v_${student.register_number.toLowerCase()}_${Date.now()}`;
    const verification: GpsVerification = {
      id: verificationId,
      verification_id: verificationId,
      register_number: student.register_number,
      student_id: student.register_number,
      student_name: student.name,
      department: student.department,
      mentor_id: student.mentor_id,
      mentor_name: student.mentor_name,
      shift_session_id: student.active_session_id,
      shift_name: student.shift_name,
      timestamp: isoTimestamp,
      time_display: timeDisplay,
      status,
      distance_meters: distance,
      accuracy_meters: accuracy,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      geofence_radius: geofence.radius_meters,
      gps_state: mode,
      permission_state: mode === 'PERMISSION_DENIED' ? 'DENIED' : 'GRANTED',
      is_inside_geofence: inside,
      verification_type: verificationType,
    };

    return verification;
  }

  /**
   * Evaluates raw coordinates directly
   */
  public static performGpsCheckCoordinates(
    student: Student,
    lat: number,
    lng: number,
    accuracy: number,
    customTime?: string,
    verificationType: GpsVerification['verification_type'] = 'MANUAL'
  ): GpsVerification {
    const geofence = this.activeGeofence || HOSPITAL_CONFIG;
    const now = new Date();
    const isoTimestamp = now.toISOString();
    const timeDisplay = customTime || this.getCurrentTimeString();

    if (lat === 0 && lng === 0) {
      return {
        id: `v_${student.register_number}_${Date.now()}`,
        register_number: student.register_number,
        student_name: student.name,
        department: student.department,
        mentor_id: student.mentor_id,
        mentor_name: student.mentor_name,
        shift_name: student.shift_name,
        timestamp: isoTimestamp,
        time_display: timeDisplay,
        status: 'GPS UNAVAILABLE',
        distance_meters: 0,
        accuracy_meters: 0,
        latitude: 0,
        longitude: 0,
        is_inside_geofence: false,
        verification_type: verificationType,
      };
    }

    const distance = calculateDistanceMeters(lat, lng, geofence.latitude, geofence.longitude);
    const inside = isInsideGeofence(lat, lng, geofence);
    
    let status: VerificationStatus = 'VERIFIED';
    if (accuracy > GPS_ACCURACY_THRESHOLD_METERS) {
      status = 'LOW ACCURACY';
    } else if (!inside) {
      status = 'NEEDS ATTENTION';
    } else {
      status = 'VERIFIED';
    }

    return {
      id: `v_${student.register_number}_${Date.now()}`,
      register_number: student.register_number,
      student_name: student.name,
      department: student.department,
      mentor_id: student.mentor_id,
      mentor_name: student.mentor_name,
      shift_name: student.shift_name,
      timestamp: isoTimestamp,
      time_display: timeDisplay,
      status,
      distance_meters: distance,
      accuracy_meters: accuracy,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      is_inside_geofence: inside,
      verification_type: verificationType,
    };
  }
}
