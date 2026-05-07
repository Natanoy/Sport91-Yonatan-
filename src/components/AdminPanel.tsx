import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../lib/firebase';
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
  limit,
  addDoc
} from 'firebase/firestore';
import { UserProfile, UserRole, SystemSettings, AdminLog } from '../types';
import { syncFootballMatches } from '../services/matchSyncService';
import { 
  Users, 
  Shield, 
  Activity,
  Trophy,
  History,
  Zap,
  LayoutDashboard,
  CreditCard,
  MessageSquare,
  Settings,
  ArrowRight,
  LogOut,
  RefreshCcw,
  ShieldAlert,
  Target,
  Search,
  Bell,
  Maximize2
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { format } from 'date-fns';

// Import sub-components
import DashboardStats from './admin/DashboardStats';
import UserManagement from './admin/UserManagement';
import FinanceHub from './admin/FinanceHub';
import BettingManager from './admin/BettingManager';
import SecurityCenter from './admin/SecurityCenter';
import SystemSettingsManager from './admin/SystemSettings';

type AdminTab = 'dashboard' | 'users' | 'finance' | 'bets' | 'security' | 'settings';

export default function AdminPanel() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Users Listener
    const unsubUsers = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), (snap) => {
      setUsers(snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile)));
      setLoading(false);
    });

    // Withdrawals Listener
    const unsubWithdr = onSnapshot(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')), (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Deposits Listener (pending approvals)
    const unsubDep = onSnapshot(query(collection(db, 'deposits'), orderBy('createdAt', 'desc')), (snap) => {
      setDeposits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // System Settings Listener
    const unsubSettings = onSnapshot(doc(db, 'system', 'settings'), (snap) => {
      if (snap.exists()) setSystemSettings(snap.data() as SystemSettings);
      else {
        // Init default settings if not exists
        const defaults: SystemSettings = {
          platformName: 'Sport91FC',
          maintenanceMode: false,
          aiProfitMultiplier: 1.0,
          minWithdrawal: 10,
          maxWithdrawal: 50000,
          withdrawalFee: 3,
          depositAddress: 'TXSampleAddress123',
          network: 'TRC20'
        };
        setDoc(doc(db, 'system', 'settings'), defaults);
        setSystemSettings(defaults);
      }
    });

    return () => {
      unsubUsers();
      unsubWithdr();
      unsubDep();
      unsubSettings();
    };
  }, []);

  const stats = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isOnline).length || users.length,
    totalDeposited: users.reduce((acc, u) => acc + (u.totalDeposits || 0), 0),
    totalWithdrawn: users.reduce((acc, u) => acc + (u.totalWithdrawals || 0), 0),
    totalProfit: users.reduce((acc, u) => acc + (u.totalDeposits || 0) - (u.totalWithdrawals || 0), 0),
    activeInvestments: users.filter(u => (u.unliquidated || 0) > 0).length,
  }), [users]);

  // Actions
  const handleAdjustBalance = async (uid: string, current: number, amount: number) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() as UserProfile;
      
      const newNotification = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'deposit',
        title: amount > 0 ? 'Abono Confirmado' : 'Ajuste de Cartera',
        message: amount > 0 
          ? `Su transferencia de ${amount} USDT ha sido verificada y acreditada exitosamente.`
          : `Se ha realizado un ajuste administrativo de ${Math.abs(amount)} USDT.`,
        timestamp: Timestamp.now(),
        read: false,
        amount: Math.abs(amount)
      };

      await updateDoc(userRef, {
        balance: Math.max(0, current + amount),
        notifications: [newNotification, ...(userData.notifications || [])].slice(0, 50)
      });
      
      // Log Action
      await addDoc(collection(db, 'admin_logs'), {
        adminId: auth.currentUser?.uid,
        adminEmail: auth.currentUser?.email,
        action: 'BALANCE_ADJUST',
        targetUserId: uid,
        details: `Adjusted by ${amount}. New balance: ${Math.max(0, current + amount)}`,
        timestamp: Timestamp.now()
      });
    } catch (e) {
      console.error(e);
      alert('Error en el ajuste');
    }
  };

  const handleToggleRole = async (uid: string, currentRole: UserRole | undefined) => {
    const roles: UserRole[] = ['user', 'manager', 'moderator', 'admin', 'super_admin'];
    const currentIdx = roles.indexOf(currentRole || 'user');
    const nextRole = roles[(currentIdx + 1) % roles.length];
    
    if (confirm(`¿Cambiar rol a ${nextRole}?`)) {
      await updateDoc(doc(db, 'users', uid), { role: nextRole });
    }
  };

  const handleFinanceAction = async (item: any, type: 'withdrawal' | 'deposit', status: 'approved' | 'rejected') => {
    try {
      const userRef = doc(db, 'users', item.userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      const userData = userSnap.data() as UserProfile;

      if (type === 'withdrawal') {
        await updateDoc(doc(db, 'withdrawals', item.id), { status });
        if (status === 'rejected') {
          // Refund
          await updateDoc(userRef, { balance: userData.balance + item.amount });
        } else {
          // Track total withdrawn
          await updateDoc(userRef, { totalWithdrawals: (userData.totalWithdrawals || 0) + item.amount });
        }
      } else {
        await updateDoc(doc(db, 'deposits', item.id), { status });
        if (status === 'approved') {
          await updateDoc(userRef, { 
            balance: userData.balance + item.amount,
            totalDeposits: (userData.totalDeposits || 0) + item.amount
          });
        }
      }

      // Notification
      const newNotif = {
        id: Math.random().toString(36).substring(2, 9),
        type: status === 'approved' ? 'deposit' : 'withdrawal_rejected',
        title: status === 'approved' ? 'Transacción Aprobada' : 'Transacción Rechazada',
        message: `Su solicitud de ${type} por ${item.amount} USDT ha sido ${status === 'approved' ? 'procesada exitosamente' : 'denegada por el departamento de seguridad'}.`,
        timestamp: Timestamp.now(),
        read: false
      };
      await updateDoc(userRef, { notifications: [newNotif, ...(userData.notifications || [])].slice(0, 50) });

      alert('Operación finalizada');
    } catch (e) {
      console.error(e);
      alert('Error procesando finanzas');
    }
  };

  const handleEnterLiveMode = (user: UserProfile) => {
    if (confirm(`¿Desea entrar en MODO LIVE como ${user.displayName}? Podrá ver la interfaz exactamente como él la ve.`)) {
      localStorage.setItem('qx_impersonate_uid', user.uid);
      localStorage.setItem('qx_impersonate_name', user.displayName);
      window.location.reload();
    }
  };

  const handleBroadcast = async (title: string, message: string) => {
    await addDoc(collection(db, 'announcements'), {
      title,
      message,
      timestamp: Timestamp.now(),
      authorEmail: auth.currentUser?.email
    });
  };

  const handleSaveSettings = async (data: Partial<SystemSettings>) => {
    await updateDoc(doc(db, 'system', 'settings'), data);
    alert('Configuración guardada');
  };

  const menuItems = useMemo(() => [
    { id: 'dashboard', label: 'Monitor Central', icon: LayoutDashboard },
    { id: 'users', label: 'Control de Usuarios', icon: Users },
    { id: 'finance', label: 'Gestión Financiera', icon: CreditCard },
    { id: 'bets', label: 'Riesgo Deportivo', icon: Target },
    { id: 'security', label: 'Inteligencia & Seguridad', icon: ShieldAlert },
    { id: 'settings', label: 'Configuración Núcleo', icon: Settings },
  ], []);

  const activeItem = useMemo(() => menuItems.find(m => m.id === activeTab), [activeTab, menuItems]);
  const ActiveIcon = activeItem?.icon || LayoutDashboard;

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <Zap className="w-12 h-12 text-brand-primary animate-pulse" />
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic tracking-widest">Sport91FC Control Center • Autologin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-white flex overflow-hidden font-sans selection:bg-brand-primary/30">
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 88 }}
        className="bg-brand-surface border-r border-white/5 flex flex-col relative z-50 overflow-hidden shadow-[10px_0_40px_rgba(0,0,0,0.5)]"
      >
        <div className="p-6 h-24 flex items-center border-b border-white/5 mb-6 group cursor-pointer">
           <div className="p-3 bg-brand-primary rounded-2xl shrink-0 shadow-[0_0_25px_rgba(223,255,0,0.4)] group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-black" />
           </div>
           <AnimatePresence>
             {isSidebarOpen && (
               <motion.div
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -10 }}
                 className="ml-4 overflow-hidden"
               >
                  <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Sport91<span className="text-brand-primary">FC</span></h1>
                  <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] leading-none mt-1">NUCLEUS OS v2.0</p>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="flex-1 px-4 space-y-6">
           <div>
              {isSidebarOpen && <p className="px-4 text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Operaciones</p>}
              <div className="space-y-1">
                 {menuItems.slice(0, 3).map((item) => (
                    <NavButton 
                       key={item.id} 
                       item={item} 
                       active={activeTab === item.id} 
                       collapsed={!isSidebarOpen} 
                       onClick={() => setActiveTab(item.id as AdminTab)} 
                    />
                 ))}
              </div>
           </div>

           <div>
              {isSidebarOpen && <p className="px-4 text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Riesgo & Datos</p>}
              <div className="space-y-1">
                 {menuItems.slice(3, 5).map((item) => (
                    <NavButton 
                       key={item.id} 
                       item={item} 
                       active={activeTab === item.id} 
                       collapsed={!isSidebarOpen} 
                       onClick={() => setActiveTab(item.id as AdminTab)} 
                    />
                 ))}
              </div>
           </div>

           <div>
              {isSidebarOpen && <p className="px-4 text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Sistema</p>}
              <div className="space-y-1">
                 {menuItems.slice(5).map((item) => (
                    <NavButton 
                       key={item.id} 
                       item={item} 
                       active={activeTab === item.id} 
                       collapsed={!isSidebarOpen} 
                       onClick={() => setActiveTab(item.id as AdminTab)} 
                    />
                 ))}
              </div>
           </div>
        </div>

        <div className="p-4 mt-auto border-t border-white/5 space-y-2">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="w-full flex items-center justify-center h-12 rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-all group"
           >
              <motion.div animate={{ rotate: isSidebarOpen ? 0 : 180 }}>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
           </button>
           <button 
             onClick={() => window.location.reload()}
             className="w-full flex items-center justify-center h-12 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
           >
              <LogOut className="w-4 h-4" />
           </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/[0.03] via-transparent to-transparent pointer-events-none -z-10" />

        <div className="h-10 bg-brand-primary text-black flex items-center px-8 relative z-50 shadow-[0_4px_20px_rgba(223,255,0,0.2)] overflow-hidden">
           <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
              <TickerItem label="EXPOSICIÓN TOTAL" value={formatCurrency(stats.totalDeposited - stats.totalWithdrawn)} />
              <div className="w-1 h-1 rounded-full bg-black/20" />
              <TickerItem label="USUARIOS ONLINE" value={stats.activeUsers} pulse />
              <div className="w-1 h-1 rounded-full bg-black/20" />
              <TickerItem label="ALFONSO API STATUS" value="OPERATIONAL" green />
              <div className="w-1 h-1 rounded-full bg-black/20" />
              <TickerItem label="LATENCIA GLOBAL" value="12ms" />
              <div className="w-1 h-1 rounded-full bg-black/20" />
              <TickerItem label="VOLUMEN 24H" value={formatCurrency(stats.totalDeposited / 30)} />
           </div>
        </div>

        <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-brand-surface/40 backdrop-blur-2xl z-40">
           <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                 <ActiveIcon className="w-4 h-4 text-brand-primary" />
              </div>
              <h2 className="text-lg font-black text-white italic uppercase tracking-tighter">
                {activeItem?.label || 'N/A'}
              </h2>
           </div>

           <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl px-4 py-2">
                 <Search className="w-3.5 h-3.5 text-gray-500" />
                 <input 
                   type="text" 
                   placeholder="Quick search (CMD+K)" 
                   className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase text-white placeholder:text-gray-700 w-48"
                 />
              </div>
              
              <div className="flex items-center gap-2 pl-4 border-l border-white/5">
                 <button className="p-2.5 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                    <Bell className="w-4 h-4" />
                 </button>
                 <button className="p-2.5 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                    <Settings className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="max-w-[1600px] mx-auto"
            >
              {activeTab === 'dashboard' && <DashboardStats stats={stats} />}
              {activeTab === 'users' && (
                <UserManagement 
                   users={users} 
                   onAdjustBalance={handleAdjustBalance}
                   onToggleRole={handleToggleRole}
                   onEnterLiveMode={handleEnterLiveMode}
                   onUpdateUser={(uid, data) => updateDoc(doc(db, 'users', uid), data)}
                />
              )}
              {activeTab === 'finance' && <FinanceHub />}
              {activeTab === 'bets' && <BettingManager />}
              {activeTab === 'security' && <SecurityCenter />}
              {activeTab === 'settings' && systemSettings && (
                <SystemSettingsManager 
                   settings={systemSettings}
                   onSave={handleSaveSettings}
                   onBroadcast={handleBroadcast}
                 />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavButton({ item, active, onClick, collapsed }: any) {
  const Icon = item.icon;
  return (
      <button
         onClick={onClick}
         className={cn(
            "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative",
            active 
               ? "bg-brand-primary text-black shadow-[0_0_20px_rgba(223,255,0,0.2)]" 
               : "text-gray-500 hover:bg-white/5 hover:text-white"
         )}
      >
         <Icon className={cn(
            "w-4 h-4 shrink-0 transition-transform", 
            active ? "text-black" : "text-gray-500 group-hover:text-brand-primary",
            !active && "group-hover:scale-110"
         )} />
         {!collapsed && (
            <span className="text-[10px] font-black uppercase tracking-widest italic truncate">{item.label}</span>
         )}
         {active && (
            <motion.div 
               layoutId="active-indicator"
               className="absolute left-0 w-1 h-1/2 bg-black rounded-r-full"
            />
         )}
      </button>
   );
}

function TickerItem({ label, value, pulse, green }: any) {
   return (
      <div className="flex items-center gap-2">
         <span className="text-[8px] font-black text-black/50 uppercase tracking-tighter">{label}</span>
         <div className="flex items-center gap-1.5">
            {pulse && <div className="w-1 h-1 rounded-full bg-black animate-pulse" />}
            <span className={cn(
               "text-[10px] font-black italic uppercase",
               green ? "text-green-900" : "text-black"
            )}>{value}</span>
         </div>
      </div>
   );
}
