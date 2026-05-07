import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp, where, getDocs, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  DollarSign,
  Briefcase,
  FileText,
  Download,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'failed';
  method: string;
  txHash?: string;
  wallet?: string;
  createdAt: any;
}

export default function FinanceHub() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
  const [stats, setStats] = useState({
    pendingWithdrawals: 0,
    dailyDeposits: 0,
    dailyWithdrawals: 0,
    netProfit: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'deposits'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, type: 'deposit' as const, ...d.data() } as Transaction));
      processTransactions(data);
    });

    const qWithdrawals = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
    const unsubW = onSnapshot(qWithdrawals, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, type: 'withdrawal' as const, ...d.data() } as Transaction));
      processTransactions(data);
    });

    return () => { unsub(); unsubW(); };
  }, []);

  const processTransactions = (newItems: Transaction[]) => {
    setTransactions(prev => {
      const combined = [...newItems, ...prev];
      const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      const sorted = unique.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      
      const pendingW = sorted.filter(t => t.type === 'withdrawal' && t.status === 'pending');
      const today = new Date().setHours(0,0,0,0) / 1000;
      const todayDeps = sorted.filter(t => t.type === 'deposit' && t.createdAt?.seconds > today);
      const todayWithdraws = sorted.filter(t => t.type === 'withdrawal' && t.status === 'approved' && t.createdAt?.seconds > today);
      
      setStats({
        pendingWithdrawals: pendingW.length,
        dailyDeposits: todayDeps.reduce((acc, t) => acc + t.amount, 0),
        dailyWithdrawals: todayWithdraws.reduce((acc, t) => acc + t.amount, 0),
        netProfit: todayDeps.reduce((acc, t) => acc + t.amount, 0) - todayWithdraws.reduce((acc, t) => acc + t.amount, 0)
      });

      return sorted;
    });
  };

  const handleAction = async (id: string, type: 'deposit' | 'withdrawal', status: 'approved' | 'rejected') => {
    const coll = type === 'deposit' ? 'deposits' : 'withdrawals';
    try {
      await updateDoc(doc(db, coll, id), { status, updatedAt: Timestamp.now() });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
       {/* Finance Summary */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FinanceMetric label="Retiros Pendientes" value={stats.pendingWithdrawals} sub="Acción requerida" color="amber" icon={Clock} />
          <FinanceMetric label="Depósitos Hoy" value={formatCurrency(stats.dailyDeposits)} sub="Entrada de capital" color="emerald" icon={ArrowUpRight} />
          <FinanceMetric label="Retiros Hoy" value={formatCurrency(stats.dailyWithdrawals)} sub="Salida de capital" color="red" icon={ArrowDownRight} />
          <FinanceMetric label="Balance Neto Hoy" value={formatCurrency(stats.netProfit)} sub="Rendimiento diario" color="blue" icon={Briefcase} />
       </div>

       {/* Audit Section */}
       <div className="bg-brand-surface border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h3 className="text-lg font-black text-white italic uppercase flex items-center gap-2">
                   <DollarSign className="w-5 h-5 text-brand-primary" />
                   Auditoría Bancaria Sport91FC
                </h3>
                <p className="text-[10px] text-gray-500 font-mono uppercase mt-1 tracking-widest">Logs financieros globales en vivo</p>
             </div>

             <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'success', 'failed'].map((f) => (
                   <button
                     key={f}
                     onClick={() => setFilter(f as any)}
                     className={cn(
                       "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                       filter === f ? "bg-brand-primary text-black" : "bg-white/5 text-gray-500 hover:text-white"
                     )}
                   >
                      {f}
                   </button>
                ))}
                <button className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors ml-2">
                   <Download className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-white/[0.02]">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Id / Fecha</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Usuario</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Monto</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Tipo / Método</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Estado</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Acción</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-mono text-gray-500">#{tx.id.slice(0, 8)}</span>
                               <span className="text-[9px] text-gray-600 font-mono italic">
                                  {tx.createdAt?.toDate ? format(tx.createdAt.toDate(), 'dd MMM, HH:mm') : 'Pendiente'}
                               </span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <p className="text-[11px] font-black text-white uppercase italic">{tx.userEmail}</p>
                            <p className="text-[9px] text-gray-600 font-mono mt-0.5 truncate max-w-[100px]">{tx.userId}</p>
                         </td>
                         <td className="px-6 py-4">
                            <p className={cn(
                               "text-xs font-mono font-black",
                               tx.type === 'deposit' ? "text-emerald-500" : "text-amber-500"
                            )}>
                               {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black text-white uppercase">{tx.type}</span>
                               <span className="text-[9px] text-gray-500 font-mono uppercase">{tx.method || 'USDT TRC20'}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className={cn(
                               "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                               tx.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                               tx.status === 'approved' || tx.status === 'success' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                               "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                               {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                               {tx.status}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                            {tx.status === 'pending' && (
                               <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleAction(tx.id, tx.type, 'approved')}
                                    className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-lg hover:shadow-emerald-500/20"
                                  >
                                     <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleAction(tx.id, tx.type, 'rejected')}
                                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
                                  >
                                     <XCircle className="w-4 h-4" />
                                  </button>
                               </div>
                            )}
                            {tx.status !== 'pending' && (
                               <button className="p-2 bg-white/5 text-gray-600 rounded-lg cursor-default">
                                  <FileText className="w-4 h-4" />
                               </button>
                            )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       {/* Security Warning */}
       <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] flex items-center gap-6">
          <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl">
             <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
             <h4 className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Protección Anti-Lavado Activa</h4>
             <p className="text-[10px] text-gray-500 font-mono italic max-w-2xl leading-relaxed">
                El sistema Sport91FC está rastreando wallets compartidas y patrones de depósito inusuales. 
                Los retiros superiores a $1,000 USD requieren verificación de IP y dispositivo.
             </p>
          </div>
       </div>
    </div>
  );
}

function FinanceMetric({ label, value, sub, color, icon: Icon }: any) {
  return (
    <div className="bg-brand-surface border border-white/5 p-6 rounded-3xl group relative overflow-hidden">
       <div className={cn(
          "absolute -right-4 -top-4 w-20 h-20 blur-2xl opacity-5",
          color === 'emerald' ? "bg-emerald-500" : 
          color === 'red' ? "bg-red-500" :
          color === 'amber' ? "bg-amber-500" : "bg-blue-500"
       )} />
       <div className="flex items-center justify-between mb-4">
          <div className={cn(
             "p-3 rounded-2xl",
             color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" : 
             color === 'red' ? "bg-red-500/10 text-red-500" :
             color === 'amber' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
          )}>
             <Icon className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{sub}</span>
       </div>
       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">{label}</p>
       <p className="text-xl font-mono font-black text-white">{value}</p>
    </div>
  );
}
