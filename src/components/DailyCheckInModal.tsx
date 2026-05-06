import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Star, CheckCircle2, Flame, Gift, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface DailyCheckInModalProps {
  onClose: () => void;
  profile: UserProfile | null;
  t: any;
}

export default function DailyCheckInModal({ onClose, profile, t }: DailyCheckInModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleClaim = async () => {
    if (!auth.currentUser || !canClaim || !profile) return;
    
    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      await updateDoc(userRef, {
        balance: increment(0.10),
        checkInStreak: increment(1),
        lastCheckInDate: nyTime,
        updatedAt: serverTimestamp()
      });

      // UI will update automatically via profile prop from App.tsx listener
    } catch (err) {
      setError('Error al reclamar la recompensa. Inténtalo de nuevo.');
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-[2100] bg-brand-bg flex flex-col">
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
        <button 
          onClick={onClose}
          className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5"
        >
          <ChevronLeft className="w-6 h-6 text-brand-primary" />
        </button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
          Registro diario
        </h2>
        <div className="w-12 h-12" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Progress Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-400/80 to-cyan-400/80 p-8 text-white shadow-xl">
           <div className="relative z-10 space-y-2">
              <p className="text-sm font-black opacity-80 uppercase">Bono de Asistencia</p>
              <h3 className="text-4xl font-black italic uppercase tracking-tighter">{streak} / 30 Días</h3>
              <div className="h-2 w-full bg-white/20 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(streak / 30) * 100}%` }}
                  className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              </div>
           </div>
           {/* Decoration */}
           <div className="absolute -top-4 -right-4 opacity-30 transform rotate-12 scale-150">
             <Gift className="w-32 h-32" />
           </div>
        </div>

        {/* Daily Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-xl font-black italic uppercase text-white">Recompensas diarias</h4>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Reclama tu recompensa diaria ahora</p>
            </div>
            <div className="flex items-center gap-2 bg-brand-surface border border-white/5 px-3 py-1.5 rounded-full">
              <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-black font-mono text-white tracking-tighter">{streak} Días Seguidos</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pb-24">
            {days.map((day) => {
              const isClaimed = day <= streak;
              const isCurrent = day === streak + 1 && canClaim;

              return (
                <div 
                  key={day}
                  className={cn(
                    "relative aspect-square rounded-[2rem] border transition-all flex flex-col items-center justify-center gap-2",
                    isClaimed 
                      ? "bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 border-emerald-400/30 text-emerald-400" 
                      : isCurrent
                        ? "bg-brand-surface border-brand-primary shadow-lg shadow-brand-primary/10 text-brand-primary"
                        : "bg-brand-surface border-white/5 text-gray-500 grayscale opacity-50"
                  )}
                >
                  <p className="text-[10px] font-black uppercase tracking-tighter">Día {day}</p>
                  <Star className={cn("w-8 h-8", isClaimed || isCurrent ? "fill-current" : "")} />
                  <p className="text-xs font-black italic">$0.10</p>
                  {isClaimed && (
                    <div className="absolute top-2 right-2">
                       <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="p-6 pb-12 bg-brand-bg/80 backdrop-blur-xl border-t border-white/5">
        <button
          onClick={handleClaim}
          disabled={!canClaim || loading}
          className={cn(
            "w-full py-5 rounded-[1.5rem] font-black italic uppercase tracking-tighter transition-all active:scale-95 shadow-xl",
            canClaim 
              ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-emerald-400/20 hover:brightness-110" 
              : "bg-white/5 text-gray-500 grayscale border border-white/10"
          )}
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin mx-auto" />
          ) : (
            canClaim ? "Reclamar 0.10 USDT" : "Ya Reclamado"
          )}
        </button>
      </div>
    </div>
  );
}
