import { ChevronLeft, Search, ChevronDown, Trophy } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { cn, getTeamLogo } from '../lib/utils';
import { Match, Bet } from '../types';

interface ResultsModalProps {
  onClose: () => void;
  matches: Match[];
  bets: Bet[];
}

type ResultTab = 'TODO' | 'VIVIR' | 'ÉXITO' | 'CANCELADO';

export default function ResultsModal({ onClose, matches, bets }: ResultsModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ResultTab>('TODO');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('Todas las ligas');

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const matchesSearch = 
        match.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.id.includes(searchQuery);
      
      const matchesLeague = selectedLeague === 'Todas las ligas' || match.league === selectedLeague;
      
      if (!matchesSearch || !matchesLeague) return false;

      // Logic for each tab
      if (activeTab === 'VIVIR') {
        // Only matches currently in progress
        return match.status === 'live';
      }
      
      if (activeTab === 'ÉXITO') {
        // Matches the user has bet on that are currently playing (live) and bet is still pending
        return match.status === 'live' && bets.some(b => b.matchId === match.id && b.status === 'pending');
      }
      
      if (activeTab === 'CANCELADO') {
        // Matches where the user's bet was canceled
        return bets.some(b => b.matchId === match.id && b.status === 'canceled');
      }
      
      // 'TODO' tab shows all matches
      return true;
    });
  }, [matches, bets, searchQuery, selectedLeague, activeTab]);

  const tabs: ResultTab[] = ['TODO', 'VIVIR', 'ÉXITO', 'CANCELADO'];

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center bg-black/95 backdrop-blur-xl">
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
            Resultado
          </h1>
          <div className="w-11" />
        </div>

        {/* Filters */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-[1fr,auto] gap-3">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter whitespace-nowrap">IDENTIFICACIÓN</span>
                 <div className="w-px h-3 bg-white/10" />
              </div>
              <input 
                type="text"
                placeholder="Partido, equipo o..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-32 pr-4 py-4 text-sm font-black italic text-white placeholder:text-gray-700 outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            <button className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-2 text-white text-xs font-black italic">
               {selectedLeague}
               <ChevronDown className="w-4 h-4 text-emerald-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex justify-between px-2 pt-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-[10px] sm:text-xs font-black italic uppercase tracking-widest relative transition-colors",
                  activeTab === tab ? "text-emerald-500" : "text-gray-600"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabResult"
                    className="absolute -bottom-1 left-3 right-3 h-1 bg-emerald-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4 pb-20">
          <AnimatePresence mode="popLayout">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => {
                const id = match.id.split('_')[1] || '5425873';
                const finalScoreParts = match.finalScore?.split('-') || ['0', '0'];
                const homeScore = finalScoreParts[0].trim();
                const awayScore = finalScoreParts[1]?.trim() || '0';
                
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-brand-surface border border-white/5 rounded-[2.5rem] p-6 shadow-2xl space-y-6 relative overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center p-1">
                          <img src="https://cdn-icons-png.flaticon.com/512/33/33736.png" className="w-full h-full object-contain brightness-0 invert" alt="" />
                        </div>
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{match.league}</span>
                      </div>
                      <span className="text-xs font-black text-emerald-500 font-mono">ID: {id}</span>
                    </div>

                    {/* Match Score Area */}
                    <div className="flex items-center justify-between px-2">
                      {/* Home */}
                      <div className="flex flex-col items-center gap-3 w-1/3">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 p-2 flex items-center justify-center">
                          <img 
                            src={match.homeLogo || getTeamLogo(match.homeTeam)} 
                            className="w-full h-full object-contain" 
                            alt="" 
                          />
                        </div>
                        <span className="text-xs font-black text-white text-center italic uppercase leading-none">{match.homeTeam}</span>
                      </div>

                      {/* Score */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-4">
                           <span className="text-4xl font-black text-white italic">{homeScore}</span>
                           <span className="text-emerald-500 font-bold opacity-30">-</span>
                           <span className="text-4xl font-black text-white italic">{awayScore}</span>
                        </div>
                        <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-1">
                           <span className="text-xs font-black text-red-500">18'</span>
                        </div>
                      </div>

                      {/* Away */}
                      <div className="flex flex-col items-center gap-3 w-1/3">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 p-2 flex items-center justify-center">
                          <img 
                            src={match.awayLogo || getTeamLogo(match.awayTeam)} 
                            className="w-full h-full object-contain" 
                            alt="" 
                          />
                        </div>
                        <span className="text-xs font-black text-white text-center italic uppercase leading-none">{match.awayTeam}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="text-center pt-2">
                       <p className="text-[10px] font-black text-gray-700 font-mono uppercase tracking-[0.2em] italic">
                         2026-05-07 00:00
                       </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center pt-20 opacity-20">
                <Search className="w-16 h-16 text-gray-500 mb-4" />
                <p className="text-sm font-black italic uppercase tracking-[0.2em]">No se encontraron resultados</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
