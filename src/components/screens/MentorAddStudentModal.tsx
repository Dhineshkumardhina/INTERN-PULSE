import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const MentorAddStudentModal: React.FC = () => {
  const {
    currentUser,
    shifts,
    isMentorAddStudentModalOpen,
    closeMentorAddStudentModal,
    mentorAddStudent,
  } = useApp();

  const mentorDept = currentUser?.department || 'Physiotherapy';
  const mentorName = currentUser?.name || 'Dr. Anitha';
  const mentorId = currentUser?.id || 'mentor01';

  const [registerNumber, setRegisterNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [academicYear, setAcademicYear] = useState('Final Year (2025–2026)');
  const [internshipDepartment, setInternshipDepartment] = useState(`${mentorDept} & Rehabilitation`);
  const [startDate, setStartDate] = useState('01 Sep 2026');
  const [endDate, setEndDate] = useState('28 Feb 2027');
  const [selectedShiftId, setSelectedShiftId] = useState(shifts[0]?.id || 'shift_night');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isMentorAddStudentModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!registerNumber.trim() || !name.trim()) {
      setErrorMsg('Please enter both Register Number and Student Name.');
      return;
    }

    const shiftObj = shifts.find((s) => s.id === selectedShiftId) || shifts[0];

    setIsSubmitting(true);

    setTimeout(() => {
      const result = mentorAddStudent({
        register_number: registerNumber.trim().toUpperCase(),
        name: name.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@student.ahs.edu`,
        phone: phone.trim() || '+91 98400 12345',
        academic_year: academicYear,
        internship_department: internshipDepartment,
        internship_start_date: startDate,
        internship_end_date: endDate,
        shift_id: shiftObj.id,
        shift_name: shiftObj.name,
        shift_time: shiftObj.label,
        is_night_shift: shiftObj.is_continuous_night,
      });

      setIsSubmitting(false);

      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          setRegisterNumber('');
          setName('');
          setEmail('');
          setPhone('');
          setSuccessMsg(null);
          closeMentorAddStudentModal();
        }, 1200);
      } else {
        setErrorMsg(result.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-outline-variant/60 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-outline-variant/40 flex items-center justify-between bg-surface-container-lowest">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <div>
              <h2 className="font-bold text-sm text-on-surface">Enroll New Student</h2>
              <p className="text-[11px] text-on-surface-variant">
                Auto-assigned to {mentorName} ({mentorDept})
              </p>
            </div>
          </div>
          <button
            onClick={closeMentorAddStudentModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs flex-1">
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 fill">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-error-container/20 border border-error/40 text-error rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] text-error">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* RBAC Notice Banner */}
          <div className="p-2.5 rounded-xl bg-secondary/5 border border-secondary/20 flex items-start gap-2 text-[11px] text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">verified_user</span>
            <span>
              <strong>RBAC Policy Enforced:</strong> Department is locked to your permitted faculty scope (<strong>{mentorDept}</strong>). Student is automatically bound to your supervision.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">
                Register Number <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 23BHS006"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl font-mono text-on-surface focus:border-primary focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant mb-1">
                Student Full Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Varma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. student@ahs.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +91 98401 23456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Department (Read-only / Locked) & Mentor (Read-only) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">
                Department <span className="text-[10px] text-outline font-normal">(Locked)</span>
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={mentorDept}
                className="w-full p-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-on-surface-variant font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant mb-1">
                Assigned Mentor <span className="text-[10px] text-outline font-normal">(Auto)</span>
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={`${mentorName} (${mentorId})`}
                className="w-full p-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-on-surface-variant font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Academic Year</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Hospital</label>
              <input
                type="text"
                readOnly
                disabled
                value="InternPulse General Hospital"
                className="w-full p-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-on-surface-variant font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-on-surface-variant mb-1">Internship Department / Unit</label>
            <input
              type="text"
              value={internshipDepartment}
              onChange={(e) => setInternshipDepartment(e.target.value)}
              className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Internship Start Date</label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Internship End Date</label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-on-surface-variant mb-1">
              Duty Shift Allocation <span className="text-error">*</span>
            </label>
            <select
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none min-h-[44px]"
            >
              {shifts.map((sh) => (
                <option key={sh.id} value={sh.id}>
                  {sh.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={closeMentorAddStudentModal}
              className="px-4 py-2.5 rounded-xl border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer shadow-xs min-h-[40px] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>{isSubmitting ? 'Registering...' : 'Enroll & Assign Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
