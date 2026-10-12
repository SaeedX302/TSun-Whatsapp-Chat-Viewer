import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Shows the WhatsApp-style presence dot. */
  online?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-24 w-24 text-3xl',
};

/** Deterministic hue per contact, the way Android contact avatars are tinted. */
const hueFromName = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
};

const initialsFromName = (name: string): string => {
  const cleaned = name.replace(/[^\p{L}\p{N}\s+]/gu, ' ').trim();
  if (!cleaned) return '#';
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Offline-safe initials avatar.
 *
 * Replaces the remote placeholder images the app used to request: zero network
 * round-trips, nothing to break when offline, and it works inside the installed
 * Android app without an internet connection.
 */
export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', online, className = '' }) => {
  const hue = hueFromName(name || 'Chat');

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        aria-hidden="true"
        className={`flex items-center justify-center rounded-full font-semibold text-white shadow-inner ring-1 ring-black/5 ${SIZE_CLASSES[size]}`}
        style={{
          backgroundImage: `linear-gradient(140deg, hsl(${hue} 62% 52%), hsl(${(hue + 38) % 360} 68% 38%))`,
        }}
      >
        {initialsFromName(name)}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900" />
      )}
      <span className="sr-only">{name}</span>
    </div>
  );
};

export default Avatar;
