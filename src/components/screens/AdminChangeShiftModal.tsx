import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { detectShiftScheduleOverlap } from '../../utils/scheduleUtils';
import { ShiftOverlapTooltip, ShiftOverlapWarningIndicator } from '../common/ShiftOverlapWarningIndicator';
import { Shift } from '../../types';

interface Props {
  studentReg: string;
  onClose: () => void;
}

export const AdminChangeShiftModal: React.FC<Props> = ({ studentReg, onClose }) => {
  const { students, shifts, changeStudentShift } = useApp();

  const [currentReg, setCurrentReg] = useState<string>(studentReg);
  const student = students.find((s) => s.register_number === currentReg) || students[0];

  const [selectedShiftId, setSelectedShiftId] = useState<string>(student.shift_id || 'shift_night');
  const [reason, setReason] = useState<string>(
    'Departmental rotation schedule adjustment for clinical radiology block.'
  );
  const [reconcileMode, setReconcileMode] = useState<'REPLACE' | 'BLOCK'>('REPLACE');
  const [hasAcknowledgedOverlap, setHasAcknowledgedOverlap] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const selectedShift = shifts.find((sh) => sh.id === selectedShiftId) || shifts[0];

  // Detect overlap in real-time
  const overlapResult = useMemo(() => {
    return detectShiftScheduleOverlap(student, selectedShift, shifts);
  }, [student, selectedShift, shifts]);

  // Pre-calculate overlap status for each available shift option in the list
  const shiftStatusMap = useMemo(() => {
    const map: Record<string, { hasConflict: boolean; summary: string }> = {};
    for (const sh of shifts) {
      const res = detectShiftScheduleOverlap(student, sh, shifts);
      if (res.hasConflict) {
        const topConflict = res.conflicts[0];
        map[sh.id] = {
          hasConflict: true,
          summary: `Overlaps with ${topConflict.conflictingTitle.slice(0, 18)}... (${topConflict.overlapHoursFormatted})`,
        };
      } else {
        map[sh.id] = {
          hasConflict: false,
          summary: 'Consistent (No Overlaps)',
        };
      }
    }
    return map;
  }, [student, shifts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!reason.trim()) {
      setErrorMessage('Reason for shift change is required for administrative audit logs.');
      return;
    }

    // Prevention gate: If overlap exists and cannot be reconciled or hasn't been acknowledged
    if (overlapResult.hasConflict) {
      if (reconcileMode === 'BLOCK') {
        setErrorMessage(
          'Assignment blocked: Selected shift overlaps with existing schedules. Choose a non-overlapping shift to prevent data inconsistency.'
        );
        return;
      }

      if (!hasAcknowledgedOverlap) {
        setErrorMessage(
          'Data Inconsistency Warning: You must check "Acknowledge conflict & reconcile overlapping schedules" before updating.'
        );
        return;
      }
    }

    const conflictingIds = overlapResult.hasConflict
      ? overlapResult.conflicts.map((c) => c.conflictingId)
      : [];

    changeStudentShift(student.register_number, selectedShiftId, reason, conflictingIds);
    onClose();
  };

  return (
    <div
      id="change-shift-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-outline-variant/60 my-auto max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-3 pb-2 border-b border-outline-variant/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">edit_calendar</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">
                Admin Shift Assignment
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Schedule conflict & data consistency verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div
            id="shift-assignment-error"
            className="mb-3 p-3 bg-error-container/80 border border-error/40 text-error text-xs rounded-xl font-medium flex items-start gap-2"
          >
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Student Selector Card */}
          <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-label-caps text-on-surface-variant uppercase font-bold text-[10px]">
                Target Intern
              </label>
              <select
                value={currentReg}
                onChange={(e) => {
                  setCurrentReg(e.target.value);
                  setHasAcknowledgedOverlap(false);
                }}
                className="text-[11px] bg-surface border border-outline-variant rounded-md px-2 py-0.5 text-primary font-bold"
              >
                {students.map((s) => (
                  <option key={s.register_number} value={s.register_number}>
                    {s.name} ({s.register_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="font-bold text-on-surface">{student.name}</span>
                <span className="text-on-surface-variant ml-1.5 font-mono">
                  [{student.register_number}]
                </span>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                {student.department}
              </span>
            </div>

            {/* Current Registered Schedules Snapshot */}
            <div className="pt-2 border-t border-outline-variant/30 text-[11px]">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">
                Existing Registered Duties & Schedules:
              </div>
              <div className="space-y-1">
                {student.schedules && student.schedules.length > 0 ? (
                  student.schedules.map((sch) => (
                    <div
                      key={sch.id}
                      className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] ${
                        sch.is_active
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200'
                          : 'bg-surface-container border border-outline-variant/30 text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sch.is_active ? 'bg-amber-500 animate-pulse' : 'bg-outline'
                          }`}
                        />
                        <span className="font-medium truncate">{sch.title}</span>
                      </div>
                      <span className="font-mono text-[10px] font-semibold shrink-0 ml-2">
                        {sch.time_label}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-on-surface-variant font-medium">
                    Current Shift: {student.shift_time}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Select Shift Timing with Live Collision Pre-Check */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-label-caps text-on-surface-variant uppercase font-bold text-[10px]">
                Select New Shift Timing
              </label>
              <span className="text-[10px] text-on-surface-variant">
                Live overlap scanner active
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {shifts.map((sh) => {
                const status = shiftStatusMap[sh.id];
                const isSelected = selectedShiftId === sh.id;

                return (
                  <label
                    key={sh.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? status.hasConflict
                          ? 'bg-amber-500/10 border-amber-500 text-amber-950 dark:text-amber-100 ring-1 ring-amber-500/40'
                          : 'bg-primary/10 border-primary text-primary font-bold ring-1 ring-primary/40'
                        : status.hasConflict
                        ? 'bg-amber-500/5 border-amber-500/20 text-on-surface hover:bg-amber-500/10'
                        : 'bg-surface border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="radio"
                        name="shiftOption"
                        value={sh.id}
                        checked={isSelected}
                        onChange={() => {
                          setSelectedShiftId(sh.id);
                          setHasAcknowledgedOverlap(false);
                          setErrorMessage('');
                        }}
                        className="accent-primary shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-semibold text-xs truncate">{sh.name}</div>
                        <div className="text-[11px] text-on-surface-variant font-mono">
                          {sh.label}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <ShiftOverlapTooltip
                        overlapResult={detectShiftScheduleOverlap(student, sh, shifts)}
                        proposedShiftName={sh.name}
                        studentName={student.name}
                        size="sm"
                        showLabel={false}
                      />

                      {sh.is_continuous_night && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">
                          Night
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* OVERLAP WARNING MECHANISM CARD */}
          {overlapResult.hasConflict ? (
            <div
              id="schedule-overlap-warning-card"
              className="p-3.5 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl space-y-2.5 text-amber-950 dark:text-amber-100"
            >
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[22px] shrink-0 mt-0.5 animate-pulse">
                  warning
                </span>
                <div className="flex-1">
                  <div className="font-bold text-xs uppercase tracking-wide text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <span>Schedule Overlap Detected</span>
                    <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.2 rounded font-mono">
                      Data Inconsistency Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 mt-0.5 leading-snug">
                    The newly assigned shift timing directly collides with this intern's existing
                    registered duties. Unresolved overlaps corrupt attendance duration telemetry and
                    generate conflicting GPS verification prompts.
                  </p>
                </div>
              </div>

              {/* Conflict Breakdown List */}
              <div className="bg-surface-container-lowest/80 p-2.5 rounded-lg border border-amber-500/30 space-y-1.5 text-[11px]">
                <div className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase">
                  Identified Schedule Collisions:
                </div>
                {overlapResult.conflicts.map((conflict, idx) => (
                  <div
                    key={conflict.conflictingId || idx}
                    className="p-2 rounded bg-amber-500/5 border border-amber-500/20 space-y-1"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-on-surface truncate">{conflict.conflictingTitle}</span>
                      <span className="text-amber-700 dark:text-amber-300 font-mono text-[10px] shrink-0">
                        {conflict.overlapHoursFormatted} Overlap
                      </span>
                    </div>

                    <div className="text-[10px] text-on-surface-variant flex items-center justify-between">
                      <span>Existing: {conflict.conflictingTiming}</span>
                      <span className="font-mono text-amber-800 dark:text-amber-200">
                        Collision: {conflict.collisionWindowText}
                      </span>
                    </div>

                    {conflict.isCurrentlyActiveDuty && (
                      <div className="text-[10px] text-error font-bold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[13px]">emergency</span>
                        <span>Active Duty In Progress — Student is currently on shift!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Inconsistency Prevention Action & Resolution */}
              <div className="pt-1 space-y-2">
                <div className="text-[10px] font-bold uppercase text-amber-900 dark:text-amber-300">
                  Data Inconsistency Prevention Controls:
                </div>

                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <label
                    className={`p-2 rounded-lg border flex items-start gap-2 cursor-pointer transition-colors ${
                      reconcileMode === 'REPLACE'
                        ? 'bg-amber-500/15 border-amber-500/60 font-medium'
                        : 'bg-surface/50 border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reconcileOption"
                      checked={reconcileMode === 'REPLACE'}
                      onChange={() => setReconcileMode('REPLACE')}
                      className="accent-amber-600 shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-on-surface text-[11px]">
                        Reconcile & Replace Overlapping Schedule (Recommended)
                      </div>
                      <div className="text-[10px] text-on-surface-variant">
                        Automatically unassigns the colliding schedule slot so only one active
                        clinical window remains in the database.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-2 rounded-lg border flex items-start gap-2 cursor-pointer transition-colors ${
                      reconcileMode === 'BLOCK'
                        ? 'bg-amber-500/15 border-amber-500/60 font-medium'
                        : 'bg-surface/50 border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reconcileOption"
                      checked={reconcileMode === 'BLOCK'}
                      onChange={() => setReconcileMode('BLOCK')}
                      className="accent-amber-600 shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-on-surface text-[11px]">
                        Block Assignment (Enforce Strict Non-Overlap)
                      </div>
                      <div className="text-[10px] text-on-surface-variant">
                        Strictly prevents assigning any shift that collides with student schedules.
                      </div>
                    </div>
                  </label>
                </div>

                {reconcileMode === 'REPLACE' && (
                  <label className="flex items-center gap-2 p-2 bg-surface-container-lowest rounded-lg border border-amber-500/40 cursor-pointer">
                    <input
                      type="checkbox"
                      id="checkbox-acknowledge-overlap"
                      checked={hasAcknowledgedOverlap}
                      onChange={(e) => setHasAcknowledgedOverlap(e.target.checked)}
                      className="accent-amber-600 rounded"
                    />
                    <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                      I confirm and authorize reconciling this schedule collision to prevent data
                      inconsistency.
                    </span>
                  </label>
                )}
              </div>
            </div>
          ) : (
            <div
              id="schedule-no-overlap-badge"
              className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-200"
            >
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                check_circle
              </span>
              <div className="text-xs">
                <span className="font-bold">Schedule Validated:</span> No overlaps detected.
                Clinical duty timing is consistent with existing student rosters.
              </div>
            </div>
          )}

          {/* Reason for change */}
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-1 uppercase font-bold text-[10px]">
              Reason for Shift Change (Mandatory Audit Documentation)
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State rotational hospital requirement or departmental transfer reason..."
              className="w-full p-2.5 bg-surface border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              id="btn-confirm-shift-change"
              type="submit"
              disabled={overlapResult.hasConflict && reconcileMode === 'BLOCK'}
              className={`w-full rounded-xl py-3 font-headline-md text-sm transition-all flex items-center justify-center gap-2 min-h-[48px] shadow-xs cursor-pointer ${
                overlapResult.hasConflict && reconcileMode === 'BLOCK'
                  ? 'bg-surface-container text-on-surface-variant cursor-not-allowed opacity-60'
                  : overlapResult.hasConflict
                  ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {overlapResult.hasConflict ? 'published_with_changes' : 'check'}
              </span>
              {overlapResult.hasConflict
                ? 'Reconcile Overlap & Update Shift'
                : 'Update Shift & Log Audit Entry'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
