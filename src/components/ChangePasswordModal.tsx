import { ChevronLeft, User, ShieldCheck, Lock, Eye, EyeOff, Info } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { cn } from '../lib/utils';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
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
            Cambiar la contraseña
          </h1>
          <div className="w-11" />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-12">
          {/* Hero Section */}
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white italic tracking-tighter leading-none">
              Restablecimiento de seguridad
            </h2>
            <p className="text-sm font-black text-gray-500 italic uppercase tracking-wider">
              Verifica tu cuenta para cambiar la contraseña.
            </p>
          </div>

          <div className="space-y-8">
            {/* User Input */}
            <div className="space-y-3">
              <label className="text-sm font-black text-white italic uppercase tracking-widest ml-1">Nombre de usuario o correo electrónico</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2">
                   <User className="w-5 h-5 text-emerald-500" />
                </div>
                <input 
                  type="text"
                  placeholder="Introduce tu nombre de usuario"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-5 py-5 text-white text-sm font-black italic placeholder:text-gray-700 focus:border-emerald-500/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* OTP Section */}
            <div className="space-y-3">
              <label className="text-sm font-black text-white italic uppercase tracking-widest ml-1">Código de verificación (Telegram)</label>
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <input 
                    type="text"
                    placeholder="Código OTP"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-5 py-5 text-white text-sm font-black italic placeholder:text-gray-700 focus:border-emerald-500/50 outline-none transition-all font-mono"
                  />
                </div>
                <button 
                  onClick={() => {
                    setIsSendingOtp(true);
                    setTimeout(() => setIsSendingOtp(false), 2000);
                  }}
                  disabled={isSendingOtp}
                  className="px-6 bg-transparent border border-emerald-500 text-emerald-500 rounded-2xl font-black italic text-xs uppercase tracking-tighter active:scale-95 transition-all disabled:opacity-50 hover:bg-emerald-500 hover:text-black"
                >
                  {isSendingOtp ? '...' : 'OBTENER CÓDIGO'}
                </button>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-3">
              <label className="text-sm font-black text-white italic uppercase tracking-widest ml-1">Nueva contraseña</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2">
                   <Lock className="w-5 h-5 text-emerald-500" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Introduce tu contraseña"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-14 py-5 text-white text-sm font-black italic placeholder:text-gray-700 focus:border-emerald-500/50 outline-none transition-all"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <button 
              className="w-full py-6 bg-emerald-500 text-black font-black italic text-xl uppercase tracking-widest rounded-3xl shadow-2xl shadow-emerald-500/30 active:scale-[0.98] transition-all"
            >
              CONFIRMAR NUEVA CONTRASEÑA
            </button>

            <div className="flex items-center justify-center gap-2 text-gray-600 opacity-60">
               <Info className="w-4 h-4" />
               <p className="text-[10px] font-black italic uppercase tracking-widest">Nunca compartas tu código con nadie.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
