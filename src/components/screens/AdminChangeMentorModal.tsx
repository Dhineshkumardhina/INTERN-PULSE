import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface Props {
  studentReg: string;
  onClose: () => void;
}

export const AdminChangeMentorModal: React.FC<Props> = ({ studentReg, onClose }) => {
  const { students, mentors, changeStudentMentor } = useApp();

  const student = students.find((s) => s.register_number === studentReg) || students[0];
  const [selectedMentorId, setSelectedMentorId] = useState<string>(student.mentor_id || 'mentor01');
  const [reason, setReason] = useState<string>(
    'Clinical supervisor load balancing across night shift rotations.'
  );
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Reason for mentor change is required for administrative audit logs.');
      return;
    }

    changeStudentMentor(student.register_number, selectedMentorId, reason);
    onClose();
  };

  return (
    <div
      id="change-mentor-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-outline-variant/60 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
            </div>
            <h3 className="font-headline-md text-base font-bold text-on-surface">
              Reassign Clinical Mentor
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

        {error && (
          <div className="mb-3 p-2 bg-error-container text-error text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-label-caps text-on-surface-variant mb-1 uppercase font-bold text-[10px]">
              Student
            </label>
            <div className="p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/40 font-bold text-on-surface">
              {student.name} ({student.register_number}) • {student.department}
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-on-surface-variant mb-1 uppercase font-bold text-[10px]">
              Select Clinical Supervisor / Mentor
            </label>
            <div className="space-y-1.5">
              {mentors.map((m) => (
                <label
                  key={m.id}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                    selectedMentorId === m.id
                      ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                      : 'bg-surface border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mentorOption"
                      value={m.id}
                      checked={selectedMentorId === m.id}
                      onChange={() => setSelectedMentorId(m.id)}
                      className="accent-secondary"
                    />
                    <div>
                      <div className="font-bold">{m.name}</div>
                      <div className="text-[10px] text-on-surface-variant">{m.title} • {m.department}</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded font-mono">
                    {m.assigned_students_count} Students
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-on-surface-variant mb-1 uppercase font-bold text-[10px]">
              Reason for Reassignment (Mandatory for Audit)
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State supervisory allocation rationale..."
              className="w-full p-2.5 bg-surface border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-secondary focus:outline-none"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              id="btn-confirm-mentor-reassign"
              type="submit"
              className="w-full bg-secondary text-on-secondary rounded-xl py-3 font-headline-md text-sm hover:bg-secondary-container hover:text-on-secondary-container transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[48px]"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Confirm Supervisor Reassignment
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
