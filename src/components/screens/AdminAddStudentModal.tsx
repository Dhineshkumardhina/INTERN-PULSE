import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface Props {
  onClose: () => void;
}

export const AdminAddStudentModal: React.FC<Props> = ({ onClose }) => {
  const { shifts, mentors, addStudent } = useApp();

  const [registerNumber, setRegisterNumber] = useState<string>('23BHS009');
  const [name, setName] = useState<string>('');
  const [department, setDepartment] = useState<string>('Radiology');
  const [mentorId, setMentorId] = useState<string>('mentor01');
  const [shiftId, setShiftId] = useState<string>('shift_night');
  const [reason, setReason] = useState<string>('New clinical cohort onboarding');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !registerNumber.trim()) return;

    const chosenMentor = mentors.find((m) => m.id === mentorId) || mentors[0];
    const chosenShift = shifts.find((s) => s.id === shiftId) || shifts[0];
    const upperReg = registerNumber.trim().toUpperCase();

    addStudent(
      {
        register_number: upperReg,
        name: name.trim(),
        department,
        mentor_id: chosenMentor.id,
        mentor_name: chosenMentor.name,
        hospital: 'InternPulse General Hospital',
        shift_id: chosenShift.id,
        shift_name: chosenShift.name,
        shift_time: chosenShift.label,
        is_night_shift: chosenShift.is_continuous_night,
        schedules: [
          {
            id: `sch_${upperReg}_primary`,
            title: `${chosenShift.name} (Primary Duty)`,
            shift_id: chosenShift.id,
            start_time: chosenShift.start_time,
            end_time: chosenShift.end_time,
            time_label: chosenShift.label,
            category: 'PRIMARY_SHIFT',
            is_active: false,
          },
        ],
      },
      reason
    );

    onClose();
  };

  return (
    <div
      id="add-student-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-outline-variant/60 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
            </div>
            <h3 className="font-headline-md text-base font-bold text-on-surface">
              Enroll Allied Health Intern
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-on-surface-variant hover:text-on-surface p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-1 uppercase font-bold text-[10px]">
              Student Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohith Venkat"
              className="w-full p-2.5 bg-surface border border-outline-variant rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-1 uppercase font-bold text-[10px]">
                Register Number (Unique ID)
              </label>
              <input
                type="text"
                required
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder="e.g. 23BHS009"
                className="w-full p-2.5 bg-surface border border-outline-variant rounded-lg text-xs font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-label-caps text-on-surface-variant mb-1 uppercase font-bold text-[10px]">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-surface border border-outline-variant rounded-lg text-xs"
              >
                <option value="Radiology">Radiology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-on-surface-variant mb-1 uppercase font-bold text-[10px]">
              Assigned Clinical Supervisor
            </label>
            <select
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              className="w-full p-2.5 bg-surface border border-outline-variant rounded-lg text-xs"
            >
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-label-caps text-on-surface-variant mb-1 uppercase font-bold text-[10px]">
              Assigned Shift
            </label>
            <select
              value={shiftId}
              onChange={(e) => setShiftId(e.target.value)}
              className="w-full p-2.5 bg-surface border border-outline-variant rounded-lg text-xs"
            >
              {shifts.map((sh) => (
                <option key={sh.id} value={sh.id}>
                  {sh.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-3">
            <button
              type="submit"
              className="w-full bg-primary text-on-primary rounded-xl py-3 font-headline-md text-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[48px]"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              Enroll Student to Geofence Monitor
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
