import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Mentor } from '../../types';

export const AdminMentorManagementScreen: React.FC = () => {
  const {
    mentors,
    students,
    departments,
    adminCreateMentor,
    adminEditMentor,
    adminToggleMentorStatus,
    adminReassignMentorDepartment,
    setCurrentScreen,
    setSelectedStudent,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [reassigningMentor, setReassigningMentor] = useState<Mentor | null>(null);
  const [selectedMentorDetail, setSelectedMentorDetail] = useState<Mentor | null>(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTitle, setFormTitle] = useState('Clinical Faculty Supervisor');
  const [formDept, setFormDept] = useState('Physiotherapy');
  const [formReason, setFormReason] = useState('');
  const [reassignDept, setReassignDept] = useState('Physiotherapy');
  const [reassignReason, setReassignReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || m.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenCreate = () => {
    setFormId(`mentor_${Date.now().toString().slice(-4)}`);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormTitle('Senior Clinical Faculty Supervisor');
    setFormDept(departments[0]?.name || 'Physiotherapy');
    setFormReason('Clinical faculty intake expansion');
    setErrorMessage('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim() || !formDept) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    const result = adminCreateMentor({
      id: formId,
      name: formName,
      email: formEmail,
      phone: formPhone,
      title: formTitle,
      department: formDept,
      reason: formReason,
    });

    if (result.success) {
      setIsCreateModalOpen(false);
      setSuccessToast(result.message);
      setTimeout(() => setSuccessToast(''), 4000);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleOpenEdit = (mentor: Mentor) => {
    setEditingMentor(mentor);
    setFormName(mentor.name);
    setFormEmail(mentor.email || '');
    setFormPhone(mentor.phone || '');
    setFormTitle(mentor.title);
    setFormDept(mentor.department);
    setFormReason('Administrative contact update');
    setErrorMessage('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMentor) return;

    const result = adminEditMentor(
      editingMentor.id,
      {
        name: formName,
        email: formEmail,
        phone: formPhone,
        title: formTitle,
        department: formDept,
      },
      formReason || 'Faculty details updated by Admin'
    );

    if (result.success) {
      setEditingMentor(null);
      setSuccessToast('Mentor updated successfully.');
      setTimeout(() => setSuccessToast(''), 4000);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleOpenReassign = (mentor: Mentor) => {
    setReassigningMentor(mentor);
    setReassignDept(mentor.department);
    setReassignReason('Departmental faculty reallocation');
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningMentor) return;

    adminReassignMentorDepartment(
      reassigningMentor.id,
      reassignDept,
      reassignReason || 'Admin departmental override'
    );

    setReassigningMentor(null);
    setSuccessToast(`Department reassigned to ${reassignDept}.`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleToggleStatus = (mentor: Mentor) => {
    const actionName = mentor.is_active !== false ? 'deactivate' : 'reactivate';
    if (confirm(`Are you sure you want to ${actionName} mentor ${mentor.name} (${mentor.id})?`)) {
      adminToggleMentorStatus(mentor.id, `Admin ${actionName} requested`);
      setSuccessToast(`Mentor ${mentor.name} ${actionName}d successfully.`);
      setTimeout(() => setSuccessToast(''), 4000);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Mentor Management"
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
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search Mentor name, ID, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <button
            id="btn-admin-create-mentor"
            onClick={handleOpenCreate}
            className="px-3.5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Create Mentor</span>
          </button>
        </div>

        {/* Department Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedDeptFilter('ALL')}
            className={`px-3 py-1.5 rounded-full font-bold transition-colors shrink-0 cursor-pointer ${
              selectedDeptFilter === 'ALL'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
            }`}
          >
            All Mentors ({mentors.length})
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeptFilter(d.name)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedDeptFilter === d.name
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
              }`}
            >
              {d.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Mentors Roster Cards */}
        <div className="space-y-2.5">
          {filteredMentors.map((mentor) => {
            const assignedStudents = students.filter(
              (s) => s.mentor_id === mentor.id || s.mentor_name === mentor.name
            );
            const activeStudentsCount = assignedStudents.filter((s) => s.is_active_shift).length;
            const needsAttentionCount = assignedStudents.filter(
              (s) => s.current_status === 'NEEDS ATTENTION'
            ).length;

            return (
              <div
                key={mentor.id}
                className={`bg-surface-container-lowest rounded-xl p-3.5 border transition-colors shadow-xs ${
                  mentor.is_active !== false
                    ? 'border-outline-variant/50 hover:border-primary/40'
                    : 'border-outline-variant/30 opacity-70 bg-surface-container-low'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm border border-secondary/20 shrink-0">
                      <span className="material-symbols-outlined text-[22px]">badge</span>
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-on-surface truncate">{mentor.name}</span>
                        <span className="font-mono text-[10px] bg-secondary/10 text-secondary font-bold px-1.5 py-0.2 rounded">
                          {mentor.id}
                        </span>
                      </div>
                      <div className="text-xs text-secondary font-semibold truncate">
                        {mentor.department}
                      </div>
                      <div className="text-[11px] text-on-surface-variant truncate">{mentor.title}</div>
                    </div>
                  </div>

                  <span
                    className={`font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      mentor.is_active !== false
                        ? 'bg-tertiary-container/15 text-tertiary-container'
                        : 'bg-error-container text-error'
                    }`}
                  >
                    {mentor.is_active !== false ? 'ACTIVE' : 'DEACTIVATED'}
                  </span>
                </div>

                {/* Workload Stats Strip */}
                <div className="grid grid-cols-3 gap-1.5 bg-surface-container-low p-2 rounded-lg text-center text-xs mb-2.5 border border-outline-variant/30">
                  <div>
                    <div className="text-[10px] uppercase text-on-surface-variant font-bold">Assigned</div>
                    <div className="font-bold text-primary">{assignedStudents.length} Interns</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-on-surface-variant font-bold">Active Duty</div>
                    <div className="font-bold text-tertiary-container">{activeStudentsCount} Active</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-on-surface-variant font-bold">Alerts</div>
                    <div
                      className={`font-bold ${
                        needsAttentionCount > 0 ? 'text-error' : 'text-on-surface-variant'
                      }`}
                    >
                      {needsAttentionCount} Flagged
                    </div>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    onClick={() => setSelectedMentorDetail(mentor)}
                    className="flex-1 py-1.5 px-2 bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1 min-w-[70px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">groups</span>
                    <span>Roster ({assignedStudents.length})</span>
                  </button>

                  <button
                    onClick={() => handleOpenReassign(mentor)}
                    className="py-1.5 px-2 bg-surface-container hover:bg-surface-container-high text-secondary font-bold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                    <span>Change Dept</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(mentor)}
                    className="py-1.5 px-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(mentor)}
                    className={`py-1.5 px-2 rounded-lg transition-colors font-semibold cursor-pointer text-center text-[11px] ${
                      mentor.is_active !== false
                        ? 'text-error hover:bg-error-container/30 border border-error/30'
                        : 'text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                    }`}
                  >
                    {mentor.is_active !== false ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredMentors.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant text-xs">
              No faculty mentors match your search criteria.
            </div>
          )}
        </div>
      </main>

      {/* Create Mentor Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-4 space-y-3.5">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-sm font-bold text-on-surface">
                    Create Faculty Mentor
                  </h3>
                  <p className="text-[10px] text-on-surface-variant">
                    Admin Provisioning • Assign to Any Department
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
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

            <form onSubmit={handleCreateSubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Mentor ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="e.g. mentor_rad_01"
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Department *
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs font-semibold text-primary"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Full Name & Credentials *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dr. K. Ramanathan, MPT"
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Faculty Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Senior Clinical Specialist"
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="mentor@hospital.org"
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98401 XXXXX"
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Reason for Creation
                </label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="e.g. Clinical faculty expansion"
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2 bg-surface-container hover:bg-surface-variant text-on-surface font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
                >
                  Create Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Department Override Modal */}
      {reassigningMentor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-4 space-y-3.5">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-sm font-bold text-on-surface">
                    Reassign Mentor Department
                  </h3>
                  <p className="text-[10px] text-on-surface-variant">
                    Admin Department Override Authority
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReassigningMentor(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs space-y-1">
              <div className="font-bold text-on-surface">{reassigningMentor.name}</div>
              <div className="text-[11px] text-on-surface-variant">
                Current Department: <span className="font-semibold text-secondary">{reassigningMentor.department}</span>
              </div>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Target New Department *
                </label>
                <select
                  value={reassignDept}
                  onChange={(e) => setReassignDept(e.target.value)}
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs font-semibold text-primary"
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
                  Reason for Department Override (Audit Trail) *
                </label>
                <input
                  type="text"
                  required
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Clinical faculty rotation requirement"
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassigningMentor(null)}
                  className="flex-1 py-2 bg-surface-container hover:bg-surface-variant text-on-surface font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
                >
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Mentor Modal */}
      {editingMentor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-4 space-y-3.5">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-sm font-bold text-on-surface">
                    Edit Mentor Details
                  </h3>
                  <p className="text-[10px] font-mono text-secondary">{editingMentor.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMentor(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Reason for Update (Audit Log)
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
                  onClick={() => setEditingMentor(null)}
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

      {/* Mentor Assigned Roster Drawer Modal */}
      {selectedMentorDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-4 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-2">
              <div>
                <h3 className="font-headline-md text-sm font-bold text-on-surface">
                  {selectedMentorDetail.name} • Assigned Interns
                </h3>
                <p className="text-[10px] text-secondary font-semibold">
                  {selectedMentorDetail.department} • {selectedMentorDetail.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedMentorDetail(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {students
                .filter(
                  (s) =>
                    s.mentor_id === selectedMentorDetail.id ||
                    s.mentor_name === selectedMentorDetail.name
                )
                .map((stud) => (
                  <div
                    key={stud.register_number}
                    className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          stud.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={stud.name}
                        className="w-8 h-8 rounded-full object-cover border border-outline-variant"
                      />
                      <div>
                        <div className="font-bold text-on-surface">{stud.name}</div>
                        <div className="text-[10px] font-mono text-primary font-bold">
                          {stud.register_number} • {stud.shift_name}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedStudent(stud.register_number);
                        setSelectedMentorDetail(null);
                        setCurrentScreen('gps_history');
                      }}
                      className="px-2 py-1 bg-surface-container hover:bg-surface-variant text-primary font-bold rounded-lg text-[11px] cursor-pointer"
                    >
                      View Logs →
                    </button>
                  </div>
                ))}

              {students.filter(
                (s) =>
                  s.mentor_id === selectedMentorDetail.id ||
                  s.mentor_name === selectedMentorDetail.name
              ).length === 0 && (
                <div className="text-center py-6 text-on-surface-variant text-xs">
                  No interns currently assigned to this mentor.
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMentorDetail(null)}
              className="w-full py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
