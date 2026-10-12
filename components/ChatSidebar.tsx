import React from 'react';
import { Download, Link2, Moon, RefreshCw, Sun, Users } from 'lucide-react';
import { Participant } from '../types';
import Avatar from './ui/Avatar';
import MaterialButton from './ui/MaterialButton';
import { formatMessageCount } from '../utils/parser';

export interface ChatSidebarProps {
  title: string;
  participants: Participant[];
  selfSender: string | null;
  totalMessages: number;
  dateRange: { from: string; to: string } | null;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onOpenParticipants: () => void;
  onReload: () => void;
  onCopyLink: () => void;
  canInstall: boolean;
  onInstall: () => void;
}

/**
 * Tablet / desktop companion pane.
 *
 * Phones get the full-screen chat; on wider displays the same data is shown as
 * a persistent sidebar so the layout uses the extra space instead of stretching
 * message bubbles across the screen.
 */
export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  title,
  participants,
  selfSender,
  totalMessages,
  dateRange,
  theme,
  onThemeToggle,
  onOpenParticipants,
  onReload,
  onCopyLink,
  canInstall,
  onInstall,
}) => (
  <aside className="hidden w-80 shrink-0 flex-col gap-4 border-r border-black/5 bg-white/70 p-4 lg:flex dark:border-white/10 dark:bg-white/5">
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-black/5 bg-white p-4 text-center shadow-m3-1 dark:border-white/10 dark:bg-slate-900/60">
      <Avatar name={title} size="xl" />
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {participants.length} participant{participants.length === 1 ? '' : 's'} ·{' '}
          {totalMessages.toLocaleString()} messages
        </p>
        {dateRange && (
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            {dateRange.from} → {dateRange.to}
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <MaterialButton size="sm" variant="tonal" icon={<Users className="h-4 w-4" />} onClick={onOpenParticipants}>
          Details
        </MaterialButton>
        <MaterialButton size="sm" variant="outlined" icon={<RefreshCw className="h-4 w-4" />} onClick={onReload}>
          Reload
        </MaterialButton>
        <MaterialButton size="sm" variant="outlined" icon={<Link2 className="h-4 w-4" />} onClick={onCopyLink}>
          Copy link
        </MaterialButton>
        <MaterialButton
          size="sm"
          variant="outlined"
          icon={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          onClick={onThemeToggle}
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </MaterialButton>
      </div>
    </div>

    <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-black/5 bg-white dark:border-white/10 dark:bg-slate-900/60">
      <h3 className="border-b border-black/5 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-white/10 dark:text-slate-400">
        Participants
      </h3>
      <ul className="material-scroll max-h-full divide-y divide-black/5 dark:divide-white/5">
        {participants.slice(0, 12).map((participant) => (
          <li key={participant.name} className="flex items-center gap-3 px-4 py-2.5">
            <Avatar name={participant.name} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-slate-800 dark:text-white">
                {participant.name}
                {participant.name === selfSender && (
                  <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-800 dark:bg-primary-500/20 dark:text-primary-200">
                    You
                  </span>
                )}
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                {formatMessageCount(participant.messageCount)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>

    {canInstall && (
      <MaterialButton variant="tonal" fullWidth icon={<Download className="h-4 w-4" />} onClick={onInstall}>
        Install on Android
      </MaterialButton>
    )}
  </aside>
);

export default ChatSidebar;
