import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Cpu, 
  ShieldAlert, 
  Zap, 
  Wallet, 
  MessageSquare,
  Save,
  RefreshCcw,
  Bell
} from 'lucide-react';
import { SystemSettings } from '../../types';
import { cn } from '../../lib/utils';

interface SystemSettingsProps {
  settings: SystemSettings;
  onSave: (data: Partial<SystemSettings>) => Promise<void>;
  onBroadcast: (title: string, message: string) => Promise<void>;
}

export default function SystemSettingsManager({ settings, onSave, onBroadcast }: SystemSettingsProps) {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '' });

  const handleUpdateLocale = (field: keyof SystemSettings, val: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(localSettings);
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       {/* Left Col: Platform Config */}
       <div className="space-y-8">
          <div className="bg-brand-surface rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-primary/10 rounded-2xl">
                   <Settings className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white italic uppercase">Configuración de Plataforma</h3>
                   <p className="text-[10px] text-gray-500 font-mono">Control global del sistema fintech</p>
                </div>
             </div>

             <div className="space-y-6">
                <InputGroup 
                   label="Nombre de la Plataforma" 
                   value={localSettings.platformName} 
                   onChange={(e: any) => handleUpdateLocale('platformName', e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-4">
                   <InputGroup 
                     label="Retiro Mínimo" 
                     type="number"
                     value={localSettings.minWithdrawal} 
                     onChange={(e: any) => handleUpdateLocale('minWithdrawal', parseFloat(e.target.value))}
                   />
                   <InputGroup 
                     label="Fee de Retiro (%)" 
                     type="number"
                     value={localSettings.withdrawalFee} 
                     onChange={(e: any) => handleUpdateLocale('withdrawalFee', parseFloat(e.target.value))}
                   />
                </div>

                <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem]">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <ShieldAlert className="w-5 h-5 text-red-500" />
                         <span className="text-[10px] font-black text-white uppercase italic">Modo Mantenimiento</span>
                      </div>
                      <button 
                        onClick={() => handleUpdateLocale('maintenanceMode', !localSettings.maintenanceMode)}
                        className={cn(
                          "relative w-12 h-6 rounded-full transition-all duration-300",
                          localSettings.maintenanceMode ? "bg-red-500" : "bg-white/10"
                        )}
                      >
                         <div className={cn(
                           "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                           localSettings.maintenanceMode ? "left-7" : "left-1"
                         )} />
                      </button>
                   </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-3 bg-brand-primary text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-brand-primary/80 transition-all shadow-lg active:scale-95"
                >
                   {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   Guardar Cambios
                </button>
             </div>
          </div>

          <div className="bg-brand-surface rounded-[2.5rem] border border-white/5 p-8 shadow-2xl">
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                   <Cpu className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white italic uppercase">Motor de Inteligencia Artificial</h3>
                   <p className="text-[10px] text-gray-500 font-mono">Optimización de ROI y Bots</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-gray-400 uppercase">Multiplicador de Ganancias (IA)</span>
                   <span className="text-xl font-mono font-black text-emerald-500">x{localSettings.aiProfitMultiplier}</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3.0" 
                  step="0.1"
                  value={localSettings.aiProfitMultiplier}
                  onChange={(e) => handleUpdateLocale('aiProfitMultiplier', parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 rounded-2xl text-center">
                      <p className="text-[9px] text-gray-500 font-black uppercase mb-1">Bots Activos</p>
                      <p className="text-lg font-mono text-white">2,481</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl text-center">
                      <p className="text-[9px] text-gray-500 font-black uppercase mb-1">ROI Proyectado</p>
                      <p className="text-lg font-mono text-emerald-500">12.5%</p>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Right Col: Announcements & Messages */}
       <div className="space-y-8">
          <div className="bg-brand-surface rounded-[2.5rem] border border-brand-primary/10 p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl" />
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-primary/10 rounded-2xl">
                   <Bell className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-white italic uppercase">Comunicación Global</h3>
                   <p className="text-[10px] text-gray-500 font-mono">Notificaciones Push & Popups</p>
                </div>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2 mb-2 block">Título del Anuncio</label>
                   <input 
                      type="text" 
                      placeholder="Eje: Mantenimiento Programado"
                      value={broadcastData.title}
                      onChange={(e) => setBroadcastData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-brand-primary/50 transition-all"
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2 mb-2 block">Mensaje Completo</label>
                   <textarea 
                      rows={4}
                      placeholder="Escribe el contenido de la notificación masiva..."
                      value={broadcastData.message}
                      onChange={(e) => setBroadcastData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-brand-primary/50 transition-all resize-none"
                   />
                </div>
                
                <button 
                  onClick={() => {
                     if (broadcastData.title && broadcastData.message) {
                        onBroadcast(broadcastData.title, broadcastData.message);
                        setBroadcastData({ title: '', message: '' });
                        alert('Broadcast enviado correctamente');
                     }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-white/80 transition-all shadow-lg"
                >
                   <Zap className="w-4 h-4 fill-black" />
                   Enviar a Todos los Usuarios
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2 block">{label}</label>
       <input 
          type={type}
          value={value}
          onChange={onChange}
          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white font-mono focus:outline-none focus:border-brand-primary/50 transition-all"
       />
    </div>
  );
}
