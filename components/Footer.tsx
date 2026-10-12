import React from 'react';
import { Heart } from 'lucide-react';

/**
 * Credits footer. Hidden on phones (a native Android app has no web footer —
 * the credits live in the overflow menu there) and shown from tablet width up.
 */
const Footer: React.FC = () => {
  return (
    <footer className="hidden w-full shrink-0 border-t border-black/5 bg-white/70 px-safe py-3 text-center backdrop-blur-md md:block dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Heart className="h-4 w-4 animate-pulse text-primary-600 dark:text-primary-300" />
        <p className="text-[0.8rem] font-medium tracking-wide text-slate-700 dark:text-slate-200">
          Made with <span className="text-primary-600 dark:text-primary-300">🫀</span> by{' '}
          <span className="font-bold text-primary-700 dark:text-primary-300">༯𝙎ค૯𝙀𝘿✘🫀</span> —{' '}
          <span className="italic text-slate-600 dark:text-slate-400">
            All Credits to TSun Studio
          </span>
        </p>
        <span className="text-[0.7rem] text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} TSun WhatsApp Chat Viewer
        </span>
      </div>
    </footer>
  );
};

export default Footer;
