import { auth, loginWithGoogle } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogIn, Headset } from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../lib/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  profile: UserProfile | null;
  onRecharge: () => void;
  onShowSupport: () => void;
}

export default function Navbar({ onShowSupport }: NavbarProps) {
  const [user] = useAuthState(auth);
  const { t } = useLanguage();

  return (
    <nav className="h-20 border-b border-brand-line bg-brand-bg sticky top-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-brand-primary rounded-[1rem] flex items-center justify-center p-1.5 shadow-lg shadow-brand-primary/20 overflow-hidden">
           <img src="https://img.icons8.com/isometric/100/football.png" className="w-full h-full object-contain brightness-0 invert shadow-2xl" alt="Logo" />
        </div>
        <span className="font-black text-3xl tracking-tighter italic uppercase text-white drop-shadow-sm">
          SPORT91 FC
        </span>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <LanguageSwitcher />
        
        <button 
          onClick={onShowSupport}
          className="w-10 h-10 bg-brand-surface border border-brand-line rounded-xl flex items-center justify-center text-brand-primary hover:bg-brand-line transition-all active:scale-90"
        >
          <Headset className="w-5 h-5" />
        </button>

        {!user && (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-black px-6 py-3 rounded-xl font-black italic transition-all active:scale-95 shadow-lg shadow-brand-primary/20 text-sm"
          >
            <LogIn className="w-5 h-5" />
            {t.login}
          </button>
        )}
      </div>
    </nav>
  );
}
