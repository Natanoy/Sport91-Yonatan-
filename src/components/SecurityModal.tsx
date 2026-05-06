import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Shield, Bell, Gift, Send, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SecurityModalProps {
  onClose: () => void;
  telegramUsername?: string;
  t: any;
}

export default function SecurityModal({ onClose, telegramUsername = "@Matty_Trader", t }: SecurityModalProps) {
  const benefits = [
    {
      icon: Shield,
      title: "Código OTP para retiros",
      description: "Cada retiro requiere un código único que se envía a tu cuenta de Telegram.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      icon: Bell,
      title: "Notificaciones instantáneas",
      description: "Reciba notificaciones inmediatas sobre inicios de sesión y depósitos.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      icon: Gift,
      title: "Recompensas exclusivas",
      description: "Acceso a códigos de bonificación privados exclusivos para Telegram.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    }
  ];

  return (
    <div className="fixed inset-0 z-[2100] bg-brand-bg flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        <button 
          onClick={onClose}
          className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Centro de seguridad</h2>
        <div className="w-12" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 pb-32">
        {/* Verification Status */}
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="relative">
            <div className="w-40 h-40 rounded-full border-2 border-emerald-500/50 flex items-center justify-center bg-black/20 relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Send className="w-16 h-16 text-white translate-x-[-2px] translate-y-[2px]" />
              </div>
              {/* Verified Badge */}
              <div className="absolute bottom-2 right-2 bg-emerald-500 rounded-full p-1 border-4 border-brand-bg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl -z-10" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Cuenta verificada</h3>
            <p className="text-gray-400 text-sm max-w-[280px] leading-relaxed mx-auto">
              Su cuenta está totalmente protegida contra el acceso no autorizado.
            </p>
          </div>
        </div>

        {/* Linked Account Card */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Cuenta de Telegram Vinculada</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-emerald-400 italic">{telegramUsername}</span>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Activo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 pb-4">
            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest">Beneficios de seguridad</h4>
          </div>
          
          <div className="divide-y divide-white/5">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx} 
                className="w-full flex gap-6 p-8 transition-all text-left"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", benefit.bg)}>
                  <benefit.icon className={cn("w-6 h-6", benefit.color)} />
                </div>
                <div className="flex-1 space-y-1">
                  <h5 className="text-lg font-black text-white italic uppercase tracking-tighter">{benefit.title}</h5>
                  <p className="text-gray-400 text-xs leading-relaxed pr-8">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="p-6 bg-brand-bg/80 backdrop-blur-xl border-t border-white/5 shrink-0">
        <button 
          className="w-full h-16 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] bg-emerald-500/5"
          onClick={() => window.open('https://t.me/your_bot', '_blank')}
        >
          <span className="text-lg font-black text-emerald-500 uppercase italic tracking-tighter">
            Ir al Bot de Telegram
          </span>
        </button>
      </div>
    </div>
  );
}
