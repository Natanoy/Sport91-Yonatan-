import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Sparkles, Box, Lock, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

interface LuckyBoxModalProps {
  onClose: () => void;
  profile: UserProfile | null;
  t: any;
}

export default function LuckyBoxModal({ onClose, profile, t }: LuckyBoxModalProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const COOLDOWN_HOURS = 48;
  const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

  useEffect(() => {
    const timer = setInterval(() => {
      if (!profile?.lastLuckyBoxClaim) {
        setTimeLeft(null);
        return;
      }

      const lastClaim = new Date(profile.lastLuckyBoxClaim).getTime();
      const nextClaim = lastClaim + COOLDOWN_MS;
      const now = new Date().getTime();
      const diff = nextClaim - now;

      if (diff <= 0) {
        setTimeLeft(null);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [profile?.lastLuckyBoxClaim]);

  const handleOpen = async () => {
    if (timeLeft || isOpening || reward) return;
    if (!auth.currentUser || !profile) return;

    if ((profile.totalDeposits || 0) < 200) {
      setError("Necesitas haber depositado más de 200 USDT para abrir esta caja.");
      return;
    }

    setIsOpening(true);
    setError(null);

    try {
      // Reward: 5% of the 200 USDT threshold = 10 USDT + 1 Lottery Ticket
      const rebateAmount = 10; 
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        balance: increment(rebateAmount),
        lotteryTickets: increment(1),
        lastLuckyBoxClaim: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });

      setReward(rebateAmount);
    } catch (err) {
      console.error(err);
      setError("Error al abrir la caja. Inténtalo de nuevo.");
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    } finally {
      setIsOpening(false);
    }
  };

  const isLocked = timeLeft !== null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-gradient-to-b from-red-900 to-black border border-red-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)] p-8"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center hover:bg-white/10 transition-all z-20 border border-white/10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="text-center space-y-6 relative z-10">
          <div className="relative">
            <div className={cn(
              "absolute inset-0 blur-[60px] opacity-40 animate-pulse transition-colors",
              reward ? "bg-yellow-400" : "bg-red-600"
            )} />
            <motion.div
              animate={isOpening ? { 
                rotate: [-8, 8, -8],
                scale: [1, 1.15, 1],
                filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
              } : { 
                y: [-8, 8, -8]
              }}
              transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex justify-center"
            >
              <img 
                src={reward ? "https://img.icons8.com/isometric/250/open-box.png" : "https://img.icons8.com/isometric/250/treasure-chest.png"} 
                className={cn(
                  "w-56 h-56 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all",
                  isLocked && "grayscale contrast-125 opacity-40"
                )} 
                alt="Lucky Box"
              />
              {isLocked && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div className="bg-black/60 backdrop-blur-md p-4 rounded-full border border-white/20">
                      <Lock className="w-10 h-10 text-yellow-400" />
                   </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="space-y-2">
            <motion.h2 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 drop-shadow-sm"
            >
              {reward ? "¡NIVEL PREMIO!" : "LUCKY BOX"}
            </motion.h2>
            <p className="text-gray-300 font-bold px-4 leading-tight text-sm">
              {reward 
                ? `¡Felicidades! Has reclamado tu beneficio exclusivo.` 
                : `Deposita más de 200 USDT para desbloquear 5% REEMBOLSO + TICKET LOTERÍA cada 48h.`}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-500 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="pt-4">
            {reward ? (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500 text-black p-4 rounded-3xl font-black italic shadow-xl">
                    <div className="text-[10px] uppercase tracking-widest opacity-70">REEMBOLSO</div>
                    <div className="text-2xl">+{reward.toFixed(2)}</div>
                  </div>
                  <div className="bg-yellow-400 text-black p-4 rounded-3xl font-black italic shadow-xl">
                    <div className="text-[10px] uppercase tracking-widest opacity-70">TICKETS</div>
                    <div className="text-2xl">+1</div>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-full h-16 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-white transition-all"
                >
                  Continuar
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {isLocked ? (
                  <div className="space-y-4 text-center">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-inner">
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">PRÓXIMA APERTURA EN</p>
                       <p className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-mono tracking-tighter">
                         {timeLeft}
                       </p>
                    </div>
                    <button 
                      disabled
                      className="w-full h-16 bg-white/5 rounded-2xl font-black uppercase tracking-widest text-gray-600 cursor-not-allowed border border-white/5"
                    >
                      BLOQUEADO
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleOpen}
                    disabled={isOpening}
                    className="w-full h-20 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-[length:200%_auto] animate-gradient-x hover:brightness-125 rounded-3xl font-black uppercase tracking-[0.2em] text-white transition-all shadow-[0_10px_30px_rgba(220,38,38,0.4)] active:scale-95 group flex flex-col items-center justify-center"
                  >
                    {isOpening ? (
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                           <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                           <span className="text-xl">ABRIR CAJA</span>
                        </div>
                        <span className="text-[9px] opacity-70 tracking-widest mt-1">RECLAMAR REEMBOLSO + TICKET</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
             <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-brand-primary" />
                <span>5% Devolución</span>
             </div>
             <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-brand-primary" />
                <span>Ticket Lotería</span>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
