import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Eye, 
  Zap, 
  Plus, 
  Minus, 
  Shield, 
  ShieldAlert,
  MessageSquare,
  Lock,
  Unlock,
  History,
  CreditCard,
  Ban,
  Activity,
  ArrowRight
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { format } from 'date-fns';

interface UserManagementProps {
  users: UserProfile[];
  onAdjustBalance: (uid: string, current: number, amount: number) => Promise<void>;
  onToggleRole: (uid: string, current: UserRole | undefined) => Promise<void>;
  onEnterLiveMode: (user: UserProfile) => void;
  onUpdateUser: (uid: string, data: Partial<UserProfile>) => Promise<void>;
}

export default function UserManagement({ 
  users, 
  onAdjustBalance, 
  onToggleRole, 
  onEnterLiveMode,
  onUpdateUser 
}: UserManagementProps) {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || 
                         u.displayName.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-surface p-6 rounded-3xl border border-white/5">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-brand-primary/10 rounded-2xl">
              <Users className="w-5 h-5 text-brand-primary" />
           </div>
           <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Gestión de Usuarios</h3>
              <p className="text-[10px] text-gray-500 font-mono italic">{users.length} miembros registrados</p>
           </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
             <input 
               type="text" 
               placeholder="Buscar usuario o email..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-primary transition-all"
             />
          </div>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase text-white focus:outline-none"
          >
            <option value="all">Todos los Roles</option>
            <option value="admin">Administradores</option>
            <option value="user">Usuarios</option>
            <option value="manager">Managers</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="bg-brand-surface border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Usuario</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Balance</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Rol / Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map(user => (
                <tr key={user.uid} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black italic shadow-lg ring-1 ring-brand-primary/20">
                          {user.displayName.charAt(0)}
                        </div>
                        {user.isFrozen && (
                          <div className="absolute -top-1 -right-1 bg-red-500 p-1 rounded-full border-2 border-brand-surface">
                            <Lock className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="text-left hover:opacity-80 transition-opacity"
                      >
                        <p className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors">{user.displayName}</p>
                        <p className="text-[10px] text-gray-500 font-mono italic">{user.email}</p>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono font-black text-emerald-500">{formatCurrency(user.balance)}</p>
                    <p className="text-[9px] text-gray-500 uppercase">Invested: {formatCurrency(user.unliquidated || 0)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                       <span className={cn(
                         "w-fit px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                         user.role === 'super_admin' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                         user.role === 'admin' ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20" :
                         "bg-white/5 text-gray-400 border-white/5"
                       )}>
                         {user.role || 'user'}
                       </span>
                       <div className="flex gap-2">
                          {user.isFrozen && <span className="text-[8px] font-black text-red-500 uppercase italic">Cuenta Congelada</span>}
                          {user.withdrawalDisabled && <span className="text-[8px] font-black text-amber-500 uppercase italic">Retiros Off</span>}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => setSelectedUser(user)}
                         className="p-2 bg-blue-500/5 text-blue-500 rounded-xl hover:bg-blue-500/10 transition-all"
                         title="Ver Perfil"
                       >
                          <Eye className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => onEnterLiveMode(user)}
                         className="p-2 bg-emerald-500/5 text-emerald-500 rounded-xl hover:bg-emerald-500/10 transition-all"
                         title="Entrar en MODO LIVE"
                       >
                          <Zap className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => onAdjustBalance(user.uid, user.balance, 100)}
                         className="p-2 bg-amber-500/5 text-amber-500 rounded-xl hover:bg-amber-500/10 transition-all"
                         title="Ajuste Rápido"
                       >
                          <CreditCard className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Slidepanel / Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedUser(null)}
               className="fixed inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.9, x: 50 }}
               animate={{ opacity: 1, scale: 1, x: 0 }}
               exit={{ opacity: 0, scale: 0.9, x: 50 }}
               className="w-full max-w-2xl bg-brand-bg border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden z-20 shadow-2xl"
            >
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[120px] -z-10" />

               <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Column: Profile Card */}
                  <div className="w-full md:w-64 space-y-6">
                     <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-white/5 text-center">
                        <div className="w-24 h-24 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-4xl font-black italic mx-auto mb-4 ring-1 ring-brand-primary/20">
                          {selectedUser.displayName.charAt(0)}
                        </div>
                        <h4 className="text-xl font-black text-white italic uppercase">{selectedUser.displayName}</h4>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">ID: {selectedUser.uid.slice(0, 8)}</p>
                        
                        <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black text-gray-500 uppercase">Estado</span>
                              <span className={cn(
                                "text-[9px] font-black uppercase italic px-2 py-0.5 rounded",
                                selectedUser.isFrozen ? "text-red-500 bg-red-500/10" : "text-emerald-500 bg-emerald-500/10"
                              )}>
                                {selectedUser.isFrozen ? 'BLOQUEADO' : 'ACTIVO'}
                              </span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black text-gray-500 uppercase">Rol</span>
                              <span className="text-[9px] font-black text-brand-primary uppercase italic">{selectedUser.role || 'USER'}</span>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 gap-2">
                        <button 
                          onClick={() => onEnterLiveMode(selectedUser)}
                          className="w-full flex items-center justify-between p-4 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-2xl border border-emerald-500/10 transition-all group"
                        >
                           <span className="text-[10px] font-black text-emerald-500 uppercase italic">Modo Live</span>
                           <Zap className="w-4 h-4 text-emerald-500 group-hover:scale-110" />
                        </button>
                        <button 
                          className="w-full flex items-center justify-between p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-2xl border border-blue-500/10 transition-all group"
                        >
                           <span className="text-[10px] font-black text-blue-500 uppercase italic">Enviar Mensaje</span>
                           <MessageSquare className="w-4 h-4 text-blue-500 group-hover:scale-110" />
                        </button>
                     </div>
                  </div>

                  {/* Right Column: Detailed Info & Actions */}
                  <div className="flex-1 space-y-8">
                     <div>
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Finanzas del Usuario</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <InfoTile label="Balance Principal" value={formatCurrency(selectedUser.balance)} color="text-emerald-500" />
                           <InfoTile label="Inversiones" value={formatCurrency(selectedUser.unliquidated || 0)} color="text-blue-500" />
                           <InfoTile label="Total Depositado" value={formatCurrency(selectedUser.totalDeposits || 0)} />
                           <InfoTile label="Total Retirado" value={formatCurrency(selectedUser.totalWithdrawals || 0)} />
                        </div>
                     </div>

                     <div>
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Control Avanzado</h3>
                        <div className="grid grid-cols-2 gap-3">
                           <ActionToggle 
                             label={selectedUser.isFrozen ? "Desbloquear Cuenta" : "Congelar Cuenta"}
                             icon={selectedUser.isFrozen ? Unlock : Lock}
                             active={selectedUser.isFrozen}
                             onClick={() => onUpdateUser(selectedUser.uid, { isFrozen: !selectedUser.isFrozen })}
                             danger
                           />
                           <ActionToggle 
                             label={selectedUser.withdrawalDisabled ? "Activar Retiros" : "Desactivar Retiros"}
                             icon={ShieldAlert}
                             active={selectedUser.withdrawalDisabled}
                             onClick={() => onUpdateUser(selectedUser.uid, { withdrawalDisabled: !selectedUser.withdrawalDisabled })}
                             warning
                           />
                           <ActionToggle 
                             label={selectedUser.depositDisabled ? "Activar Depósitos" : "Desactivar Depósitos"}
                             icon={CreditCard}
                             active={selectedUser.depositDisabled}
                             onClick={() => onUpdateUser(selectedUser.uid, { depositDisabled: !selectedUser.depositDisabled })}
                           />
                           <ActionToggle 
                             label="Cambiar Rol"
                             icon={Shield}
                             onClick={() => onToggleRole(selectedUser.uid, selectedUser.role)}
                           />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <button 
                          onClick={() => {
                            const newBalance = prompt('Establecer nuevo balance:', selectedUser.balance.toString());
                            if (newBalance) onAdjustBalance(selectedUser.uid, selectedUser.balance, parseFloat(newBalance) - selectedUser.balance);
                          }}
                          className="w-full bg-brand-surface border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-brand-primary/30 transition-all"
                        >
                           <div className="flex items-center gap-3">
                              <Plus className="w-4 h-4 text-emerald-500" />
                              <span className="text-[10px] font-black text-white uppercase italic">Modificar Balance Manualmente</span>
                           </div>
                           <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                          className="w-full bg-brand-surface border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-red-500/30 transition-all"
                        >
                           <div className="flex items-center gap-3">
                              <Ban className="w-4 h-4 text-red-500" />
                              <span className="text-[10px] font-black text-white uppercase italic">Cerrar Sesión Globalmente</span>
                           </div>
                           <ArrowRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoTile({ label, value, color = "text-white" }: any) {
  return (
    <div className="bg-brand-surface border border-white/5 p-4 rounded-2xl">
       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
       <p className={cn("text-lg font-mono font-black", color)}>{value}</p>
    </div>
  );
}

function ActionToggle({ label, icon: Icon, active, onClick, danger, warning }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3 p-4 rounded-2xl border transition-all text-left group",
        active 
          ? (danger ? "bg-red-500/20 border-red-500/30" : "bg-brand-primary/20 border-brand-primary/30") 
          : "bg-brand-surface border-white/5 hover:border-white/20"
      )}
    >
       <Icon className={cn(
         "w-5 h-5",
         active ? (danger ? "text-red-400" : "text-brand-primary") : "text-gray-500",
         danger && !active && "group-hover:text-red-400",
         warning && !active && "group-hover:text-amber-400"
       )} />
       <span className={cn(
         "text-[9px] font-black uppercase tracking-wider",
         active ? "text-white" : "text-gray-500"
       )}>{label}</span>
    </button>
  );
}
