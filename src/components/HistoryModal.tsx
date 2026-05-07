import { X, ChevronLeft, RotateCcw, Calendar, Search, FileText, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface HistoryModalProps {
  onClose: () => void;
  profile: UserProfile | null;
}

type HistoryTab = 'apuestas' | 'deposito' | 'retirar' | 'recompensas';

export default function HistoryModal({ onClose, profile }: HistoryModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<HistoryTab>('apuestas');
  const [status, setStatus] = useState('Todo');
  const [dateFilter, setDateFilter] = useState('Todas las fechas');

  const tabs: { id: HistoryTab; label: string }[] = [
    { id: 'apuestas', label: 'Apuestas' },
    { id: 'deposito', label: 'Depósito' },
    { id: 'retirar', label: 'Retirar' },
    { id: 'recompensas', label: 'Recompensas' },
  ];

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full h-full md:max-w-md md:h-[90vh] bg-brand-bg flex flex-col relative overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/5 rounded-xl text-emerald-500 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">
            Historia
          </h1>
          <button className="p-2.5 bg-white/5 rounded-xl text-gray-400 active:rotate-180 transition-transform duration-500">
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-white/5 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-4 text-sm font-black italic uppercase tracking-widest whitespace-nowrap transition-all relative",
                activeTab === tab.id ? "text-white" : "text-gray-600"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabHistory"
                  className="absolute bottom-0 left-4 right-4 h-1 bg-emerald-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-brand-bg px-2 text-[10px] font-black italic text-gray-500 uppercase tracking-widest z-10">Estado</label>
              <button className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex items-center justify-between text-white text-sm font-black italic">
                {status}
                <ChevronDown className="w-4 h-4 text-emerald-500" />
              </button>
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-brand-bg px-2 text-[10px] font-black italic text-gray-500 uppercase tracking-widest z-10">Fecha</label>
              <button className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex items-center justify-between text-white text-sm font-black italic text-left">
                <span className="truncate">{dateFilter}</span>
                <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter pt-2">
            Historial de {activeTab === 'apuestas' ? 'apuestas' : activeTab}
          </h2>

          {/* Empty State */}
          <div className="flex-1 flex flex-col items-center justify-center pt-20 sm:pt-32 opacity-30">
            <div className="relative w-48 h-48 mb-8">
              <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative">
                   <FileText className="w-32 h-32 text-gray-400 stroke-1" />
                   <div className="absolute bottom-0 right-0 p-4 bg-brand-bg rounded-2xl border border-white/10 translate-x-4 translate-y-4">
                     <Search className="w-12 h-12 text-gray-500" />
                   </div>
                </div>
              </div>
            </div>
            <p className="text-sm font-black italic text-gray-500 uppercase tracking-[0.2em]">
              No se encontraron registros
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
