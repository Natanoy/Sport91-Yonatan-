import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Target, 
  Activity, 
  Trophy, 
  AlertCircle, 
  Lock, 
  Unlock,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  TrendingUp,
  History
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Bet } from '../../types';

export default function BettingManager() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState({
    activeBets: 0,
    totalAtRisk: 0,
    potentialLoss: 0,
    highRiskCount: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'bets'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const betData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Bet));
      setBets(betData);
      
      const active = betData.filter(b => b.status === 'pending');
      setStats({
        activeBets: active.length,
        totalAtRisk: active.reduce((acc, b) => acc + b.amount, 0),
        potentialLoss: active.reduce((acc, b) => acc + (b.amount * (1 + b.roi/100)), 0),
        highRiskCount: active.filter(b => b.amount > 500).length
      });
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-8">
       {/* Metrics Bar */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <RiskMetric label="Órdenes Activas" value={stats.activeBets} color="blue" icon={Activity} />
          <RiskMetric label="Capital en Juego" value={formatCurrency(stats.totalAtRisk)} color="emerald" icon={TrendingUp} />
          <RiskMetric label="Exposición Máxima" value={formatCurrency(stats.potentialLoss)} color="amber" icon={Target} />
          <RiskMetric label="Alertas de Riesgo" value={stats.highRiskCount} color="red" icon={ShieldAlert} />
       </div>

       {/* Detailed Bet Table */}
       <div className="bg-brand-surface border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
             <div>
                <h3 className="text-lg font-black text-white italic uppercase flex items-center gap-2">
                   <Trophy className="w-5 h-5 text-brand-primary" />
                   Monitor de Apuestas Deportivas
                </h3>
                <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">Control de exposición y liquidación</p>
             </div>
             
             <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 uppercase hover:text-white transition-colors">
                   <Filter className="w-3 h-3" />
                   Filtrar Riesgo
                </button>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-white/[0.02]">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Evento / Mercado</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Monto / ROI</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Probabilidad Casa</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Liquidar</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {bets.slice(0, 15).map(bet => (
                      <tr key={bet.id} className="hover:bg-white/[0.01] transition-colors group">
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <p className="text-[11px] font-black text-white uppercase italic">{bet.homeTeam} vs {bet.awayTeam}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-black text-brand-primary uppercase bg-brand-primary/10 px-1.5 py-0.5 rounded">Anti {bet.selectedScore}</span>
                                  <span className="text-[9px] text-gray-500 font-mono italic">#{bet.id.slice(0, 6)}</span>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <p className="text-xs font-mono font-black text-white">{formatCurrency(bet.amount)}</p>
                            <p className="text-[9px] text-emerald-500 font-mono font-black">+{bet.roi}% ROI</p>
                         </td>
                         <td className="px-6 py-4">
                            <div className="w-24 bg-white/5 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-emerald-500 h-full" style={{ width: '92%' }} />
                            </div>
                            <p className="text-[8px] text-emerald-500 font-black uppercase mt-1">Seguridad: 92%</p>
                         </td>
                         <td className="px-6 py-4">
                            <span className={cn(
                               "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                               bet.status === 'pending' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                               bet.status === 'won' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                               "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                               {bet.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => console.log('View user', bet.userId)}
                                 className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                               >
                                  <Eye className="w-4 h-4" />
                               </button>
                               <button 
                                 className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                               >
                                  <XCircle className="w-4 h-4" />
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       {/* House Advantage Control */}
       <div className="bg-brand-surface border border-brand-primary/10 rounded-[2.5rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[120px] -z-10" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="max-w-md">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2 flex items-center gap-2">
                   <ShieldAlert className="w-6 h-6 text-brand-primary" />
                   Control de Ventaja Algorítmica
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                   Ajuste global de beneficios proyectados para bots y trading de alta frecuencia. 
                   Valores superiores a x1.5 reducen drásticamente el riesgo de exposición.
                </p>
             </div>
             
             <div className="flex flex-col items-center gap-4 bg-black/40 p-8 rounded-[2rem] border border-white/5 w-full md:w-auto min-w-[240px]">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Multiplicador Global</p>
                <span className="text-4xl font-black text-brand-primary italic">x1.24</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                   <div className="bg-brand-primary h-full w-[45%]" />
                </div>
                <button className="w-full py-3 bg-brand-primary text-black text-[10px] font-black uppercase rounded-xl mt-4 hover:shadow-lg shadow-brand-primary/20 transition-all">
                   Actualizar Algoritmo
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

function RiskMetric({ label, value, color, icon: Icon }: any) {
  return (
    <div className="bg-brand-surface border border-white/5 p-6 rounded-3xl group">
       <div className="flex items-center gap-4 mb-4">
          <div className={cn(
             "p-2.5 rounded-xl",
             color === 'blue' ? "bg-blue-500/10 text-blue-500" :
             color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
             color === 'amber' ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
          )}>
             <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">{label}</span>
       </div>
       <p className="text-xl font-mono font-black text-white">{value}</p>
    </div>
  );
}
