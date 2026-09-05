import React from 'react';
import { ShiftOverlapTooltip } from './ShiftOverlapTooltip';
import { ScheduleOverlapCheckResult } from '../../utils/scheduleUtils';

interface ShiftOverlapWarningIndicatorProps {
  overlapResult: ScheduleOverlapCheckResult;
  proposedShiftName?: string;
  studentName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ShiftOverlapWarningIndicator: React.FC<ShiftOverlapWarningIndicatorProps> = (props) => {
  return <ShiftOverlapTooltip {...props} />;
};

export { ShiftOverlapTooltip };
export default ShiftOverlapWarningIndicator;
