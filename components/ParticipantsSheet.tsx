import React from 'react';
import { Check, MessagesSquare, Users } from 'lucide-react';
import { Participant } from '../types';
import BottomSheet from './ui/BottomSheet';
import Avatar from './ui/Avatar';
import { formatMessageCount } from '../utils/parser';
import { haptic, HAPTIC_TICK } from '../utils/haptics';

export interface ParticipantsSheetProps {
  open: boolean;
  onClose: () => void;
  participants: Participant[];
  selfSender: string | null;
  onChangeSelf: (sender: string) => void;
  totalMessages: number;
  dateRange: { from: string; to: string } | null;
}

/**
 * Chat details sheet: participant list plus the "which one is you?" switch.
 *
 * WhatsApp exports do not record who sent what from the device owner's point of
 * view, so the app lets the user pick their identity and then renders their
 * messages on the right, exactly like the native app.
 */
export const ParticipantsSheet: React.FC<ParticipantsSheetProps> = ({
  open,
  onClose,
  participants,
  selfSender,
  onChangeSelf,
  totalMessages,
  dateRange,
}) => {
  const pick = (name: string) => {
    haptic(HAPTIC_TICK);
    onChangeSelf(name);
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Chat details"
      description={
        participants.length > 1
          ? 'Choose which participant you are — your messages move to the right.'
          : undefined
      }
      height="tall"
    >
      <div className="grid grid-cols-3 gap-2 pb-4">
        <Stat icon={<MessagesSquare className="h-4 w-4" />} label="Messages" value={totalMessages.toLocaleString()} />
        <Stat icon={<Users className="h-4 w-4" />} label="People" value={String(participants.length)} />
        <Stat
          icon={<Check className="h-4 w-4" />}
          label="Range"
          value={dateRange ? `${dateRange.from} →\n${dateRange.to}` : '—'}
          wrap
        />
      </div>

      <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white dark:divide-white/5 dark:border-white/10 dark:bg-white/5">
        {participants.map((participant) => {
          const isSelf = participant.name === selfSender;
          return (
            <li key={participant.name}>
              <button
                type="button"
                onClick={() => pick(participant.name)}
                className="ripple-host flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                aria-pressed={isSelf}
                aria-label={`Set ${participant.name} as you`}
              >
                <Avatar name={participant.name} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                    {participant.name}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {formatMessageCount(participant.messageCount)}
                  </span>
                </span>
                {isSelf && (
                  <span className="flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-800 dark:bg-primary-500/20 dark:text-primary-200">
                    You
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="pt-3 text-center text-[11.5px] text-slate-500 dark:text-slate-400">
        {participants.length} participant{participants.length === 1 ? '' : 's'} detected in this export.
      </p>
    </BottomSheet>
  );
};

const Stat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  /** Allow the value to wrap onto two lines (used by the date range). */
  wrap?: boolean;
}> = ({ icon, label, value, wrap }) => (
  <div className="rounded-2xl border border-black/5 bg-white px-2 py-3 text-center dark:border-white/10 dark:bg-white/5">
    <span className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-200">
      {icon}
    </span>
    <span
      className={`block text-[13px] font-semibold leading-tight text-slate-900 dark:text-white ${
        wrap ? 'break-words' : 'truncate'
      }`}
    >
      {value}
    </span>
    <span className="block text-[10.5px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </span>
  </div>
);

export default ParticipantsSheet;
