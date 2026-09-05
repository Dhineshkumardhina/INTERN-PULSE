import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const AdminActivityLogScreen: React.FC = () => {
  const { activityLogs, setCurrentScreen } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('ALL');

  const filteredLogs = activityLogs.filter((log) => {
    const searchTarget = `${log.target || ''} ${log.student_name || ''} ${log.student_register_number || ''} ${log.actor || ''} ${log.reason || ''} ${log.details || ''}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
    const matchesAction = actionTypeFilter === 'ALL' || log.action_type === actionTypeFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Admin Activity Log"
        showBack={true}
        onBack={() => setCurrentScreen('admin_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* Banner */}
        <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-xs flex items-center justify-between">
          <div>
            <h3 className="font-headline-md text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              <span>Hospital Audit Trail</span>
            </h3>
            <p className="text-[10px] text-on-surface-variant">
              Immutable historical record of all administrative overrides and schedule changes
            </p>
          </div>
          <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full font-mono shrink-0">
            {activityLogs.length} Events
          </span>
        </div>

        {/* Search & Filter */}
        <div className="space-y-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search audit trail by actor, target, reason, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'ALL', label: 'All Actions' },
              { id: 'SHIFT_CHANGE', label: 'Shift Changes' },
              { id: 'MENTOR_REASSIGN', label: 'Mentor Reassign' },
              { id: 'HOD_CREATE', label: 'HOD Creation' },
              { id: 'GEOFENCE_UPDATE', label: 'Geofence Config' },
              { id: 'STUDENT_ADD', label: 'Student Enroll' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActionTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors shrink-0 cursor-pointer ${
                  actionTypeFilter === f.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-xs text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase">
                  {log.action || log.action_type}
                </span>
                <span className="font-mono text-[11px] text-on-surface-variant">
                  {log.timestamp}
                </span>
              </div>

              <div>
                <div className="font-bold text-sm text-on-surface">
                  Target: {log.target || log.student_name || log.student_register_number}
                </div>
                <div className="text-on-surface text-xs font-medium mt-0.5">
                  {log.details}
                </div>
              </div>

              {/* Old vs New Values if available */}
              {(log.old_value || log.new_value) && (
                <div className="grid grid-cols-2 gap-1.5 bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 text-[11px]">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-on-surface-variant">Previous Value</div>
                    <div className="font-mono text-on-surface truncate">{log.old_value || 'None'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-primary">New Value</div>
                    <div className="font-mono text-primary font-bold truncate">{log.new_value || 'Updated'}</div>
                  </div>
                </div>
              )}

              <div className="p-2 bg-surface-container-low rounded-lg text-[11px] text-on-surface-variant border border-outline-variant/20">
                <span className="font-semibold text-on-surface">Reason: </span>
                <span>{log.reason}</span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-on-surface-variant pt-0.5">
                <span>Actor: <span className="font-semibold text-on-surface">{log.actor || log.performed_by}</span></span>
                <span className="italic flex items-center gap-0.5 text-outline">
                  <span className="material-symbols-outlined text-[12px]">lock</span>
                  <span>Immutable Log</span>
                </span>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-on-surface-variant text-xs">
              No activity logs match your filter criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
