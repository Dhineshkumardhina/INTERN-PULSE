import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const HodGpsMonitoringScreen: React.FC = () => {
  const {
    currentUser,
    getDepartmentVerifications,
    getDepartmentStudents,
    setSelectedStudent,
    setCurrentScreen,
  } = useApp();

  const hodDept = currentUser?.department || 'Physiotherapy';
  const departmentVerifications = getDepartmentVerifications(hodDept);
  const departmentStudents = getDepartmentStudents(hodDept);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');

  const totalVerifications = departmentVerifications.length;
  const verifiedCount = departmentVerifications.filter((v) => v.status === 'VERIFIED' || v.status === 'REVIEWED').length;
  const needsAttentionCount = departmentVerifications.filter((v) => v.status === 'NEEDS ATTENTION').length;
  const gpsUnavailableCount = departmentVerifications.filter((v) => v.status === 'GPS UNAVAILABLE').length;
  const permissionDeniedCount = departmentVerifications.filter((v) => v.status === 'PERMISSION DENIED').length;

  const successRate = totalVerifications > 0 ? Math.round((verifiedCount / totalVerifications) * 100) : 100;

  const filteredVerifications = departmentVerifications.filter((v) => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Department GPS Telemetry"
        showBack={true}
        onBack={() => setCurrentScreen('hod_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1 min-w-0">
        {/* Privacy & Operational Standard Notice */}
        <div className="p-3 bg-secondary/5 rounded-2xl border border-secondary/20 flex items-start gap-2.5 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
            privacy_tip
          </span>
          <div className="space-y-0.5">
            <span className="font-bold text-on-surface block">Privacy-First Operational Monitoring</span>
            <p className="text-[11px] leading-relaxed">
              InternTrack does not expose raw private latitude/longitude coordinates. Only clinical verification status, boundary perimeter proximity, and accuracy metrics are displayed for internship compliance.
            </p>
          </div>
        </div>

        {/* 5 Department GPS Statistics Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-2xs">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Total Checks</span>
            <span className="font-mono text-xl font-bold text-on-surface mt-0.5 block">{totalVerifications}</span>
          </div>

          <div className="p-2.5 bg-surface-container-lowest rounded-2xl border border-emerald-500/30 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Verified</span>
            <span className="font-mono text-xl font-bold text-emerald-700 mt-0.5 block">{verifiedCount}</span>
            <span className="text-[9.5px] text-outline font-semibold">({successRate}%)</span>
          </div>

          <div className="p-2.5 bg-surface-container-lowest rounded-2xl border border-error/30 shadow-2xs">
            <span className="text-[10px] font-bold text-error uppercase block">Attention</span>
            <span className="font-mono text-xl font-bold text-error mt-0.5 block">{needsAttentionCount}</span>
          </div>

          <div className="p-2.5 bg-surface-container-lowest rounded-2xl border border-amber-500/30 shadow-2xs">
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Unavailable</span>
            <span className="font-mono text-xl font-bold text-amber-700 mt-0.5 block">{gpsUnavailableCount}</span>
          </div>

          <div className="p-2.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Permission Denied</span>
            <span className="font-mono text-xl font-bold text-on-surface mt-0.5 block">{permissionDeniedCount}</span>
          </div>
        </section>

        {/* Status Filter Pills */}
        <div className="flex gap-1.5 text-xs overflow-x-auto pb-0.5 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Telemetry' },
            { id: 'VERIFIED', label: 'Verified' },
            { id: 'NEEDS ATTENTION', label: 'Needs Attention' },
            { id: 'REVIEWED', label: 'Reviewed' },
            { id: 'GPS UNAVAILABLE', label: 'GPS Unavailable' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-colors shrink-0 cursor-pointer min-h-[32px] ${
                statusFilter === tab.id
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Verification Event Feed */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Department Telemetry Events ({filteredVerifications.length})
            </span>
          </div>

          {filteredVerifications.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center text-xs text-on-surface-variant">
              No verification events matching selected criteria.
            </div>
          ) : (
            filteredVerifications.map((log) => {
              const isBreach = log.status === 'NEEDS ATTENTION';
              const isReviewed = log.status === 'REVIEWED';
              const isVerified = log.status === 'VERIFIED';

              return (
                <div
                  key={log.id}
                  onClick={() => {
                    setSelectedStudent(log.register_number);
                    setCurrentScreen('mentor_student_details');
                  }}
                  className={`bg-surface-container-lowest rounded-2xl p-3.5 border shadow-2xs transition-all space-y-2.5 hover:border-primary/50 cursor-pointer ${
                    isBreach
                      ? 'border-error/40 bg-error-container/5'
                      : isReviewed
                      ? 'border-secondary/40'
                      : 'border-outline-variant/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isBreach
                            ? 'bg-error-container text-error'
                            : isReviewed
                            ? 'bg-secondary/15 text-secondary'
                            : 'bg-emerald-500/15 text-emerald-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isBreach ? 'warning' : isReviewed ? 'fact_check' : 'check'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-on-surface truncate">
                          {log.student_name} ({log.register_number})
                        </div>
                        <div className="text-[11px] text-on-surface-variant font-mono">
                          {log.time_display} • {log.verification_type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        isBreach
                          ? 'bg-error text-on-error animate-pulse'
                          : isReviewed
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
                    <div>
                      <span className="text-[9.5px] text-on-surface-variant block font-medium">
                        Perimeter Proximity
                      </span>
                      <span className={`font-mono font-bold ${isBreach ? 'text-error' : 'text-emerald-700'}`}>
                        {log.distance_meters}m from hospital
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9.5px] text-on-surface-variant block font-medium">
                        GPS Accuracy
                      </span>
                      <span className="font-mono font-bold text-on-surface">
                        ±{log.accuracy_meters}m
                      </span>
                    </div>
                  </div>

                  {isReviewed && log.review_details && (
                    <div className="p-2 rounded-lg bg-secondary/10 text-[11px] text-secondary border border-secondary/20">
                      <strong>Endorsed by {log.review_details.reviewer_name}:</strong> "{log.review_details.review_notes}"
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};
