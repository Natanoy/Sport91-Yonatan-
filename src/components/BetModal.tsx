import { Match, UserProfile } from '../types';
import { X, TrendingUp, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency, calculatePotentialProfit, cn, getTeamLogo } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

interface BetModalProps {
  match: Match;
  profile: UserProfile | null;
  onClose: () => void;
  onPlaceBet: (score: string, amount: number, roi: number) => Promise<void>;
}

export default function BetModal({ match, profile, onClose, onPlaceBet }: BetModalProps) {
  const { t } = useLanguage();
  const [selectedScore, setSelectedScore] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;
  const currentROI = selectedScore ? match.antiScoreOdds[selectedScore] : 0;
  const potentialProfit = calculatePotentialProfit(numericAmount, currentROI);

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-brand-surface border border-brand-line w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-4 border-b border-brand-line flex items-center justify-between bg-brand-bg/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center -space-x-4">
              <div className="w-10 h-10 bg-brand-bg rounded-full border-2 border-brand-line p-1.5 z-10">
                <img src={getTeamLogo(match.homeTeam)} className="w-full h-full object-contain" alt={match.homeTeam} />
              </div>
              <div className="w-10 h-10 bg-brand-bg rounded-full border-2 border-brand-line p-1.5">
                <img src={getTeamLogo(match.awayTeam)} className="w-full h-full object-contain" alt={match.awayTeam} />
              </div>
            </div>
            <div>
              <h2 className="font-bold">Mercados {t.anti}-{t.score}</h2>
              <p className="text-[10px] text-gray-500 font-mono uppercase">{match.homeTeam} vs {match.awayTeam}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[500px]">
          {/* Left: Scores List */}
          <div className="flex-1 overflow-y-auto p-4 border-r border-brand-line">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(match.antiScoreOdds).sort(([, a], [, b]) => a - b).map(([score, roi]) => (
                <button
                  key={score}
                  onClick={() => setSelectedScore(score)}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-left group",
                    selectedScore === score 
                      ? "bg-brand-primary/10 border-brand-primary" 
                      : "bg-brand-bg border-brand-line hover:border-gray-600"
                  )}
                >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-bold text-sm">{score}</span>
                      <span className={cn(
                        "text-[10px] font-mono",
                        selectedScore === score ? "text-brand-primary" : "text-gray-500"
                      )}>{t.anti}</span>
                    </div>
                    <div className="text-lg font-black text-brand-primary">
                      {roi.toFixed(2)}%
                      <span className="text-[10px] ml-1 text-gray-500">{t.roi}</span>
                    </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Bet Panel */}
            <div className="w-full md:w-80 bg-brand-bg/30 p-6 flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">{t.amount}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-brand-bg border border-brand-line rounded-xl px-4 py-3 font-mono text-xl focus:outline-none focus:border-brand-primary transition-colors pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-gray-600">$</span>
                </div>
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[10px] text-gray-500">{t.balance}: {formatCurrency(profile?.balance || 0)}</span>
                  <button 
                    onClick={() => setAmount(profile?.balance.toString() || '0')}
                    className="text-[10px] text-brand-primary font-bold hover:underline"
                  >
                    MAX
                  </button>
                </div>
              </div>

            <div className="flex-1 space-y-4">
                <div className="bg-brand-surface border border-brand-line rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{t.match}</span>
                    <span className="font-mono font-bold">{selectedScore || '--'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Probabilidad {t.anti}</span>
                    <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Alta
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-brand-line">
                    <span className="text-xs text-gray-500">{t.roi} Estimado</span>
                    <span className="font-mono font-bold text-brand-primary">{currentROI.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{t.potentialProfit}</span>
                    <span className="font-mono font-bold text-green-500">+{formatCurrency(potentialProfit)}</span>
                  </div>
                </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-xs text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedScore || numericAmount <= 0 || isSubmitting}
                className="w-full bg-brand-primary disabled:opacity-50 disabled:grayscale hover:bg-brand-primary/90 text-black py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    {t.placeBet}
                  </>
                )}
              </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
