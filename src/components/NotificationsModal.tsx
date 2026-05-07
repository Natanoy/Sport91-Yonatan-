import { ChevronLeft, Bell, Trash2, CheckCircle2, XCircle, TrendingUp, Wallet, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { cn, formatCurrency } from '../lib/utils';
import { UserNotification } from '../types';

interface NotificationsModalProps {
  onClose: () => void;
  notifications: UserNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationsModal({ onClose, notifications, onMarkAsRead, onClearAll }: NotificationsModalProps) {
  const { t } = useLanguage();

  const getIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'deposit': return <Wallet className="w-5 h-5 text-emerald-500" />;
      case 'withdrawal_approved': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'withdrawal_rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'bet_success': return <Bell className="w-5 h-5 text-blue-500" />;
      case 'bet_won': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'bet_lost': return <Check className="w-5 h-5 text-amber-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    const timeA = a.timestamp?.seconds || 0;
    const timeB = b.timestamp?.seconds || 0;
    return timeB - timeA;
  });

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full h-full md:max-w-md md:h-[90vh] bg-brand-bg flex flex-col relative overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/5 rounded-xl text-emerald-500 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">
            Notificaciones
          </h1>
          <button 
            onClick={onClearAll}
            className="p-2.5 bg-white/5 rounded-xl text-red-500 active:scale-95 transition-transform"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4 pb-20">
          <AnimatePresence mode="popLayout">
            {sortedNotifications.length > 0 ? (
              sortedNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => !notification.read && onMarkAsRead(notification.id)}
                  className={cn(
                    "bg-brand-surface border border-white/5 rounded-3xl p-5 shadow-2xl relative transition-all active:scale-[0.98]",
                    !notification.read && "border-emerald-500/30 bg-emerald-500/5"
                  )}
                >
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white italic uppercase tracking-tighter truncate">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-bold leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.amount && (
                        <p className="text-sm font-black text-emerald-500 italic">
                          {formatCurrency(notification.amount)} USDT
                        </p>
                      )}
                      <p className="text-[10px] text-gray-700 font-mono uppercase tracking-widest pt-1">
                        {notification.timestamp?.toDate ? notification.timestamp.toDate().toLocaleString() : new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center pt-20 opacity-20">
                <Bell className="w-16 h-16 text-gray-500 mb-4" />
                <p className="text-sm font-black italic uppercase tracking-[0.2em]">No hay notificaciones</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
