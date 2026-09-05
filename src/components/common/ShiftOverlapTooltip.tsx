import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ScheduleOverlapCheckResult } from '../../utils/scheduleUtils';

interface ShiftOverlapTooltipProps {
  overlapResult: ScheduleOverlapCheckResult;
  proposedShiftName?: string;
  studentName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ShiftOverlapTooltip: React.FC<ShiftOverlapTooltipProps> = ({
  overlapResult,
  proposedShiftName,
  studentName,
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const hasConflict = overlapResult.hasConflict;
  const primaryConflict = hasConflict ? overlapResult.conflicts[0] : null;

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Visual Interactive Icon Trigger */}
      <button
        type="button"
        id="shift-overlap-warning-icon-trigger"
        aria-label={
          hasConflict
            ? `Schedule overlap warning: ${overlapResult.totalConflictingSchedules} conflict detected`
            : 'Schedule is consistent with existing shifts'
        }
        aria-expanded={isOpen}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className={`group relative flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          hasConflict
            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 focus:ring-amber-500 animate-pulse'
            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 focus:ring-emerald-500'
        }`}
      >
        {hasConflict ? (
          <AlertTriangle
            size={iconSize}
            className="text-amber-600 dark:text-amber-400 shrink-0"
          />
        ) : (
          <CheckCircle2
            size={iconSize}
            className="text-emerald-600 dark:text-emerald-400 shrink-0"
          />
        )}

        {showLabel && (
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {hasConflict ? 'Overlap Warning' : 'Timing Clear'}
          </span>
        )}

        {hasConflict && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        )}
      </button>

      {/* Floating Tooltip Warning Card */}
      {isOpen && (
        <div
          ref={tooltipRef}
          role="tooltip"
          id="shift-overlap-tooltip-content"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-amber-500/50 text-xs backdrop-blur-md pointer-events-auto select-text animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Tooltip Header */}
          <div className="flex items-start gap-2 pb-2 border-b border-white/10">
            {hasConflict ? (
              <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={15} />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={15} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[10px] text-amber-300">
                  {hasConflict ? 'Data Consistency Warning' : 'Shift Timing Verified'}
                </span>
                {hasConflict && (
                  <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                    {primaryConflict?.overlapHoursFormatted} Overlap
                  </span>
                )}
              </div>
              <h4 className="font-bold text-xs text-white leading-tight mt-0.5">
                {hasConflict
                  ? `Shift Overlap Detected${studentName ? ` for ${studentName}` : ''}`
                  : `Schedule Consistent${studentName ? ` for ${studentName}` : ''}`}
              </h4>
            </div>
          </div>

          {/* Tooltip Body */}
          {hasConflict && primaryConflict ? (
            <div className="space-y-2 pt-2 text-[11px]">
              {proposedShiftName && (
                <div className="text-white/80">
                  Proposed Shift:{' '}
                  <span className="font-semibold text-amber-300">{proposedShiftName}</span>
                </div>
              )}

              {/* Conflict details breakdown */}
              <div className="bg-white/5 p-2 rounded-lg border border-amber-500/30 space-y-1">
                <div className="text-[10px] font-bold uppercase text-amber-400">
                  Colliding Existing Schedule:
                </div>
                <div className="font-semibold text-white truncate">
                  {primaryConflict.conflictingTitle}
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/70">
                  <span>Duty Time:</span>
                  <span className="font-mono text-white/90">
                    {primaryConflict.conflictingTiming}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-amber-300 font-semibold pt-0.5">
                  <span>Collision Window:</span>
                  <span className="font-mono">{primaryConflict.collisionWindowText}</span>
                </div>
              </div>

              {/* Consistency rationale */}
              <div className="flex items-start gap-1.5 text-[10px] text-amber-200/90 leading-relaxed bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                <ShieldAlert size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Aiding Data Consistency:</strong> Overlapping schedules trigger double
                  attendance prompts, distort rotation duration logs, and breach accreditation
                  records.
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-2 text-[11px] text-white/80 leading-relaxed">
              No overlapping clinical shifts or rotations found. Assigning this proposed shift time
              maintains clean schedule continuity and accurate attendance telemetry.
            </div>
          )}

          {/* Tooltip Arrow Pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

export { ShiftOverlapTooltip as ShiftOverlapWarningIndicator };
export default ShiftOverlapTooltip;
