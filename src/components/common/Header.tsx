import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title = 'InternTrack', showBack = false, onBack, actionButton }) => {
  const { currentUser, currentScreen, setCurrentScreen, switchRoleQuickly, logout, hospitalGeofence, studentNotifications } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);

  const unreadNotifsCount = studentNotifications.filter((n) => !n.is_read).length;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (currentUser?.role === 'STUDENT') {
        setCurrentScreen('student_dashboard');
      } else if (currentUser?.role === 'MENTOR') {
        setCurrentScreen('mentor_dashboard');
      } else if (currentUser?.role === 'HOD') {
        setCurrentScreen('hod_dashboard');
      } else if (currentUser?.role === 'ADMIN') {
        setCurrentScreen('admin_dashboard');
      }
    }
  };

  const handleSwitchRole = (role: UserRole) => {
    switchRoleQuickly(role);
    setShowRoleMenu(false);
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-outline-variant/50 px-3.5 h-14 flex items-center justify-between shadow-2xs"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-1.5">
        {showBack && (
          <button
            id="header-back-button"
            onClick={handleBack}
            className="p-1.5 -ml-1 text-on-surface hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Go Back"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        )}

        <div
          className="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
          onClick={() => {
            if (currentUser?.role === 'STUDENT') setCurrentScreen('student_dashboard');
            else if (currentUser?.role === 'MENTOR') setCurrentScreen('mentor_dashboard');
            else if (currentUser?.role === 'HOD') setCurrentScreen('hod_dashboard');
            else if (currentUser?.role === 'ADMIN') setCurrentScreen('admin_dashboard');
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-[19px]">local_hospital</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-display-id text-sm font-bold text-on-surface tracking-tight truncate">
                {title}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                AHS
              </span>
            </div>
            <div className="text-[10px] text-on-surface-variant truncate">
              {currentUser?.name ? `${currentUser.name} • ${currentUser.role}` : 'Clinical Monitoring'}
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 shrink-0 relative">
        {actionButton}

        {/* Student Notifications Bell */}
        {currentUser?.role === 'STUDENT' && (
          <button
            id="header-student-notifications-btn"
            onClick={() => setCurrentScreen('student_notifications')}
            title="Internship Notifications"
            className="relative p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-full transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadNotifsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-on-primary rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        )}

        {/* Clickable Geofence Perimeter Badge (Mentor, HOD, and Admin only) */}
        {currentUser?.role !== 'STUDENT' && (
          <button
            id="header-geofence-badge"
            onClick={() => setCurrentScreen('geofence_setup')}
            title="Configure Hospital Geofence Perimeter"
            className="flex items-center gap-1 bg-surface-container-high hover:bg-surface-container-highest px-2 py-1 rounded-full border border-outline-variant/60 cursor-pointer transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[14px] text-primary">share_location</span>
            <span className="text-[10px] font-bold text-on-surface">{hospitalGeofence.radius_meters}m</span>
          </button>
        )}

        <button
          id="header-profile-menu-button"
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className="flex items-center gap-1.5 p-1 pl-2 bg-surface-container-low hover:bg-surface-container rounded-full border border-outline-variant/40 transition-colors cursor-pointer"
        >
          <span className="text-[11px] font-bold text-primary max-w-[80px] truncate hidden sm:inline">
            {currentUser?.name?.split(' ')[0] || currentUser?.role}
          </span>
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-outline-variant"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[11px]">
              {currentUser?.role?.substring(0, 2) || 'IT'}
            </div>
          )}
          <span className="material-symbols-outlined text-[16px] text-outline">
            {showRoleMenu ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {/* User Dropdown Menu */}
        {showRoleMenu && (
          <div className="absolute right-0 top-12 w-60 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-2 border-b border-outline-variant/30 mb-1">
              <div className="text-xs font-bold text-on-surface truncate">{currentUser?.name}</div>
              <div className="text-[10px] text-primary font-mono font-bold mt-0.5">
                {currentUser?.role === 'STUDENT' ? `Register No: ${currentUser.registerNumber || '23UCCT001'}` : currentUser?.department}
              </div>
              {currentUser?.role === 'STUDENT' && (
                <div className="text-[10px] text-on-surface-variant truncate mt-0.5">
                  {hospitalGeofence.name}
                </div>
              )}
            </div>

            {/* Student Personal Navigation in Menu */}
            {currentUser?.role === 'STUDENT' ? (
              <div className="space-y-0.5">
                <button
                  id="menu-student-profile"
                  onClick={() => {
                    setShowRoleMenu(false);
                    setCurrentScreen('student_profile');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-container text-on-surface flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
                  <span>Internship Profile</span>
                </button>
                <button
                  id="menu-student-attendance"
                  onClick={() => {
                    setShowRoleMenu(false);
                    setCurrentScreen('student_attendance');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-container text-on-surface flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">event_available</span>
                  <span>Attendance History</span>
                </button>
                <button
                  id="menu-student-notifications"
                  onClick={() => {
                    setShowRoleMenu(false);
                    setCurrentScreen('student_notifications');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-container text-on-surface flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">notifications</span>
                    <span>Notifications</span>
                  </div>
                  {unreadNotifsCount > 0 && (
                    <span className="text-[10px] font-bold bg-primary text-on-primary px-1.5 py-0.2 rounded-full">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <>
                <div className="text-[10px] uppercase font-bold text-outline-variant px-2.5 py-1">
                  Switch Active Role
                </div>

                <div className="space-y-0.5">
                  {(['STUDENT', 'MENTOR', 'HOD', 'ADMIN'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleSwitchRole(role)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        currentUser?.role === role
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <span className="capitalize">{role.toLowerCase()} Portal</span>
                      {currentUser?.role === role && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="border-t border-outline-variant/30 mt-1.5 pt-1 space-y-1">
              {currentUser?.role !== 'STUDENT' && (
                <button
                  id="header-menu-geofence"
                  onClick={() => {
                    setShowRoleMenu(false);
                    setCurrentScreen('geofence_setup');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">share_location</span>
                    <span>Hospital Geofence</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono bg-primary/20 px-1.5 py-0.2 rounded">
                    {hospitalGeofence.radius_meters}m
                  </span>
                </button>
              )}

              <button
                id="header-logout-button"
                onClick={() => {
                  setShowRoleMenu(false);
                  logout();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-error hover:bg-error-container/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
