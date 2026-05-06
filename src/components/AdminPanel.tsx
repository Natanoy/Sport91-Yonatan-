import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  orderBy,
  setDoc,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { UserProfile, Match } from '../types';
import { syncFootballMatches } from '../services/matchSyncService';
import { 
  Users, 
  Plus, 
  Minus, 
  Shield, 
  ShieldAlert, 
  Search, 
  CreditCard,
  Activity,
  RefreshCcw,
  Trophy,
  History
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { format } from 'date-fns';

export default function AdminPanel() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncInfo, setLastSyncInfo] = useState<{ date: Date; count: number } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => d.data() as UserProfile));
      setLoading(false);
    });

    // Fetch last sync info
    getDoc(doc(db, 'system', 'match_sync')).then(snap => {
      if (snap.exists()) {
        setLastSyncInfo({
          date: snap.data().lastSync?.toDate() || new Date(),
          count: snap.data().matchCount || 0
        });
      }
    });

    // Trigger auto-sync on mount (it has internal check to not over-sync)
    handleAutoSync();

    return () => unsub();
  }, []);

  const handleAutoSync = async () => {
    try {
      await syncFootballMatches();
      const snap = await getDoc(doc(db, 'system', 'match_sync'));
      if (snap.exists()) {
        setLastSyncInfo({
          date: snap.data().lastSync?.toDate() || new Date(),
          count: snap.data().matchCount || 0
        });
      }
    } catch (e) {
      console.error('Auto-sync failed:', e);
    }
  };

  const adjustBalance = async (uid: string, current: number, amount: number) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        balance: Math.max(0, current + amount)
      });
    } catch (e) {
      alert('Error updating balance');
    }
  };

  const toggleAdmin = async (uid: string, currentRole: string | undefined) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        role: currentRole === 'admin' ? 'user' : 'admin'
      });
    } catch (e) {
      alert('Only bootstrap admin can manage roles or permission denied');
    }
  };

  const syncMatches = async () => {
    setIsSyncing(true);
    try {
      const result = await syncFootballMatches();
      if (result.success) {
        alert(result.count ? `Sincronización exitosa: ${result.count} eventos.` : 'Ya estaba actualizado recientemente.');
      }
      
      const snap = await getDoc(doc(db, 'system', 'match_sync'));
      if (snap.exists()) {
        setLastSyncInfo({
          date: snap.data().lastSync?.toDate() || new Date(),
          count: snap.data().matchCount || 0
        });
      }
    } catch (e) {
      console.error(e);
      alert('Error syncing matches. Make sure API KEY is configured.');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Management Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-surface border border-brand-line p-6 rounded-2xl">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-brand-primary" />
              {t.usersMaster}
            </h2>
            <p className="text-[10px] text-gray-500 font-mono mt-1">{filteredUsers.length} USUARIOS ACTIVOS</p>
          </div>
          <div className="relative w-full md:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder={t.searchUsers} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-brand-line rounded-lg pl-10 pr-4 py-2 text-[10px] focus:outline-none focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {/* API Sync Section */}
        <div className="bg-brand-surface border border-brand-line p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2 text-white text-brand-primary">
              <Trophy className="w-5 h-5" />
              API DEPORTIVA
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <History className="w-3 h-3 text-gray-500" />
               <p className="text-[9px] text-gray-500 font-mono uppercase">
                 Última Sinc: {lastSyncInfo ? format(lastSyncInfo.date, 'dd/MM HH:mm') : 'NUNCA'} ({lastSyncInfo?.count || 0} event)
               </p>
            </div>
          </div>
          <button 
            onClick={syncMatches}
            disabled={isSyncing}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg",
              isSyncing ? "bg-gray-800 text-gray-600 animate-pulse" : "bg-red-600 text-white hover:bg-red-500 active:scale-95"
            )}
          >
            <RefreshCcw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-line rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg/50">
                <th className="data-grid-header px-6">{t.userLabel}</th>
                <th className="data-grid-header px-6">{t.currentBalance}</th>
                <th className="data-grid-header px-6">{t.actions}</th>
                <th className="data-grid-header px-6">{t.privileges}</th>
                <th className="data-grid-header px-6 text-right">{t.liveStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {filteredUsers.map(user => (
                <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
                        {user.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{user.displayName}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-bold text-green-500">
                    {formatCurrency(user.balance)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => adjustBalance(user.uid, user.balance, 100)}
                        className="p-1.5 bg-green-500/10 text-green-500 rounded-md hover:bg-green-500/20 transition-all"
                        title="Add $100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => adjustBalance(user.uid, user.balance, -100)}
                        className="p-1.5 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-all"
                        title="Subtract $100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleAdmin(user.uid, user.role)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all",
                        user.role === 'admin' 
                          ? "bg-brand-primary text-black" 
                          : "bg-brand-line text-gray-500 hover:text-gray-300"
                      )}
                    >
                      {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {user.role === 'admin' ? t.administrator : t.userLabel}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-green-500/70">
                      <Activity className="w-3 h-3" />
                      ONLINE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
