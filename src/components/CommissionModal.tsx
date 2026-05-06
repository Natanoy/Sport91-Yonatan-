import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RefreshCcw, Filter, Calendar, FileSearch } from 'lucide-react';
import { cn } from '../lib/utils';

interface CommissionModalProps {
  onClose: () => void;
  t: any;
}

export default function CommissionModal({ onClose, t }: CommissionModalProps) {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: t.all },
    { id: 'level1', label: t.level1 },
    { id: 'level2', label: t.level2 },
    { id: 'level3', label: t.level3 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-brand-bg flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8 border-b border-white/5">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group active:scale-90 transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-emerald-500" />
        </button>
        <h2 className="text-xl font-black uppercase tracking-widest text-white">{t.commission}</h2>
        <div className="w-10" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-6 relative flex flex-col items-center gap-1 group"
          >
            <span className={cn(
              "text-xs font-black uppercase tracking-widest transition-colors",
              activeTab === tab.id ? "text-white" : "text-gray-500 group-hover:text-gray-300"
            )}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabCommission"
                className="absolute bottom-0 w-12 h-1 bg-brand-primary rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 px-6 py-6">
         <button className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all">
            <div className="text-left">
               <p className="text-[9px] font-black text-gray-500 tracking-widest mb-0.5">{t.filterState}</p>
               <p className="text-[11px] font-black text-white uppercase tracking-widest">{t.all}S</p>
            </div>
            <Filter className="w-4 h-4 text-emerald-500" />
         </button>
         <button className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all">
            <div className="text-left">
               <p className="text-[9px] font-black text-gray-500 tracking-widest mb-0.5">{t.filterDate}</p>
               <p className="text-[11px] font-black text-white uppercase tracking-widest">{t.all}</p>
            </div>
            <Calendar className="w-4 h-4 text-emerald-500" />
         </button>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center pb-32">
         <div className="relative w-48 h-48 opacity-10 mb-8">
            <div className="absolute inset-0 bg-brand-primary/20 blur-[100px] rounded-full" />
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               {/* Document icon similar to the screenshot */}
               <path d="M 25,15 L 60,15 L 75,30 L 75,85 L 25,85 Z" />
               <path d="M 60,15 L 60,30 L 75,30" />
               <line x1="35" y1="40" x2="65" y2="40" />
               <line x1="35" y1="55" x2="65" y2="55" />
               <line x1="35" y1="70" x2="55" y2="70" />
               {/* Magnifying glass */}
               <circle cx="65" cy="65" r="15" className="fill-white/20" />
               <line x1="75" y1="75" x2="85" y2="85" strokeWidth="4" />
            </svg>
         </div>
         <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-600 line-clamp-2 max-w-xs mx-auto">
            {t.noRecords}
         </p>
      </div>
    </motion.div>
  );
}
