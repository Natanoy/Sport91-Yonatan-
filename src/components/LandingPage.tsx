import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, EyeOff, Flame, ShieldCheck, Gift, Key, ChevronDown, Headset, X, Send } from 'lucide-react';
import { loginWithGoogle, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Match } from '../types';
import { getTeamLogo, cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import SupportModal from './SupportModal';

interface LandingPageProps {
  popularMatches: Match[];
}

export default function LandingPage({ popularMatches }: LandingPageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showSupport, setShowSupport] = useState(false);
  const { t } = useLanguage();



  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.max(1, popularMatches.length));
    }, 5000);
    return () => clearInterval(timer);
  }, [popularMatches.length]);

  return (
    <div className="min-h-screen bg-brand-bg text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-20 px-6 flex items-center justify-between border-b border-brand-line bg-brand-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-brand-primary p-1 rounded italic font-black text-black text-xs">S91</div>
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
      <main className="flex-1 w-full max-w-lg mx-auto py-8 px-6 flex flex-col">
        {/* Popular Events Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-5 h-5 text-brand-primary fill-brand-primary/20" />
            <h2 className="font-black italic text-sm tracking-widest text-brand-primary uppercase">{t.popularEvents}</h2>
          </div>

          <div className="relative h-48 perspective-1000">
            <AnimatePresence mode="popLayout">
              {popularMatches.map((match, idx) => {
                if (idx !== activeIndex && idx !== (activeIndex + 1) % popularMatches.length) return null;
                
                const isCurrent = idx === activeIndex;
                
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: 200, scale: 0.8, rotateY: 45 }}
                    animate={{ 
                      opacity: isCurrent ? 1 : 0.5, 
                      x: isCurrent ? 0 : 250, 
                      scale: isCurrent ? 1 : 0.9,
                      rotateY: isCurrent ? 0 : -25,
                      zIndex: isCurrent ? 10 : 5
                    }}
                    exit={{ opacity: 0, x: -200, scale: 0.8, rotateY: -45 }}
                    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0"
                  >
                    <div className="w-72 h-full bg-brand-surface border border-brand-line rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                      
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest relative z-10">{match.league}</div>
                      
                      <div className="flex items-center justify-between gap-4 my-2 relative z-10">
                        <div className="flex-1 text-center">
                          <div className="w-14 h-14 bg-white/5 rounded-xl mx-auto mb-1 flex items-center justify-center p-2 border border-white/10 shadow-inner">
                            <img src={getTeamLogo(match.homeTeam)} className="w-full h-full object-contain" alt={match.homeTeam} />
                          </div>
                          <p className="text-[10px] font-bold truncate">{match.homeTeam}</p>
                        </div>
                        <div className="text-brand-primary italic font-black text-sm">VS</div>
                        <div className="flex-1 text-center">
                          <div className="w-14 h-14 bg-white/5 rounded-xl mx-auto mb-1 flex items-center justify-center p-2 border border-white/10 shadow-inner">
                            <img src={getTeamLogo(match.awayTeam)} className="w-full h-full object-contain" alt={match.awayTeam} />
                          </div>
                          <p className="text-[10px] font-bold truncate">{match.awayTeam}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono border-t border-brand-line pt-2 text-gray-500 relative z-10">
                        <span>04/05 18:30</span>
                        <span>31/12</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
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
                  <label className="absolute -top-2.5 left-4 bg-brand-bg px-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest z-10">{t.username}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary group-focus-within:scale-110 transition-transform" />
                    <input 
                      type="text" 
                      placeholder={t.enterUsername}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="absolute -top-2.5 left-4 bg-brand-bg px-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest z-10">{t.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary group-focus-within:scale-110 transition-transform" />
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

                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setShowSupport(true)}
                    className="flex items-center gap-2 text-[10px] font-black text-brand-primary italic opacity-70 hover:opacity-100 transition-opacity uppercase"
                  >
                    <Headset className="w-3 h-3" />
                    {t.support}
                  </button>
                  <button className="text-[10px] font-black text-brand-primary italic opacity-70 hover:opacity-100 transition-opacity uppercase">
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
