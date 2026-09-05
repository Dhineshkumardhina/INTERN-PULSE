import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Student } from '../../types';
import { AdminChangeShiftModal } from './AdminChangeShiftModal';
import { AdminChangeMentorModal } from './AdminChangeMentorModal';
import { AdminAddStudentModal } from './AdminAddStudentModal';

export const AdminStudentManagementScreen: React.FC = () => {
  const {
    students,
    departments,
    mentors,
    shifts,
    adminEditStudent,
    adminToggleStudentStatus,
    setCurrentScreen,
    setSelectedStudent,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [mentorFilter, setMentorFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [activeModal, setActiveModal] = useState<'SHIFT' | 'MENTOR' | 'ADD' | 'EDIT' | null>(null);
  const [targetStudentReg, setTargetStudentReg] = useState<string>('23UCCT001');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editAcademicYear, setEditAcademicYear] = useState('');
  const [editReason, setEditReason] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.register_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || s.department === deptFilter;
    const matchesMentor =
      mentorFilter === 'ALL' || s.mentor_id === mentorFilter || s.mentor_name === mentorFilter;
    const matchesShift = shiftFilter === 'ALL' || s.shift_id === shiftFilter || s.shift_name === shiftFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && s.is_active_shift) ||
      (statusFilter === 'NEEDS_ATTENTION' && s.current_status === 'NEEDS ATTENTION') ||
      (statusFilter === 'VERIFIED' && s.current_status === 'VERIFIED') ||
      (statusFilter === 'OFF_SHIFT' && !s.is_active_shift);

    return matchesSearch && matchesDept && matchesMentor && matchesShift && matchesStatus;
  });

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditEmail(student.email || '');
    setEditPhone(student.phone || '');
    setEditDept(student.department);
    setEditAcademicYear(student.academic_year || 'Final Year (2025–2026)');
    setEditReason('Administrative student data update');
    setActiveModal('EDIT');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const result = adminEditStudent(
      editingStudent.register_number,
      {
        name: editName,
        email: editEmail,
        phone: editPhone,
        department: editDept,
        academic_year: editAcademicYear,
      },
      editReason || 'Student record update by Admin'
    );

    if (result.success) {
      setActiveModal(null);
      setEditingStudent(null);
      setSuccessToast('Student details updated successfully.');
      setTimeout(() => setSuccessToast(''), 4000);
    }
  };

  const handleToggleStatus = (student: Student) => {
    const action = student.shift_status === 'MISSED' ? 'reactivate' : 'deactivate';
    if (confirm(`Are you sure you want to ${action} student ${student.name} (${student.register_number})? (Historical logs remain preserved)`)) {
      adminToggleStudentStatus(student.register_number, `Admin requested ${action}`);
      setSuccessToast(`Student ${student.name} ${action}d successfully.`);
      setTimeout(() => setSuccessToast(''), 4000);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Student Management"
        showBack={true}
        onBack={() => setCurrentScreen('admin_dashboard')}
      />

      {successToast && (
        <div className="mx-3.5 mt-2 p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
          <span>{successToast}</span>
        </div>
      )}

      <main className="p-3.5 space-y-3 flex-1 min-w-0">
        {/* Search & Enroll Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search student name or register number (e.g. 23BHS001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <button
            id="btn-admin-enroll-student"
            onClick={() => setActiveModal('ADD')}
            className="px-3.5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Enroll Intern</span>
          </button>
        </div>

        {/* Multi-Dimensional Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="p-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs font-medium text-on-surface"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={mentorFilter}
            onChange={(e) => setMentorFilter(e.target.value)}
            className="p-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs font-medium text-on-surface"
          >
            <option value="ALL">All Mentors</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="p-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs font-medium text-on-surface"
          >
            <option value="ALL">All Shifts</option>
            {shifts.map((sh) => (
              <option key={sh.id} value={sh.id}>
                {sh.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs font-medium text-on-surface"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">On Duty (Active)</option>
            <option value="VERIFIED">Verified</option>
            <option value="NEEDS_ATTENTION">Needs Attention</option>
            <option value="OFF_SHIFT">Off Shift</option>
          </select>
        </div>

        {/* Active Results Counter */}
        <div className="text-[11px] text-on-surface-variant font-medium flex justify-between items-center px-1">
          <span>Showing {filteredStudents.length} of {students.length} Registered Interns</span>
          {(deptFilter !== 'ALL' || mentorFilter !== 'ALL' || shiftFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setDeptFilter('ALL');
                setMentorFilter('ALL');
                setShiftFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Student Cards Roster */}
        <div className="space-y-2.5">
          {filteredStudents.map((stud) => {
            const isAlert = stud.current_status === 'NEEDS ATTENTION';
            const isVerified = stud.current_status === 'VERIFIED';
            const isReviewed = stud.current_status === 'REVIEWED';

            return (
              <div
                key={stud.register_number}
                className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 hover:border-primary/40 transition-colors shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        stud.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={stud.name}
                      className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-on-surface truncate">{stud.name}</span>
                        <span className="font-mono text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded">
                          {stud.register_number}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant truncate">
                        {stud.department} • <span className="text-primary font-medium">{stud.academic_year || 'Final Year'}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      isAlert
                        ? 'bg-error-container text-error'
                        : isReviewed
                        ? 'bg-secondary-container text-on-secondary-container'
                        : isVerified
                        ? 'bg-tertiary-container/15 text-tertiary-container'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {stud.current_status}
                  </span>
                </div>

                {/* Duty & Supervisory Grid */}
                <div className="bg-surface-container-low p-2 rounded-lg text-xs space-y-1 mb-2.5 border border-outline-variant/30">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Shift:</span>
                    <span className="font-semibold text-primary">{stud.shift_name} ({stud.shift_time})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Supervisor:</span>
                    <span className="font-semibold text-secondary">{stud.mentor_name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-on-surface-variant">
                    <span>Internship:</span>
                    <span>{stud.internship_status || 'Active Clinical Block'}</span>
                  </div>
                </div>

                {/* Operations Toolbar */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    onClick={() => {
                      setTargetStudentReg(stud.register_number);
                      setActiveModal('SHIFT');
                    }}
                    className="flex-1 py-1.5 px-2 bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded-lg transition-colors cursor-pointer text-center min-w-[70px]"
                  >
                    Change Shift
                  </button>

                  <button
                    onClick={() => {
                      setTargetStudentReg(stud.register_number);
                      setActiveModal('MENTOR');
                    }}
                    className="flex-1 py-1.5 px-2 bg-surface-container hover:bg-surface-container-high text-secondary font-bold rounded-lg transition-colors cursor-pointer text-center min-w-[75px]"
                  >
                    Change Mentor
                  </button>

                  <button
                    onClick={() => handleOpenEdit(stud)}
                    className="py-1.5 px-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      setSelectedStudent(stud.register_number);
                      setCurrentScreen('gps_history');
                    }}
                    className="py-1.5 px-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors font-bold cursor-pointer text-center"
                  >
                    GPS Log
                  </button>

                  <button
                    onClick={() => handleToggleStatus(stud)}
                    className="py-1.5 px-2 text-error hover:bg-error-container/30 rounded-lg transition-colors font-medium cursor-pointer"
                    title="Deactivate Student (Preserves historical records)"
                  >
                    <span className="material-symbols-outlined text-[16px]">block</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant text-xs">
              No student intern records match your search criteria.
            </div>
          )}
        </div>
      </main>

      {/* Edit Student Modal */}
      {activeModal === 'EDIT' && editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-4 space-y-3.5">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-sm font-bold text-on-surface">
                    Edit Student Profile
                  </h3>
                  <p className="text-[10px] font-mono text-primary font-bold">
                    Reg: {editingStudent.register_number}
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

            <form onSubmit={handleEditSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Department *
                  </label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={editAcademicYear}
                    onChange={(e) => setEditAcademicYear(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Reason for Modification (Audit Trail)
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Corrected spelling or contact phone"
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Sub-Modals */}
      {activeModal === 'SHIFT' && (
        <AdminChangeShiftModal
          studentReg={targetStudentReg}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'MENTOR' && (
        <AdminChangeMentorModal
          studentReg={targetStudentReg}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'ADD' && (
        <AdminAddStudentModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};
