import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Shift } from '../../types';
import { detectShiftScheduleOverlap } from '../../utils/scheduleUtils';
import { ShiftOverlapTooltip } from '../common/ShiftOverlapWarningIndicator';
import { AdminChangeShiftModal } from './AdminChangeShiftModal';

export const AdminShiftManagementScreen: React.FC = () => {
  const { shifts, students, departments, createShift, bulkAssignShift, setCurrentScreen } = useApp();

  const [activeModal, setActiveModal] = useState<'CREATE' | 'BULK' | 'INDIVIDUAL' | null>(null);
  const [selectedStudentReg, setSelectedStudentReg] = useState<string>('23UCCT001');

  // Create Shift Form State
  const [formName, setFormName] = useState('');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('16:00');
  const [formIsNight, setFormIsNight] = useState(false);
  const [formReason, setFormReason] = useState('Clinical ward operational scheduling');
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Bulk Shift Form State
  const [bulkShiftId, setBulkShiftId] = useState<string>(shifts[0]?.id || 'shift_gen_ahs');
  const [bulkDeptFilter, setBulkDeptFilter] = useState('ALL');
  const [selectedStudentsForBulk, setSelectedStudentsForBulk] = useState<string[]>([]);
  const [bulkReason, setBulkReason] = useState('Cohort rotational schedule transition');

  // Quick Conflict Tester State
  const [testStudentReg, setTestStudentReg] = useState<string>('23UCCT001');
  const [testShiftId, setTestShiftId] = useState<string>(shifts[0]?.id || 'shift_morning');

  const testStudent = students.find((s) => s.register_number === testStudentReg) || students[0];
  const testShift = shifts.find((sh) => sh.id === testShiftId) || shifts[0];

  const quickOverlapTest = useMemo(() => {
    if (!testStudent || !testShift) return null;
    return detectShiftScheduleOverlap(testStudent, testShift, shifts);
  }, [testStudent, testShift, shifts]);

  const bulkFilteredStudents = useMemo(() => {
    if (bulkDeptFilter === 'ALL') return students;
    return students.filter((s) => s.department === bulkDeptFilter);
  }, [students, bulkDeptFilter]);

  const handleOpenCreateShift = () => {
    setFormName('');
    setFormStartTime('08:00');
    setFormEndTime('16:00');
    setFormIsNight(false);
    setFormReason('Clinical ward schedule expansion');
    setErrorMessage('');
    setActiveModal('CREATE');
  };

  const handleCreateShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formStartTime || !formEndTime) {
      setErrorMessage('Please provide valid shift name and timings.');
      return;
    }

    const startFormatted = formStartTime;
    const endFormatted = formEndTime;
    const label = `${formName} (${startFormatted} - ${endFormatted})`;

    const result = createShift(
      {
        name: formName,
        start_time: formStartTime,
        end_time: formEndTime,
        label,
        is_continuous_night: formIsNight,
      },
      formReason
    );

    if (result.success) {
      setActiveModal(null);
      setSuccessToast(result.message);
      setTimeout(() => setSuccessToast(''), 4000);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleToggleSelectStudent = (regNumber: string) => {
    setSelectedStudentsForBulk((prev) =>
      prev.includes(regNumber) ? prev.filter((r) => r !== regNumber) : [...prev, regNumber]
    );
  };

  const handleSelectAllInBulk = () => {
    if (selectedStudentsForBulk.length === bulkFilteredStudents.length) {
      setSelectedStudentsForBulk([]);
    } else {
      setSelectedStudentsForBulk(bulkFilteredStudents.map((s) => s.register_number));
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentsForBulk.length === 0) {
      alert('Please select at least one student for bulk shift assignment.');
      return;
    }

    const result = bulkAssignShift(
      selectedStudentsForBulk,
      bulkShiftId,
      bulkReason || 'Bulk cohort schedule update'
    );

    if (result.success) {
      setActiveModal(null);
      setSelectedStudentsForBulk([]);
      setSuccessToast(`Bulk assigned shift to ${result.count} interns.`);
      setTimeout(() => setSuccessToast(''), 4000);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Shift Management"
        showBack={true}
        onBack={() => setCurrentScreen('admin_dashboard')}
      />

      {successToast && (
        <div className="mx-3.5 mt-2 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
          <span>{successToast}</span>
        </div>
      )}

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="font-headline-md text-sm font-bold text-on-surface">
              Hospital Clinical Shift Catalog
            </h2>
            <p className="text-[11px] text-on-surface-variant">
              Includes continuous 10:00 PM – 06:00 AM Night shifts and automated schedule collision detection
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveModal('BULK')}
              className="px-3 py-2 bg-secondary text-on-secondary rounded-xl text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              <span>Bulk Assign</span>
            </button>

            <button
              id="btn-admin-create-shift"
              onClick={handleOpenCreateShift}
              className="px-3.5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add_alarm</span>
              <span>Create Shift</span>
            </button>
          </div>
        </div>

        {/* Shift Timings Catalog Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {shifts.map((sh) => {
            const studentCount = students.filter((s) => s.shift_id === sh.id).length;
            const activeOnDuty = students.filter((s) => s.shift_id === sh.id && s.is_active_shift).length;

            return (
              <div
                key={sh.id}
                className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {sh.is_continuous_night ? 'bedtime' : 'wb_sunny'}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-on-surface">{sh.name}</div>
                      <div className="text-xs font-mono font-bold text-primary">{sh.label}</div>
                    </div>
                  </div>

                  {sh.is_continuous_night ? (
                    <span className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                      CONTINUOUS NIGHT
                    </span>
                  ) : (
                    <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                      STANDARD DAY
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1 text-[11px] bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 text-on-surface-variant">
                  <div>Assigned Interns: <span className="font-bold text-on-surface">{studentCount}</span></div>
                  <div>Active On Duty: <span className="font-bold text-tertiary-container">{activeOnDuty}</span></div>
                  <div>Start Timing: <span className="font-mono font-medium">{sh.start_time}</span></div>
                  <div>End Timing: <span className="font-mono font-medium">{sh.end_time}</span></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Schedule Collision Detection Tester Section */}
        <section className="bg-surface-container-lowest rounded-xl p-card-padding border-2 border-primary/40 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
            <div>
              <h3 className="font-headline-md text-sm font-bold text-on-surface">
                Schedule Overlap Consistency Guardian
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Pre-assignment schedule collision evaluator to prevent double-counted duty hours
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                Select Intern
              </label>
              <select
                value={testStudentReg}
                onChange={(e) => setTestStudentReg(e.target.value)}
                className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
              >
                {students.map((s) => (
                  <option key={s.register_number} value={s.register_number}>
                    {s.name} ({s.register_number}) • {s.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                Select Proposed Shift
              </label>
              <select
                value={testShiftId}
                onChange={(e) => setTestShiftId(e.target.value)}
                className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
              >
                {shifts.map((sh) => (
                  <option key={sh.id} value={sh.id}>
                    {sh.name} ({sh.label})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {quickOverlapTest && (
            <div>
              {quickOverlapTest.hasConflict ? (
                <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl space-y-1 text-xs text-amber-950 dark:text-amber-100">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>Timing Collision Detected ({quickOverlapTest.conflicts[0]?.overlapHoursFormatted})</span>
                  </div>
                  <p className="text-[11px] leading-snug">
                    Proposed shift "{testShift.name}" conflicts with existing schedule "
                    {quickOverlapTest.conflicts[0]?.conflictingTitle}" (
                    {quickOverlapTest.conflicts[0]?.conflictingTiming}).
                  </p>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                  <span>Zero collision detected. Clear for duty assignment.</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Assigned Intern Roster Table */}
        <section className="bg-surface-container-lowest rounded-xl p-card-padding border border-outline-variant/50 shadow-xs space-y-2.5">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-md text-sm font-bold text-on-surface">
              Active Shift Duty Assignments ({students.length})
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {students.map((stud) => {
              const currentShift = shifts.find((sh) => sh.id === stud.shift_id);
              return (
                <div
                  key={stud.register_number}
                  className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        stud.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={stud.name}
                      className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-on-surface truncate">{stud.name}</span>
                        <span className="font-mono text-[10px] text-primary font-bold">
                          {stud.register_number}
                        </span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant truncate">
                        {stud.department} • <span className="font-medium text-primary">{stud.shift_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShiftOverlapTooltip
                      overlapResult={detectShiftScheduleOverlap(stud, currentShift || shifts[0], shifts)}
                      proposedShiftName={stud.shift_name}
                      studentName={stud.name}
                      size="sm"
                    />
                    <button
                      onClick={() => {
                        setSelectedStudentReg(stud.register_number);
                        setActiveModal('INDIVIDUAL');
                      }}
                      className="px-2.5 py-1 bg-surface-container hover:bg-surface-variant text-primary font-bold rounded-lg text-[11px] cursor-pointer"
                    >
                      Change Shift
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Create Shift Modal */}
      {activeModal === 'CREATE' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-4 space-y-3.5">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">add_alarm</span>
                </div>
                <h3 className="font-headline-md text-sm font-bold text-on-surface">
                  Create Shift Timing
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-error-container/30 border border-error/40 rounded-xl text-xs text-error font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateShiftSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Shift Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Twilight Trauma Shift"
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-on-surface">Continuous Night Shift</div>
                  <div className="text-[10px] text-on-surface-variant">Crosses midnight (e.g. 10:00 PM – 06:00 AM)</div>
                </div>
                <input
                  type="checkbox"
                  checked={formIsNight}
                  onChange={(e) => setFormIsNight(e.target.checked)}
                  className="w-4 h-4 text-primary rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Reason for Creation
                </label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2 bg-surface-container hover:bg-surface-variant text-on-surface font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
                >
                  Create Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Shift Assignment Modal */}
      {activeModal === 'BULK' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-4 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">group_add</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-sm font-bold text-on-surface">
                    Bulk Shift Assignment
                  </h3>
                  <p className="text-[10px] text-on-surface-variant">
                    Assign shift timings to multiple interns simultaneously
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-2.5 text-xs flex-1 flex flex-col min-h-0">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Target Shift *
                  </label>
                  <select
                    value={bulkShiftId}
                    onChange={(e) => setBulkShiftId(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs font-semibold text-primary"
                  >
                    {shifts.map((sh) => (
                      <option key={sh.id} value={sh.id}>
                        {sh.name} ({sh.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Department Filter
                  </label>
                  <select
                    value={bulkDeptFilter}
                    onChange={(e) => setBulkDeptFilter(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  >
                    <option value="ALL">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant">
                    Select Interns ({selectedStudentsForBulk.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllInBulk}
                    className="text-[10px] text-primary font-bold hover:underline cursor-pointer"
                  >
                    {selectedStudentsForBulk.length === bulkFilteredStudents.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-surface border border-outline-variant rounded-xl">
                  {bulkFilteredStudents.map((stud) => {
                    const isSelected = selectedStudentsForBulk.includes(stud.register_number);
                    return (
                      <label
                        key={stud.register_number}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectStudent(stud.register_number)}
                            className="w-4 h-4 text-primary rounded"
                          />
                          <span className="font-bold text-on-surface">{stud.name}</span>
                          <span className="font-mono text-[10px] text-primary font-bold">
                            {stud.register_number}
                          </span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant">{stud.shift_name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Reason for Bulk Assignment (Audit Log) *
                </label>
                <input
                  type="text"
                  required
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="e.g. Rotational clinical posting transition"
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2 mt-auto">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2 bg-surface-container hover:bg-surface-variant text-on-surface font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedStudentsForBulk.length === 0}
                  className="flex-1 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Assign to {selectedStudentsForBulk.length} Interns
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Change Shift Modal */}
      {activeModal === 'INDIVIDUAL' && (
        <AdminChangeShiftModal
          studentReg={selectedStudentReg}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};
