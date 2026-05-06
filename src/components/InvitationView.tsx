import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import CommissionModal from './CommissionModal';
import TeamModal from './TeamModal';
import InviteModal from './InviteModal';
import { 
  RefreshCcw, 
  ChevronRight, 
  Users, 
  ClipboardList, 
  Gift, 
  UserPlus, 
  TrendingUp, 
  TrendingDown, 
  PieChart 
} from 'lucide-react';

interface InvitationViewProps {
  profile: UserProfile | null;
  t: any;
}

export default function InvitationView({ profile, t }: InvitationViewProps) {
  const [showCommission, setShowCommission] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <AnimatePresence>
        {showCommission && (
          <CommissionModal onClose={() => setShowCommission(false)} t={t} />
        )}
        {showTeam && (
          <TeamModal onClose={() => setShowTeam(false)} t={t} />
        )}
        {showInvite && (
          <InviteModal 
            onClose={() => setShowInvite(false)} 
            userId={profile?.uid || '00000000'} 
            t={t} 
          />
        )}
      </AnimatePresence>

      {/* Commission Card */}
      <div className="bg-brand-surface rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 space-y-8">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-500">
                 <span className="text-xs font-black uppercase tracking-[0.2em]">{t.pendingCommission}</span>
              </div>
              <button 
                onClick={() => setShowCommission(true)}
                className="flex items-center gap-1 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:translate-x-1 transition-transform"
              >
                 {t.details} <ChevronRight className="w-3 h-3" />
              </button>
           </div>

           <div className="flex justify-between items-end">
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black italic tracking-tighter text-white">
                   {formatCurrency(profile?.pendingCommission || 0)}
                 </span>
                 <span className="text-xs font-black text-brand-primary">USDT</span>
              </div>
              <button className="bg-brand-primary px-8 py-3 rounded-2xl text-[10px] font-black text-black uppercase tracking-[0.2em] shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">
                 {t.claim}
              </button>
           </div>

           <div className="h-px bg-white/5" />

           <div className="grid grid-cols-3 gap-4">
              <div>
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{t.totalRefund}</p>
                 <p className="text-sm font-black italic text-white">$ {formatCurrency(profile?.totalRefund || 0)}</p>
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{t.referralBonus}</p>
                 <p className="text-sm font-black italic text-white">$ {formatCurrency(profile?.referralBonus || 0)}</p>
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{t.transactionStatus}</p>
                 <p className={cn(
                    "text-sm font-black italic",
                    profile?.referralStatus === 'active' || !profile?.referralStatus ? "text-emerald-400" : "text-red-400"
                 )}>
                    {profile?.referralStatus === 'inactive' ? t.inactive : t.active}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
         <button 
          onClick={() => setShowTeam(true)}
          className="bg-brand-surface border border-white/5 rounded-3xl p-6 flex flex-col items-center gap-3 group hover:border-white/10 transition-all shadow-xl"
         >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-black transition-all">
               <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{t.myTeam}</span>
         </button>
         
         <button 
          onClick={() => setShowCommission(true)}
          className="bg-brand-surface border border-white/5 rounded-3xl p-6 flex flex-col items-center gap-3 group hover:border-white/10 transition-all shadow-xl"
         >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-black transition-all">
               <ClipboardList className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{t.teamCommission}</span>
         </button>

         <button 
          onClick={() => setShowInvite(true)}
          className="bg-brand-surface border border-white/5 rounded-3xl p-6 flex flex-col items-center gap-3 group hover:border-white/10 transition-all shadow-xl"
         >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-black transition-all">
               <Gift className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">{t.invite}</span>
         </button>
      </div>

      {/* Daily Performance */}
      <div className="space-y-4">
         <h3 className="text-xl font-black italic uppercase tracking-tighter text-white px-2">
           {t.dailyPerformance}
         </h3>
         
         <div className="grid grid-cols-2 gap-4">
            {[
              { icon: UserPlus, label: t.newRegistered, value: profile?.dailyNewUsers || 0, color: 'text-brand-primary', iconColor: 'text-emerald-500' },
              { icon: TrendingUp, label: t.teamDeposits, value: `$ ${formatCurrency(profile?.dailyTeamDeposits || 0)}`, color: 'text-emerald-400', iconColor: 'text-emerald-500' },
              { icon: TrendingDown, label: t.teamWithdrawals, value: `$ ${formatCurrency(profile?.dailyTeamWithdrawals || 0)}`, color: 'text-red-400', iconColor: 'text-red-500' },
              { icon: PieChart, label: t.commission, value: `$ ${formatCurrency(profile?.dailyCommission || 0)}`, color: 'text-brand-primary', iconColor: 'text-purple-500' }
            ].map((stat, i) => (stat && (
              <div key={i} className="bg-brand-surface border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <stat.icon className={StatIconClass(stat.iconColor)} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                    <p className={cn("text-xl font-black italic tracking-tighter", stat.color)}>{stat.value}</p>
                 </div>
              </div>
            )))}
         </div>
      </div>

      {/* Hierarchy Levels */}
      <div className="space-y-4">
         <h3 className="text-xl font-black italic uppercase tracking-tighter text-white px-2">
           {t.hierarchyLevels}
         </h3>
         <div className="bg-brand-surface border border-white/5 rounded-3xl p-8 flex items-center justify-center shadow-xl">
            <div className="text-center opacity-20">
               <Users className="w-16 h-16 mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">Cargando niveles...</p>
            </div>
         </div>
      </div>
    </motion.div>
  );
}

function StatIconClass(color: string) {
  return cn("w-5 h-5", color);
}
