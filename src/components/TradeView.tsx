import React from 'react';
import { motion } from 'motion/react';
import { Bet } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Search, Dice5 } from 'lucide-react';

interface TradeViewProps {
  bets: Bet[];
  t: any;
}

export default function TradeView({ bets, t }: TradeViewProps) {
  const openBets = bets.filter(b => b.status === 'pending');
  
  const totalAmount = openBets.reduce((acc, b) => acc + b.amount, 0);
  const totalProfit = openBets.reduce((acc, b) => acc + (b.amount * b.roi / 100), 0);
  const totalReturn = totalAmount + totalProfit;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Stats */}
      <div className="relative bg-brand-surface rounded-[2.5rem] p-8 border border-white/5 shadow-2xl overflow-hidden min-h-[220px]">
        {/* Goal Background Decor */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none translate-y-4">
           <svg viewBox="0 0 400 200" className="w-[80%] h-auto fill-none stroke-white" strokeWidth="2">
              {/* Goal frame */}
              <path d="M 50,180 L 50,40 Q 50,30 60,30 L 340,30 Q 350,30 350,40 L 350,180" />
              {/* Net horizontal lines */}
              {[45, 60, 75, 90, 105, 120, 135, 150, 165].map(y => (
                <line key={y} x1={50} y1={y} x2={350} y2={y} strokeOpacity="0.5" strokeDasharray="2 4" />
              ))}
              {/* Net vertical lines */}
              {[70, 90, 110, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310, 330].map(x => (
                <line key={x} x1={x} y1={30} x2={x} y2={180} strokeOpacity="0.5" strokeDasharray="2 4" />
              ))}
              {/* Ball */}
              <circle cx="200" cy="150" r="15" fill="none" strokeWidth="1" />
              <path d="M 190,140 Q 200,150 210,140" />
              <path d="M 190,160 Q 200,150 210,160" />
              <path d="M 185,150 L 215,150" />
           </svg>
        </div>

        <div className="relative z-10 space-y-6">
           <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{t.tradeOperation}</p>
              <h2 className="text-4xl font-black italic tracking-tighter text-white">
                $ {formatCurrency(totalAmount)}
              </h2>
           </div>

           <div className="flex gap-12">
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{t.estimatedProfit}</p>
                 <p className="text-2xl font-black italic tracking-tighter text-white">
                   $ {formatCurrency(totalProfit)}
                 </p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{t.estimatedReturn}</p>
                 <p className="text-2xl font-black italic tracking-tighter text-white">
                   $ {formatCurrency(totalReturn)}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-brand-surface rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden min-h-[400px]">
         <div className="p-8 border-b border-white/5">
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{t.openTransactions}</h3>
         </div>

         {openBets.length > 0 ? (
            <div className="p-6 space-y-4">
               {openBets.map((bet) => (
                  <div key={bet.id} className="bg-black/20 rounded-3xl p-5 border border-white/5 flex flex-col gap-3 group hover:border-brand-primary/30 transition-all">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">{bet.homeTeam} VS {bet.awayTeam}</p>
                           <p className="text-xs font-bold text-gray-400">Anti-Score: <span className="text-white">{bet.selectedScore}</span></p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">ROI</p>
                           <p className="text-sm font-black italic text-brand-primary">{bet.roi.toFixed(2)}%</p>
                        </div>
                     </div>

                     <div className="h-px bg-white/5" />

                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">MONTO</p>
                           <p className="text-base font-black italic text-white">$ {formatCurrency(bet.amount)}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">GANANCIA EST.</p>
                           <p className="text-base font-black italic text-emerald-400">$ {formatCurrency(bet.amount * bet.roi / 100)}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-black/5 h-full">
               <div className="w-48 h-48 mb-8 opacity-10 relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-white">
                     <path d="M7 21v-3m0-15v3m10 12v3m0-15v3m-3.5 1.5l3.5 3.5m-3.5 0l3.5-3.5m-10 10l3.5 3.5m-3.5 0l3.5-3.5" />
                     <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
               </div>
               <p className="text-lg font-black italic uppercase tracking-widest text-gray-600">{t.noActiveTransactions}</p>
            </div>
         )}
      </div>
    </motion.div>
  );
}
