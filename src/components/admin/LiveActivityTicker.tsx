import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, TrendingUp, UserPlus, CreditCard, Target, ShieldAlert } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { format } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'bet' | 'deposit' | 'withdrawal' | 'signup' | 'win' | 'security';
  title: string;
  subtitle: string;
  amount?: number;
  timestamp: any;
  status?: string;
  severity?: 'low' | 'medium' | 'high';
}

export default function LiveActivityTicker() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Escuchar múltiples colecciones para crear un feed unificado
    const unsubscibers: (() => void)[] = [];

    // 1. Apuestas
    const qBets = query(collection(db, 'bets'), orderBy('createdAt', 'desc'), limit(5));
    unsubscibers.push(onSnapshot(qBets, (snap) => {
      const dailyBets = snap.docs.map(doc => ({
        id: doc.id,
        type: 'bet' as const,
        title: 'Nueva Apuesta',
        subtitle: `${doc.data().homeTeam} vs ${doc.data().awayTeam}`,
        amount: doc.data().amount,
        timestamp: doc.data().createdAt,
      }));
      updateActivities(dailyBets);
    }));

    // 2. Depósitos
    const qDeps = query(collection(db, 'deposits'), orderBy('createdAt', 'desc'), limit(3));
    unsubscibers.push(onSnapshot(qDeps, (snap) => {
      const deps = snap.docs.map(doc => ({
        id: doc.id,
        type: 'deposit' as const,
        title: 'Depósito Detectado',
        subtitle: doc.data().userEmail || 'Usuario',
        amount: doc.data().amount,
        timestamp: doc.data().createdAt,
        status: doc.data().status
      }));
      updateActivities(deps);
    }));

    // 3. Usuarios (Signups)
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(3));
    unsubscibers.push(onSnapshot(qUsers, (snap) => {
      const users = snap.docs.map(doc => ({
        id: doc.id,
        type: 'signup' as const,
        title: 'Nuevo Registro',
        subtitle: doc.data().displayName,
        timestamp: doc.data().createdAt,
      }));
      updateActivities(users);
    }));

    return () => unsubscibers.forEach(unsub => unsub());
  }, []);

  const updateActivities = (newItems: ActivityItem[]) => {
    setActivities(prev => {
      const combined = [...newItems, ...prev];
      // Eliminar duplicados por ID y ordenar por tiempo descente
      const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      return unique
        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
        .slice(0, 15);
    });
  };

  return (
    <div className="bg-brand-surface border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-[500px] shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-12 bg-brand-primary/5 pointer-events-none" />
      
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_#dfff00]" />
            <h3 className="text-[10px] font-black text-white italic uppercase tracking-[0.2em]">Live Intelligence Feed</h3>
         </div>
         <TrendingUp className="w-3.5 h-3.5 text-brand-primary opacity-50" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
         <AnimatePresence initial={false}>
            {activities.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-30 p-12">
                  <Zap className="w-8 h-8 mb-4 animate-spin-slow text-brand-primary" />
                  <p className="text-[9px] font-mono leading-relaxed uppercase italic">Syncing with global clusters...<br/>Awaiting incoming packets</p>
               </div>
            ) : (
               <div className="divide-y divide-white/[0.03]">
                  {activities.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="py-5 flex items-center justify-between hover:bg-white/[0.01] transition-colors group"
                    >
                       <div className="flex items-center gap-4">
                          <div className={cn(
                             "p-2.5 rounded-xl border shadow-lg transition-transform group-hover:scale-110",
                             item.type === 'bet' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                             item.type === 'deposit' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                             item.type === 'signup' ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" :
                             "bg-red-500/10 border-red-500/20 text-red-500"
                          )}>
                             {item.type === 'bet' && <Target className="w-4 h-4" />}
                             {item.type === 'deposit' && <CreditCard className="w-4 h-4" />}
                             {item.type === 'signup' && <UserPlus className="w-4 h-4" />}
                             {item.type === 'security' && <ShieldAlert className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                             <p className="text-[10px] font-black text-white uppercase italic tracking-tight group-hover:text-brand-primary transition-colors">{item.title}</p>
                             <p className="text-[9px] text-gray-500 font-mono mt-0.5 truncate max-w-[140px] uppercase">{item.subtitle}</p>
                          </div>
                       </div>
                       
                       <div className="text-right">
                          {item.amount && (
                             <p className={cn(
                               "text-[10px] font-mono font-black",
                               item.type === 'deposit' ? "text-emerald-500" : "text-brand-primary"
                             )}>
                               {item.type === 'deposit' ? '+' : ''}{formatCurrency(item.amount)}
                             </p>
                          )}
                          <p className="text-[8px] text-gray-600 font-mono mt-1 italic">
                             {item.timestamp?.toDate ? format(item.timestamp.toDate(), 'HH:mm:ss') : 'LIVE'}
                          </p>
                       </div>
                    </motion.div>
                  ))}
               </div>
            )}
         </AnimatePresence>
      </div>
      
      <div className="p-4 bg-black/40 border-t border-white/5">
         <div className="flex items-center justify-between text-[8px] font-black text-gray-600 uppercase tracking-widest">
            <span>NETWORK LOAD</span>
            <span className="text-emerald-500">OPTIMAL</span>
         </div>
         <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <motion.div 
               animate={{ width: ['20%', '35%', '22%'] }}
               transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
               className="bg-brand-primary h-full shadow-[0_0_8px_#dfff00]"
            />
         </div>
      </div>
    </div>
  );
}
