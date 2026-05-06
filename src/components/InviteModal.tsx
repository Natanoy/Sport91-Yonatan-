import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Copy, QrCode, Share2, Link, UserPlus, TrendingUp, Gift } from 'lucide-react';
import { cn } from '../lib/utils';

interface InviteModalProps {
  onClose: () => void;
  userId: string;
  t: any;
}

export default function InviteModal({ onClose, userId, t }: InviteModalProps) {
  const referralLink = `${window.location.origin}?ref=${userId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    // You could add a toast notification here
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[110] bg-brand-bg flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8 border-b border-white/5">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group active:scale-90 transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-emerald-500" />
        </button>
        <h2 className="text-xl font-black uppercase tracking-widest text-white">{t.invite}</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 flex flex-col items-center text-center pb-32">
         {/* QR Code Container */}
         <div className="w-full max-w-[280px] bg-white p-8 rounded-[3rem] shadow-[0_0_50px_rgba(204,255,0,0.15)] relative">
            <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-black/5">
               <QrCode className="w-[80%] h-[80%] text-black opacity-80" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-brand-primary px-6 py-2 rounded-full shadow-lg">
               <span className="text-[10px] font-black italic uppercase text-black">CÓDIGO: {userId.slice(0, 8).toUpperCase()}</span>
            </div>
         </div>

         <div className="space-y-2">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">¡Invita a tus amigos!</h3>
            <p className="text-sm font-bold text-gray-500">Comparte tu link y gana comisiones por cada depósito.</p>
         </div>

         {/* Promo Banner */}
         <div className="w-full bg-brand-primary/10 border border-brand-primary/20 rounded-[2rem] p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-primary/5 animate-pulse" />
            <div className="relative z-10 flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center shadow-[0_0_20px_#ccff0033]">
                  <Gift className="w-6 h-6 text-black" />
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">PROMOCIÓN ESPECIAL</p>
                  <p className="text-sm font-black italic text-white uppercase tracking-tighter">
                     Gana <span className="text-brand-primary">0.10 USDT</span> por cada usuario referido
                  </p>
               </div>
            </div>
         </div>

         {/* Link Input */}
         <div className="w-full space-y-4">
            <div className="bg-brand-surface border border-white/10 rounded-[2rem] p-4 flex items-center gap-4 group">
               <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Link className="w-5 h-5 text-gray-500" />
               </div>
               <div className="flex-1 text-left overflow-hidden">
                  <p className="text-[9px] font-black text-gray-500 tracking-widest uppercase mb-0.5">TU LINK DE REFERIDO</p>
                  <p className="text-xs font-bold text-white truncate opacity-60">{referralLink}</p>
               </div>
               <button 
                  onClick={copyToClipboard}
                  className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center hover:bg-brand-primary hover:text-black transition-all active:scale-90"
               >
                  <Copy className="w-5 h-5" />
               </button>
            </div>

            <button 
               onClick={async () => {
                  if (navigator.share) {
                     try {
                        await navigator.share({
                           title: t.inviteTitle || 'Únete a Sport91 FC',
                           text: t.inviteText || 'Regístrate usando mi link de referido!',
                           url: referralLink,
                        });
                     } catch (err) {
                        if (err instanceof Error && err.name !== 'AbortError') {
                           console.error("Share failed:", err);
                        }
                     }
                  }
               }}
               className="w-full bg-white/5 border border-white/10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
            >
               <Share2 className="w-4 h-4 text-brand-primary" />
               MÁS OPCIONES
            </button>
         </div>

         {/* Steps */}
         <div className="grid grid-cols-3 gap-4 w-full pt-4">
            {[
               { icon: UserPlus, label: 'REGISTRO' },
               { icon: TrendingUp, label: 'DEPÓSITO' },
               { icon: Gift, label: 'PREMIO' }
            ].map((step, i) => (
               <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center relative">
                     <step.icon className="w-5 h-5 text-gray-400" />
                     <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-primary text-[10px] font-black text-black flex items-center justify-center">
                        {i + 1}
                     </div>
                  </div>
                  <span className="text-[8px] font-black text-gray-500 tracking-widest">{step.label}</span>
               </div>
            ))}
         </div>
      </div>
    </motion.div>
  );
}
