import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const MentorReviewScreen: React.FC = () => {
  const {
    currentUser,
    selectedAlertId,
    alerts,
    students,
    verifications,
    markAlertAsReviewed,
    setCurrentScreen,
  } = useApp();

  const alert =
    alerts.find((a) => a.id === selectedAlertId) ||
    alerts.find((a) => a.status === 'NEEDS ATTENTION') ||
    alerts[0];

  const student =
    students.find((s) => s.register_number === alert?.register_number) ||
    students[0];

  // RBAC Permission Check: Verify review authority
  const canReview = (() => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'HOD') {
      return student.department.toLowerCase().trim() === currentUser.department.toLowerCase().trim();
    }
    if (currentUser.role === 'MENTOR') {
      return student.mentor_id === currentUser.id;
    }
    return false;
  })();

  // Get student's shift verifications for contextual timeline
  const studentVerifications = verifications.filter(
    (v) => v.register_number === student.register_number
  );

  const [predefinedReason, setPredefinedReason] = useState<string>(
    'Emergency Clinical Dispatch to Blood Bank for Cross-Match'
  );
  const [customNotes, setCustomNotes] = useState<string>(
    'Student was instructed by Senior Resident on-duty to fetch emergency blood units for emergency trauma OT. Geofence excursion is justified and accredited.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const isAlreadyReviewed = alert?.status === 'REVIEWED';

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canReview) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const fullNotes = `[${predefinedReason}] ${customNotes}`;
      markAlertAsReviewed(alert.id, fullNotes);
      setIsSubmitting(false);
      setShowSuccessToast(true);
      setTimeout(() => {
        setCurrentScreen(currentUser?.role === 'HOD' ? 'hod_dashboard' : 'mentor_dashboard');
      }, 1200);
    }, 400);
  };

  if (!canReview) {
    return (
      <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
        <Header
          title="Access Denied"
          showBack={true}
          onBack={() => setCurrentScreen(currentUser?.role === 'HOD' ? 'hod_dashboard' : 'mentor_dashboard')}
        />
        <main className="p-4 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-3xl">gpp_bad</span>
          </div>
          <h2 className="text-base font-bold text-on-surface">Unauthorized Action</h2>
          <p className="text-xs text-on-surface-variant max-w-xs mt-1">
            You do not have supervisory credentials to adjudicate clinical alerts for student{' '}
            <span className="font-semibold text-on-surface">{student.name}</span> ({student.register_number}).
          </p>
          <button
            onClick={() => setCurrentScreen(currentUser?.role === 'HOD' ? 'hod_dashboard' : 'mentor_dashboard')}
            className="mt-5 px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Return to Dashboard
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Presence Verification Review"
        showBack={true}
        onBack={() => setCurrentScreen(currentUser?.role === 'HOD' ? 'hod_dashboard' : 'mentor_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Success Toast */}
        {showSuccessToast && (
          <div className="bg-secondary-container text-on-secondary-container p-3 rounded-xl border border-secondary font-bold text-xs flex items-center gap-2 animate-in fade-in shadow-xs">
            <span className="material-symbols-outlined text-[20px] text-secondary fill">
              check_circle
            </span>
            <span>Incident reviewed and marked as REVIEWED. Returning to dashboard...</span>
          </div>
        )}

        {/* Presence Verification Dossier Card */}
        <section
          id="incident-dossier-card"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-error tracking-wider block">
                PRESENCE VERIFICATION
              </span>
              <h2 className="font-bold text-base text-on-surface">{student.name}</h2>
              <p className="text-xs text-on-surface-variant font-mono">
                {student.register_number} • {student.department}
              </p>
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
                isAlreadyReviewed
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-error-container text-error animate-pulse'
              }`}
            >
              GPS: {alert.status}
            </span>
          </div>

          <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/30 text-xs space-y-2">
            <div className="flex justify-between items-center py-0.5 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">Student:</span>
              <span className="font-bold text-on-surface">
                {student.name} ({student.register_number})
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">Anomaly Time:</span>
              <span className="font-mono font-bold text-error">{alert.time_display}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">Recorded Distance:</span>
              <span className="font-mono font-bold text-error">
                {alert.distance_meters} m (Hospital radius: 150m)
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">GPS Accuracy:</span>
              <span className="font-mono font-bold text-on-surface">
                ±{alert.accuracy_meters} m
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-on-surface-variant font-medium">Shift Duty Window:</span>
              <span className="font-semibold text-primary font-mono">{student.shift_time} ({student.shift_name})</span>
            </div>
          </div>
        </section>

        {/* Complete Shift Timeline (Crucial Contextual Section) */}
        <section
          id="verification-timeline-section"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-on-surface-variant tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">timeline</span>
              Complete Shift Verification Timeline
            </h3>
            <span className="text-[10px] font-mono font-bold text-outline">Night Duty</span>
          </div>

          {/* Context Note */}
          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-[11px] text-on-surface-variant leading-relaxed">
            <strong>Contextual Evaluation Principle:</strong> Faculty mentors review the entire duty timeline to evaluate anomalies fairly without instant punitive action for clinical dispatches or GPS drift.
          </div>

          {/* Complete Sequential Timeline */}
          <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/40 space-y-2.5 font-mono text-xs">
            {/* 10:02 PM -> VERIFIED */}
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="font-bold text-on-surface">10:02 PM</span>
                <span className="text-on-surface font-sans">→</span>
                <span className="text-emerald-700 font-bold font-sans">VERIFIED</span>
              </div>
              <span className="text-[10px] text-outline font-sans">Shift Start (42m)</span>
            </div>

            {/* 11:31 PM -> VERIFIED */}
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="font-bold text-on-surface">11:31 PM</span>
                <span className="text-on-surface font-sans">→</span>
                <span className="text-emerald-700 font-bold font-sans">VERIFIED</span>
              </div>
              <span className="text-[10px] text-outline font-sans">Random Prompt (35m)</span>
            </div>

            {/* 01:18 AM -> VERIFIED */}
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="font-bold text-on-surface">01:18 AM</span>
                <span className="text-on-surface font-sans">→</span>
                <span className="text-emerald-700 font-bold font-sans">VERIFIED</span>
              </div>
              <span className="text-[10px] text-outline font-sans">Scheduled Check (28m)</span>
            </div>

            {/* 03:42 AM -> NEEDS ATTENTION */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-error/10 border border-error/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error shrink-0 animate-pulse"></span>
                <span className="font-bold text-error">03:42 AM</span>
                <span className="text-error font-sans">→</span>
                <span className="text-error font-bold font-sans">NEEDS ATTENTION</span>
              </div>
              <span className="text-[10px] text-error font-bold font-sans">420m (±18m acc)</span>
            </div>

            {/* 05:58 AM -> VERIFIED */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="font-bold text-on-surface">05:58 AM</span>
                <span className="text-on-surface font-sans">→</span>
                <span className="text-emerald-700 font-bold font-sans">VERIFIED</span>
              </div>
              <span className="text-[10px] text-outline font-sans">Scheduled Check (38m)</span>
            </div>
          </div>
        </section>

        {/* Mentor Review Action Section */}
        <section
          id="supervisor-action-card"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              rate_review
            </span>
            <h3 className="font-bold text-sm text-on-surface">
              Mentor Clinical Evaluation
            </h3>
          </div>

          {isAlreadyReviewed ? (
            <div className="bg-secondary/10 rounded-xl p-3 border border-secondary/30 text-xs space-y-1.5">
              <div className="font-bold text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Status: REVIEWED
              </div>
              <div className="text-[11px] text-on-surface-variant">
                Reviewed By: <strong>{alert.reviewed_by || currentUser?.name}</strong> • Reviewed At:{' '}
                <strong>{alert.reviewed_at || 'Today'}</strong>
              </div>
              <p className="italic text-on-surface bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/30 mt-1">
                "{alert.review_notes}"
              </p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Clinical Exemption Category
                </label>
                <select
                  value={predefinedReason}
                  onChange={(e) => setPredefinedReason(e.target.value)}
                  className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary focus:outline-none min-h-[44px]"
                >
                  <option value="Emergency Clinical Dispatch to Blood Bank for Cross-Match">
                    Emergency Dispatch (Blood Bank / Cross-Match)
                  </option>
                  <option value="Stat Specimen Transport to Central Pathology">
                    Stat Specimen Transport (Pathology / Microbiology)
                  </option>
                  <option value="Inter-Departmental Emergency Consult (Trauma / ICU)">
                    Inter-Departmental Consult (Trauma / ICU)
                  </option>
                  <option value="Accidental Perimeter Threshold Breach / GPS Drift">
                    Accidental Perimeter Threshold Breach / GPS Drift
                  </option>
                  <option value="Other Authorized Clinical Duty">
                    Other Authorized Clinical Duty
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Supervisor Justification Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Enter clinical justification and evaluation notes..."
                  className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <button
                  id="btn-mark-as-reviewed"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-secondary text-on-secondary rounded-xl py-3.5 font-bold text-sm hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[48px] active:scale-[0.99] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px] fill">check_circle</span>
                  <span>{isSubmitting ? 'Updating...' : '[ MARK AS REVIEWED ]'}</span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Audit Trail Note */}
        <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/30 text-center text-[11px] text-on-surface-variant">
          <div className="font-semibold text-primary">Immutable Audit Trail</div>
          <div>Review status records Reviewed By & Reviewed At without modifying original raw GPS records.</div>
        </div>
      </main>
    </div>
  );
};
