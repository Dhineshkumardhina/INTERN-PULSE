import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const AdminReportsScreen: React.FC = () => {
  const { students, mentors, hods, departments, verifications, alerts, attendanceRecords, setCurrentScreen } = useApp();

  const [reportTab, setReportTab] = useState<'ATTENDANCE' | 'DEPARTMENT' | 'MENTOR' | 'GPS' | 'ALERTS' | 'INTERNSHIP'>('ATTENDANCE');
  const [timeframe, setTimeframe] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'>('MONTHLY');
  const [selectedDept, setSelectedDept] = useState('ALL');

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Institutional Analytics & Reports"
        showBack={true}
        onBack={() => setCurrentScreen('admin_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* Timeframe Selector Strip */}
        <div className="flex justify-between items-center bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/50 shadow-xs">
          <div className="flex gap-1 text-xs">
            {(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer text-[11px] ${
                  timeframe === t
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-variant text-primary font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Export</span>
          </button>
        </div>

        {/* Report Section Navigation Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'ATTENDANCE', label: 'Attendance', icon: 'event_available' },
            { id: 'DEPARTMENT', label: 'Departments', icon: 'domain' },
            { id: 'MENTOR', label: 'Mentors', icon: 'badge' },
            { id: 'GPS', label: 'GPS Compliance', icon: 'radar' },
            { id: 'ALERTS', label: 'Alerts', icon: 'warning' },
            { id: 'INTERNSHIP', label: 'Completion', icon: 'school' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                reportTab === tab.id
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40 hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 1. Attendance Report Tab */}
        {reportTab === 'ATTENDANCE' && (
          <div className="space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40">
                <div className="text-[10px] uppercase font-bold text-on-surface-variant">Active Enrolled</div>
                <div className="font-display-id text-xl font-bold text-primary">{students.length}</div>
              </div>
              <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-emerald-500/30">
                <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">Compliant Rate</div>
                <div className="font-display-id text-xl font-bold text-emerald-700 dark:text-emerald-300">96.4%</div>
              </div>
              <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40">
                <div className="text-[10px] uppercase font-bold text-on-surface-variant">Completed Shifts</div>
                <div className="font-display-id text-xl font-bold text-secondary">348</div>
              </div>
              <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-error/30">
                <div className="text-[10px] uppercase font-bold text-error">Anomalous Checkouts</div>
                <div className="font-display-id text-xl font-bold text-error">4</div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-xs space-y-2">
              <h3 className="font-headline-md text-sm font-bold text-on-surface">
                Attendance Compliance Breakdown
              </h3>
              <div className="space-y-2 text-xs">
                {departments.map((dept) => (
                  <div key={dept.id} className="space-y-1">
                    <div className="flex justify-between text-on-surface-variant">
                      <span className="font-medium text-on-surface">{dept.name}</span>
                      <span className="font-mono font-bold text-primary">97%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '97%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Department Analytics Tab */}
        {reportTab === 'DEPARTMENT' && (
          <div className="space-y-2.5 animate-fade-in text-xs">
            {departments.map((dept) => {
              const deptStudents = students.filter((s) => s.department.toLowerCase().includes(dept.name.toLowerCase().split(' ')[0]));
              const deptMentors = mentors.filter((m) => m.department.toLowerCase().includes(dept.name.toLowerCase().split(' ')[0]));

              return (
                <div
                  key={dept.id}
                  className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-xs space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-on-surface">{dept.name}</div>
                      <div className="text-[11px] text-primary font-medium">Chair: {dept.hod_name}</div>
                    </div>
                    <span className="font-mono text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                      {dept.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 bg-surface-container-low p-2 rounded-lg text-center">
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">Interns</div>
                      <div className="font-bold text-primary">{dept.total_students}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">Mentors</div>
                      <div className="font-bold text-secondary">{deptMentors.length || 2}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">Active Today</div>
                      <div className="font-bold text-tertiary-container">{dept.active_interns}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Mentor Monitoring Tab */}
        {reportTab === 'MENTOR' && (
          <div className="space-y-2.5 animate-fade-in text-xs">
            {mentors.map((mentor) => {
              const assigned = students.filter((s) => s.mentor_id === mentor.id || s.mentor_name === mentor.name);
              return (
                <div
                  key={mentor.id}
                  className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-on-surface">{mentor.name}</div>
                    <div className="text-[11px] text-secondary font-medium">{mentor.department} • {mentor.id}</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">
                      Assigned Interns: <span className="font-bold text-primary">{assigned.length}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                      100% Reviews
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. GPS Compliance Tab */}
        {reportTab === 'GPS' && (
          <div className="space-y-3 animate-fade-in text-xs">
            <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-primary/30 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-on-surface">Campus Geofence Accuracy Index</span>
                <span className="text-primary font-mono font-bold text-base">98.2%</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-snug">
                Aggregate physical presence telemetry inside hospital perimeter across 24-hour continuous rotational shifts.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40">
                <div className="text-[10px] uppercase font-bold text-on-surface-variant">Average Fix Accuracy</div>
                <div className="font-mono text-xl font-bold text-primary mt-1">±12.4m</div>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40">
                <div className="text-[10px] uppercase font-bold text-on-surface-variant">Mean Geofence Distance</div>
                <div className="font-mono text-xl font-bold text-secondary mt-1">44.8m</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Alerts Analytics Tab */}
        {reportTab === 'ALERTS' && (
          <div className="space-y-2.5 animate-fade-in text-xs">
            <div className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-xs space-y-2">
              <div className="font-bold text-sm text-on-surface">Incident Resolution Efficiency</div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Avg Supervisor Response Time:</span>
                  <span className="font-mono font-bold text-primary">14 mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Reviewed Endorsement Rate:</span>
                  <span className="font-mono font-bold text-emerald-600">92.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Total Shift Anomalies (30 Days):</span>
                  <span className="font-mono font-bold text-error">14 Flags</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Internship Completion Tab */}
        {reportTab === 'INTERNSHIP' && (
          <div className="space-y-2.5 animate-fade-in text-xs">
            <div className="bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-xs space-y-2">
              <div className="font-bold text-sm text-on-surface">Cohort Accreditation & Progress</div>
              <div className="space-y-2 pt-1">
                {departments.map((d) => (
                  <div key={d.id} className="p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/30 space-y-1">
                    <div className="flex justify-between font-bold text-on-surface">
                      <span>{d.name}</span>
                      <span className="text-primary font-mono">Month 2 of 6</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '33%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
