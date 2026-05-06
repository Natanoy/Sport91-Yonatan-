import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Users, UserPlus, TrendingUp, Search } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

interface TeamModalProps {
  onClose: () => void;
  t: any;
}

const LEVELS = [
  { id: '1', label: 'Nivel 1' },
  { id: '2', label: 'Nivel 2' },
  { id: '3', label: 'Nivel 3' },
];

export default function TeamModal({ onClose, t }: TeamModalProps) {
  const [activeLevel, setActiveLevel] = useState('1');

  return (
    <motion.div 
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[110] bg-brand-bg flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8 border-b border-white/5">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group active:scale-90 transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-emerald-500" />
        </button>
        <h2 className="text-xl font-black uppercase tracking-widest text-white">{t.myTeam}</h2>
        <div className="w-10" />
      </div>

      {/* Levels Tabs */}
      <div className="flex border-b border-white/5 px-4">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => setActiveLevel(level.id)}
            className="flex-1 py-6 relative flex flex-col items-center group"
          >
            <span className={cn(
              "text-xs font-black uppercase tracking-widest transition-colors",
              activeLevel === level.id ? "text-brand-primary" : "text-gray-500 group-hover:text-gray-300"
            )}>
              {level.label}
            </span>
            {activeLevel === level.id && (
              <motion.div 
                layoutId="activeTeamLevel"
                className="absolute bottom-0 w-12 h-1 bg-brand-primary rounded-full shadow-[0_0_10px_#ccff00]"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por ID..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-brand-primary/50 transition-all"
          />
        </div>

        {/* Level Summary */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-brand-surface border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                 <UserPlus className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">REGISTRADOS</p>
                 <p className="text-2xl font-black italic tracking-tighter text-white">0</p>
              </div>
           </div>
           <div className="bg-brand-surface border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                 <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">DEPÓSITOS</p>
                 <p className="text-2xl font-black italic tracking-tighter text-brand-primary">$ 0.00</p>
              </div>
           </div>
        </div>

        {/* Empty List */}
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-black/5 rounded-[2.5rem] border border-white/5 border-dashed">
           <Users className="w-16 h-16 text-white/5 mb-6" />
           <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-600">
             No hay miembros en este nivel
           </p>
        </div>
      </div>
    </motion.div>
  );
}
