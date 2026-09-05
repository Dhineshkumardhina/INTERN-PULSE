import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Hod } from '../../types';

export const AdminHodManagementScreen: React.FC = () => {
  const { hods, departments, createHod, editHod, toggleHodStatus, setCurrentScreen } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHod, setEditingHod] = useState<Hod | null>(null);
  const [selectedHodDetail, setSelectedHodDetail] = useState<Hod | null>(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDept, setFormDept] = useState('Physiotherapy');
  const [formReason, setFormReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const filteredHods = hods.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || h.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenCreate = () => {
    setFormId(`hod_${Date.now().toString().slice(-4)}`);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormDept(departments[0]?.name || 'Physiotherapy');
    setFormReason('Annual faculty academic leadership appointment');
    setErrorMessage('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    const result = createHod({
      id: formId,
      name: formName,
      email: formEmail,
      phone: formPhone,
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

  const handleOpenEdit = (hod: Hod) => {
    setEditingHod(hod);
    setFormName(hod.name);
    setFormEmail(hod.email);
    setFormPhone(hod.phone);
    setFormDept(hod.department);
    setFormReason('Administrative contact update');
    setErrorMessage('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHod) return;

    const result = editHod(
      editingHod.id,
      {
        name: formName,
        email: formEmail,
        phone: formPhone,
        department: formDept,
      },
      formReason || 'Administrative update'
    );

    if (result.success) {
      setEditingHod(null);
      setSuccessToast('HOD details updated successfully.');
      setTimeout(() => setSuccessToast(''), 4000);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleToggleStatus = (hod: Hod) => {
    const actionName = hod.is_active ? 'deactivate' : 'reactivate';
    if (confirm(`Are you sure you want to ${actionName} HOD ${hod.name} (${hod.id})?`)) {
      toggleHodStatus(hod.id, `Administrative ${actionName} requested by Admin`);
      setSuccessToast(`HOD ${hod.name} ${actionName}d successfully.`);
      setTimeout(() => setSuccessToast(''), 4000);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="HOD Management"
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
              placeholder="Search HOD name, ID, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <button
            id="btn-admin-create-hod"
            onClick={handleOpenCreate}
            className="px-3.5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Create HOD</span>
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
            All ({hods.length})
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

        {/* HOD Roster Cards */}
        <div className="space-y-2.5">
          {filteredHods.map((hod) => (
            <div
              key={hod.id}
              className={`bg-surface-container-lowest rounded-xl p-3.5 border transition-colors shadow-xs ${
                hod.is_active
                  ? 'border-outline-variant/50 hover:border-primary/40'
                  : 'border-outline-variant/30 opacity-70 bg-surface-container-low'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                    <span className="material-symbols-outlined text-[22px]">clinical_notes</span>
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-on-surface truncate">{hod.name}</span>
                      <span className="font-mono text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded">
                        {hod.id}
                      </span>
                    </div>
                    <div className="text-xs text-primary font-medium truncate">{hod.department}</div>
                  </div>
                </div>

                <span
                  className={`font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                    hod.is_active
                      ? 'bg-tertiary-container/15 text-tertiary-container'
                      : 'bg-error-container text-error'
                  }`}
                >
                  {hod.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                </span>
              </div>

              {/* Contact Information & Metadata */}
              <div className="bg-surface-container-low p-2 rounded-lg text-xs grid grid-cols-1 sm:grid-cols-2 gap-1 mb-2.5 border border-outline-variant/30 text-on-surface-variant">
                <div className="flex items-center gap-1 truncate">
                  <span className="material-symbols-outlined text-[14px]">mail</span>
                  <span className="truncate">{hod.email}</span>
                </div>
                <div className="flex items-center gap-1 truncate">
                  <span className="material-symbols-outlined text-[14px]">phone</span>
                  <span className="font-mono">{hod.phone}</span>
                </div>
                {hod.created_at && (
                  <div className="text-[10px] text-on-surface-variant/80 col-span-full">
                    Created: {hod.created_at} by {hod.created_by || 'Admin'}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setSelectedHodDetail(hod)}
                  className="flex-1 py-1.5 px-2 bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  <span>View</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(hod)}
                  className="flex-1 py-1.5 px-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleToggleStatus(hod)}
                  className={`py-1.5 px-2.5 rounded-lg transition-colors font-semibold cursor-pointer text-center text-[11px] ${
                    hod.is_active
                      ? 'text-error hover:bg-error-container/30 border border-error/30'
                      : 'text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30'
                  }`}
                >
                  {hod.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}

          {filteredHods.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant text-xs">
              No Head of Department records match your search criteria.
            </div>
          )}
        </div>
      </main>

      {/* Create HOD Modal */}
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
                    Create Head of Department
                  </h3>
                  <p className="text-[10px] text-on-surface-variant">
                    Exclusive Admin Authority • Scoped to Hospital
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
                    HOD Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="e.g. hod_physio"
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
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
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
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Mitchell, PT, PhD"
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="hod@hospital.org"
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Direct Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98401 XXXXX"
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Reason for Creation (Audit Trail)
                </label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="e.g. New academic chair appointment"
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
                  className="flex-1 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Create HOD</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit HOD Modal */}
      {editingHod && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-4 space-y-3.5">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-sm font-bold text-on-surface">
                    Edit HOD Profile
                  </h3>
                  <p className="text-[10px] font-mono text-primary">{editingHod.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingHod(null)}
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
                  Department
                </label>
                <select
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
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
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                  Reason for Update (Audit Trail)
                </label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="e.g. Change in contact information"
                  className="w-full p-2 bg-surface border border-outline-variant rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingHod(null)}
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

      {/* HOD Detail Modal */}
      {selectedHodDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl border border-outline-variant shadow-2xl p-4 space-y-3.5">
            <div className="flex justify-between items-center border-b border-outline-variant/40 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                </div>
                <h3 className="font-headline-md text-sm font-bold text-on-surface">
                  HOD Profile & Governance
                </h3>
              </div>
              <button
                onClick={() => setSelectedHodDetail(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base text-on-surface">{selectedHodDetail.name}</span>
                  <span
                    className={`font-status-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      selectedHodDetail.is_active
                        ? 'bg-tertiary-container/15 text-tertiary-container'
                        : 'bg-error-container text-error'
                    }`}
                  >
                    {selectedHodDetail.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                  </span>
                </div>
                <div className="text-primary font-semibold">{selectedHodDetail.department}</div>
                <div className="font-mono text-[11px] text-on-surface-variant">ID: {selectedHodDetail.id}</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between p-2 bg-surface-container-lowest rounded border border-outline-variant/20">
                  <span className="text-on-surface-variant">Hospital Campus:</span>
                  <span className="font-semibold">{selectedHodDetail.hospital}</span>
                </div>
                <div className="flex justify-between p-2 bg-surface-container-lowest rounded border border-outline-variant/20">
                  <span className="text-on-surface-variant">Email Address:</span>
                  <span className="font-semibold">{selectedHodDetail.email}</span>
                </div>
                <div className="flex justify-between p-2 bg-surface-container-lowest rounded border border-outline-variant/20">
                  <span className="text-on-surface-variant">Phone:</span>
                  <span className="font-mono font-semibold">{selectedHodDetail.phone}</span>
                </div>
                <div className="flex justify-between p-2 bg-surface-container-lowest rounded border border-outline-variant/20">
                  <span className="text-on-surface-variant">Registered Date:</span>
                  <span className="font-mono">{selectedHodDetail.created_at || 'Institutional Cohort'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedHodDetail(null)}
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
