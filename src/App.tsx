import React, { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  serverTimestamp, 
  orderBy,
  limit,
  addDoc,
  where
} from 'firebase/firestore';
import { useLanguage } from './lib/LanguageContext';
import { Match, UserProfile, Bet, Tab } from './types';
import Navbar from './components/Navbar';
import MatchCard from './components/MatchCard';
import BetModal from './components/BetModal';
import DepositModal from './components/DepositModal';
import WithdrawModal from './components/WithdrawModal';
import RewardsModal from './components/RewardsModal';
import VipModal from './components/VipModal';
import SupportModal from './components/SupportModal';
import LuckyBoxModal from './components/LuckyBoxModal';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';
import TradeView from './components/TradeView';
import InvitationView from './components/InvitationView';
import ProfileView from './components/ProfileView';
import { formatCurrency, cn } from './lib/utils';
import { 
  Search, 
  Flame, 
  ShieldCheck, 
  Dice5, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Gift, 
  Award, 
  RefreshCcw,
  Home,
  Tags,
  Activity,
  Users,
  User,
  CheckCircle2,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { syncFootballMatches } from './services/matchSyncService';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const { t } = useLanguage();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [showLuckyBoxModal, setShowLuckyBoxModal] = useState(false);
  const [luckyBoxCountdown, setLuckyBoxCountdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSupport, setShowSupport] = useState(false);

  // 0. Auto-sync matches (internal cooldown check exists)
  useEffect(() => {
    syncFootballMatches().catch(e => console.error('Match sync error:', e));
  }, []);

  // 1. Load Profile
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const unsub = onSnapshot(doc(db, 'users', user.uid), async (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Usuario',
          balance: 1000,
          createdAt: serverTimestamp()
        };
        try {
          await setDoc(doc(db, 'users', user.uid), newProfile);
        } catch (err) {
          console.error("Error creating profile:", err);
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    const timer = setInterval(() => {
      if (!profile.lastLuckyBoxClaim) {
        setLuckyBoxCountdown(null);
        return;
      }
      const lastClaim = new Date(profile.lastLuckyBoxClaim).getTime();
      const nextClaim = lastClaim + 48 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const diff = nextClaim - now;

      if (diff <= 0) {
        setLuckyBoxCountdown(null);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setLuckyBoxCountdown(`${hours}h ${minutes}m`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [profile?.lastLuckyBoxClaim]);

  // 2. Load Matches
  useEffect(() => {
    // We order by startTime and prioritize real matches
    const q = query(
      collection(db, 'matches'), 
      orderBy('startTime', 'asc'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const allMatches = snap.docs.map(d => ({ id: d.id, ...d.data() } as Match));
      // Show ONLY real matches. This satisfies the user's request for "partidos reales"
      const realMatches = allMatches.filter(m => m.isReal);
      
      // Filter out matches that finished more than 2 hours ago
      const now = new Date().getTime();
      const visibleMatches = realMatches.filter(m => {
        const matchTime = m.startTime?.toDate ? m.startTime.toDate().getTime() : new Date(m.startTime).getTime();
        if (m.status === 'finished') {
          return (now - matchTime) < 2 * 60 * 60 * 1000; // Only show finished matches for 2 hours
        }
        return true;
      });

      setMatches(visibleMatches);
    });
    return () => unsub();
  }, []);

  // 3. Load Bets
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'bets'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'), 
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Bet));
      setBets(data);
    });
    return () => unsub();
  }, [user]);

  const handlePlaceBet = async (score: string, amount: number, roi: number) => {
    if (!user || !selectedMatch || !profile) return;
    await addDoc(collection(db, 'bets'), {
      userId: user.uid,
      matchId: selectedMatch.id,
      homeTeam: selectedMatch.homeTeam,
      awayTeam: selectedMatch.awayTeam,
      selectedScore: score,
      amount: amount,
      roi: roi,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    // Balance update should be handled via Cloud Functions or a more complex logic, 
    // but for this MVP keep it simple.
  };

  const handleWithdraw = async (amount: number, address: string, network: string) => {
    if (!user || !profile) return;
    
    const fee = amount * 0.07;
    const netAmount = amount - fee;

    await setDoc(doc(db, 'users', user.uid), { 
      balance: profile.balance - amount 
    }, { merge: true });
    
    await addDoc(collection(db, 'withdrawals'), {
      userId: user.uid,
      amount,
      fee,
      netAmount,
      address,
      network,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  };

  const closeAllModals = () => {
    setShowDepositModal(false);
    setShowWithdrawModal(false);
    setShowRewardsModal(false);
    setShowVipModal(false);
    setShowSupport(false);
    setSelectedMatch(null);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    closeAllModals();
  };

  const filteredMatches = matches.filter(m => 
    m.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.league.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <LandingPage popularMatches={matches.slice(0, 3)} />;

  const promos = [
    { 
      id: 'luckybox',
      name: 'LUCKY BOX', 
      prize: luckyBoxCountdown || '5% REBATE + TICKET', 
      action: luckyBoxCountdown ? t.onWait : t.openNow, 
      title: t.luckyBoxTitle, 
      color: 'from-red-600 via-red-700 to-rose-900', 
      img: 'https://img.icons8.com/isometric/200/treasure-chest.png',
      badge: t.luckyBoxBadge
    },
    { 
      id: 'referral',
      name: 'INVITA Y GANA', 
      prize: '13% REBATE', 
      action: t.invite, 
      title: 'CRECE TU EQUIPO', 
      color: 'from-blue-600 via-indigo-700 to-purple-800', 
      img: 'https://img.icons8.com/isometric/200/trophy.png',
      badge: 'SOCIOS'
    },
    { 
      id: 'vip',
      name: 'CENTRO VIP', 
      prize: 'LEVEL UP', 
      action: t.vip, 
      title: 'BENEFICIOS EXCLUSIVOS', 
      color: 'from-yellow-400 via-orange-500 to-red-600', 
      img: 'https://img.icons8.com/isometric/200/star.png',
      badge: 'PREMIUM'
    },
    { 
      id: 'security',
      name: 'SPORT91 FC', 
      prize: '100% SEGURO', 
      action: t.support, 
      title: 'GARANTÍA TOTAL', 
      color: 'from-gray-700 via-gray-800 to-black', 
      img: 'https://img.icons8.com/isometric/200/shield.png',
      badge: 'CERTIFICADO'
    },
  ];

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-brand-bg text-white flex flex-col overflow-hidden">
      <Navbar profile={profile} onRecharge={() => {}} onShowSupport={() => setShowSupport(true)} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 overflow-y-auto safe-area-bottom pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Promotional Banners */}
              <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x px-2">
                {promos.map((promo, i) => (
                  <motion.div 
                    key={promo.id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={cn(
                      "flex-shrink-0 w-80 sm:w-[400px] h-52 rounded-[2rem] p-6 relative overflow-hidden snap-start shadow-2xl transition-all border border-white/10 group",
                      "bg-gradient-to-br", promo.color
                    )}
                  >
                    {/* Background Patterns */}
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                       <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
                    
                    {/* Floating Illustration */}
                    <motion.div
                      animate={{ 
                        y: [-5, 5, -5],
                        rotate: [-2, 2, -2]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute right-4 bottom-4 w-32 h-32 z-0 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                    >
                      <img 
                        src={promo.img} 
                        className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" 
                        alt={promo.name} 
                      />
                    </motion.div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="space-y-1">                        <div className="flex items-center gap-2">
                           <motion.span 
                             animate={promo.id === 'luckybox' ? { 
                               scale: [1, 1.1, 1],
                               backgroundColor: ['rgba(0,0,0,0.3)', 'rgba(255,255,0,0.4)', 'rgba(0,0,0,0.3)']
                             } : {}}
                             transition={{ duration: 2, repeat: Infinity }}
                             className="bg-black/30 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black tracking-tighter text-white border border-white/10 italic"
                           >
                             {promo.badge}
                           </motion.span>
                           <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">{promo.name}</p>
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter leading-none text-white drop-shadow-md">
                          {promo.title}
                        </h3>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[9px] text-white/60 font-medium uppercase tracking-widest mb-1">{t.invitationBannerPrize}</p>
                          <div className={cn(
                            "px-4 py-1 rounded-full font-black italic text-lg shadow-lg",
                            promo.id === 'luckybox' ? "bg-yellow-400 text-black shadow-yellow-500/50" : "bg-white text-black"
                          )}>
                            {promo.prize}
                          </div>
                        </div>
                        
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (promo.id === 'luckybox') setShowLuckyBoxModal(true);
                            if (promo.id === 'referral') handleTabChange('invite');
                            if (promo.id === 'vip') setShowVipModal(true);
                            if (promo.id === 'security') setShowSupport(true);
                          }}
                          className={cn(
                            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            promo.id === 'luckybox' ? "bg-yellow-400 text-black hover:bg-white shadow-yellow-500/50" : "bg-white text-black hover:bg-brand-primary shadow-xl"
                          )}
                        >
                          {promo.action}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* User Financial Control Panel */}
              <div className="bg-brand-surface border border-brand-line rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <span className="text-gray-400 font-bold">{user.displayName || 'User'}</span>
                       <div className="bg-brand-primary p-1 rounded-md text-[8px] font-black text-black italic">VIP0</div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-4xl font-black italic tracking-tighter">{formatCurrency(profile?.balance || 0)}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-4 gap-4 sm:gap-8">
                    {[
                      { icon: ArrowDownToLine, label: t.deposit, action: () => setShowDepositModal(true) },
                      { icon: ArrowUpFromLine, label: t.withdraw, action: () => setShowWithdrawModal(true) },
                      { icon: Gift, label: t.bonus, action: () => setShowRewardsModal(true) },
                      { icon: Award, label: t.vip, action: () => setShowVipModal(true) }
                    ].map((btn, i) => (
                      <button key={i} onClick={btn.action} className="flex flex-col items-center gap-3 group">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-black transition-all shadow-inner">
                           <btn.icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors">{btn.label}</span>
                      </button>
                    ))}
                 </div>
              </div>

              {/* Search Section */}
              <div className="bg-brand-surface border border-brand-line rounded-3xl p-2 flex items-center shadow-lg">
                 <div className="bg-brand-bg px-4 py-3 rounded-2xl flex items-center gap-2 border border-brand-line shadow-inner">
                    <span className="font-black text-brand-primary italic text-xs">{t.id}</span>
                 </div>
                 <div className="flex-1 relative mx-4">
                    <input 
                      type="text" 
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none text-sm font-bold placeholder:text-gray-600 focus:outline-none"
                    />
                 </div>
                 <button className="bg-brand-primary p-3 rounded-2xl text-black shadow-lg shadow-brand-primary/30 active:scale-90 transition-transform">
                    <Search className="w-5 h-5" />
                 </button>
              </div>

              {/* Popular Events Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Flame className="w-6 h-6 text-brand-primary fill-brand-primary/20" />
                   <h2 className="text-xl font-black italic uppercase tracking-tighter">{t.popularEvents}</h2>
                </div>
                <button className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-xl text-[10px] font-black text-green-500 uppercase tracking-widest">
                   <CheckCircle2 className="w-3 h-3" />
                   {t.betPlan}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMatches.length > 0 ? (
                  filteredMatches.map(match => (
                    <MatchCard key={match.id} match={match} onClick={(m) => setSelectedMatch(m)} />
                  ))
                ) : (
                  <div className="col-span-full h-64 flex flex-col items-center justify-center text-center p-8 bg-brand-surface border border-brand-line border-dashed rounded-[2.5rem]">
                    <Dice5 className="w-12 h-12 text-brand-line mb-4" />
                    <p className="text-gray-400 font-medium">{t.noMatches}</p>
                    <p className="text-gray-600 text-xs mt-1">{t.noMatchesSub}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'bets' ? (
              <motion.div
                key="bets"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-brand-surface border border-brand-line rounded-[2.5rem] overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-brand-line flex items-center justify-between bg-white/[0.02]">
                   <div>
                      <h2 className="text-2xl font-black italic uppercase">{t.myBets}</h2>
                      <p className="text-xs text-gray-500 font-mono italic">HISTORIAL DE ACTIVIDAD RECIENTE</p>
                   </div>
                   <Activity className="w-8 h-8 text-brand-primary opacity-20" />
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand-bg/50">
                        <th className="data-grid-header px-8 py-5">{t.date}</th>
                        <th className="data-grid-header px-8 py-5">{t.match}</th>
                        <th className="data-grid-header px-8 py-5">{t.score}</th>
                        <th className="data-grid-header px-8 py-5">{t.amount}</th>
                        <th className="data-grid-header px-8 py-5">{t.roi}</th>
                        <th className="data-grid-header px-8 py-5">{t.status}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-line">
                      {bets.map(bet => (
                        <tr key={bet.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-6 text-xs text-gray-500 font-mono italic">{bet.createdAt?.toDate ? bet.createdAt.toDate().toLocaleString() : '---'}</td>
                          <td className="px-8 py-6 font-bold">{bet.homeTeam} vs {bet.awayTeam}</td>
                          <td className="px-8 py-6 font-mono text-sm">
                            <span className="text-xs text-gray-500 mr-2 uppercase">{t.anti}</span>
                            {bet.selectedScore}
                          </td>
                          <td className="px-8 py-6 font-mono text-sm font-bold whitespace-nowrap tracking-tighter">
                            {formatCurrency(bet.amount)}
                          </td>
                          <td className="px-8 py-6 font-mono text-sm text-brand-primary font-bold">{bet.roi.toFixed(2)}%</td>
                          <td className="px-8 py-6">
                            <span className={cn(
                               "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                               bet.status === 'pending' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                               bet.status === 'won' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                              {bet.status === 'pending' ? t.pending : bet.status === 'won' ? t.won : t.lost}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
          ) : activeTab === 'trade' ? (
             <TradeView bets={bets} t={t} />
          ) : activeTab === 'invite' ? (
             <InvitationView profile={profile} t={t} />
          ) : activeTab === 'me' ? (
             <ProfileView 
               profile={profile} 
               t={t} 
               onVipClick={() => setShowVipModal(true)}
               onBetHistoryClick={() => handleTabChange('bets')}
               onSupportClick={() => setShowSupport(true)}
               onInviteClick={() => handleTabChange('invite')}
               onDepositClick={() => setShowDepositModal(true)}
               onWithdrawClick={() => setShowWithdrawModal(true)}
               onLogout={() => auth.signOut()}
             />
          ) : activeTab === 'admin' ? (
            <AdminPanel />
          ) : (
            <div className="flex items-center justify-center h-96 bg-brand-surface rounded-[2.5rem] border border-brand-line border-dashed">
                <div className="text-center space-y-4">
                   <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <LayoutDashboard className="w-8 h-8 text-brand-primary" />
                   </div>
                   <p className="text-gray-400 font-bold uppercase tracking-widest">{activeTab} Section</p>
                </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-brand-surface/95 backdrop-blur-md border-t border-brand-line px-4 py-3 z-[2000] flex items-center justify-around md:hidden safe-area-bottom">
        {[
          { id: 'home', icon: Home, label: t.home },
          { id: 'market', icon: Tags, label: t.market },
          { id: 'trade', icon: Activity, label: t.trade },
          { id: 'invite', icon: Users, label: t.invite },
          { id: 'me', icon: User, label: t.me }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id as Tab)}
            className={cn(
              "flex flex-col items-center gap-1.5 px-3 py-1.5 transition-all text-gray-500",
              activeTab === item.id && "text-brand-primary"
            )}
          >
            <item.icon className={cn("w-6 h-6", activeTab === item.id && "scale-110")} />
            <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Desktop Sidebar Fallback if needed or just use activeTab headers */}
      <div className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 bg-brand-surface/80 backdrop-blur-md border border-brand-line px-8 py-4 rounded-[2rem] shadow-2xl items-center gap-12 z-[2000]">
        {[
          { id: 'home', icon: Home, label: t.home },
          { id: 'bets', icon: Clock, label: t.myBets },
          { id: 'admin', icon: ShieldCheck, label: t.admin, adminOnly: true },
        ].filter(i => !i.adminOnly || profile?.role === 'admin').map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id as Tab)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all group",
              activeTab === item.id ? "text-brand-primary scale-110" : "text-gray-500 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedMatch && profile && (
          <BetModal 
            match={selectedMatch} 
            profile={profile} 
            onClose={() => setSelectedMatch(null)}
            onPlaceBet={handlePlaceBet}
          />
        )}
        {showSupport && (
          <SupportModal onClose={() => setShowSupport(false)} t={t} />
        )}
        {showDepositModal && (
          <DepositModal 
            onClose={() => setShowDepositModal(false)} 
            t={t} 
          />
        )}
        {showWithdrawModal && (
          <WithdrawModal 
            onClose={() => setShowWithdrawModal(false)} 
            onWithdraw={handleWithdraw}
            profile={profile}
            t={t} 
          />
        )}
        {showRewardsModal && (
          <RewardsModal 
            onClose={() => setShowRewardsModal(false)} 
            onDeposit={() => {
              setShowRewardsModal(false);
              setShowDepositModal(true);
            }}
            onBet={() => {
              setShowRewardsModal(false);
              setActiveTab('home');
            }}
            profile={profile}
            t={t} 
          />
        )}
        {showLuckyBoxModal && (
          <LuckyBoxModal
            onClose={() => setShowLuckyBoxModal(false)}
            profile={profile}
            t={t}
          />
        )}
        {showVipModal && (
          <VipModal
            onClose={() => setShowVipModal(false)}
            profile={profile}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

