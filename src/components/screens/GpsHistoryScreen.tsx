import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const GpsHistoryScreen: React.FC = () => {
  const {
    verifications,
    students,
    currentUser,
    selectedStudentRegisterNumber,
    setCurrentScreen,
    hospitalGeofence,
  } = useApp();

  const [filter, setFilter] = useState<string>('ALL');

  // If student, strictly force own register number
  const targetReg =
    currentUser?.role === 'STUDENT'
      ? currentUser.registerNumber || '23UCCT001'
      : selectedStudentRegisterNumber || currentUser?.registerNumber || '23UCCT001';

  const student = students.find((s) => s.register_number === targetReg) || students[0];

  const studentVerifications = verifications.filter((v) => v.register_number === student.register_number);

  const filteredLogs = studentVerifications.filter((v) => {
    if (filter === 'VERIFIED') return v.status === 'VERIFIED';
    if (filter === 'NEEDS ATTENTION') return v.status === 'NEEDS ATTENTION';
    if (filter === 'REVIEWED') return v.status === 'REVIEWED';
    return true;
  });

  const totalChecks = studentVerifications.length;
  const verifiedCount = studentVerifications.filter((v) => v.status === 'VERIFIED' || v.status === 'REVIEWED').length;
  const complianceRate = totalChecks > 0 ? Math.round((verifiedCount / totalChecks) * 100) : 100;

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="GPS Verification History"
        showBack={true}
        onBack={() => {
          if (currentUser?.role === 'STUDENT') setCurrentScreen('student_dashboard');
          else if (currentUser?.role === 'MENTOR') setCurrentScreen('mentor_dashboard');
          else if (currentUser?.role === 'HOD') setCurrentScreen('hod_dashboard');
          else setCurrentScreen('admin_dashboard');
        }}
      />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Student Summary Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">
                Personal GPS Telemetry Log
              </span>
              <h2 className="font-bold text-base text-on-surface truncate">
                {student.name}
              </h2>
              <div className="text-xs text-on-surface-variant">
                Reg: <span className="font-mono font-bold text-primary">{student.register_number}</span> • {student.department}
              </div>
            </div>

            {/* Compliance Gauge */}
            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase font-bold text-on-surface-variant">
                Verification Rate
              </div>
              <div className="font-mono text-xl font-bold text-primary">
                {complianceRate}%
              </div>
              <div className="text-[10px] text-outline">
                {verifiedCount}/{totalChecks} Verified
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Hospital Perimeter: <strong className="text-on-surface font-mono">{hospitalGeofence.radius_meters}m</strong></span>
            <span>Rotation: <strong className="text-primary font-mono">{student.shift_name}</strong></span>
          </div>
        </section>

        {/* Filter Pills */}
        <div className="flex gap-1.5 text-xs overflow-x-auto pb-0.5">
          {['ALL', 'VERIFIED', 'NEEDS ATTENTION', 'REVIEWED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-colors shrink-0 cursor-pointer min-h-[36px] ${
                filter === tab
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/50'
              }`}
            >
              {tab} (
              {tab === 'ALL'
                ? studentVerifications.length
                : studentVerifications.filter((v) => v.status === tab).length}
              )
            </button>
          ))}
        </div>

        {/* Timeline Log Entries */}
        <section className="space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 text-center border border-outline-variant/40 text-on-surface-variant text-xs">
              No logs matching "{filter}".
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isBreach = log.status === 'NEEDS ATTENTION';
              const isReviewed = log.status === 'REVIEWED';
              const dateStr = new Date(log.timestamp).toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={log.id}
                  className={`bg-surface-container-lowest rounded-xl p-3.5 border shadow-2xs transition-all space-y-2.5 ${
                    isBreach
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : isReviewed
                      ? 'border-secondary/40'
                      : 'border-outline-variant/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          isBreach
                            ? 'bg-amber-500/15 text-amber-700'
                            : isReviewed
                            ? 'bg-secondary/15 text-secondary'
                            : 'bg-emerald-500/15 text-emerald-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isBreach ? 'warning' : isReviewed ? 'fact_check' : 'check'}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                          <span>{log.time_display}</span>
                          <span className="text-[10px] text-on-surface-variant font-medium">
                            • {dateStr}
                          </span>
                        </div>
                        <div className="text-[10px] text-secondary font-semibold mt-0.5">
                          {student.shift_name} ({student.shift_time})
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                        isBreach
                          ? 'bg-amber-500/10 text-amber-800 border border-amber-500/30'
                          : isReviewed
                          ? 'bg-secondary/10 text-secondary border border-secondary/30'
                          : 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  {/* Distance and Accuracy Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30">
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">Distance from Hospital</span>
                      <span className={`font-mono font-bold ${isBreach ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {log.distance_meters} meters
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block">GPS Accuracy</span>
                      <span className="font-mono font-bold text-on-surface">
                        ±{log.accuracy_meters} meters
                      </span>
                    </div>
                  </div>

                  {/* Geofence Neutral Explanatory Note */}
                  {isBreach && (
                    <div className="bg-amber-500/10 rounded-lg p-2.5 text-xs text-amber-900 border border-amber-500/25 flex items-start gap-1.5 leading-relaxed">
                      <span className="material-symbols-outlined text-[16px] text-amber-700 shrink-0 mt-0.5">
                        info
                      </span>
                      <div>
                        Your current location could not be verified within the hospital area. Telemetry has been submitted for mentor review.
                      </div>
                    </div>
                  )}

                  {/* Supervisor Review Endorsement Note */}
                  {isReviewed && (
                    <div className="bg-secondary/10 rounded-lg p-2.5 text-xs text-secondary border border-secondary/20 text-[11px] space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Endorsed by {log.review_details?.reviewer_name || 'Dr. Anitha'}
                      </div>
                      <p className="italic text-on-surface-variant">
                        "{log.review_details?.review_notes || 'Dispatched to Emergency Ward for clinical rehabilitation consultation.'}"
                      </p>
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
