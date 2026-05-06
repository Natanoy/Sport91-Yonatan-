import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { Clock, Copy, ChevronRight, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import { getTeamLogo } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';
import { format } from 'date-fns';

interface MatchCardProps {
  match: Match;
  onClick: (match: Match) => void;
  key?: string | number;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const { t } = useLanguage();
  
  const startTime = match.startTime?.toDate ? match.startTime.toDate() : new Date(match.startTime);
  const formattedDate = format(startTime, 'dd/MM HH:mm');

  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = startTime.getTime() - now;

      if (diff <= 0) {
        setCountdown(match.status === 'live' ? 'LIVE' : (match.status === 'finished' ? 'TERMINADO' : 'JUGANDO'));
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else {
        setCountdown(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [startTime, match.status]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => onClick(match)}
      className="bg-brand-surface border border-brand-line rounded-[2.5rem] p-6 cursor-pointer group hover:border-brand-primary/30 transition-all shadow-xl"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center p-2 border border-white/10">
            <img 
              src={match.leagueLogo || getTeamLogo(match.league)} 
              className="w-full h-full object-contain" 
              alt={match.league} 
            />
          </div>
          <span className="font-bold text-lg">{match.league}</span>
        </div>
        <div className="flex items-center gap-2 bg-brand-bg px-4 py-2 rounded-full border border-brand-line">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-tighter">ID: {match.id.includes('api_') ? match.id.split('_')[1] : match.id.slice(0, 7)}</span>
          <Copy className="w-4 h-4 text-gray-500 hover:text-white transition-colors" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-8 py-2">
        {/* Progress Circle for Volume */}
        <div className="relative w-28 h-28 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-full h-full -rotate-90">
            <circle 
              cx="56" cy="56" r="50" 
              className="stroke-brand-line fill-none" 
              strokeWidth="8" 
            />
            <circle 
              cx="56" cy="56" r="50" 
              className="stroke-brand-primary fill-none" 
              strokeWidth="8" 
              strokeDasharray="314"
              strokeDashoffset={Math.random() * 200 + 100}
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-gray-500 uppercase">{t.volume}</span>
            <span className="text-base font-black text-brand-primary leading-tight">{(Math.random() * 90 + 10).toFixed(2)}M</span>
          </div>
        </div>

        <div className="flex-1 space-y-7">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-100 flex-1 text-base uppercase tracking-tight">{match.homeTeam}</span>
            <img 
              src={match.homeLogo || getTeamLogo(match.homeTeam)} 
              className="w-12 h-12 object-contain ml-3" 
              alt="" 
            />
          </div>
          
          <div className="flex items-center justify-center -my-2 relative">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dashed border-white/10" /></div>
             <span className="relative z-10 bg-brand-surface px-2 text-brand-primary italic font-black text-xs">VS</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-100 flex-1 text-base uppercase tracking-tight">{match.awayTeam}</span>
            <img 
              src={match.awayLogo || getTeamLogo(match.awayTeam)} 
              className="w-12 h-12 object-contain ml-3" 
              alt="" 
            />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-brand-line flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-5 h-5 text-brand-primary font-bold" />
            <span className="text-sm font-bold font-mono tracking-tighter">{formattedDate}</span>
          </div>
          {countdown && (
            <div className="flex items-center gap-1.5">
               <Timer className="w-4 h-4 text-red-500 animate-pulse" />
               <span className="text-xs font-black text-red-500 font-mono italic uppercase">{countdown}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-brand-primary/10 px-4 py-2 rounded-xl border border-brand-primary/20">
           <span className="text-xs font-black text-brand-primary uppercase italic">Trade Now</span>
        </div>
      </div>
    </motion.div>
  );
}
