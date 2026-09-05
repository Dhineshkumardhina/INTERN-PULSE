import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const MentorNotificationsScreen: React.FC = () => {
  const {
    mentorNotifications,
    markMentorNotificationAsRead,
    markAllMentorNotificationsAsRead,
    setCurrentScreen,
    setSelectedStudent,
    setSelectedAlert,
  } = useApp();

  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ALERTS'>('ALL');

  const getIconForType = (type: string) => {
    switch (type) {
      case 'NEEDS_ATTENTION_ALERT':
        return { icon: 'warning', color: 'text-error bg-error-container/20' };
      case 'MISSED_VERIFICATION':
        return { icon: 'timer_off', color: 'text-amber-700 bg-amber-500/10' };
      case 'SHIFT_ISSUE':
        return { icon: 'schedule', color: 'text-amber-700 bg-amber-500/10' };
      case 'CHECK_IN_ISSUE':
        return { icon: 'login', color: 'text-blue-600 bg-blue-500/10' };
      case 'CHECK_OUT_ISSUE':
        return { icon: 'logout', color: 'text-purple-600 bg-purple-500/10' };
      case 'STUDENT_CREATION':
        return { icon: 'how_to_reg', color: 'text-emerald-700 bg-emerald-500/15' };
      default:
        return { icon: 'notifications', color: 'text-primary bg-primary/10' };
    }
  };

  const filteredNotifs = mentorNotifications.filter((n) => {
    if (filter === 'UNREAD') return !n.is_read;
    if (filter === 'ALERTS') return n.type === 'NEEDS_ATTENTION_ALERT';
    return true;
  });

  const unreadCount = mentorNotifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = (notif: any) => {
    markMentorNotificationAsRead(notif.id);
    if (notif.alert_id) {
      setSelectedAlert(notif.alert_id);
      if (notif.student_register_number) {
        setSelectedStudent(notif.student_register_number);
      }
      setCurrentScreen('mentor_review_arun_kumar');
    } else if (notif.student_register_number) {
      setSelectedStudent(notif.student_register_number);
      setCurrentScreen('mentor_student_details');
    }
  };

  return (
    <div className="bg-background min-h-screen pb-28 font-body-md text-on-surface flex flex-col">
      <Header
        title="Mentor Notifications"
        showBack={true}
        onBack={() => setCurrentScreen('mentor_dashboard')}
      />

      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Faculty Alert Center
            </span>
            <h2 className="text-sm font-bold text-on-surface">
              {unreadCount > 0 ? `${unreadCount} Unread Alerts` : 'All Alerts Acknowledged'}
            </h2>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllMentorNotificationsAsRead}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 text-xs">
          {(['ALL', 'UNREAD', 'ALERTS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-full font-bold text-[11px] transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40'
              }`}
            >
              {tab === 'ALL'
                ? `All (${mentorNotifications.length})`
                : tab === 'UNREAD'
                ? `Unread (${unreadCount})`
                : 'Presence Alerts'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5">
          {filteredNotifs.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 text-center space-y-1">
              <span className="material-symbols-outlined text-outline-variant text-[28px]">
                notifications_off
              </span>
              <p className="text-xs text-on-surface-variant">No notifications matching selected filter.</p>
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const { icon, color } = getIconForType(notif.type);

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    notif.is_read
                      ? 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant'
                      : notif.type === 'NEEDS_ATTENTION_ALERT'
                      ? 'bg-error-container/10 border-error/40 shadow-2xs text-on-surface'
                      : 'bg-surface-container-low border-primary/30 shadow-2xs text-on-surface'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs leading-tight truncate ${
                            notif.is_read ? 'font-medium' : 'font-bold text-on-surface'
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-outline font-mono shrink-0">
                          {notif.time_display}
                        </span>
                      </div>

                      <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.alert_id && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-error">
                          <span>Click to review contextual shift timeline</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!notif.is_read && (
                    <div className="flex justify-end pt-0.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
