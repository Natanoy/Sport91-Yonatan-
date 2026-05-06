import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Headset, X, Send, ShieldCheck } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface SupportModalProps {
  onClose: () => void;
  t: any;
}

export default function SupportModal({ onClose, t }: SupportModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await addDoc(collection(db, 'tickets'), {
        email,
        message,
        status: 'open',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-brand-surface border border-brand-line rounded-3xl p-8 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-3xl -mr-16 -mt-16 rounded-full" />
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
              <Headset className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-black italic uppercase tracking-tight">{t.support}</h3>
              <p className="text-[10px] text-gray-500 font-mono">REPORTE DE INCIDENCIAS</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-bold text-green-500">{t.ticketSent}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <label className="absolute -top-2.5 left-4 bg-brand-surface px-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest z-10">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="TU@EMAIL.COM"
                className="w-full bg-brand-bg border border-brand-line rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-600 font-mono"
              />
            </div>

            <div className="relative group">
              <label className="absolute -top-2.5 left-4 bg-brand-surface px-2 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest z-10">{t.message}</label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="..."
                rows={4}
                className="w-full bg-brand-bg border border-brand-line rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-600 font-mono resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isSending}
              className="slant-button w-full flex items-center justify-center gap-2 py-4"
            >
              <Send className="w-4 h-4" />
              {isSending ? '...' : t.sendTicket}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
