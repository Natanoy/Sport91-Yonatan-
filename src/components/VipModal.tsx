import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, HelpCircle, Gift, ArrowUpCircle, Percent, Wallet } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { UserProfile } from '../types';

interface VipModalProps {
  onClose: () => void;
  profile: UserProfile | null;
  t: any;
}

const VIP_LEVELS = [
  { level: 0, deposit: 0, bet: 0, bonus: 0, limit: 10, fee: 50, color: 'text-gray-400', bg: 'bg-gray-400' },
  { level: 1, deposit: 30, bet: 300, bonus: 1, limit: 10, fee: 10, color: 'text-orange-400', bg: 'bg-orange-400' },
  { level: 2, deposit: 100, bet: 1500, bonus: 5, limit: 20, fee: 8, color: 'text-slate-300', bg: 'bg-slate-300' },
  { level: 3, deposit: 300, bet: 3000, bonus: 15, limit: 60, fee: 5, color: 'text-amber-400', bg: 'bg-amber-400' },
  { level: 4, deposit: 1000, bet: 10000, bonus: 50, limit: 200, fee: 5, color: 'text-blue-400', bg: 'bg-blue-400' },
  { level: 5, deposit: 3000, bet: 30000, bonus: 150, limit: 600, fee: 5, color: 'text-purple-400', bg: 'bg-purple-400' },
  { level: 6, deposit: 6000, bet: 60000, bonus: 300, limit: 1200, fee: 5, color: 'text-cyan-400', bg: 'bg-cyan-400' },
  { level: 7, deposit: 10000, bet: 100000, bonus: 500, limit: 2000, fee: 5, color: 'text-brand-primary', bg: 'bg-brand-primary' },
];

export default function VipModal({ onClose, profile, t }: VipModalProps) {
  const currentVipLevel = profile?.vipLevel || 0;
  const [viewingLevel, setViewingLevel] = useState(currentVipLevel);
  
  const currentLevelData = VIP_LEVELS[viewingLevel];
  const nextLevelData = VIP_LEVELS[viewingLevel + 1];

  const totalDeposits = profile?.totalDeposits || 0;
  const totalBets = profile?.totalBets || 0;

  const depositProgress = nextLevelData 
    ? Math.min(100, (totalDeposits / nextLevelData.deposit) * 100) 
    : 100;
  
  const betProgress = nextLevelData 
    ? Math.min(100, (totalBets / nextLevelData.bet) * 100) 
    : 100;

  return (
    <div className="fixed inset-0 z-[100] bg-brand-bg flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        <button 
          onClick={onClose}
          className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5"
        >
          <ChevronLeft className="w-6 h-6 text-brand-primary" />
        </button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
          Nivel VIP
        </h2>
        <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
          <HelpCircle className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32">
        {/* VIP Level Arc Visualization */}
        <div className="relative pt-10 pb-12 px-4 overflow-x-auto no-scrollbar">
           {/* Arc */}
           <div className="absolute top-1/2 left-0 right-0 h-[300px] border-[2px] border-white/5 rounded-[50%] -translate-y-1/3 pointer-events-none" />
           
           <div className="flex justify-between items-end relative h-20 min-w-[400px]">
             {VIP_LEVELS.map((v) => (
               <button 
                key={v.level} 
                onClick={() => setViewingLevel(v.level)}
                className="flex flex-col items-center gap-2 group relative z-10"
               >
                 <span className={cn(
                   "text-[8px] font-black uppercase tracking-widest transition-all",
                   v.level === viewingLevel ? "text-brand-primary font-bold scale-110" : "text-gray-600",
                   v.level <= currentVipLevel && v.level !== viewingLevel ? "text-emerald-500" : ""
                 )}>
                   VIP{v.level}
                 </span>
                 <div className={cn(
                   "w-3 h-3 rounded-full transition-all duration-300",
                   v.level === viewingLevel ? "bg-brand-primary shadow-[0_0_15px_#ccff00] scale-125" : 
                   v.level <= currentVipLevel ? "bg-emerald-500" : "bg-white/10"
                 )} />
               </button>
             ))}
           </div>
        </div>

        {/* Level Stats */}
        <div className="flex bg-brand-surface rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <div className="flex-1 p-5 border-r border-white/5 flex flex-col items-center">
            <span className="text-brand-primary font-black italic flex items-center gap-1 text-base">
              {formatCurrency(totalDeposits)} <span className="text-[10px]">USDT</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">DEPÓSITO VÁLIDO</span>
          </div>
          <div className="flex-1 p-5 flex flex-col items-center">
            <span className="text-brand-primary font-black italic flex items-center gap-1 text-base">
              {formatCurrency(totalBets)} <span className="text-[10px]">USDT</span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">APUESTA VÁLIDA</span>
          </div>
        </div>

        {/* Current Level Status Card */}
        <div className="relative touch-none">
          <AnimatePresence mode="wait">
            <motion.div 
              key={viewingLevel}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                const swipeThreshold = 50;
                if (info.offset.x < -swipeThreshold && viewingLevel < VIP_LEVELS.length - 1) {
                  setViewingLevel(prev => prev + 1);
                } else if (info.offset.x > swipeThreshold && viewingLevel > 0) {
                  setViewingLevel(prev => prev - 1);
                }
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              whileTap={{ cursor: 'grabbing' }}
              className="bg-brand-surface rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group shadow-2xl cursor-grab active:cursor-grabbing"
            >
              <div className="relative z-10 space-y-7 pointer-events-none select-none">
                 <div className="flex items-baseline gap-2">
                   <h3 className="text-6xl font-black italic uppercase tracking-tighter text-white">VIP{viewingLevel}</h3>
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
                     {viewingLevel === currentVipLevel ? 'Nivel Actual' : viewingLevel < currentVipLevel ? 'Completado' : 'Próximo Nivel'}
                   </span>
                 </div>

                 <div className="space-y-4">
                    {/* Deposit Progress */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span className="text-gray-500">Depósito Requerido</span>
                        <span className="text-white/80">{nextLevelData ? `V${nextLevelData.level}` : 'MAX'}</span>
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${depositProgress}%` }}
                          className={cn("h-full", currentLevelData.bg)}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold font-mono text-gray-600">
                        <span>{formatCurrency(totalDeposits)} / {formatCurrency(nextLevelData?.deposit || currentLevelData.deposit)} USDT</span>
                      </div>
                    </div>

                    {/* Betting Progress */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span className="text-gray-500">Progreso de Apuesta</span>
                        <span className="text-brand-primary">{nextLevelData ? `V${nextLevelData.level}` : 'MAX'}</span>
                      </div>
                      <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${betProgress}%` }}
                          className={cn("h-full opacity-80", currentLevelData.bg)}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold font-mono text-gray-600">
                        <span>{formatCurrency(totalBets)} / {formatCurrency(nextLevelData?.bet || currentLevelData.bet)} USDT</span>
                      </div>
                    </div>
                 </div>

                 <div 
                    className={cn(
                      "w-full mt-4 py-4 rounded-2xl text-[10px] font-black italic uppercase tracking-[0.2em] transition-all flex justify-center items-center",
                      viewingLevel <= currentVipLevel 
                        ? "bg-white/5 text-white/50 border border-white/10" 
                        : "bg-black/30 text-gray-600 border border-white/5"
                    )}
                  >
                   {viewingLevel <= currentVipLevel ? 'Obtenido' : 'Bloqueado'}
                 </div>
              </div>

              {/* Level Badge Overlay */}
              <div className="absolute top-6 right-6 pointer-events-none select-none">
                 <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className={cn("absolute inset-0 rounded-full opacity-20 blur-xl animate-pulse", currentLevelData.bg)} />
                    <img 
                      src="https://img.icons8.com/isometric/100/diamond.png" 
                      alt="vip" 
                      className="w-16 h-16 relative z-10" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute -top-1 -right-1 bg-white/10 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/20 text-[10px] font-black">
                       V{viewingLevel}
                    </div>
                 </div>
              </div>
              
              {/* Drag Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 items-center opacity-30">
                <div className="w-4 h-1 bg-white/20 rounded-full" />
                <div className="w-8 h-1 bg-brand-primary rounded-full" />
                <div className="w-4 h-1 bg-white/20 rounded-full" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Privileges */}
        <div className="space-y-5">
           <div className="flex items-center gap-4">
             <div className="h-px flex-1 bg-white/5" />
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">PRIVILEGIOS VIP {viewingLevel}</h4>
             <div className="h-px flex-1 bg-white/5" />
           </div>

           <div className="space-y-3.5">
              {[
                { icon: Gift, label: 'Bono de Nivel', value: `${formatCurrency(currentLevelData.bonus)} USDT`, color: 'text-emerald-400' },
                { icon: ArrowUpCircle, label: 'Límite Diario Retiro', value: `${formatCurrency(currentLevelData.limit)} USDT`, color: 'text-brand-primary' },
                { icon: Percent, label: 'Comisión Retiro', value: `${currentLevelData.fee}%`, color: viewingLevel <= 3 ? 'text-emerald-400' : 'text-brand-primary' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-brand-surface border border-white/5 rounded-2xl group active:scale-[0.98] transition-all shadow-lg hover:border-white/10">
                  <div className="flex items-center gap-5">
                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/10 transition-all">
                       <item.icon className="w-5 h-5 text-gray-400 group-hover:text-brand-primary" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.1em] text-gray-300">{item.label}</span>
                  </div>
                  <span className={cn("text-xs font-black italic", item.color)}>{item.value}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
