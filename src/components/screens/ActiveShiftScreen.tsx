import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { GeofenceMap } from '../common/GeofenceMap';

export const ActiveShiftScreen: React.FC = () => {
  const {
    currentUser,
    students,
    gpsMode,
    performGpsVerification,
    triggerRandomVerificationPrompt,
    openCheckOutModal,
    setCurrentScreen,
    hospitalGeofence,
  } = useApp();

  const regNo = currentUser?.registerNumber || '23UCCT001';
  const student = students.find((s) => s.register_number === regNo) || students[0];

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(20520); // 5 hours 42 minutes into shift
  const [boundaryView, setBoundaryView] = useState<'map' | 'radar'>('map');

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsedTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isBreach = gpsMode === 'OUTSIDE_HOSPITAL' || student.current_status === 'NEEDS ATTENTION';
  const isNoGps = gpsMode === 'GPS_UNAVAILABLE' || student.current_status === 'GPS UNAVAILABLE';
  const isDenied = gpsMode === 'PERMISSION_DENIED' || student.current_status === 'LOCATION PERMISSION REQUIRED';

  const distance = isBreach ? 420 : isNoGps || isDenied ? 0 : (student.last_verification_distance || 42);
  const accuracy = isBreach ? 18 : isNoGps || isDenied ? 0 : (student.last_verification_accuracy || 12);

  const handleVerifyPresence = async () => {
    const result = await performGpsVerification(undefined, undefined, 'MANUAL');
    if (result.status === 'NEEDS ATTENTION' || result.status === 'GPS UNAVAILABLE' || result.status === 'LOCATION PERMISSION REQUIRED') {
      setCurrentScreen('verification_result_needs_attention');
    } else {
      setCurrentScreen('verification_result');
    }
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Active Clinical Shift"
        showBack={true}
        onBack={() => setCurrentScreen('student_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Student & Shift Info Card */}
        <section
          id="active-shift-identity-card"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                Clinical Shift Active
              </span>
              <h1 className="text-base font-bold text-on-surface leading-tight truncate mt-0.5">
                {student.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md">
                  Reg No: {student.register_number}
                </span>
                <span className="text-outline-variant">•</span>
                <span className="text-xs text-on-surface-variant truncate">
                  {student.department}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SHIFT ACTIVE
            </span>
          </div>

          <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/40 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant block">Assigned Mentor</span>
              <span className="font-bold text-on-surface truncate block">{student.mentor_name}</span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant block">Shift Timing</span>
              <span className="font-bold text-primary font-mono truncate block">
                {student.shift_name} ({student.shift_time})
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-on-surface-variant block">Host Hospital</span>
              <span className="font-medium text-on-surface truncate block">{student.hospital}</span>
            </div>
          </div>
        </section>

        {/* Shift Elapsed Timer Banner */}
        <section
          id="shift-timer-banner"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Continuous Shift Timer
            </span>
            <span className="text-[11px] font-mono text-on-surface-variant">
              Shift started: <strong className="text-on-surface font-bold">10:02 PM</strong>
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div>
              <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                Duty Elapsed
              </div>
              <div className="font-mono text-2xl font-bold text-on-surface tracking-tight">
                {formatElapsedTime(elapsedSeconds)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                Geofence Radius
              </div>
              <div className="font-bold text-sm text-primary font-mono">
                {hospitalGeofence.radius_meters}m Perimeter
              </div>
            </div>
          </div>
        </section>

        {/* Live Hospital Geofence Radar / Map Display */}
        <section
          id="geofence-radar-container"
          className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/60 shadow-2xs flex flex-col items-center relative overflow-hidden space-y-3"
        >
          <div className="w-full flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5 font-bold text-on-surface">
              <span className="material-symbols-outlined text-[18px] text-primary">
                {boundaryView === 'map' ? 'map' : 'radar'}
              </span>
              <span>Hospital Geofence Map</span>
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-surface-container-high p-0.5 rounded-lg border border-outline-variant/60 text-[10px]">
              <button
                type="button"
                id="btn-shift-view-map"
                onClick={() => setBoundaryView('map')}
                className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                  boundaryView === 'map'
                    ? 'bg-primary text-on-primary shadow-2xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Map
              </button>
              <button
                type="button"
                id="btn-shift-view-radar"
                onClick={() => setBoundaryView('radar')}
                className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                  boundaryView === 'radar'
                    ? 'bg-primary text-on-primary shadow-2xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Radar
              </button>
            </div>
          </div>

          {boundaryView === 'map' ? (
            <div className="w-full h-48 rounded-xl overflow-hidden border border-outline-variant/50">
              <GeofenceMap
                latitude={hospitalGeofence.latitude}
                longitude={hospitalGeofence.longitude}
                radiusMeters={hospitalGeofence.radius_meters}
                hospitalName={hospitalGeofence.name}
                testDistance={distance}
                interns={[student]}
                interactive={false}
                className="h-48 w-full"
              />
            </div>
          ) : (
            <div className="relative w-48 h-48 flex items-center justify-center my-1">
              <div
                className={`w-48 h-48 rounded-full border-2 border-dashed ${
                  isBreach
                    ? 'border-error/40 bg-error/5'
                    : 'border-primary/40 bg-primary/5'
                } flex items-center justify-center`}
              >
                <div className="w-32 h-32 rounded-full border border-outline-variant/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-outline-variant/30 flex items-center justify-center"></div>
                </div>
              </div>

              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div className="w-full h-full border-r border-secondary/40 origin-center animate-spin duration-3000"></div>
              </div>

              <div className="absolute z-10 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[16px]">local_hospital</span>
                </div>
                <span className="text-[9px] font-bold text-primary mt-0.5 bg-surface-container-lowest/90 px-1 rounded shadow-2xs">
                  Center
                </span>
              </div>

              <div
                className={`absolute z-20 transition-all duration-700 flex flex-col items-center ${
                  isBreach ? 'top-2 right-2' : 'top-12 left-16'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md border-2 border-surface ${
                    isBreach ? 'bg-error animate-ping' : 'bg-emerald-600 animate-pulse'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <div
                  className={`text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded shadow-2xs ${
                    isBreach ? 'bg-error text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isBreach ? '420m' : '42m'}
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-on-surface-variant text-center max-w-xs leading-relaxed">
            {isBreach
              ? 'Your current location could not be verified within the hospital area.'
              : `Presence confirmed inside ${hospitalGeofence.name.split(' - ')[0]} (${hospitalGeofence.radius_meters}m perimeter).`}
          </div>
        </section>

        {/* Telemetry Metrics Grid */}
        <section className="grid grid-cols-2 gap-2.5">
          <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/40 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              Current Status
            </div>
            <div className="mt-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  isBreach
                    ? 'bg-amber-500/10 text-amber-800'
                    : 'bg-emerald-500/10 text-emerald-800'
                }`}
              >
                {isBreach ? 'NEEDS ATTENTION' : 'VERIFIED'}
              </span>
            </div>
            <div className="text-[10px] text-outline mt-1.5">Live Presence State</div>
          </div>

          <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/40 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              Last Verification
            </div>
            <div className="text-sm font-bold font-mono text-primary mt-1">
              {student.last_verified_at || '11:31 PM'}
            </div>
            <div className="text-[10px] text-outline mt-0.5">Automated Check</div>
          </div>

          <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/40 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              Distance to Center
            </div>
            <div
              className={`text-lg font-bold font-mono mt-0.5 ${
                isBreach ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {distance} m
            </div>
            <div className="text-[10px] text-outline mt-0.5">Limit: ≤{hospitalGeofence.radius_meters}m</div>
          </div>

          <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/40 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              GPS Accuracy
            </div>
            <div className="text-lg font-bold font-mono text-on-surface mt-0.5">
              ±{accuracy} m
            </div>
            <div className="text-[10px] text-outline mt-0.5">High Precision Fix</div>
          </div>
        </section>

        {/* Actions: VERIFY PRESENCE, CHECK OUT, SIMULATE RANDOM VERIFICATION */}
        <section className="space-y-2 pt-1">
          <button
            id="btn-verify-presence-active"
            type="button"
            onClick={handleVerifyPresence}
            className="w-full bg-primary text-on-primary rounded-xl py-3 font-bold text-xs shadow-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
          >
            <span className="material-symbols-outlined text-[20px]">share_location</span>
            VERIFY PRESENCE
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-simulate-random-verification-active"
              type="button"
              onClick={() => triggerRandomVerificationPrompt()}
              className="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span className="material-symbols-outlined text-[18px]">notification_important</span>
              Simulate Random Check
            </button>

            <button
              id="btn-checkout-active"
              type="button"
              onClick={openCheckOutModal}
              className="py-2.5 px-3 rounded-xl bg-error/10 hover:bg-error/15 text-error border border-error/25 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              CHECK OUT
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
