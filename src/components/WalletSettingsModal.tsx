import { X, ChevronLeft, ChevronDown, Wallet, Clipboard, ShieldCheck, Mail } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { cn } from '../lib/utils';

interface WalletSettingsModalProps {
  onClose: () => void;
}

export default function WalletSettingsModal({ onClose }: WalletSettingsModalProps) {
  const { t } = useLanguage();
  const [currency, setCurrency] = useState('');
  const [walletName, setWalletName] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleSendOtp = () => {
    setIsSendingOtp(true);
    setTimeout(() => setIsSendingOtp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[2300] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full h-full md:max-w-md md:h-[90vh] bg-brand-bg flex flex-col relative overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/5 rounded-xl text-emerald-500 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">
            Métodos de retirada
          </h1>
          <div className="w-11" /> {/* Spacer */}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-8">
          {/* Tabs - Only Crypto as requested */}
          <div className="bg-white/5 p-1.5 rounded-2xl flex gap-2">
            <button className="flex-1 bg-emerald-500 text-black py-3 rounded-xl text-xs font-black italic uppercase tracking-tighter shadow-lg shadow-emerald-500/20">
              Criptomonedas
            </button>
            <button className="flex-1 text-gray-600 py-3 rounded-xl text-xs font-black italic uppercase tracking-tighter opacity-50 cursor-not-allowed">
              Banco
            </button>
          </div>

          <div className="space-y-6">
            {/* Currency Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Moneda y Red</label>
              <div className="relative">
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 appearance-none text-white text-sm font-black italic focus:border-emerald-500/50 outline-none transition-all"
                >
                  <option value="" disabled>Seleccionar moneda</option>
                  <option value="usdt_trc20">USDT (TRC20)</option>
                  <option value="usdt_erc20">USDT (ERC20)</option>
                  <option value="btc">Bitcoin (BTC)</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
              </div>
            </div>

            {/* Wallet Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nombre de la billetera</label>
              <input 
                type="text"
                placeholder="Ejemplo: Binance"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black italic placeholder:text-gray-700 focus:border-emerald-500/50 outline-none transition-all"
              />
            </div>

            {/* Wallet Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Dirección de la billetera</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Pega tu dirección"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white text-sm font-black italic placeholder:text-gray-700 focus:border-emerald-500/50 outline-none transition-all"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-lg text-emerald-500 active:scale-95 transition-transform">
                  <Clipboard className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* OTP Verification */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Verificación OTP</label>
              <div className="flex gap-3">
                <input 
                  type="text"
                  placeholder="Código de 6 dígitos"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-black italic placeholder:text-gray-700 focus:border-emerald-500/50 outline-none transition-all font-mono"
                />
                <button 
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="px-6 bg-emerald-500 text-black rounded-2xl font-black italic text-xs uppercase tracking-tighter active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSendingOtp ? '...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>

          <button 
            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-black italic text-lg uppercase tracking-widest rounded-3xl shadow-2xl shadow-emerald-500/20 active:scale-[0.98] transition-all mt-4"
          >
            Configurar la billetera
          </button>

          {/* Footer Note */}
          <div className="pt-4 flex gap-3 opacity-50">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-[10px] font-medium leading-relaxed text-gray-400">
              Para eliminar o desvincular una cuenta, póngase en contacto con el servicio de atención al cliente.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
