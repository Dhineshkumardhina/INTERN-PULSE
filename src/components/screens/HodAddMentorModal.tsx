import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const HodAddMentorModal: React.FC = () => {
  const {
    currentUser,
    isHodAddMentorModalOpen,
    closeHodAddMentorModal,
    hodAddMentor,
  } = useApp();

  const hodDept = currentUser?.department || 'Physiotherapy';
  const hodName = currentUser?.name || 'Dr. Sarah Mitchell';

  const [mentorId, setMentorId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('Senior Clinical Supervisor');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isHodAddMentorModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!mentorId.trim() || !name.trim()) {
      setErrorMsg('Please enter both Mentor ID and Faculty Mentor Name.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = hodAddMentor({
        id: mentorId.trim().toLowerCase(),
        name: name.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@hospital.org`,
        phone: phone.trim() || '+91 98408 00000',
        title: title.trim() || 'Clinical Faculty Supervisor',
      });

      setIsSubmitting(false);

      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          setMentorId('');
          setName('');
          setEmail('');
          setPhone('');
          setSuccessMsg(null);
          closeHodAddMentorModal();
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
              <h2 className="font-bold text-sm text-on-surface">Create Faculty Mentor</h2>
              <p className="text-[11px] text-on-surface-variant">
                Auto-assigned to {hodDept} Department
              </p>
            </div>
          </div>
          <button
            onClick={closeHodAddMentorModal}
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
              <strong>Department Scope Protected:</strong> New mentors are automatically bound to your department (<strong>{hodDept}</strong>) under your supervision as Head of Department ({hodName}).
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">
                Mentor ID <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. mentor04"
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value.toLowerCase())}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl font-mono text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant mb-1">
                Faculty Mentor Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Varma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-on-surface-variant mb-1">Professional Title / Role</label>
            <input
              type="text"
              placeholder="e.g. Senior Clinical Specialist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Faculty Email</label>
              <input
                type="email"
                placeholder="e.g. dr.rajesh@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="e.g. +91 98408 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Department (Read-only / Locked to HOD's Department) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-on-surface-variant mb-1">
                Department <span className="text-[10px] text-outline font-normal">(Locked)</span>
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={hodDept}
                className="w-full p-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-on-surface-variant font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface-variant mb-1">
                Hospital Campus <span className="text-[10px] text-outline font-normal">(Locked)</span>
              </label>
              <input
                type="text"
                readOnly
                disabled
                value="InternPulse General Hospital"
                className="w-full p-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-on-surface-variant font-medium cursor-not-allowed"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={closeHodAddMentorModal}
              className="px-4 py-2.5 rounded-xl border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer shadow-xs min-h-[40px] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{isSubmitting ? 'Creating...' : 'Create Mentor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
