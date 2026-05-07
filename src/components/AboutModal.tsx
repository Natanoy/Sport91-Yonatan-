import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShieldCheck, Users, TrendingUp, Info, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
  t: any;
}

export default function AboutModal({ onClose, t }: AboutModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-brand-bg w-full max-w-lg h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col relative border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center px-6 py-6 border-b border-white/5">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-primary"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="flex-1 text-center text-lg font-black text-white italic uppercase tracking-tighter">
            Acerca de Sport91FC
          </h2>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-12">
          {/* Logo Section */}
          <div className="flex flex-col items-center text-center space-y-4 py-6">
            <div className="w-32 h-32 overflow-hidden mb-2 flex items-center justify-center">
               <img 
                 src="https://storage.googleapis.com/test-media-store/6b8d234d-ed12-40de-99f1-610196726884/p-a3967484-904d-4bc5-9c92-3c35b62e49c7.png" 
                 className="w-full h-full object-contain scale-[2.2] translate-y-[-5%] translate-x-[-15%]" 
                 alt="Logo" 
               />
            </div>
            <div className="inline-block px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
              <span className="text-[10px] font-black text-brand-primary uppercase">EST. 2026</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter italic leading-none">Sport91FC</h1>
            <p className="text-gray-400 font-medium text-sm">El futuro de la gestión de activos deportivos</p>
          </div>

          {/* Anti-Score Section */}
          <div className="bg-brand-surface rounded-3xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Info className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-black text-white italic">¿Qué es Anti-Score?</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-400 leading-relaxed">
                Sport91FC utiliza un revolucionario <span className="text-brand-primary font-bold">modelo de probabilidad inversa</span>. 
                En lugar de adivinar el ganador, usted invierte en contra de un marcador específico. 
                Si el partido termina con <span className="text-brand-primary font-bold uppercase tracking-tighter">CUALQUIER OTRO</span> resultado, 
                su inversión genera ganancias.
              </p>
              
              <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-gray-400">
                  Estadísticamente, hay 20 resultados comunes en el fútbol. Al apostar en contra de uno de ellos, 
                  se obtiene una <span className="text-brand-primary font-bold">probabilidad de ganar del 94,44%</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Protection Section */}
          <div className="bg-brand-surface rounded-3xl p-6 border border-brand-line space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
             
             <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                   <ShieldCheck className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-xl font-black text-white italic">Protección de apuestas seguras</h3>
             </div>

             <div className="space-y-4 relative z-10">
                <p className="text-sm text-gray-400">
                   Para garantizar un crecimiento constante, nuestros analistas ofrecen <span className="text-brand-primary font-bold italic">Apuestas Seguras</span>. 
                   Estas se asignan en función de su <span className="text-brand-primary font-bold">Nivel VIP</span>:
                </p>

                <div className="space-y-3">
                   {[
                     "El principal está asegurado al 100% por la plataforma.",
                     "Política de reembolso por pérdida activa para señales VIP.",
                     "Los niveles VIP más altos desbloquean señales diarias más estables."
                   ].map((item, i) => (
                     <div key={i} className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0" />
                        <span className="text-xs text-gray-300 italic">{item}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Referral Section */}
          <div className="bg-brand-surface rounded-3xl p-6 border border-white/5 space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                   <Users className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-black text-white italic">Sistema de referencias de 3 niveles</h3>
             </div>

             <div className="space-y-6">
                <p className="text-sm text-gray-400">
                   Crea tu propia red financiera. Sport91FC ofrece comisiones de alto rendimiento en tres niveles:
                </p>

                <div className="grid grid-cols-3 gap-4">
                   {[
                     { level: "1", rate: "8%" },
                     { level: "2", rate: "4%" },
                     { level: "3", rate: "1%" }
                   ].map((tier, i) => (
                     <div key={i} className="text-center space-y-1">
                        <p className="text-2xl font-black text-brand-primary italic">{tier.rate}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black">Nivel {tier.level}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Performance Analysis Section */}
          <div className="space-y-4 pb-8">
             <h3 className="text-xl font-black text-white italic px-2 flex items-center gap-2">
                Análisis de rendimiento
             </h3>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-surface/50 rounded-3xl p-6 border border-white/5 space-y-2">
                   <p className="text-3xl font-black text-brand-primary italic">35%</p>
                   <p className="text-[10px] text-gray-400 font-medium uppercase leading-tight">
                     Los usuarios duplican sus fondos en 32 días.
                   </p>
                </div>
                <div className="bg-brand-surface/50 rounded-3xl p-6 border border-white/5 space-y-2">
                   <p className="text-3xl font-black text-brand-primary italic">12%</p>
                   <p className="text-[10px] text-gray-400 font-medium uppercase leading-tight">
                     Logre un retorno de inversión superior al 300%.
                   </p>
                </div>
             </div>
          </div>

          {/* CTA Button */}
          <button 
            onClick={onClose}
            className="w-full bg-brand-primary text-black font-black uppercase italic py-5 rounded-2xl shadow-[0_10px_30px_rgba(223,255,0,0.3)] active:scale-[0.98] transition-all tracking-widest text-sm"
          >
            COMIENCE A INVERTIR
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
