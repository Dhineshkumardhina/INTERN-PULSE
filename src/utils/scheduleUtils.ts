import { Shift, Student, StudentScheduleEntry } from '../types';

/**
 * Converts "HH:MM" 24-hour string to minutes from midnight (0..1439)
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return ((h % 24) * 60 + (m % 60));
}

/**
 * Converts minutes from midnight into 12-hour AM/PM format (e.g. 840 -> "02:00 PM")
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(norm / 60);
  const minutes = norm % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours < 10 ? '0' : ''}${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Returns sub-intervals in minutes [start, end] for a shift.
 * If the shift crosses midnight (start > end), it is split into [start, 1440] and [0, end].
 */
export function getShiftIntervals(startTime: string, endTime: string): Array<[number, number]> {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);

  if (start < end) {
    // Normal same-day interval
    return [[start, end]];
  } else if (start > end) {
    // Cross-midnight overnight interval (e.g. 22:00 to 06:00)
    return [
      [start, 1440],
      [0, end],
    ];
  } else {
    // 24-hour continuous
    return [[0, 1440]];
  }
}

export interface OverlapCollisionDetail {
  conflictingId: string;
  conflictingTitle: string;
  conflictingTiming: string;
  conflictingCategory: string;
  overlapMinutes: number;
  overlapHoursFormatted: string;
  collisionWindowText: string;
  severity: 'CRITICAL' | 'WARNING';
  isCurrentlyActiveDuty: boolean;
  explanation: string;
}

export interface ScheduleOverlapCheckResult {
  hasConflict: boolean;
  conflicts: OverlapCollisionDetail[];
  totalConflictingSchedules: number;
  warningSummary: string;
  preventInconsistencyRecommendation: string;
}

/**
 * Checks whether a proposed shift overlaps with any existing schedule of a student.
 * Compares against:
 * 1. student.schedules array (existing clinical postings, rotations, lab training, on-call)
 * 2. If student has an active ongoing shift (is_active_shift: true), verifies that the new shift
 *    doesn't collide with the currently active duty hours.
 */
export function detectShiftScheduleOverlap(
  student: Student,
  proposedShift: Shift,
  allShifts: Shift[] = []
): ScheduleOverlapCheckResult {
  const proposedIntervals = getShiftIntervals(proposedShift.start_time, proposedShift.end_time);
  const conflicts: OverlapCollisionDetail[] = [];

  // 1. Gather all existing schedules to check against
  const existingSchedules: Array<{
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    time_label: string;
    category: string;
    isActive: boolean;
  }> = [];

  if (student.schedules && student.schedules.length > 0) {
    student.schedules.forEach((sch) => {
      // Don't compare against identical shift if it's the exact one being modified
      existingSchedules.push({
        id: sch.id,
        title: sch.title,
        start_time: sch.start_time,
        end_time: sch.end_time,
        time_label: sch.time_label,
        category: sch.category,
        isActive: !!sch.is_active,
      });
    });
  } else if (student.shift_id) {
    // Fallback if student doesn't have an explicit schedules array yet:
    // check against their current assigned primary shift
    const currentShift = allShifts.find((s) => s.id === student.shift_id);
    if (currentShift && currentShift.id !== proposedShift.id) {
      existingSchedules.push({
        id: `primary_${currentShift.id}`,
        title: `Current Primary Shift: ${currentShift.name}`,
        start_time: currentShift.start_time,
        end_time: currentShift.end_time,
        time_label: currentShift.label,
        category: 'PRIMARY_SHIFT',
        isActive: student.is_active_shift,
      });
    }
  }

  // Also check currently active shift if marked as active in real-time
  if (student.is_active_shift && student.shift_id) {
    const activeShiftObj = allShifts.find((s) => s.id === student.shift_id);
    const activeStart = activeShiftObj ? activeShiftObj.start_time : '22:00';
    const activeEnd = activeShiftObj ? activeShiftObj.end_time : '06:00';
    const activeLabel = student.shift_time || (activeShiftObj ? activeShiftObj.label : '10:00 PM – 06:00 AM');

    // Check if not already in existingSchedules list
    const alreadyListed = existingSchedules.some(
      (s) => s.start_time === activeStart && s.end_time === activeEnd
    );
    if (!alreadyListed && proposedShift.id !== student.shift_id) {
      existingSchedules.unshift({
        id: `active_duty_${student.register_number}`,
        title: `Active Clinical Duty in Progress (${student.shift_name})`,
        start_time: activeStart,
        end_time: activeEnd,
        time_label: activeLabel,
        category: 'ACTIVE_DUTY_IN_PROGRESS',
        isActive: true,
      });
    }
  }

  // 2. Perform intersection checks
  for (const existing of existingSchedules) {
    const existingIntervals = getShiftIntervals(existing.start_time, existing.end_time);

    let totalOverlapMinutes = 0;
    const overlapWindows: string[] = [];

    for (const [pStart, pEnd] of proposedIntervals) {
      for (const [eStart, eEnd] of existingIntervals) {
        const collisionStart = Math.max(pStart, eStart);
        const collisionEnd = Math.min(pEnd, eEnd);

        if (collisionStart < collisionEnd) {
          const minutes = collisionEnd - collisionStart;
          totalOverlapMinutes += minutes;
          overlapWindows.push(
            `${formatMinutesToTime(collisionStart)} – ${formatMinutesToTime(collisionEnd)}`
          );
        }
      }
    }

    if (totalOverlapMinutes > 0) {
      const hours = Math.floor(totalOverlapMinutes / 60);
      const mins = totalOverlapMinutes % 60;
      const hoursFormatted =
        hours > 0 && mins > 0
          ? `${hours}h ${mins}m`
          : hours > 0
          ? `${hours} hour${hours > 1 ? 's' : ''}`
          : `${mins} mins`;

      conflicts.push({
        conflictingId: existing.id,
        conflictingTitle: existing.title,
        conflictingTiming: existing.time_label,
        conflictingCategory: existing.category,
        overlapMinutes: totalOverlapMinutes,
        overlapHoursFormatted: hoursFormatted,
        collisionWindowText: overlapWindows.join(', '),
        severity: existing.isActive || totalOverlapMinutes >= 120 ? 'CRITICAL' : 'WARNING',
        isCurrentlyActiveDuty: existing.isActive,
        explanation: existing.isActive
          ? `Student is currently active on duty. Assigning this shift causes direct active duty collision of ${hoursFormatted}.`
          : `Overlaps with scheduled duty "${existing.title}" by ${hoursFormatted} during ${overlapWindows.join(', ')}.`,
      });
    }
  }

  const hasConflict = conflicts.length > 0;

  return {
    hasConflict,
    conflicts,
    totalConflictingSchedules: conflicts.length,
    warningSummary: hasConflict
      ? `Schedule overlap detected with ${conflicts.length} existing student schedule${
          conflicts.length > 1 ? 's' : ''
        }. Data inconsistency risk: duplicate presence prompts & telemetry distortion.`
      : 'No schedule overlaps detected. Shift timing is consistent with existing student rosters.',
    preventInconsistencyRecommendation: hasConflict
      ? 'To prevent data inconsistency and conflicting geofence verification prompts, resolve this overlap by either replacing the conflicting schedule or selecting a non-overlapping clinical rotation.'
      : 'Safe to proceed.',
  };
}
