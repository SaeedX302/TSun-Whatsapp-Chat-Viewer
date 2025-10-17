import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-cyan-800/30 bg-gradient-to-r from-cyan-50 via-slate-50 to-cyan-100 dark:from-slate-900 dark:via-slate-950 dark:to-cyan-950 text-center py-4 mt-4 shadow-sm dark:shadow-[0_0_12px_rgba(103,232,249,0.25)] transition-all duration-300">
      <div className="flex items-center justify-center space-x-2">
        <Heart className="w-4 h-4 text-cyan-600 dark:text-cyan-300 animate-pulse" />
        <p className="text-[0.8rem] font-semibold tracking-wide text-slate-700 dark:text-cyan-200 drop-shadow-sm">
          Made with <span className="text-cyan-500 dark:text-cyan-300">🫀</span> by{' '}
          <span className="text-cyan-600 dark:text-cyan-300 font-bold">༯𝙎ค૯𝙀𝘿✘🫀</span> —{' '}
          <span className="italic text-slate-600 dark:text-cyan-400">All Credits to TSun Studio</span>
        </p>
      </div>
      <p className="mt-2 text-[0.7rem] text-slate-500 dark:text-cyan-400/70">
        © {new Date().getFullYear()} TSun WhatsApp Chat Viewer • Crafted for the modern dev
      </p>
    </footer>
  );
};

export default Footer;
