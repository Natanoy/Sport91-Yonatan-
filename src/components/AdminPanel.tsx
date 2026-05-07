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
  getDoc,
  where,
  limit
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
  History,
  Eye,
  MessageSquare,
  Zap,
  Lock,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { format } from 'date-fns';

export default function AdminPanel() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncInfo, setLastSyncInfo] = useState<{ date: Date; count: number } | null>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTabPanel, setActiveTabPanel] = useState<'users' | 'withdrawals' | 'tickets'>('users');
  const [selectedUserForMonitor, setSelectedUserForMonitor] = useState<UserProfile | null>(null);
  const [userBetsForMonitor, setUserBetsForMonitor] = useState<any[]>([]);

  useEffect(() => {
    if (selectedUserForMonitor) {
      const q = query(
        collection(db, 'bets'), 
        where('userId', '==', selectedUserForMonitor.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const unsub = onSnapshot(q, (snap) => {
        setUserBetsForMonitor(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [selectedUserForMonitor]);

  useEffect(() => {
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setUsers(snap.docs.map(d => d.data() as UserProfile));
      setLoading(false);
    });

    const qWithdrawals = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
    const unsubWithdrawals = onSnapshot(qWithdrawals, (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qTickets = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    const unsubTickets = onSnapshot(qTickets, (snap) => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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

    handleAutoSync();

    return () => {
      unsubUsers();
      unsubWithdrawals();
      unsubTickets();
    };
  }, []);

  const handleTicketAction = async (ticketId: string, status: 'resolved' | 'closed') => {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), { status, updatedAt: Timestamp.now() });
      alert('Ticket actualizado');
    } catch (e) {
      console.error(e);
      alert('Error actualizando ticket');
    }
  };

  const handleWithdrawalAction = async (withdrawal: any, status: 'approved' | 'rejected') => {
    try {
      const userRef = doc(db, 'users', withdrawal.userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const userData = userSnap.data() as UserProfile;

      const newNotification = {
        id: Math.random().toString(36).substring(2, 9),
        type: status === 'approved' ? 'withdrawal_approved' : 'withdrawal_rejected',
        title: status === 'approved' ? 'Retiro Liquidado' : 'Solicitud de Retiro Denegada',
        message: status === 'approved'
          ? `Su solicitud de retiro por ${withdrawal.amount} USDT ha sido aprobada y los fondos han sido transferidos a la dirección de destino.`
          : `Lamentamos informarle que su solicitud de retiro por ${withdrawal.amount} USDT no ha podido ser procesada. Los activos han sido reintegrados a su balance de forma inmediata.`,
        timestamp: Timestamp.now(),
        read: false,
        amount: withdrawal.amount
      };

      const notifications = userData.notifications || [];
      const updatedNotifications = [newNotification, ...notifications].slice(0, 50);

      // Update withdrawal status
      await updateDoc(doc(db, 'withdrawals', withdrawal.id), { status });

      // If rejected, refund the user
      if (status === 'rejected') {
        await updateDoc(userRef, {
          balance: userData.balance + withdrawal.amount,
          notifications: updatedNotifications
        });
      } else {
        await updateDoc(userRef, {
          notifications: updatedNotifications
        });
      }

      alert(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} con éxito.`);
    } catch (e) {
      console.error(e);
      alert('Error al procesar el retiro');
    }
  };

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
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() as UserProfile;
      
      const newNotification = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'deposit',
        title: amount > 0 ? 'Abono Confirmado' : 'Ajuste de Cartera',
        message: amount > 0 
          ? `Su transferencia de ${amount} USDT ha sido verificada y acreditada exitosamente a su balance principal.`
          : `Se ha realizado un ajuste administrativo en su balance por un monto de ${Math.abs(amount)} USDT.`,
        timestamp: Timestamp.now(),
        read: false,
        amount: Math.abs(amount)
      };

      const notifications = userData.notifications || [];
      const updatedNotifications = [newNotification, ...notifications].slice(0, 50);

      await updateDoc(userRef, {
        balance: Math.max(0, current + amount),
        notifications: updatedNotifications
      });
    } catch (e) {
      console.error(e);
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
        <div className="bg-brand-surface border border-brand-line p-6 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-brand-primary" />
                {t.usersMaster}
              </h2>
              <div className="flex gap-4 mt-2">
                 <button 
                   onClick={() => setActiveTabPanel('users')}
                   className={cn(
                     "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all",
                     activeTabPanel === 'users' ? "bg-brand-primary text-black" : "text-gray-500 hover:text-white bg-white/5"
                   )}
                 >
                   Usuarios
                 </button>
                 <button 
                   onClick={() => setActiveTabPanel('withdrawals')}
                   className={cn(
                     "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all",
                     activeTabPanel === 'withdrawals' ? "bg-brand-primary text-black" : "text-gray-500 hover:text-white bg-white/5"
                   )}
                 >
                   Retiros ({withdrawals.filter(w => w.status === 'pending').length})
                 </button>
                 <button 
                   onClick={() => setActiveTabPanel('tickets')}
                   className={cn(
                     "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all",
                     activeTabPanel === 'tickets' ? "bg-brand-primary text-black" : "text-gray-500 hover:text-white bg-white/5"
                   )}
                 >
                   Tickets ({tickets.filter(t => t.status === 'pending').length})
                 </button>
              </div>
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
          {activeTabPanel === 'users' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg/50">
                  <th className="data-grid-header px-6 py-4">{t.userLabel}</th>
                  <th className="data-grid-header px-6 py-4">MONITOR</th>
                  <th className="data-grid-header px-6 py-4">{t.currentBalance}</th>
                  <th className="data-grid-header px-6 py-4">{t.actions}</th>
                  <th className="data-grid-header px-6 py-4">{t.privileges}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {filteredUsers.map(user => (
                  <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs ring-1 ring-brand-primary/20">
                          {user.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{user.displayName}</p>
                          <p className="text-[10px] text-gray-500 font-mono italic">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedUserForMonitor(user)}
                            className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all group/btn"
                            title="Monitor User"
                          >
                             <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button 
                            onClick={() => alert(`Iniciando modo live para: ${user.email}\n(Función restringida por seguridad)`)}
                            className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all group/btn"
                            title="Impersonate"
                          >
                             <Zap className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
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
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTabPanel === 'withdrawals' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg/50">
                  <th className="data-grid-header px-6 py-4">FECHA</th>
                  <th className="data-grid-header px-6 py-4">USUARIO</th>
                  <th className="data-grid-header px-6 py-4">CANTIDAD</th>
                  <th className="data-grid-header px-6 py-4">DESTINO</th>
                  <th className="data-grid-header px-6 py-4">ESTADO</th>
                  <th className="data-grid-header px-6 py-4 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {withdrawals.map(w => {
                  const u = users.find(u => u.uid === w.userId);
                  return (
                    <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-[10px] font-mono text-gray-500 uppercase">
                        {w.createdAt?.toDate ? format(w.createdAt.toDate(), 'dd/MM HH:mm') : '---'}
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-xs font-bold">{u?.displayName || 'Desconocido'}</p>
                         <p className="text-[10px] text-gray-500 font-mono italic">{u?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm font-bold text-red-400">
                        {formatCurrency(w.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{w.network}</p>
                        <p className="text-[9px] font-mono text-gray-600 truncate max-w-[120px]">{w.address}</p>
                      </td>
                      <td className="px-6 py-4">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                           w.status === 'pending' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                           w.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                           "bg-red-500/10 text-red-500 border border-red-500/20"
                         )}>
                           {w.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {w.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => handleWithdrawalAction(w, 'approved')}
                               className="p-1 px-3 bg-emerald-500 text-black rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-emerald-400 active:scale-95 transition-all"
                             >
                               Aprobar
                             </button>
                             <button 
                               onClick={() => handleWithdrawalAction(w, 'rejected')}
                               className="p-1 px-3 bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-red-400 active:scale-95 transition-all"
                             >
                               Rechazar
                             </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg/50">
                  <th className="data-grid-header px-6 py-4">TICKET ID / FECHA</th>
                  <th className="data-grid-header px-6 py-4">USUARIO</th>
                  <th className="data-grid-header px-6 py-4">ASUNTO / MENSAJE</th>
                  <th className="data-grid-header px-6 py-4">ESTADO</th>
                  <th className="data-grid-header px-6 py-4 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {tickets.map(tk => {
                  const u = users.find(u => u.uid === tk.userId);
                  return (
                    <tr key={tk.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                         <p className="text-[10px] font-mono font-black text-brand-primary uppercase">#{tk.id.slice(0, 8)}</p>
                         <p className="text-[9px] text-gray-500 uppercase mt-1">
                           {tk.createdAt?.toDate ? format(tk.createdAt.toDate(), 'dd/MM HH:mm') : '---'}
                         </p>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-xs font-bold">{u?.displayName || 'Cliente'}</p>
                         <p className="text-[10px] text-gray-500 font-mono italic">{u?.email || tk.email}</p>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                         <p className="text-[10px] font-black text-white italic uppercase truncate mb-1">{tk.subject}</p>
                         <p className="text-[10px] text-gray-500 leading-tight line-clamp-2">{tk.message}</p>
                      </td>
                      <td className="px-6 py-4">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                           tk.status === 'pending' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                           tk.status === 'resolved' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                           "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                         )}>
                           {tk.status === 'pending' ? 'Pendiente' : tk.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {tk.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                             <button 
                               onClick={() => handleTicketAction(tk.id, 'resolved')}
                               className="p-1 px-3 bg-emerald-500 text-black rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-emerald-400 active:scale-95 transition-all"
                             >
                               Resolver
                             </button>
                             <button 
                               onClick={() => handleTicketAction(tk.id, 'closed')}
                               className="p-1 px-3 bg-white/5 text-white rounded-lg text-[9px] font-black uppercase tracking-tighter hover:bg-white/10 active:scale-95 transition-all"
                             >
                               Cerrar
                             </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MONITOR MODAL */}
      <AnimatePresence>
        {selectedUserForMonitor && (
          <div className="fixed inset-0 z-[4000] flex items-end md:items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedUserForMonitor(null)}
               className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
               initial={{ opacity: 0, y: 100, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 100, scale: 0.9 }}
               className="w-full max-w-lg bg-brand-bg border border-brand-line rounded-[2.5rem] p-8 relative overflow-hidden z-20 shadow-2xl"
            >
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-2xl font-black italic">
                        {selectedUserForMonitor.displayName.charAt(0)}
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                           {selectedUserForMonitor.displayName}
                        </h2>
                        <p className="text-[10px] text-gray-500 font-mono">{selectedUserForMonitor.email}</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUserForMonitor(null)}
                    className="p-3 bg-white/5 rounded-2xl text-gray-400 hover:text-white"
                  >
                     <Zap className="w-6 h-6 rotate-45" />
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-brand-surface border border-white/5 p-5 rounded-3xl">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Balance Actual</p>
                     <p className="text-xl font-mono font-black text-emerald-500">{formatCurrency(selectedUserForMonitor.balance)}</p>
                  </div>
                  <div className="bg-brand-surface border border-white/5 p-5 rounded-3xl">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Rol Sistema</p>
                     <p className={cn(
                       "text-xs font-mono font-black uppercase",
                       selectedUserForMonitor.role === 'admin' ? "text-brand-primary" : "text-gray-400"
                     )}>
                       {selectedUserForMonitor.role || 'user'}
                     </p>
                  </div>
                  <div className="bg-brand-surface border border-white/5 p-5 rounded-3xl">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Beneficio Semanal</p>
                     <p className="text-xl font-mono font-black text-blue-500">{formatCurrency(selectedUserForMonitor.weeklyProfit || 0)}</p>
                  </div>
                  <div className="bg-brand-surface border border-white/5 p-5 rounded-3xl">
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Fecha Registro</p>
                     <p className="text-xs font-mono font-black text-gray-400 uppercase">
                        {selectedUserForMonitor.createdAt?.toDate ? format(selectedUserForMonitor.createdAt.toDate(), 'dd/MM/yyyy') : '---'}
                     </p>
                  </div>
               </div>

               {userBetsForMonitor.length > 0 && (
                 <div className="mb-8">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <Activity className="w-3 h-3 text-brand-primary" />
                       Últimas Órdenes (Beta Live)
                    </p>
                    <div className="space-y-2">
                       {userBetsForMonitor.map(bet => (
                         <div key={bet.id} className="bg-black/40 border border-white/5 p-3 rounded-2xl flex justify-between items-center">
                            <div>
                               <p className="text-[10px] font-bold text-white uppercase italic">{bet.homeTeam} vs {bet.awayTeam}</p>
                               <p className="text-[9px] text-gray-500 font-mono">Anti {bet.selectedScore} • {formatCurrency(bet.amount)}</p>
                            </div>
                            <span className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5 rounded border",
                              bet.status === 'won' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" :
                              bet.status === 'lost' ? "text-red-500 border-red-500/20 bg-red-500/5" :
                              "text-blue-500 border-blue-500/20 bg-blue-500/5"
                            )}>
                               {bet.status}
                            </span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               <div className="space-y-3">
                  <button 
                    onClick={() => {
                        window.open(`mailto:${selectedUserForMonitor.email}`);
                    }}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                  >
                     <span className="text-xs font-black text-white italic uppercase tracking-widest">Enviar comunicación</span>
                     <ExternalLink className="w-4 h-4 text-brand-primary group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => {
                        const newBalance = prompt('Ingrese el nuevo balance para este usuario:', selectedUserForMonitor.balance.toString());
                        if (newBalance !== null) {
                            const val = parseFloat(newBalance);
                            if (!isNaN(val)) adjustBalance(selectedUserForMonitor.uid, selectedUserForMonitor.balance, val - selectedUserForMonitor.balance);
                        }
                    }}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                  >
                     <span className="text-xs font-black text-white italic uppercase tracking-widest">Ajuste de Saldo Manual</span>
                     <CreditCard className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => {
                        if (confirm(`¿Desea cambiar el rol de este usuario? (Estado actual: ${selectedUserForMonitor.role || 'user'})`)) {
                            toggleAdmin(selectedUserForMonitor.uid, selectedUserForMonitor.role);
                            setSelectedUserForMonitor(null);
                        }
                    }}
                    className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 rounded-2xl transition-all group"
                  >
                     <span className="text-xs font-black text-red-500 italic uppercase tracking-widest">Alternar Privilegios Admin</span>
                     <Shield className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
