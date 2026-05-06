import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ArrowUpToLine, 
  ArrowDownToLine, 
  Copy, 
  Gift,
  Shield,
  Wallet,
  Settings,
  CalendarCheck,
  Trophy,
  Users,
  Bell,
  History,
  UserPlus,
  Headphones,
  Info,
  ListTodo
} from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile | null;
  t: any;
  onVipClick: () => void;
  onBetHistoryClick: () => void;
  onSupportClick: () => void;
  onInviteClick: () => void;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
  onLogout: () => void;
}

export default function ProfileView({ 
  profile, 
  t, 
  onVipClick, 
  onBetHistoryClick, 
  onSupportClick,
  onInviteClick,
  onDepositClick,
  onWithdrawClick,
  onLogout
}: ProfileViewProps) {
  const [showBalance, setShowBalance] = useState(true);
  const referralLink = `https://sport91fc.com?ref=${profile?.uid?.slice(0, 8) || '000000'}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const services = [
    { icon: Gift, label: t.prizes, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { icon: Shield, label: t.security, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: Wallet, label: t.wallet, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { icon: Settings, label: t.settings, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { icon: CalendarCheck, label: t.checkIn, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { icon: Trophy, label: t.results, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { icon: Users, label: t.myTeam, color: 'text-brand-primary', bg: 'bg-brand-primary/10', onClick: () => {} },
    { icon: Bell, label: t.notifications, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: History, label: t.history, color: 'text-emerald-500', bg: 'bg-emerald-500/10', onClick: onBetHistoryClick },
    { icon: UserPlus, label: t.invite, color: 'text-brand-primary', bg: 'bg-brand-primary/10', onClick: onInviteClick },
    { icon: Headphones, label: t.support, color: 'text-cyan-500', bg: 'bg-cyan-500/10', onClick: onSupportClick },
    { icon: Info, label: t.aboutUs, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4 pb-20"
    >
      {/* Header Profile Info */}
      <div className="flex items-center gap-3 px-2">
         <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-brand-primary/30 p-1 bg-gradient-to-tr from-brand-primary/20 to-transparent">
               <div className="w-full h-full rounded-full bg-brand-surface border border-white/10 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://img.icons8.com/isometric/100/football.png" 
                    alt="avatar" 
                    className="w-12 h-12" 
                    referrerPolicy="no-referrer"
                  />
               </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white/10 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/20">
               <span className="text-[10px] font-black italic text-brand-primary">VIP{profile?.vipLevel || 0}</span>
            </div>
         </div>
         <div className="flex-1">
            <div className="flex items-center gap-2">
               <h2 className="text-xl font-black text-white italic">{profile?.displayName || 'Guest'}</h2>
               <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                  <span className="text-[8px] font-black text-brand-primary italic">VIP{profile?.vipLevel || 0}</span>
               </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-xs font-bold text-gray-500">ID: {profile?.uid?.slice(0, 6).toUpperCase() || '000000'}</span>
               <button onClick={() => copyToClipboard(profile?.uid || '')} className="text-emerald-500 hover:text-emerald-400">
                  <Copy className="w-3 h-3" />
               </button>
            </div>
         </div>
         <button className="bg-white/5 border border-white/10 rounded-full px-3 py-1 flex items-center gap-2">
            <span className="text-[10px] font-bold text-white">ES</span>
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
         </button>
      </div>

      {/* Wallet/Balance Card */}
      <div className="bg-brand-surface rounded-[2rem] p-6 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
         <div className="relative z-10 space-y-6 sm:space-y-8">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{t.availableBalance}</span>
                  <button onClick={() => setShowBalance(!showBalance)} className="text-gray-500 hover:text-white transition-colors">
                     {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
               </div>
               <button className="flex items-center gap-1 text-[9px] font-black text-brand-primary uppercase tracking-widest hover:translate-x-1 transition-transform">
                  {t.details} <ChevronRight className="w-3 h-3" />
               </button>
            </div>

            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-white">
                 {showBalance ? formatCurrency(profile?.balance || 0) : '••••••'}
               </h3>
               <span className="text-xs font-black text-brand-primary">USDT</span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-white/5">
               <div>
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{t.unliquidated}</p>
                  <p className="text-xs sm:text-sm font-black italic text-white">{showBalance ? formatCurrency(profile?.unliquidated || 0) : '0.00'}</p>
               </div>
               <div>
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{t.todayProfit}</p>
                  <p className="text-xs sm:text-sm font-black italic text-white">{showBalance ? formatCurrency(profile?.todayProfit || 0) : '0.00'}</p>
               </div>
               <div>
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">{t.weeklyProfit}</p>
                  <p className="text-xs sm:text-sm font-black italic text-white">{showBalance ? formatCurrency(profile?.weeklyProfit || 0) : '0.00'}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
         <button 
           onClick={onDepositClick}
           className="bg-brand-surface border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col items-center gap-2 sm:gap-3 shadow-xl hover:border-white/10 active:scale-95 transition-all group"
         >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-black transition-all">
               <ArrowUpToLine className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white">{t.deposit}</span>
         </button>
         <button 
           onClick={onWithdrawClick}
           className="bg-brand-surface border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col items-center gap-2 sm:gap-3 shadow-xl hover:border-white/10 active:scale-95 transition-all group"
         >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-black transition-all">
               <ArrowDownToLine className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white">{t.withdraw}</span>
         </button>
      </div>

      {/* Referral Banner */}
      <div className="bg-brand-surface border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
         </div>
         <div className="absolute right-0 top-0 h-full w-48 bg-gradient-to-l from-brand-primary/10 to-transparent pointer-events-none" />
         
         <div className="flex items-center gap-6 relative z-10">
            <div className="relative flex-shrink-0">
               <div className="absolute inset-0 bg-brand-primary blur-3xl opacity-30" />
               <motion.img 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [-3, 3, -3]
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                  src="https://img.icons8.com/isometric/200/gift.png" 
                  alt="gift" 
                  className="w-20 h-20 relative drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" 
                  referrerPolicy="no-referrer" 
               />
            </div>
            <div className="flex-1 min-w-0">
               <div className="space-y-1 mb-4">
                  <span className="bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border border-brand-primary/20 italic">PROMOCIÓN</span>
                  <p className="text-sm font-black text-white italic tracking-tighter leading-tight">
                    {t.referralPromo}
                  </p>
               </div>
               
               <div className="flex items-center gap-1">
                  <div className="flex-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center px-4 h-9 overflow-hidden">
                     <span className="text-[10px] text-gray-500 truncate font-mono">{referralLink}</span>
                  </div>
                  <button 
                     onClick={() => copyToClipboard(referralLink)}
                     className="bg-brand-primary px-4 h-9 rounded-xl text-[10px] font-black text-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg"
                  >
                     {t.copy}
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* Intermediate Cards */}
      <div className="grid grid-cols-2 gap-4">
         <button 
           onClick={onVipClick}
           className="bg-brand-surface border border-white/5 rounded-3xl p-5 flex items-center justify-between shadow-xl group hover:border-white/10 transition-all"
         >
            <div className="text-left">
               <p className="text-[11px] font-black text-white italic uppercase tracking-tighter mb-0.5">{t.vipCenter}</p>
               <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{t.viewBenefits}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/10 transition-all">
               <motion.img 
                 animate={{ rotate: [0, 360] }}
                 transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                 src="https://img.icons8.com/isometric/100/diamond.png" 
                 alt="vip" 
                 className="w-6 h-6" 
               />
            </div>
         </button>
         <button 
           onClick={onBetHistoryClick}
           className="bg-brand-surface border border-white/5 rounded-3xl p-5 flex items-center justify-between shadow-xl group hover:border-white/10 transition-all"
         >
            <div className="text-left">
               <p className="text-[11px] font-black text-white italic uppercase tracking-tighter mb-0.5">{t.myOrders}</p>
               <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{t.history}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/10 transition-all">
               <ListTodo className="w-6 h-6 text-emerald-500" />
            </div>
         </button>
      </div>

      {/* "Mis Servicios" (My Services) Grid */}
      <div className="bg-brand-surface border border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-2xl space-y-6 sm:space-y-8">
         <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-white">{t.myServices}</h3>
         <div className="grid grid-cols-4 gap-y-6 sm:gap-y-10">
            {services.map((service, i) => (
              <button 
                key={i} 
                onClick={service.onClick}
                className="flex flex-col items-center gap-2 sm:gap-3 group active:scale-95 transition-all"
              >
                 <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-all transform group-hover:-translate-y-1",
                    service.bg
                 )}>
                    <service.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", service.color)} />
                 </div>
                 <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors text-center px-1">
                   {service.label}
                 </span>
              </button>
            ))}
         </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={onLogout}
        className="w-full bg-red-500/10 border border-red-500/20 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] shadow-lg shadow-red-500/5 mb-8"
      >
        {t.logout}
      </button>
    </motion.div>
  );
}
