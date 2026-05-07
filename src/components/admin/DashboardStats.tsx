import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  Activity,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import LiveActivityTicker from './LiveActivityTicker';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalDeposited: number;
    totalWithdrawn: number;
    totalProfit: number;
    activeInvestments: number;
  };
}

const mockChartData = [
  { name: 'Lun', volume: 4000, users: 240 },
  { name: 'Mar', volume: 3000, users: 139 },
  { name: 'Mie', volume: 2000, users: 980 },
  { name: 'Jue', volume: 2780, users: 390 },
  { name: 'Vie', volume: 1890, users: 480 },
  { name: 'Sab', volume: 2390, users: 380 },
  { name: 'Dom', volume: 3490, users: 430 },
];

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="space-y-8 pb-12">
      {/* Top Value Cards - High Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <ValueCard 
          label="Balance Total Plataforma" 
          value={formatCurrency(stats.totalProfit)} 
          subValue="Net Liquid Assets"
          icon={DollarSign}
          color="brand"
          trend="+4.2%"
        />
        <ValueCard 
          label="Depósitos Activos" 
          value={formatCurrency(stats.totalDeposited)} 
          subValue="24h Volume: $42,100"
          icon={CreditCard}
          color="emerald"
          trend="+12.5%"
        />
        <ValueCard 
          label="Pasivos en Tránsito" 
          value={formatCurrency(stats.totalWithdrawn)} 
          subValue="Retiros Pendientes: 12"
          icon={ArrowDownRight}
          color="amber"
          trend="-2.1%"
        />
        <ValueCard 
          label="Base de Usuarios" 
          value={stats.totalUsers} 
          subValue="Activos Ahora: 154"
          icon={Users}
          color="blue"
          trend="+89"
        />
      </div>

      {/* Main Grid: Analytical Core */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Span: Main Chart (Bento Large) */}
        <div className="xl:col-span-8 space-y-8">
           <div className="bg-brand-surface border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[150px] -z-10 group-hover:bg-brand-primary/10 transition-colors" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                 <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-brand-primary rounded-full shadow-[0_0_15px_#dfff00]" />
                      Análisis de Rendimiento Corporativo
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.4em] mt-2 italic">Global Revenue & Transaction Volume • Realtime</p>
                 </div>
                 <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                    {['1H', '24H', '7D', '30D'].map(period => (
                       <button key={period} className={cn(
                          "px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all",
                          period === '7D' ? "bg-brand-primary text-black" : "text-gray-500 hover:text-white"
                       )}>
                          {period}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="h-[400px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData}>
                       <defs>
                          <linearGradient id="mainGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#dfff00" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#dfff00" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                       <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900, fontStyle: 'italic' }}
                       />
                       <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 900 }}
                       />
                       <Tooltip 
                         contentStyle={{ 
                           backgroundColor: '#0a0a0a', 
                           border: '1px solid #ffffff10',
                           borderRadius: '24px',
                           padding: '16px',
                           boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                         }}
                         itemStyle={{ color: '#dfff00', fontWeight: '900', fontSize: '12px' }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="volume" 
                         stroke="#dfff00" 
                         strokeWidth={5}
                         fillOpacity={1} 
                         fill="url(#mainGradient)" 
                         animationDuration={2000}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-brand-surface border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
                 <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[12px] font-black text-white italic uppercase tracking-widest flex items-center gap-2">
                       <Users className="w-4 h-4 text-blue-500" />
                       Adquisición de Usuarios
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-500 font-black">+24.2%</span>
                 </div>
                 <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={mockChartData}>
                          <Bar dataKey="users" radius={[8, 8, 0, 0]}>
                             {mockChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.users > 400 ? '#3b82f6' : '#2563eb'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-brand-surface border border-brand-primary/10 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center overflow-hidden group">
                 <div className="p-6 bg-brand-primary/10 rounded-full mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="w-12 h-12 text-brand-primary animate-pulse" />
                 </div>
                 <h4 className="text-xl font-black text-white italic uppercase mb-2">Neural Engine Activo</h4>
                 <p className="text-[11px] text-gray-500 font-mono italic max-w-[200px] leading-relaxed">
                   IA optimizando cuotas deportivas basadas en 2,400 señales/seg.
                 </p>
                 <div className="mt-8 flex gap-2">
                    <div className="w-8 h-1.5 rounded-full bg-brand-primary" />
                    <div className="w-8 h-1.5 rounded-full bg-brand-primary" />
                    <div className="w-8 h-1.5 rounded-full bg-brand-primary/20" />
                 </div>
              </div>
           </div>
        </div>

        {/* Right Span: Live Ticker (Bento Vertical) */}
        <div className="xl:col-span-4 space-y-8">
           <LiveActivityTicker />
           
           <div className="bg-brand-surface border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                 ESTADO DEL NÚCLEO
                 <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-emerald-500" />)}
                 </div>
              </h4>
              <div className="space-y-5">
                 <HealthBar label="Database Cluster" value={98} color="emerald" />
                 <HealthBar label="Asset Liquidity" value={85} color="blue" />
                 <HealthBar label="Security Firewall" value={99} color="emerald" />
                 <HealthBar label="Sport API Latency" value={14} color="amber" metric="ms" />
              </div>
              <button className="w-full mt-8 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand-primary transition-all">
                Ver Logs de Infraestructura
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}

function ValueCard({ label, value, subValue, icon: Icon, color, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-brand-surface border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-xl"
    >
      <div className={cn(
        "absolute -right-8 -top-8 w-32 h-32 blur-[60px] opacity-10 transition-opacity group-hover:opacity-20",
        color === 'brand' ? "bg-brand-primary" :
        color === 'emerald' ? "bg-emerald-500" :
        color === 'amber' ? "bg-amber-500" : "bg-blue-500"
      )} />

      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "p-4 rounded-[1.25rem] shadow-lg",
          color === 'brand' ? "bg-brand-primary/10 text-brand-primary" :
          color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
          color === 'amber' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
           <div className={cn(
             "px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5",
             trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
           )}>
             {trend}
             <TrendingUp className={cn("w-3 h-3", !trend.startsWith('+') && "rotate-90")} />
           </div>
        )}
      </div>

      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic opacity-60">{label}</p>
      <h4 className="text-3xl font-black text-white italic tracking-tighter group-hover:text-brand-primary transition-colors">{value}</h4>
      <p className="text-[9px] text-gray-500 font-mono mt-2 uppercase tracking-tight">{subValue}</p>
    </motion.div>
  );
}

function HealthBar({ label, value, color, metric }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between text-[11px] font-black italic uppercase tracking-tight">
            <span className="text-gray-400">{label}</span>
            <span className={cn(
              color === 'emerald' ? "text-emerald-500" : color === 'blue' ? "text-blue-500" : "text-amber-500"
            )}>{value}{metric || '%'}</span>
         </div>
         <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: metric ? '20%' : `${value}%` }}
               className={cn(
                 "h-full rounded-full",
                 color === 'emerald' ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : 
                 color === 'blue' ? "bg-blue-500 shadow-[0_0_10px_#3b82f6]" : 
                 "bg-amber-500 shadow-[0_0_10px_#f59e0b]"
               )}
            />
         </div>
      </div>
   );
}


function StatCard({ label, value, subValue, icon: Icon, color, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-brand-surface border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group"
    >
      <div className={cn(
        "absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
        color === 'brand' ? "bg-brand-primary" :
        color === 'emerald' ? "bg-emerald-500" :
        color === 'amber' ? "bg-amber-500" : "bg-blue-500"
      )} />

      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-3 rounded-2xl",
          color === 'brand' ? "bg-brand-primary/10 text-brand-primary" :
          color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
          color === 'amber' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
           <div className={cn(
             "px-2 py-0.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1",
             trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
           )}>
             {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
             {trend === 'up' ? 'Bullish' : 'Bearish'}
           </div>
        )}
      </div>

      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">{label}</p>
      <div className="flex items-baseline gap-2">
         <h4 className="text-2xl font-black text-white italic tracking-tighter">{value}</h4>
      </div>
      <p className="text-[9px] text-gray-600 font-mono mt-1 uppercase">{subValue}</p>
    </motion.div>
  );
}
