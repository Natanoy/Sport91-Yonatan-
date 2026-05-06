import { Language } from '../lib/translations';
import { useLanguage } from '../lib/LanguageContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/us.svg' },
  { code: 'es', name: 'Español', flag: 'https://flagcdn.com/es.svg' },
  { code: 'pt', name: 'Português', flag: 'https://flagcdn.com/br.svg' },
  { code: 'ru', name: 'Русский', flag: 'https://flagcdn.com/ru.svg' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(l => l.code === language) || languages[1];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-brand-surface border border-brand-line px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-brand-line transition-colors"
      >
        <img src={currentLang.flag} className="w-4 h-3 object-cover rounded-sm" alt={currentLang.name} />
        {currentLang.code.toUpperCase()}
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-32 bg-brand-surface border border-brand-line rounded-xl shadow-2xl py-2 z-20 overflow-hidden"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 text-xs font-medium hover:bg-brand-primary/10 transition-colors",
                    language === lang.code ? "text-brand-primary" : "text-gray-300"
                  )}
                >
                  <img src={lang.flag} className="w-4 h-3 object-cover rounded-sm" alt="" />
                  {lang.name}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
