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
        <div className="w-12 h-12 bg-transparent rounded-[1rem] flex items-center justify-center overflow-hidden">
           <img 
             src="https://storage.googleapis.com/test-media-store/6b8d234d-ed12-40de-99f1-610196726884/p-a3967484-904d-4bc5-9c92-3c35b62e49c7.png" 
             className="w-full h-full object-contain scale-[2.2] translate-y-[-5%] translate-x-[-15%]" 
             alt="Logo" 
           />
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
