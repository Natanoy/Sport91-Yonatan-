import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, FileText, Copy, Headset, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface DepositModalProps {
  onClose: () => void;
  t: any;
}

export default function DepositModal({ onClose, t }: DepositModalProps) {
  const [method, setMethod] = useState<'crypto' | 'local'>('crypto');
  const [network, setNetwork] = useState<'TRC20' | 'BEP20'>('TRC20');
  const [copied, setCopied] = useState(false);

  const addresses = {
    TRC20: "TKKQTNEBhBRLNLba9LsrLPauhNF1BHbeTX",
    BEP20: "0x478da7a60d5d978008e7272c27e7579f7728d0f2"
  };

  const walletAddress = addresses[network];
  const qrCodeUrl = "https://ais-pre-h6uhyn4xluoulohrx7oo3f-96323741204.us-east1.run.app/qr_code.png"; // Placeholder for the asset

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          {t.deposit}
        </h2>
        <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
          <FileText className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Method Selector */}
        <div className="flex bg-brand-surface p-1.5 rounded-[1.5rem] border border-white/5">
          <button
            onClick={() => setMethod('crypto')}
            className={cn(
              "flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
              method === 'crypto' ? "bg-brand-primary text-black" : "text-gray-500"
            )}
          >
            Cripto
          </button>
          <button
            onClick={() => setMethod('local')}
            className={cn(
              "flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
              method === 'local' ? "bg-brand-primary text-black" : "text-gray-500"
            )}
          >
            Local
          </button>
        </div>

        {/* Network Selector */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Red de Depósito</p>
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

        {/* QR Code Container */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-[2rem] shadow-2xl relative group">
            <div className="absolute inset-0 bg-brand-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${walletAddress}&bgcolor=ffffff&color=000000`}
              className="w-56 h-56 relative z-10" 
              alt="QR Code" 
            />
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Escanea la dirección para recargar</p>
        </div>

        {/* Address Field */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Dirección de Billetera</p>
          <div className="bg-brand-surface border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
            <span className="font-mono text-xs text-white truncate max-w-[240px]">
              {walletAddress}
            </span>
            <button 
              onClick={handleCopy}
              className="p-2.5 bg-white/5 rounded-xl hover:bg-brand-primary hover:text-black transition-all border border-content/5"
            >
              {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 space-y-4">
          <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Reglas de Recarga</h4>
          <ul className="space-y-3">
            <li className="flex gap-2 text-sm text-gray-400">
              <span className="text-brand-primary">•</span>
              <p>Depósito mínimo: <span className="text-brand-primary font-black">10.00 USDT</span></p>
            </li>
            <li className="flex gap-2 text-sm text-gray-400">
              <span className="text-brand-primary">•</span>
              <p>Enviar solo <span className="font-black text-white">USDT</span> a esta dirección mediante <span className="font-black text-white">{network}</span>.</p>
            </li>
            <li className="flex gap-2 text-sm text-gray-400">
              <span className="text-brand-primary">•</span>
              <p>Llega después de 1 confirmación de red.</p>
            </li>
          </ul>
        </div>

        <button className="w-full bg-white/5 hover:bg-white/10 py-5 rounded-[1.5rem] font-black italic uppercase tracking-tighter transition-all border border-white/5 flex items-center justify-center gap-3 text-brand-primary">
          <Headset className="w-5 h-5" />
          Contactar Servicio al Cliente
        </button>
      </div>
    </div>
  );
}
