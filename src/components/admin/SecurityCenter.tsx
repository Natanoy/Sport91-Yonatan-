import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Eye, 
  MapPin, 
  Smartphone, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  Zap,
  Fingerprint,
  Globe
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { format } from 'date-fns';
import { SecurityEvent } from '../../types';

export default function SecurityCenter() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [activeThreats, setActiveThreats] = useState(0);

  useEffect(() => {
    // Escuchar eventos de seguridad
    const q = query(collection(db, 'security_logs'), orderBy('timestamp', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SecurityEvent));
      setEvents(data);
      setActiveThreats(data.filter(e => !e.resolved && e.severity === 'high').length);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-8">
       {/* Security Status Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-surface border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10" />
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                   <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Blindaje de Red</p>
                   <p className="text-xl font-black text-white italic uppercase mt-1">SISTEMA ACTIVO</p>
                </div>
             </div>
             <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>Protección DDoS</span>
                <span className="text-emerald-500 font-black uppercase">Excelente</span>
             </div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98%]" />
             </div>
          </div>

          <div className="bg-brand-surface border border-brand-primary/10 p-8 rounded-[2.5rem] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl -z-10" />
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                   <Activity className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Nivel de Amenaza</p>
                   <p className="text-xl font-black text-brand-primary italic uppercase mt-1">BAJO • ESTABLE</p>
                </div>
             </div>
             <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>Sesiones en Paralelo</span>
                <span className="text-white font-black">214</span>
             </div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-brand-primary h-full w-[12%]" />
             </div>
          </div>

          <div className="bg-brand-surface border border-red-500/10 p-8 rounded-[2.5rem] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -z-10" />
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                   <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Alertas Críticas</p>
                   <p className="text-xl font-black text-red-500 italic uppercase mt-1">{activeThreats} DETECTADAS</p>
                </div>
             </div>
             <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>Último Incidente</span>
                <span className="text-red-300 font-black">Hace 14 min</span>
             </div>
             <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className={cn("bg-red-500 h-full", activeThreats > 0 ? "w-[60%]" : "w-0")} />
             </div>
          </div>
       </div>

       {/* Security Event Log */}
       <div className="bg-brand-surface border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-brand-primary" />
                <h3 className="text-lg font-black text-white italic uppercase">Registro de Inteligencia de Seguridad</h3>
             </div>
             <Zap className="w-4 h-4 text-brand-primary animate-pulse" />
          </div>

          <div className="divide-y divide-white/5">
             <AnimatePresence>
                {events.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 text-[10px] uppercase font-mono italic">
                     Sin anomalías detectadas en el perímetro de seguridad.
                  </div>
                ) : (
                  events.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors"
                    >
                       <div className="flex items-center gap-6">
                          <div className={cn(
                             "p-3 rounded-2xl border",
                             event.severity === 'critical' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                             event.severity === 'high' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                             "bg-blue-500/10 border-blue-500/20 text-blue-500"
                          )}>
                             <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                             <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-white uppercase italic tracking-tight">{event.userEmail}</span>
                                <span className={cn(
                                   "text-[8px] font-black px-2 py-0.5 rounded-full uppercase italic",
                                   event.severity === 'critical' ? "bg-red-500 text-black" : "bg-white/10 text-gray-400"
                                )}>
                                   {event.severity}
                                </span>
                             </div>
                             <p className="text-[10px] text-gray-500 font-mono mt-1">{event.details}</p>
                             <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1 text-[9px] text-gray-600">
                                   <Globe className="w-3 h-3" /> {event.ip}
                                </span>
                                <span className="flex items-center gap-1 text-[9px] text-gray-600">
                                   <Lock className="w-3 h-3" /> Protocolo: {event.type.replace('_', ' ').toUpperCase()}
                                </span>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 text-right">
                          <div>
                             <p className="text-[9px] text-gray-600 font-mono italic">
                                {event.timestamp?.toDate ? format(event.timestamp.toDate(), 'HH:mm:ss') : 'SYSTEM'}
                             </p>
                             <p className="text-[8px] text-gray-700 font-black uppercase mt-1">Detección Automática</p>
                          </div>
                          <button className="p-3 bg-white/5 text-gray-500 rounded-xl hover:text-white transition-colors">
                             <CheckCircle2 className="w-5 h-5" />
                          </button>
                       </div>
                    </motion.div>
                  ))
                )}
             </AnimatePresence>
          </div>
       </div>

       {/* Fraud Patterns Analysis */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-brand-surface border border-white/5 rounded-[2.5rem] p-8">
             <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Analítica de Fraude IP</h4>
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                     <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-brand-primary" />
                        <span className="text-[10px] font-mono text-white">186.22.{i}.154</span>
                     </div>
                     <span className="text-[9px] font-black text-red-500 uppercase">3 Cuentas Vinculadas</span>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-brand-surface border border-white/5 rounded-[2.5rem] p-8">
             <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6">Dispositivos en Alerta</h4>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-mono text-white">iPhone 15 Pro Max (iOS 17.4)</span>
                   </div>
                   <span className="text-[9px] font-black text-emerald-500 uppercase">Seguro</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-mono text-white">Redmi Note 12 (Rooted)</span>
                   </div>
                   <span className="text-[9px] font-black text-amber-500 uppercase">Riesgo Moderado</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
