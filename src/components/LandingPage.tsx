import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, EyeOff, Flame, ShieldCheck, Gift, Key, ChevronDown, Headset, X, Send, Calendar } from 'lucide-react';
import { loginWithGoogle, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Match } from '../types';
import { getTeamLogo, cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import SupportModal from './SupportModal';

interface LandingPageProps {
  popularMatches: Match[];
  onMatchClick?: (match: Match) => void;
}

export default function LandingPage({ popularMatches, onMatchClick }: LandingPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showSupport, setShowSupport] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-brand-bg text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-20 px-6 flex items-center justify-between border-b border-brand-line bg-brand-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 overflow-hidden flex items-center justify-center">
             <img 
               src="https://storage.googleapis.com/test-media-store/6b8d234d-ed12-40de-99f1-610196726884/p-a3967484-904d-4bc5-9c92-3c35b62e49c7.png" 
               className="w-full h-full object-contain scale-[2.2] translate-y-[-5%] translate-x-[-15%]" 
               alt="" 
             />
          </div>
          <span className="font-black italic text-xl tracking-tighter uppercase whitespace-nowrap">
            {authMode === 'login' ? 'SPORT91 FC' : t.createAccount.split(' ')[0]}
          </span>
          {authMode === 'signup' && (
             <span className="font-bold text-gray-500 text-sm hidden sm:block uppercase tracking-widest ml-2 truncate">
               {t.createAccount.split(' ').slice(1).join(' ')}...
             </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 sm:gap-8">
          <button 
            onClick={() => setAuthMode('login')} 
            className="text-xs sm:text-sm font-bold tracking-widest hover:text-brand-primary transition-colors cursor-pointer uppercase"
          >
            {t.login}
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto py-8 px-6 flex flex-col relative">
        {/* Background Image Decoration */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
           <img 
             src="https://storage.googleapis.com/test-media-store/6b8d234d-ed12-40de-99f1-610196726884/p-a3967484-904d-4bc5-9c92-3c35b62e49c7.png" 
             className="w-full h-full object-cover opacity-20 filter saturate-[0.5] blur-[2px]" 
             alt="" 
           />
           <div className="absolute inset-0 bg-gradient-to-b from-brand-bg via-brand-bg/80 to-brand-bg" />
        </div>
        
        {/* Popular Events Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-5 h-5 text-brand-primary fill-brand-primary/20" />
            <h2 className="font-black italic text-sm tracking-widest text-brand-primary uppercase">{t.popularEvents}</h2>
          </div>

          <div className="flex flex-col gap-4">
            {popularMatches.length > 0 ? (
              popularMatches.map((match) => (
                <motion.div
                  key={match.id}
                  whileHover={{ y: -4 }}
                  onClick={() => onMatchClick?.(match)}
                  className="w-full bg-brand-surface border border-white/5 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                  
                  {/* Header */}
                  <div className="text-xs font-mono text-gray-500 uppercase tracking-widest relative z-10 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center p-0.5">
                        <img src="https://cdn-icons-png.flaticon.com/512/33/33736.png" className="w-full h-full object-contain brightness-0 invert" alt="" />
                      </div>
                      <span className="font-bold text-white/50">{match.league}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-emerald-500 font-bold font-mono">ID: {match.id.split('_')[1] || '5109375'}</span>
                    </div>
                  </div>
                  
                  {/* Body */}
                  <div className="flex items-center gap-6 mb-6 relative z-10">
                    {/* Volume Chart */}
                    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="56" cy="56" r="48" fill="none" stroke="white" strokeWidth="4" strokeOpacity="0.05" />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="6"
                          strokeDasharray={301.59}
                          strokeDashoffset={301.59 * (1 - 0.85)}
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase leading-none">VOLUMEN</span>
                        <span className="text-base font-black text-emerald-400 italic mt-0.5">89.26 M</span>
                      </div>
                    </div>

                    {/* Team Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-end gap-3 group/team">
                        <span className="text-sm font-black text-white italic uppercase tracking-tighter truncate max-w-[120px]">{match.homeTeam}</span>
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center p-2 border border-white/10 shadow-xl">
                          <img src={match.homeLogo || getTeamLogo(match.homeTeam)} className="w-full h-full object-contain" alt="" />
                        </div>
                      </div>
                      
                      <div className="flex justify-end pr-14 relative h-4 items-center">
                         <div className="absolute right-14 w-10 h-[1px] bg-white/5" />
                         <div className="text-xs font-black text-emerald-500 italic tracking-widest opacity-40 px-2 bg-brand-surface z-10">VS</div>
                      </div>

                      <div className="flex items-center justify-end gap-3 group/team">
                        <span className="text-sm font-black text-white italic uppercase tracking-tighter truncate max-w-[120px]">{match.awayTeam}</span>
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center p-2 border border-white/10 shadow-xl">
                          <img src={match.awayLogo || getTeamLogo(match.awayTeam)} className="w-full h-full object-contain" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs font-mono border-t border-brand-line pt-6 text-gray-500 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 text-emerald-500">
                         <Calendar className="w-full h-full" />
                      </div>
                      <span className="text-white/60 font-black tracking-wider">
                        {match.startTime?.toDate ? match.startTime.toDate().toLocaleDateString([], {day: '2-digit', month: '2-digit'}) : '06/05'} 
                        {" "}
                        {match.startTime?.toDate ? match.startTime.toDate().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '23:30'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       {['00', '10', '09'].map((v, i) => (
                         <div key={i} className="flex items-center gap-1.5">
                           <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 px-2 py-1 rounded text-xs font-black">{v}</div>
                           {i < 2 && <span className="text-emerald-500 font-bold">:</span>}
                         </div>
                       ))}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full flex flex-col items-center justify-center h-48 bg-brand-surface/50 border border-brand-line border-dashed rounded-[2.5rem] text-gray-600">
                 <Flame className="w-8 h-8 mb-2 opacity-20" />
                 <p className="text-[10px] font-black tracking-widest uppercase">{t.noMatches || 'BUSCANDO EVENTOS...'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Auth Forms */}
        <AnimatePresence mode="wait">
          {authMode === 'login' ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-primary" />
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                  {t.welcome}
                </h1>
                <div className="h-1 w-24 bg-brand-primary mt-3 opacity-50" />
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <label className="absolute -top-3.5 left-4 bg-brand-bg px-2 text-xs font-mono font-bold text-gray-500 uppercase tracking-widest z-10">{t.username}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-primary group-focus-within:scale-110 transition-transform" />
                    <input 
                      type="text" 
                      placeholder={t.enterUsername}
                      className="input-field py-4 pl-14 text-base"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="absolute -top-3.5 left-4 bg-brand-bg px-2 text-xs font-mono font-bold text-gray-500 uppercase tracking-widest z-10">{t.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-primary group-focus-within:scale-110 transition-transform" />
                    <input 
                      type="password" 
                      placeholder="........"
                      className="input-field py-4 pl-14 text-base"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                      <EyeOff className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setShowSupport(true)}
                    className="flex items-center gap-2 text-xs font-black text-brand-primary italic opacity-70 hover:opacity-100 transition-opacity uppercase"
                  >
                    <Headset className="w-4 h-4" />
                    {t.support}
                  </button>
                  <button className="text-xs font-black text-brand-primary italic opacity-70 hover:opacity-100 transition-opacity uppercase">
                    {t.forgotPassword}
                  </button>
                </div>

                <div className="pt-4 relative">
                  <button 
                    onClick={loginWithGoogle}
                    className="slant-button w-full text-brand-primary/50 text-xl"
                  >
                    {t.login}
                  </button>
                  
                  {/* Mascot decoration */}
                  <div className="absolute -right-4 -top-8 w-16 h-16 pointer-events-none">
                    <div className="w-12 h-12 bg-[#ffdd44] rounded-full flex flex-col items-center justify-center shadow-lg relative">
                       <div className="absolute -top-1 -left-1 -right-1 flex justify-between px-1">
                          <div className="w-4 h-4 bg-black rounded-full border-2 border-white" />
                          <div className="w-4 h-4 bg-black rounded-full border-2 border-white" />
                       </div>
                       <div className="w-2 h-1 bg-black/20 rounded-full mt-4" />
                       <div className="absolute inset-0 border-[3px] border-black rounded-full" />
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-500 mt-8 uppercase tracking-wide">
                  {t.noAccount} <button onClick={() => setAuthMode('signup')} className="text-white font-bold underline decoration-brand-primary decoration-2 underline-offset-4 ml-1">{t.signup}</button>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12 pb-20"
            >
              <div className="relative pl-6">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-primary" />
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                  {t.createAccount}
                </h1>
                <div className="h-1 w-24 bg-brand-primary mt-3 opacity-50" />
              </div>

              <div className="space-y-6">
                {/* Username */}
                <div className="relative group">
                  <label className="absolute -top-2.5 left-4 bg-brand-bg px-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest z-10">{t.username}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary group-focus-within:scale-110 transition-transform" />
                    <input 
                      type="text" 
                      placeholder={t.introduceUsername}
                      className="input-field"
                    />
                  </div>
                </div>



                {/* Password */}
                <div className="relative group">
                  <label className="absolute -top-2.5 left-4 bg-brand-bg px-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest z-10">{t.password}</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary group-focus-within:scale-110 transition-transform" />
                    <input 
                      type="password" 
                      placeholder="........"
                      className="input-field"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                      <EyeOff className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="relative group">
                  <label className="absolute -top-2.5 left-4 bg-brand-bg px-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest z-10">{t.confirmPassword}</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary group-focus-within:scale-110 transition-transform" />
                    <input 
                      type="password" 
                      placeholder="........"
                      className="input-field"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                      <EyeOff className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Invitation Code */}
                <div className="relative group">
                  <label className="absolute -top-2.5 left-4 bg-brand-bg px-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest z-10">{t.invitationCode}</label>
                  <div className="relative">
                    <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary group-focus-within:scale-110 transition-transform" />
                    <input 
                      type="text" 
                      placeholder={t.introduceCode}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center gap-3 px-1">
                  <div className="w-5 h-5 border border-brand-line bg-brand-surface rounded flex items-center justify-center cursor-pointer hover:border-brand-primary transition-colors">
                    {/* Tick for visual reference */}
                  </div>
                  <p className="text-xs font-bold text-gray-400">
                    {t.acceptTerms.split('+18')[0]} 
                    <span className="text-brand-primary">+18</span>
                  </p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={loginWithGoogle}
                    className="slant-button w-full text-brand-primary/50 text-xl"
                  >
                    {t.signup}
                  </button>
                </div>

                <div className="text-center pt-4">
                  <button 
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-gray-500 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto group"
                  >
                    {t.alreadyHaveAccount} 
                    <span className="text-brand-primary font-black italic group-hover:underline underline-offset-4">{t.login}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showSupport && <SupportModal onClose={() => setShowSupport(false)} t={t} />}
      </AnimatePresence>
    </div>
  );
}
