import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, FileText, Wallet, AlertCircle, CheckCircle2, ArrowUpFromLine } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { UserProfile } from '../types';

interface WithdrawModalProps {
  onClose: () => void;
  onWithdraw: (amount: number, address: string, network: string) => Promise<void>;
  profile: UserProfile | null;
  t: any;
}

export default function WithdrawModal({ onClose, onWithdraw, profile, t }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState<'TRC20' | 'BEP20'>('TRC20');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    setError(null);
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount < 10) {
      setError('El monto mínimo de retiro es 10.00 USDT');
      return;
    }

    if (profile && numAmount > profile.balance) {
      setError('Saldo insuficiente');
      return;
    }

    if (!address || address.length < 20) {
      setError('Por favor ingresa una dirección de billetera válida');
      return;
    }

    setLoading(true);
    try {
      await onWithdraw(numAmount, address, network);
      setSuccess(true);
      setTimeout(onClose, 2500);
    } catch (err) {
      setError('Error al procesar el retiro. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const currentAmount = parseFloat(amount || '0');
  const withdrawalFee = currentAmount * 0.07;
  const netAmount = Math.max(0, currentAmount - withdrawalFee);

  return (
    <div className="fixed inset-0 z-[100] bg-brand-bg flex flex-col">
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
        <button 
          onClick={onClose}
          className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5"
        >
          <ChevronLeft className="w-6 h-6 text-brand-primary" />
        </button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
          {t.withdraw}
        </h2>
        <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
          <FileText className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-6"
          >
            <div className="w-24 h-24 bg-brand-primary/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-brand-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Solicitud Enviada</h3>
              <p className="text-gray-400 font-bold max-w-xs mx-auto">
                Tu solicitud de retiro de {formatCurrency(parseFloat(amount))} USDT está siendo procesada.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Balance Card */}
            <div className="bg-brand-surface border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-3xl -mr-16 -mt-16 rounded-full" />
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Saldo Disponible</p>
              <h3 className="text-4xl font-black italic text-brand-primary tracking-tighter">
                {formatCurrency(profile?.balance || 0)} <span className="text-lg opacity-50">USDT</span>
              </h3>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Network Selector */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Red de Retiro</p>
                <div className="flex gap-3">
                  {['TRC20', 'BEP20'].map((net) => (
                    <button
                      key={net}
                      onClick={() => setNetwork(net as any)}
                      className={cn(
                        "px-6 py-3 rounded-xl font-black text-xs transition-all border",
                        network === net 
                          ? "bg-brand-primary/20 text-brand-primary border-brand-primary/50" 
                          : "bg-brand-surface text-gray-500 border-white/5"
                      )}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Field */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Monto a Retirar</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-brand-primary italic">USDT</span>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Min. 10.00"
                    className="w-full bg-brand-surface border border-white/5 rounded-2xl pl-16 pr-4 py-4 text-lg font-black focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-700 font-mono italic"
                  />
                  <button 
                    onClick={() => setAmount((profile?.balance || 0).toString())}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-primary uppercase tracking-widest"
                  >
                    TODO
                  </button>
                </div>
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Dirección de Billetera ({network})</p>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Pega tu dirección aquí..."
                    className="w-full bg-brand-surface border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleWithdraw}
                  disabled={loading || !amount || !address}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-black py-5 rounded-[1.5rem] font-black italic uppercase tracking-tighter transition-all active:scale-95 shadow-xl shadow-brand-primary/20 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <ArrowUpFromLine className="w-5 h-5" />
                      Retirar USDT
                    </>
                  )}
                </button>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span>Comisión de Retiro (7%)</span>
                  <span className="text-red-500">{formatCurrency(withdrawalFee)} USDT</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/5 pt-2">
                  <span>Recibirás (Neto)</span>
                  <span className="text-brand-primary font-black">{formatCurrency(netAmount)} USDT</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span>Tiempo Estimado</span>
                  <span className="text-white">1-24 Horas</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
