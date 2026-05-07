import { Match, UserProfile } from '../types';
import { X, ShieldCheck, AlertCircle, Copy, Calendar, ChevronLeft, FileText, LayoutGrid, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency, calculatePotentialProfit, cn, getTeamLogo } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import HistoryModal from './HistoryModal';

interface BetModalProps {
  match: Match;
  profile: UserProfile | null;
  onClose: () => void;
  onPlaceBet: (score: string, amount: number, roi: number) => Promise<void>;
}

function CountdownTimerLabel({ targetDate }: { targetDate: any }) {
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      let target: number;
      
      if (targetDate?.toDate) {
        target = targetDate.toDate().getTime();
      } else if (typeof targetDate === 'string' || typeof targetDate === 'number') {
        target = new Date(targetDate).getTime();
      } else if (targetDate instanceof Date) {
        target = targetDate.getTime();
      } else {
        target = Date.now() + 3600000;
      }

      const diff = target - now;
      if (diff <= 0) return { hours: '00', minutes: '00', seconds: '00' };

      const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

      return { hours, minutes, seconds };
    };

    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    setTimeLeft(calculateTime());
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1.5 font-mono">
      <div className="bg-emerald-500 text-black px-1.5 py-0.5 rounded text-[10px] font-black">{timeLeft.hours}</div>
      <span className="text-emerald-500 font-bold">:</span>
      <div className="bg-emerald-500 text-black px-1.5 py-0.5 rounded text-[10px] font-black">{timeLeft.minutes}</div>
      <span className="text-emerald-500 font-bold">:</span>
      <div className="bg-emerald-500 text-black px-1.5 py-0.5 rounded text-[10px] font-black">{timeLeft.seconds}</div>
    </div>
  );
}

export default function BetModal({ match, profile, onClose, onPlaceBet }: BetModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'market' | 'bet'>('market');
  const [selectedScore, setSelectedScore] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showHistory, setShowHistory] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const currentROI = selectedScore ? match.antiScoreOdds[selectedScore] : 0;
  const potentialProfit = calculatePotentialProfit(numericAmount, currentROI);
  const fee = numericAmount * 0.05;
  const netProfit = potentialProfit - fee;

  const handleSubmit = async () => {
    if (!selectedScore || numericAmount <= 0) return;
    if (profile && numericAmount > profile.balance) {
      setError('Saldo insuficiente');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onPlaceBet(selectedScore, numericAmount, currentROI);
      onClose();
    } catch (e) {
      setError('Error al procesar la apuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const addAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const formatDate = (date: any) => {
    if (!date) return '07/05';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString([], {day: '2-digit', month: '2-digit'});
  };

  const formatTime = (date: any) => {
    if (!date) return '00:00';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full md:max-w-md md:h-[90vh] bg-brand-bg flex flex-col relative"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <button 
            onClick={() => step === 'bet' ? setStep('market') : onClose()}
            className="p-2.5 bg-white/5 rounded-xl text-emerald-500 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-black text-white italic tracking-tighter uppercase">
            {step === 'market' ? 'Detalles del partido' : 'Detalles de la apuesta'}
          </h1>
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2.5 bg-white/5 rounded-xl text-gray-500 active:scale-95 transition-transform"
          >
            <FileText className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-12">
          {step === 'market' ? (
            <div className="space-y-6">
              {/* Match Card */}
              <div className="bg-brand-surface border border-white/5 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{match.league}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <span className="text-[10px] font-mono text-emerald-500">ID: 5261361</span>
                    <Copy onClick={() => copyToClipboard('5261361')} className="w-3 h-3 text-gray-500 cursor-pointer" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mb-8 relative z-10 px-2">
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-20 h-20 bg-brand-bg rounded-full p-3 border-4 border-white/5 shadow-inner flex items-center justify-center">
                       <img src={match.homeLogo || getTeamLogo(match.homeTeam)} className="w-full h-full object-contain" alt="" />
                    </div>
                    <span className="text-xs font-black text-white italic uppercase tracking-tighter text-center">{match.homeTeam}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl font-black text-white font-mono px-2">{formatTime(match.startTime)}</span>
                    <div className="flex items-center gap-2">
                       <img src="https://cdn-icons-png.flaticon.com/512/32/32285.png" className="w-8 h-8 object-contain" alt="VS" />
                    </div>
                    <span className="text-[10px] font-black text-gray-500 font-mono tracking-widest">{formatDate(match.startTime)}</span>
                  </div>

                  <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-20 h-20 bg-brand-bg rounded-full p-3 border-4 border-white/5 shadow-inner flex items-center justify-center">
                       <img src={match.awayLogo || getTeamLogo(match.awayTeam)} className="w-full h-full object-contain" alt="" />
                    </div>
                    <span className="text-xs font-black text-white italic uppercase tracking-tighter text-center">{match.awayTeam}</span>
                  </div>
                </div>

                  <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/5 relative z-10">
                   <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Comienza en :</span>
                   <CountdownTimerLabel targetDate={match.startTime} />
                </div>
              </div>

              {/* Security Banner */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-black" />
                </div>
                <p className="text-xs leading-relaxed text-white/70">
                  <span className="font-black text-white block mb-0.5 text-sm">Sistema Anti-Puntuación :</span>
                  Asegure sus ganancias eligiendo puntuaciones imposibles.
                </p>
              </div>

              {/* Market Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white italic uppercase tracking-tighter">Opciones de mercado</h2>
                  <div className="flex bg-white/5 p-1 rounded-xl">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={cn("p-1.5 rounded-lg transition-colors", viewMode === 'grid' ? "bg-emerald-500 text-black" : "text-gray-500")}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={cn("p-1.5 rounded-lg transition-colors", viewMode === 'list' ? "bg-emerald-500 text-black" : "text-gray-500")}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className={cn(
                  "grid gap-3",
                  viewMode === 'grid' ? "grid-cols-4" : "grid-cols-1"
                )}>
                  {viewMode === 'list' && (
                    <div className="grid grid-cols-4 px-6 text-xs font-black text-gray-600 uppercase tracking-widest mb-2 px-4">
                      <span>Puntaje</span>
                      <span className="text-center">Volumen</span>
                      <span className="text-center">Ganancia</span>
                      <span className="text-right"></span>
                    </div>
                  )}

                  {Object.entries(match.antiScoreOdds)
                    .sort(([a], [b]) => {
                      if (a === 'otro') return 1;
                      if (b === 'otro') return -1;
                      return a.localeCompare(b);
                    })
                    .map(([score, roi]) => {
                      const seed = (match.id.split('_')[1] || '5261').slice(-2);
                      const vol = Math.floor(100 + (parseInt(seed) * (score.length + 5)) % 900);
                      
                      if (viewMode === 'list') {
                        return (
                          <div
                            key={score}
                            className="bg-brand-surface border border-white/5 rounded-2xl p-3 flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-lg"
                          >
                            <span className="w-1/4 font-black text-white text-base font-mono italic tracking-tighter pl-2">{score}</span>
                            <span className="w-1/4 text-center text-xs font-black text-gray-500 font-mono italic">{vol}k</span>
                            <span className="w-1/4 text-center text-xs font-black text-emerald-500 italic">{roi.toFixed(1)} %</span>
                            <div className="w-1/4 flex justify-end">
                              <button 
                                onClick={() => {
                                  setSelectedScore(score);
                                  setStep('bet');
                                }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-xl text-xs font-black italic tracking-tighter uppercase transition-colors"
                              >
                                APUESTA
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={score}
                          onClick={() => {
                            setSelectedScore(score);
                            setStep('bet');
                          }}
                          className="bg-brand-surface border border-white/5 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-colors group text-center flex flex-col shadow-lg"
                        >
                          <div className="p-2 border-b border-white/5 space-y-0.5">
                            <span className="text-[7px] font-black text-gray-400 tracking-tighter leading-none block uppercase">Tasa de beneficio</span>
                            <span className="text-[10px] font-black text-white tracking-widest">{roi.toFixed(1)}%</span>
                          </div>
                          <div className="p-2 bg-black/40">
                            <span className="text-xs font-black text-gray-400 group-hover:text-emerald-500 transition-colors font-mono">{score}</span>
                          </div>
                        </button>
                      );
                    })}
                </div>

                <button className="w-full py-5 text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-500/10 transition-colors">
                  Mostrar menos <ChevronLeft className="w-5 h-5 -rotate-90" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
               {/* Team Banner */}
               <div className="space-y-4">
                 <h2 className="text-lg font-black text-white italic uppercase tracking-tighter">Datos de apuestas</h2>
                 <p className="text-[10px] text-gray-600 font-mono tracking-[0.2em] -mt-3">{match.league}</p>
                 
                 <div className="bg-brand-surface border border-white/5 rounded-[2rem] p-6 shadow-2xl flex items-center justify-between gap-4">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-12 h-12 bg-brand-bg rounded-xl p-2 border border-white/5">
                        <img src={match.homeLogo || getTeamLogo(match.homeTeam)} className="w-full h-full object-contain" alt="" />
                      </div>
                      <span className="text-[10px] font-black text-white italic uppercase text-center truncate w-full">{match.homeTeam}</span>
                    </div>
                    
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-white/10">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase italic">VS</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-12 h-12 bg-brand-bg rounded-xl p-2 border border-white/5">
                        <img src={match.awayLogo || getTeamLogo(match.awayTeam)} className="w-full h-full object-contain" alt="" />
                      </div>
                      <span className="text-[10px] font-black text-white italic uppercase text-center truncate w-full">{match.awayTeam}</span>
                    </div>
                 </div>
               </div>

               {/* Score & ROI Info */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-brand-surface border border-white/5 rounded-2xl p-6 space-y-3">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Puntuación de mercado</span>
                    <p className="text-2xl font-black text-white font-mono">{selectedScore || '0-0'}</p>
                 </div>
                 <div className="bg-brand-surface border border-white/5 rounded-2xl p-6 space-y-3">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Tasa de beneficio</span>
                    <p className="text-2xl font-black text-emerald-500 italic">+{currentROI.toFixed(1)} %</p>
                 </div>
               </div>

               {/* Amount Input Section */}
               <div className="space-y-5">
                 <div className="flex justify-between items-center text-xs font-black italic tracking-widest">
                    <span className="text-white uppercase">Cantidad de la apuesta</span>
                    <span className="text-gray-500">Monedero : <span className="text-emerald-500">{formatCurrency(profile?.balance || 0)}</span></span>
                 </div>

                 <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-500 italic">$</div>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-brand-surface border border-white/5 rounded-[1.5rem] pl-12 pr-28 py-6 text-2xl font-black italic text-white placeholder:text-gray-800 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                    />
                    <button 
                      onClick={() => setAmount(profile?.balance.toString() || '0')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-emerald-500 text-[10px] font-black italic tracking-widest hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all"
                    >
                      MÁXIMO
                    </button>
                 </div>

                 {/* Shortcuts */}
                 <div className="grid grid-cols-4 gap-3">
                   {[100, 500, 1000, 5000].map(val => (
                     <button
                        key={val}
                        onClick={() => addAmount(val)}
                        className="py-3 bg-brand-surface border border-white/5 rounded-xl text-[10px] font-black text-gray-400 hover:text-white hover:border-emerald-500/30 transition-all"
                     >
                       +$ {val}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Calcs */}
               <div className="bg-brand-surface border border-white/5 rounded-[2rem] p-6 space-y-4 shadow-xl">
                 <div className="flex justify-between items-center pb-4 border-b border-white/5">
                   <span className="text-xs font-black text-gray-500 uppercase italic">Retorno potencial</span>
                   <span className="text-xl font-black text-emerald-500 italic">{formatCurrency(potentialProfit)}</span>
                 </div>
                 <div className="space-y-3">
                   <div className="flex justify-between text-[10px] font-black italic">
                      <span className="text-gray-500 uppercase">Beneficio neto</span>
                      <span className="text-emerald-500">+{formatCurrency(netProfit > 0 ? netProfit : 0)}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-black italic">
                      <span className="text-gray-500 uppercase">Tarifa ( 5 % )</span>
                      <span className="text-red-500">-{formatCurrency(fee)}</span>
                   </div>
                 </div>
               </div>

               {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-black italic tracking-tighter">{error}</span>
                </div>
               )}

               <button
                 onClick={handleSubmit}
                 disabled={numericAmount <= 0 || isSubmitting}
                 className="w-full py-6 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-black italic text-lg uppercase tracking-widest rounded-3xl shadow-2xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
               >
                 {isSubmitting ? 'Procesando...' : '¡APUESTA AHORA!'}
               </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showHistory && (
            <HistoryModal 
              profile={profile} 
              onClose={() => setShowHistory(false)} 
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
