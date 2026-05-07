import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Camera, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AvatarPickerProps {
  onClose: () => void;
  userId: string;
  currentAvatar?: string;
  onUpdate: (newAvatar: string) => void;
}

const AVATARS = [
  'https://img.icons8.com/isometric/100/football.png',
  'https://img.icons8.com/isometric/100/soccer-ball.png',
  'https://img.icons8.com/isometric/100/trophy.png',
  'https://img.icons8.com/isometric/100/medal.png',
  'https://img.icons8.com/isometric/100/referee-whistle.png',
  'https://img.icons8.com/isometric/100/stadium.png',
  'https://img.icons8.com/isometric/100/goal.png',
  'https://img.icons8.com/isometric/100/test-account.png',
  'https://img.icons8.com/isometric/100/male-user.png',
  'https://img.icons8.com/isometric/100/female-user.png',
  'https://img.icons8.com/isometric/100/user-male-circle.png',
  'https://img.icons8.com/isometric/100/user-female-circle.png',
];

export default function AvatarPicker({ onClose, userId, currentAvatar, onUpdate }: AvatarPickerProps) {
  const [selected, setSelected] = useState(currentAvatar || AVATARS[0]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const avatarToSave = showCustom && customUrl ? customUrl : selected;
      await updateDoc(doc(db, 'users', userId), {
        photoURL: avatarToSave
      });
      onUpdate(avatarToSave);
      onClose();
    } catch (err) {
      console.error('Error updating avatar:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-brand-bg w-full max-w-sm rounded-[2rem] overflow-hidden border border-white/10 flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Imagen de Perfil</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-brand-primary/30 p-1 bg-gradient-to-tr from-brand-primary/20 to-transparent">
              <div className="w-full h-full rounded-full bg-brand-surface border border-white/10 flex items-center justify-center overflow-hidden">
                <img 
                  src={showCustom && customUrl ? customUrl : selected} 
                  alt="preview" 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = AVATARS[0];
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Seleccionar Avatar</p>
              <button 
                onClick={() => setShowCustom(!showCustom)}
                className="text-[10px] font-black text-brand-primary uppercase underline italic"
              >
                {showCustom ? 'Usar Galería' : 'Usar URL personalizada'}
              </button>
            </div>

            {showCustom ? (
              <div className="space-y-2">
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder:text-gray-600 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
                <p className="text-[8px] text-gray-500 italic">Pega un link directo a una imagen PNG/JPG para usarla como avatar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {AVATARS.map((avatar, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(avatar)}
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center transition-all relative border",
                      selected === avatar ? "border-brand-primary bg-brand-primary/10 shadow-[0_0_15px_rgba(223,255,0,0.2)]" : "border-white/5 bg-white/5 hover:border-white/20"
                    )}
                  >
                    <img src={avatar} alt="option" className="w-8 h-8 object-contain" />
                    {selected === avatar && (
                      <div className="absolute -top-1 -right-1 bg-brand-primary text-black rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[4]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={isUpdating || (showCustom && !customUrl)}
            className="w-full bg-brand-primary text-black font-black uppercase italic py-4 rounded-xl shadow-lg shadow-brand-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
          >
            {isUpdating ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
