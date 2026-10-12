import React from 'react';
import { Copy, Download, Info, Link2, Moon, RefreshCw, Sun } from 'lucide-react';
import BottomSheet from './ui/BottomSheet';

export interface ChatMenuSheetProps {
  open: boolean;
  onClose: () => void;
  onChangeChat: () => void;
  onReload: () => void;
  onCopyLink: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  canInstall: boolean;
  onInstall: () => void;
  version: string;
}

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
  trailing?: React.ReactNode;
}> = ({ icon, label, hint, onClick, trailing }) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      className="ripple-host flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-white/10 dark:text-primary-200">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </span>
        {hint && (
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{hint}</span>
        )}
      </span>
      {trailing}
    </button>
  </li>
);

/**
 * Android-style overflow menu rendered as a bottom sheet (instead of a web
 * dropdown), keeping every action within thumb reach on a phone.
 */
export const ChatMenuSheet: React.FC<ChatMenuSheetProps> = ({
  open,
  onClose,
  onChangeChat,
  onReload,
  onCopyLink,
  theme,
  onThemeToggle,
  canInstall,
  onInstall,
  version,
}) => (
  <BottomSheet open={open} onClose={onClose} title="Options" height="auto">
    <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white dark:divide-white/5 dark:border-white/10 dark:bg-white/5">
      <MenuItem
        icon={<Link2 className="h-4 w-4" />}
        label="Load another chat"
        hint="Paste a different export URL"
        onClick={onChangeChat}
      />
      <MenuItem
        icon={<RefreshCw className="h-4 w-4" />}
        label="Reload this chat"
        hint="Re-fetch the export from the source"
        onClick={onReload}
      />
      <MenuItem
        icon={<Copy className="h-4 w-4" />}
        label="Copy chat link"
        onClick={onCopyLink}
      />
      <MenuItem
        icon={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        label={theme === 'dark' ? 'Light theme' : 'Dark theme'}
        hint="Matches your Android system setting on first launch"
        onClick={onThemeToggle}
      />
      {canInstall && (
        <MenuItem
          icon={<Download className="h-4 w-4" />}
          label="Install app"
          hint="Add TSun Chat Viewer to your home screen"
          onClick={onInstall}
        />
      )}
    </ul>

    <div className="mt-4 flex items-start gap-3 rounded-2xl bg-black/5 p-3 dark:bg-white/5">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
      <p className="text-[11.5px] leading-snug text-slate-600 dark:text-slate-300">
        TSun Chat Viewer <span className="font-semibold">v{version}</span> — made with 🫀 by{' '}
        <span className="font-semibold">༯𝙎ค૯𝙀𝘿✘🫀</span>. All credits to TSun Studio. Chats are parsed
        locally in your browser and never leave your device.
      </p>
    </div>
  </BottomSheet>
);

export default ChatMenuSheet;
