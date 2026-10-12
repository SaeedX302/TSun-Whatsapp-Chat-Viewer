import React, { useEffect, useRef } from 'react';
import { ArrowLeft, MoreVertical, Search, X } from 'lucide-react';
import Avatar from './ui/Avatar';
import IconButton from './ui/IconButton';

export interface AppBarProps {
  title: string;
  subtitle: string;
  avatarName: string;
  searchQuery: string;
  searchActive: boolean;
  onSearchChange: (query: string) => void;
  onSearchToggle: (active: boolean) => void;
  onOpenMenu: () => void;
  onOpenParticipants: () => void;
  /** True once the chat is scrolled, which raises the app bar elevation. */
  elevated: boolean;
  resultCount: number | null;
}

/**
 * Material 3 top app bar.
 *
 * Implements the two Android behaviours users expect from a chat app: the bar
 * gains elevation as the content scrolls underneath it, and tapping the search
 * icon *transforms the bar itself* into a search field (rather than opening a
 * separate screen). Height and the status-bar inset adapt to the device.
 */
export const AppBar: React.FC<AppBarProps> = ({
  title,
  subtitle,
  avatarName,
  searchQuery,
  searchActive,
  onSearchChange,
  onSearchToggle,
  onOpenMenu,
  onOpenParticipants,
  elevated,
  resultCount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchActive) {
      // Delay so the bar's layout settles before the keyboard slides up.
      const timeout = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(timeout);
    }
  }, [searchActive]);

  const subtitleText =
    searchActive && searchQuery
      ? resultCount === null
        ? 'Searching…'
        : `${resultCount} result${resultCount === 1 ? '' : 's'}`
      : subtitle;

  return (
    <header
      data-elevated={elevated}
      className="app-bar app-bar-safe z-20 shrink-0 border-b border-black/5 px-safe dark:border-white/10"
    >
      <div className="flex h-14 items-center gap-1 px-1.5 sm:h-16 sm:px-2">
        {searchActive ? (
          <>
            <IconButton
              label="Close search"
              size="md"
              onClick={() => {
                onSearchChange('');
                onSearchToggle(false);
              }}
            >
              <ArrowLeft />
            </IconButton>
            <div className="relative flex flex-1 items-center">
              <input
                ref={inputRef}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search this chat"
                className="h-11 w-full rounded-full border border-transparent bg-black/5 pl-4 pr-10 text-[16px] text-slate-800 outline-none transition-colors placeholder:text-slate-500 focus:border-primary-400 focus:bg-transparent dark:bg-white/10 dark:text-white dark:placeholder:text-slate-400"
              />
              {searchQuery && (
                <IconButton
                  label="Clear search"
                  size="sm"
                  className="absolute right-1"
                  onClick={() => {
                    onSearchChange('');
                    inputRef.current?.focus();
                  }}
                >
                  <X />
                </IconButton>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onOpenParticipants}
              className="ripple-host flex min-w-0 flex-1 items-center gap-3 rounded-full px-1 py-1 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Chat details"
            >
              <Avatar name={avatarName} size="md" online />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[17px] font-semibold leading-tight text-slate-900 dark:text-white">
                  {title}
                </span>
                <span className="block truncate text-xs text-primary-700 dark:text-primary-300">
                  {subtitleText}
                </span>
              </span>
            </button>

            {/* Tablet/desktop get an always-visible search field. */}
            <div className="relative mr-1 hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search chat"
                className="h-10 w-40 rounded-full bg-black/5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-all focus:w-56 focus:ring-2 focus:ring-primary-400 lg:w-56 lg:focus:w-72 dark:bg-white/10 dark:text-white"
              />
            </div>

            <IconButton
              label="Search"
              className="md:hidden"
              onClick={() => onSearchToggle(true)}
            >
              <Search />
            </IconButton>
            <IconButton label="More options" onClick={onOpenMenu}>
              <MoreVertical />
            </IconButton>
          </>
        )}
      </div>
    </header>
  );
};

export default AppBar;
