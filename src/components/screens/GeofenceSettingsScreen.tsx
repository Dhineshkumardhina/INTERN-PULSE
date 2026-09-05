import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { HOSPITAL_PRESETS, GeofencePreset } from '../../services/mockData';
import { GeofenceMap } from '../common/GeofenceMap';

export const GeofenceSettingsScreen: React.FC = () => {
  const {
    hospitalGeofence,
    updateHospitalGeofence,
    resetHospitalGeofence,
    setCurrentScreen,
    currentRole,
    currentUser,
    students,
  } = useApp();

  // Local form state
  const [name, setName] = useState(hospitalGeofence.name);
  const [departmentZone, setDepartmentZone] = useState(hospitalGeofence.department_zone || 'Central Clinical Campus');
  const [latitude, setLatitude] = useState<number>(hospitalGeofence.latitude);
  const [longitude, setLongitude] = useState<number>(hospitalGeofence.longitude);
  const [radiusMeters, setRadiusMeters] = useState<number>(hospitalGeofence.radius_meters);
  const [toleranceMeters, setToleranceMeters] = useState<number>(hospitalGeofence.tolerance_meters || 15);
  const [reason, setReason] = useState<string>('Routine clinical rotation perimeter adjustment');

  // Device GPS detection state
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsDetectMessage, setGpsDetectMessage] = useState<string | null>(null);

  // Live simulation tester state
  const [testDistance, setTestDistance] = useState<number>(45);

  // Map vs Radar visualizer toggle (default to map for interactive geofence setting)
  const [visualizerMode, setVisualizerMode] = useState<'map' | 'radar'>('map');

  // Success toast
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Keep synced with context if context changes externally
  useEffect(() => {
    setName(hospitalGeofence.name);
    setDepartmentZone(hospitalGeofence.department_zone || 'Central Clinical Campus');
    setLatitude(hospitalGeofence.latitude);
    setLongitude(hospitalGeofence.longitude);
    setRadiusMeters(hospitalGeofence.radius_meters);
    setToleranceMeters(hospitalGeofence.tolerance_meters || 15);
  }, [hospitalGeofence]);

  // Handle Preset selection
  const handleSelectPreset = (preset: GeofencePreset) => {
    setName(preset.name);
    setDepartmentZone(preset.department_zone);
    setLatitude(preset.latitude);
    setLongitude(preset.longitude);
    setRadiusMeters(preset.radius_meters);
    setToleranceMeters(preset.tolerance_meters);
    setReason(`Applied preset: ${preset.name}`);
  };

  // Handle device GPS acquisition
  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      setGpsDetectMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsDetectMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLat = Number(position.coords.latitude.toFixed(6));
        const detectedLng = Number(position.coords.longitude.toFixed(6));
        const acc = Math.round(position.coords.accuracy);

        setLatitude(detectedLat);
        setLongitude(detectedLng);
        setIsDetectingGps(false);
        setGpsDetectMessage(`Acquired device GPS: ${detectedLat}, ${detectedLng} (Accuracy: ±${acc}m)`);
        setReason(`Calibrated from device GPS hardware (±${acc}m accuracy)`);
      },
      (error) => {
        setIsDetectingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsDetectMessage('Permission denied. Using default hospital coordinates.');
        } else {
          setGpsDetectMessage('Unable to retrieve current location. Using hospital coordinates.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Handle Save
  const handleSaveGeofence = () => {
    updateHospitalGeofence(
      {
        name,
        department_zone: departmentZone,
        latitude,
        longitude,
        radius_meters: radiusMeters,
        tolerance_meters: toleranceMeters,
      },
      reason
    );

    setToastMessage(`Geofence updated to ${radiusMeters}m! Enforced across all active shifts.`);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4500);
  };

  // Handle Reset
  const handleReset = () => {
    resetHospitalGeofence();
    setToastMessage('Geofence reset to institutional baseline (150m).');
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  // Quick radius presets
  const RADIUS_OPTIONS = [50, 100, 150, 200, 250, 350, 500];

  // Visual radar scale calculation
  // Base radar diameter is 240px representing a 600m visual field
  const radarScale = Math.min(1, Math.max(0.15, radiusMeters / 500));
  const circlePixelRadius = Math.round(radarScale * 110);

  // Test distance evaluation
  const isTestInside = testDistance <= radiusMeters;
  const isTestNearEdge = Math.abs(testDistance - radiusMeters) <= toleranceMeters;

  const activeInternsCount = students.filter((s) => s.is_active_shift).length || 3;

  return (
    <div className="min-h-screen bg-background text-on-background pb-32">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div
          id="geofence-success-toast"
          className="fixed top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-50 bg-primary text-on-primary px-4 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 animate-bounce"
        >
          <span className="material-symbols-outlined text-[24px]">verified</span>
          <div className="flex-1 text-xs">
            <p className="font-bold text-sm">Geofence Enforced</p>
            <p className="opacity-95">{toastMessage}</p>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="p-1 rounded-full hover:bg-white/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Screen Header */}
      <header className="bg-surface border-b border-outline-variant/40 px-4 pt-4 pb-3 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between">
          <button
            id="btn-geofence-back"
            onClick={() => {
              if (currentRole === 'ADMIN') setCurrentScreen('admin_dashboard');
              else if (currentRole === 'HOD') setCurrentScreen('hod_dashboard');
              else if (currentRole === 'MENTOR') setCurrentScreen('mentor_dashboard');
              else setCurrentScreen('student_dashboard');
            }}
            className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-sm font-bold text-on-surface flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">share_location</span>
              Hospital Geofence
            </h1>
            <p className="text-[10px] text-on-surface-variant">Perimeter Configuration & Calibration</p>
          </div>

          <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-full border border-outline-variant/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-on-surface">{radiusMeters}m</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto">
        {/* Active Geofence Status Banner */}
        <section className="bg-surface-container-low border border-primary/20 rounded-2xl p-3.5 shadow-xs relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Active Clinical Zone
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  {activeInternsCount} Active Interns
                </span>
              </div>
              <h2 className="text-sm font-bold text-on-surface leading-tight">{hospitalGeofence.name}</h2>
              <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">pin_drop</span>
                {hospitalGeofence.latitude.toFixed(4)}° N, {hospitalGeofence.longitude.toFixed(4)}° E
                <span className="text-outline">|</span>
                <span className="font-semibold text-primary">Radius: {hospitalGeofence.radius_meters}m</span>
              </p>
            </div>
          </div>
          {hospitalGeofence.last_updated_at && (
            <p className="text-[10px] text-on-surface-variant/80 mt-2 border-t border-outline-variant/40 pt-1.5">
              Last calibrated: {hospitalGeofence.last_updated_at} by {hospitalGeofence.updated_by || 'Admin'}
            </p>
          )}
        </section>

        {/* Interactive Map & Radar Visualizer */}
        <section className="bg-surface border border-outline-variant/50 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">map</span>
                  Campus Geofence Visualizer
                </h2>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-300/60">
                  Free OpenStreetMap
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {visualizerMode === 'map'
                  ? 'Click map or drag the pins to configure campus perimeter. No API keys required.'
                  : `Concentric radar view showing active ${radiusMeters}m perimeter`}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-surface-container-high p-0.5 rounded-xl border border-outline-variant/60 text-[10px] font-semibold">
              <button
                type="button"
                id="btn-view-map"
                onClick={() => setVisualizerMode('map')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  visualizerMode === 'map'
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">map</span>
                <span>Free Map</span>
              </button>
              <button
                type="button"
                id="btn-view-radar"
                onClick={() => setVisualizerMode('radar')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  visualizerMode === 'radar'
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">radar</span>
                <span>Radar</span>
              </button>
            </div>
          </div>

          {/* Map Mode Display */}
          {visualizerMode === 'map' && (
            <div className="space-y-2">
              <GeofenceMap
                latitude={latitude}
                longitude={longitude}
                radiusMeters={radiusMeters}
                toleranceMeters={toleranceMeters}
                hospitalName={name}
                onCoordinatesChange={(newLat, newLng) => {
                  setLatitude(newLat);
                  setLongitude(newLng);
                  setReason(`Calibrated via interactive free map: ${newLat.toFixed(4)}°N, ${newLng.toFixed(4)}°E`);
                }}
                onRadiusChange={(newRadius) => {
                  setRadiusMeters(newRadius);
                }}
                interns={students}
                testDistance={testDistance}
                className="h-[380px]"
                interactive={true}
              />

              {/* Free Map Action Guidance Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/60">
                <div className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-primary text-white font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span className="text-on-surface-variant leading-tight">
                    <strong className="text-on-surface">Set Epicenter:</strong> Drag the blue hospital pin or click anywhere on the free map.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span className="text-on-surface-variant leading-tight">
                    <strong className="text-on-surface">Adjust Radius:</strong> Drag the amber dot on the circle boundary or tap preset chips.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span className="text-on-surface-variant leading-tight">
                    <strong className="text-on-surface">Test Intern:</strong> Drag the Arun intern marker across the line to test breach alerts.
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[11px] bg-primary/5 p-2.5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-1.5 text-primary font-medium">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Free OpenStreetMap Active • Ready to calibrate campus perimeter</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-on-surface-variant">
                  <span className="font-semibold text-primary">{latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E</span>
                  <span>|</span>
                  <span className="font-bold text-primary">R = {radiusMeters}m</span>
                </div>
              </div>
            </div>
          )}

          {/* Radar Canvas Display */}
          {visualizerMode === 'radar' && (
            <div className="space-y-2">
              <div className="relative w-full aspect-square max-w-[280px] mx-auto bg-slate-950 rounded-2xl border border-primary/30 p-2 flex items-center justify-center overflow-hidden shadow-inner">
                {/* Concentric Distance Grid Lines */}
                <div className="absolute w-[240px] h-[240px] rounded-full border border-slate-800/80 pointer-events-none"></div>
                <div className="absolute w-[180px] h-[180px] rounded-full border border-slate-800/80 pointer-events-none"></div>
                <div className="absolute w-[120px] h-[120px] rounded-full border border-slate-800/80 pointer-events-none"></div>
                <div className="absolute w-[60px] h-[60px] rounded-full border border-slate-800/80 pointer-events-none"></div>

                {/* Radar Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-800/60 pointer-events-none"></div>
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-800/60 pointer-events-none"></div>

                {/* Range markers */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-500">
                  500m
                </span>
                <span className="absolute top-8 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-500">
                  300m
                </span>
                <span className="absolute top-15 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-500">
                  150m
                </span>

                {/* Peripheral Hospital Buildings */}
                <div className="absolute top-5 left-7 flex flex-col items-center pointer-events-none opacity-60">
                  <span className="material-symbols-outlined text-[14px] text-slate-400">biomedical</span>
                  <span className="text-[7px] text-slate-400">Stat Labs</span>
                </div>
                <div className="absolute bottom-6 right-6 flex flex-col items-center pointer-events-none opacity-60">
                  <span className="material-symbols-outlined text-[14px] text-slate-400">emergency</span>
                  <span className="text-[7px] text-slate-400">Trauma OT</span>
                </div>
                <div className="absolute top-7 right-7 flex flex-col items-center pointer-events-none opacity-60">
                  <span className="material-symbols-outlined text-[14px] text-slate-400">bloodtype</span>
                  <span className="text-[7px] text-slate-400">Blood Bank</span>
                </div>
                <div className="absolute bottom-6 left-7 flex flex-col items-center pointer-events-none opacity-60">
                  <span className="material-symbols-outlined text-[14px] text-slate-400">meeting_room</span>
                  <span className="text-[7px] text-slate-400">North Gate</span>
                </div>

                {/* Dynamic Geofence Perimeter Ring */}
                <div
                  style={{
                    width: `${circlePixelRadius * 2}px`,
                    height: `${circlePixelRadius * 2}px`,
                  }}
                  className="absolute rounded-full border-2 border-primary/90 bg-primary/10 transition-all duration-300 pointer-events-none flex items-center justify-center animate-pulse"
                >
                  {/* Tolerance buffer outline */}
                  <div
                    style={{
                      width: `${circlePixelRadius * 2 + 14}px`,
                      height: `${circlePixelRadius * 2 + 14}px`,
                    }}
                    className="absolute rounded-full border border-dashed border-primary/40 pointer-events-none"
                  ></div>
                </div>

                {/* Center Hospital Anchor Pin */}
                <div className="relative z-10 flex flex-col items-center cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/40">
                    <span className="material-symbols-outlined text-primary text-[18px]">local_hospital</span>
                  </div>
                  <span className="text-[8px] font-bold text-white bg-slate-900/90 px-1 rounded mt-0.5 border border-slate-700">
                    Hospital Core
                  </span>
                </div>

                {/* Simulated Intern Dot at testDistance */}
                {testDistance > 0 && (
                  <div
                    style={{
                      transform: `translate(${Math.round(
                        (testDistance / 500) * 110 * 0.7
                      )}px, -${Math.round((testDistance / 500) * 110 * 0.7)}px)`,
                    }}
                    className="absolute z-20 flex flex-col items-center transition-all duration-200 pointer-events-none"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        isTestInside
                          ? 'bg-emerald-500 border-white shadow-emerald-500/50'
                          : 'bg-rose-500 border-white shadow-rose-500/50'
                      } shadow-md`}
                    >
                      <span className="w-1 h-1 rounded-full bg-white"></span>
                    </div>
                    <span
                      className={`text-[7px] font-bold px-1 rounded mt-0.5 text-white whitespace-nowrap ${
                        isTestInside ? 'bg-emerald-700' : 'bg-rose-700'
                      }`}
                    >
                      Intern ({testDistance}m)
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-center text-on-surface-variant mt-2">
                Dynamic blue ring represents the enforced boundary. Green dot reflects test location.
              </p>
            </div>
          )}
        </section>

        {/* 1-Tap Institutional Presets */}
        <section className="bg-surface border border-outline-variant/50 rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">bookmark</span>
            Quick Campus Presets
          </h2>
          <p className="text-[11px] text-on-surface-variant mb-3">
            Select a verified clinical zone preset to load calibrated coordinates and perimeter:
          </p>

          <div className="space-y-2">
            {HOSPITAL_PRESETS.map((preset) => {
              const isSelected =
                Math.abs(latitude - preset.latitude) < 0.0001 &&
                Math.abs(longitude - preset.longitude) < 0.0001 &&
                radiusMeters === preset.radius_meters;

              return (
                <button
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-xs'
                      : 'bg-surface-container-low border-outline-variant/60 hover:bg-surface-container-high'
                  }`}
                >
                  <div className="space-y-0.5 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-on-surface">{preset.name}</span>
                      {isSelected && (
                        <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-primary font-medium">{preset.department_zone}</p>
                    <p className="text-[10px] text-on-surface-variant line-clamp-1">{preset.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-on-surface">{preset.radius_meters}m</span>
                    <p className="text-[9px] text-on-surface-variant">radius</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Radius Configuration Slider & Inputs */}
        <section className="bg-surface border border-outline-variant/50 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">straighten</span>
                Perimeter Radius
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                Enforced distance threshold for shift verification
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-primary font-mono">{radiusMeters}</span>
              <span className="text-xs text-on-surface-variant ml-1">meters</span>
            </div>
          </div>

          {/* Range Slider */}
          <div className="space-y-2">
            <input
              id="slider-geofence-radius"
              type="range"
              min={25}
              max={800}
              step={5}
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
              <span>25m (Ward OT)</span>
              <span>150m (Hospital)</span>
              <span>350m (Campus)</span>
              <span>800m</span>
            </div>
          </div>

          {/* Quick Radius Buttons */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-on-surface-variant">Quick Radius Selection:</label>
            <div className="flex flex-wrap gap-1.5">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  id={`btn-radius-${r}`}
                  type="button"
                  onClick={() => setRadiusMeters(r)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    radiusMeters === r
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container-high'
                  }`}
                >
                  {r}m
                </button>
              ))}
            </div>
          </div>

          {/* GPS Drift & Wall Tolerance Buffer */}
          <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/60 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="input-tolerance-buffer" className="text-xs font-semibold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">wifi_tethering</span>
                Dual-Band GPS Drift Tolerance Buffer:
              </label>
              <span className="text-xs font-mono font-bold text-secondary">±{toleranceMeters}m</span>
            </div>
            <input
              id="input-tolerance-buffer"
              type="range"
              min={5}
              max={35}
              step={1}
              value={toleranceMeters}
              onChange={(e) => setToleranceMeters(Number(e.target.value))}
              className="w-full accent-secondary h-1.5 bg-surface-container-highest rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Compensates for multi-path signal drift through reinforced concrete ward walls and basement diagnostic labs.
            </p>
          </div>
        </section>

        {/* Center Coordinates & Device GPS */}
        <section className="bg-surface border border-outline-variant/50 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">my_location</span>
                Center Coordinates
              </h2>
              <p className="text-[11px] text-on-surface-variant">Geographic hospital anchor point</p>
            </div>
          </div>

          {/* Campus Facility / Zone Name */}
          <div className="space-y-1">
            <label htmlFor="input-geofence-name" className="text-xs font-semibold text-on-surface">
              Hospital / Zone Name:
            </label>
            <input
              id="input-geofence-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-primary"
              placeholder="e.g. InternPulse General Hospital - Acute Ward"
            />
          </div>

          {/* Department Coverage */}
          <div className="space-y-1">
            <label htmlFor="input-geofence-zone" className="text-xs font-semibold text-on-surface">
              Covered Departments / Wards:
            </label>
            <input
              id="input-geofence-zone"
              type="text"
              value={departmentZone}
              onChange={(e) => setDepartmentZone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-primary"
              placeholder="e.g. Emergency, Radiology, ICU & Inpatient Wards"
            />
          </div>

          {/* Coordinates Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="input-geofence-latitude" className="text-xs font-semibold text-on-surface">
                Latitude (°N):
              </label>
              <input
                id="input-geofence-latitude"
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-primary"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="input-geofence-longitude" className="text-xs font-semibold text-on-surface">
                Longitude (°E):
              </label>
              <input
                id="input-geofence-longitude"
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-primary"
              />
            </div>
          </div>

          {/* Device GPS Button */}
          <button
            id="btn-use-device-gps"
            type="button"
            onClick={handleUseDeviceLocation}
            disabled={isDetectingGps}
            className="w-full py-2.5 px-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isDetectingGps ? 'animate-spin' : ''
              }`}
            >
              {isDetectingGps ? 'sync' : 'location_searching'}
            </span>
            <span>
              {isDetectingGps ? 'Detecting Device GPS...' : '📍 Use My Current Device GPS Location'}
            </span>
          </button>

          {gpsDetectMessage && (
            <p
              id="gps-detect-status-message"
              className="text-[11px] p-2 rounded-lg bg-surface-container-high text-on-surface border border-outline-variant/60"
            >
              {gpsDetectMessage}
            </p>
          )}
        </section>

        {/* Live Distance Verification Tester */}
        <section className="bg-surface border border-outline-variant/50 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">rule</span>
                Test Location Verification
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                Simulate how an intern at varying distances will be evaluated
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isTestInside
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {isTestInside ? 'PASS (VERIFIED)' : 'BREACH (ALERT)'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface-variant">Simulated Intern Distance:</span>
              <span className="font-mono text-primary font-bold">{testDistance} meters</span>
            </div>
            <input
              id="slider-test-distance"
              type="range"
              min={5}
              max={600}
              step={5}
              value={testDistance}
              onChange={(e) => setTestDistance(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer"
            />
          </div>

          {/* Evaluation Result Card */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isTestInside
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] mt-0.5 shrink-0">
              {isTestInside ? 'check_circle' : 'warning'}
            </span>
            <div className="text-xs space-y-0.5">
              <p className="font-bold">
                {isTestInside
                  ? `Within Permitted Perimeter (${testDistance}m ≤ ${radiusMeters}m)`
                  : `Geofence Breach Detected (${testDistance}m > ${radiusMeters}m)`}
              </p>
              <p className="text-[11px] opacity-90">
                {isTestInside
                  ? `Intern attendance is verified. Distance is safely inside the hospital boundary.`
                  : `Exceeds configured perimeter by ${
                      testDistance - radiusMeters
                    }m. System triggers automated alert to Mentor & HOD.`}
              </p>
            </div>
          </div>
        </section>

        {/* Change Reason for Clinical Audit */}
        <section className="bg-surface border border-outline-variant/50 rounded-2xl p-4 shadow-sm space-y-2">
          <label htmlFor="input-geofence-reason" className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">assignment</span>
            Institutional Audit Reason:
          </label>
          <input
            id="input-geofence-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:outline-primary"
            placeholder="e.g. Ward boundary expansion for emergency rotation"
          />
          <p className="text-[10px] text-on-surface-variant">
            Changes will be permanently recorded in the Admin Activity Audit Trail under your credential.
          </p>
        </section>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            id="btn-apply-geofence"
            type="button"
            onClick={handleSaveGeofence}
            className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span>Apply & Enforce Geofence ({radiusMeters}m)</span>
          </button>

          <button
            id="btn-reset-geofence"
            type="button"
            onClick={handleReset}
            className="w-full py-2.5 px-4 rounded-xl border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>Reset to Hospital Default (150m)</span>
          </button>
        </div>
      </main>
    </div>
  );
};
