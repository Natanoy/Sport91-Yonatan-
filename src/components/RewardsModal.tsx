import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Gift, Flame, Wallet, Trophy, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import DailyCheckInModal from './DailyCheckInModal';

import { UserProfile } from '../types';

interface RewardsModalProps {
  onClose: () => void;
  onDeposit: () => void;
  onBet: () => void;
  profile: UserProfile | null;
  t: any;
}

export default function RewardsModal({ onClose, onDeposit, onBet, profile, t }: RewardsModalProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'unique'>('daily');
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);

  const streak = profile?.checkInStreak || 0;
  const lastClaim = profile?.lastCheckInDate;

  // Check if can claim (NY Time 12:00 AM reset)
  const now = new Date();
  const nyTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  const canClaim = !lastClaim || lastClaim !== nyTime;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-brand-bg flex flex-col">
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5"
          >
            <ChevronLeft className="w-6 h-6 text-brand-primary" />
          </button>
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
            Centro de recompensas...
          </h2>
          <div className="w-12 h-12" /> {/* Spacer */}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tabs */}
          <div className="flex bg-brand-surface p-1.5 rounded-[1.5rem] border border-white/5">
            <button
              onClick={() => setActiveTab('daily')}
              className={cn(
                "flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                activeTab === 'daily' ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20" : "text-gray-500"
              )}
            >
              Recompensas diarias
            </button>
            <button
              onClick={() => setActiveTab('unique')}
              className={cn(
                "flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                activeTab === 'unique' ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20" : "text-gray-500 transition-all"
              )}
            >
              Recompensas Únicas
            </button>
          </div>

          {/* Daily Rewards Grid */}
          <div className="space-y-4 pb-12">
            {/* Daily Check-in */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-400/80 to-cyan-400/80 p-8 text-white shadow-xl">
              <div className="relative z-10 space-y-4">
                <p className="text-sm font-black opacity-80">+$0.10 - $1.00 USDT</p>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Registro diario</h3>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span className="text-xs font-bold font-mono tracking-tighter text-white">{streak} Días Seguidos</span>
                </div>
                
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(streak / 30) * 100}%` }}
                      className="h-full bg-white" 
                    />
                  </div>
                  <p className="text-right text-[10px] font-black italic uppercase">{streak}/30 Días</p>
                </div>

                <button 
                  onClick={() => setShowDailyCheckIn(true)}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black italic uppercase tracking-tighter border transition-all",
                    canClaim 
                      ? "bg-white/30 backdrop-blur-md text-white border-white/20 hover:bg-white/40" 
                      : "bg-black/20 text-white/50 border-white/5 cursor-default"
                  )}
                >
                  {canClaim ? "Continuar" : "Ya Reclamado"}
                </button>
              </div>
              {/* Background Decoration */}
              <div className="absolute top-4 right-4 opacity-40">
                <Gift className="w-32 h-32 rotate-12" />
              </div>
            </div>

            {/* Today's Deposit */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-400/80 to-pink-400/80 p-8 text-white shadow-xl">
              <div className="relative z-10 space-y-4">
                <p className="text-sm font-black opacity-80">6 Premios</p>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Depósito de hoy</h3>
                
                <div className="bg-black/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black italic">$1.00</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold">0/50</span>
                    <button 
                      onClick={onDeposit}
                      className="bg-white/20 hover:bg-white/30 border border-white/40 px-4 py-2 rounded-xl text-xs font-black italic uppercase tracking-tighter transition-all"
                    >
                      Depósito
                    </button>
                  </div>
                </div>

                <button className="w-full bg-white/20 border border-white/20 py-4 rounded-2xl font-black italic uppercase tracking-tighter">
                  Ver detalles
                </button>
              </div>
              {/* Background Decoration */}
              <div className="absolute top-4 right-4 opacity-40">
                <div className="relative">
                  <div className="w-32 h-32 bg-white/10 rounded-full blur-3xl absolute -inset-4" />
                  <Trophy className="w-32 h-32 -rotate-12" />
                </div>
              </div>
            </div>

            {/* Daily Betting Flow */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-400/80 to-emerald-400/80 p-8 text-white shadow-xl">
              <div className="relative z-10 space-y-4">
                <p className="text-sm font-black opacity-80">6 Premios</p>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">Flujo de apuestas diario</h3>
                
                <div className="bg-black/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-black italic">$0.10</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold">0/50</span>
                    <button 
                      onClick={onBet}
                      className="bg-brand-primary/30 hover:bg-brand-primary/40 border border-brand-primary/40 px-4 py-2 rounded-xl text-xs font-black italic uppercase tracking-tighter transition-all text-brand-primary"
                    >
                      bet
                    </button>
                  </div>
                </div>
              </div>
              {/* Background Decoration */}
              <div className="absolute top-4 right-4 opacity-40">
                <Wallet className="w-32 h-32 rotate-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDailyCheckIn && (
          <DailyCheckInModal 
            onClose={() => setShowDailyCheckIn(false)} 
            profile={profile}
            t={t}
          />
        )}
      </AnimatePresence>
    </>
  );
}
