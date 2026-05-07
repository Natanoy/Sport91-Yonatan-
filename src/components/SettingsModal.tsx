import { ChevronLeft, User, Mail, QrCode, Copy, Lock, Send, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';
import ChangePasswordModal from './ChangePasswordModal';

interface SettingsModalProps {
  onClose: () => void;
  profile: UserProfile | null;
  onLogout: () => void;
}

export default function SettingsModal({ onClose, profile, onLogout }: SettingsModalProps) {
  const { t } = useLanguage();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const invitationCode = profile?.uid?.slice(0, 6).toUpperCase() || 'CCB764';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-[2400] flex items-center justify-center bg-black/95 backdrop-blur-xl">
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
            Configuraciones de I...
          </h1>
          <div className="w-11" />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-12">
          {/* Profile Header */}
          <div className="flex flex-col items-center gap-6 pt-4">
             <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-brand-primary p-1.5 bg-gradient-to-tr from-brand-primary/20 to-transparent">
                   <div className="w-full h-full rounded-full bg-brand-surface border-4 border-white/10 flex items-center justify-center overflow-hidden">
                      <img 
                        src="https://img.icons8.com/isometric/200/football.png" 
                        alt="avatar" 
                        className="w-24 h-24" 
                        referrerPolicy="no-referrer"
                      />
                   </div>
                </div>
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-brand-primary rounded-full border-2 border-brand-bg" />
             </div>
             <h2 className="text-4xl font-black text-white italic tracking-tighter leading-none">
                {profile?.displayName || 'yonatan00'}
             </h2>
          </div>

          <div className="space-y-12">
            {/* Account Details */}
            <div className="space-y-6">
               <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] ml-1">Detalles de la cuenta</h3>
               <div className="bg-brand-surface border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                  {/* Item: Username */}
                  <div className="flex items-center gap-5 p-2">
                     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-emerald-500">
                        <User className="w-6 h-6" />
                     </div>
                     <div className="flex-1 min-w-0 border-b border-white/5 pb-2">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Nombre de usuario</p>
                        <p className="text-base font-black text-white italic truncate">{profile?.displayName || 'yonatan00'}</p>
                     </div>
                  </div>

                  {/* Item: Email */}
                  <div className="flex items-center gap-5 p-2">
                     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-emerald-500">
                        <Mail className="w-6 h-6" />
                     </div>
                     <div className="flex-1 min-w-0 border-b border-white/5 pb-2">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Dirección de correo electrónico</p>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-black text-white italic truncate">
                             {profile?.email || 'No está vinculado'}
                          </p>
                          {profile?.email && <span className="text-emerald-500 text-sm">✅</span>}
                        </div>
                     </div>
                  </div>

                  {/* Item: Invite Code */}
                  <div className="flex items-center gap-5 p-2">
                     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-emerald-500">
                        <QrCode className="w-6 h-6" />
                     </div>
                     <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Código de invitación</p>
                           <p className="text-base font-black text-white italic">{invitationCode}</p>
                        </div>
                        <button 
                           onClick={() => copyToClipboard(invitationCode)}
                           className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-500 active:scale-95 transition-all"
                        >
                           <Copy className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Security & Society */}
            <div className="space-y-6">
               <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] ml-1">Seguridad y sociedad</h3>
               <div className="bg-brand-surface border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                  <button 
                    onClick={() => setShowChangePassword(true)}
                    className="w-full flex items-center gap-5 p-2 group active:scale-[0.98] transition-all"
                  >
                     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                        <Lock className="w-6 h-6" />
                     </div>
                     <div className="flex-1 min-w-0 flex items-center justify-between border-b border-white/5 pb-2">
                        <p className="text-[15px] font-black text-white italic uppercase tracking-tighter">Cambiar la contraseña</p>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                     </div>
                  </button>

                  <div className="w-full flex items-center gap-5 p-2">
                     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-emerald-500">
                        <Send className="w-6 h-6" />
                     </div>
                     <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div>
                           <p className="text-[15px] font-black text-white italic uppercase tracking-tighter">ID de Telegram</p>
                           <p className="text-[10px] font-black text-gray-600 font-mono italic">1796954378</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <button 
              onClick={onLogout}
              className="w-full py-6 bg-red-500/10 border border-red-500/20 text-red-500 font-black italic text-lg uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
            >
              <LogOut className="w-6 h-6" />
              Finalizar la sesión
            </button>

            <p className="text-center text-[10px] font-black text-gray-700 uppercase tracking-widest italic pt-4">
              Capítulo 1.0.4 (2026)
            </p>
          </div>
        </div>

        <AnimatePresence>
          {showChangePassword && (
            <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
