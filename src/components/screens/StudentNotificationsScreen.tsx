import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const StudentNotificationsScreen: React.FC = () => {
  const {
    studentNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setCurrentScreen,
  } = useApp();

  const getIconForType = (type: string) => {
    switch (type) {
      case 'SHIFT_REMINDER':
        return { icon: 'alarm', color: 'text-secondary bg-secondary/10' };
      case 'VERIFICATION_REQUIRED':
        return { icon: 'share_location', color: 'text-primary bg-primary/10' };
      case 'VERIFICATION_RESULT':
        return { icon: 'verified', color: 'text-emerald-600 bg-emerald-500/10' };
      case 'MENTOR_REVIEW':
        return { icon: 'clinical_notes', color: 'text-blue-600 bg-blue-500/10' };
      case 'ATTENDANCE_UPDATE':
        return { icon: 'event_available', color: 'text-purple-600 bg-purple-500/10' };
      case 'SHIFT_COMPLETED':
        return { icon: 'task_alt', color: 'text-emerald-700 bg-emerald-600/15' };
      default:
        return { icon: 'notifications', color: 'text-primary bg-primary/10' };
    }
  };

  const unreadCount = studentNotifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex-1 flex flex-col pb-28 min-h-screen bg-background text-on-surface">
      <Header title="Notifications" showBack onBack={() => setCurrentScreen('student_dashboard')} />

      <main className="p-3.5 space-y-3 flex-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Internship Updates
            </span>
            <h2 className="text-sm font-bold text-on-surface">
              {unreadCount > 0 ? `${unreadCount} Unread Notifications` : 'All Caught Up'}
            </h2>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {studentNotifications.map((notif) => {
            const { icon, color } = getIconForType(notif.type);
            return (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  notif.is_read
                    ? 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant'
                    : 'bg-surface-container-low border-primary/30 shadow-2xs text-on-surface'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className={`text-xs leading-tight truncate ${notif.is_read ? 'font-medium' : 'font-bold text-on-surface'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] text-outline font-mono shrink-0">
                        {notif.time_display}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {!notif.is_read && (
                  <div className="flex justify-end pt-1">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
