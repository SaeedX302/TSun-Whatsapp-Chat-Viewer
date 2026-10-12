import React, { useEffect, useState } from 'react';
import { ClipboardPaste, FileText, Link2, Loader2, ShieldCheck } from 'lucide-react';
import BottomSheet from './ui/BottomSheet';
import MaterialButton from './ui/MaterialButton';
import { haptic, HAPTIC_TICK } from '../utils/haptics';

const SAMPLE_URL =
  'https://gist.githubusercontent.com/SaeedX302/14ce71f3aa3b7fb2eba2d4206cc4862c/raw/d614b4d64ff15cbe7b7aa8572e9561b01f9d3bc4/gistfile1.txt';

const RECENT_KEY = 'tsun-recent-urls';

export interface LoadChatSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  /** Loads a .txt export picked from the device (Android Files / Downloads). */
  onFileLoaded: (text: string, fileName: string) => void;
  /** URL that is currently loaded, prefilled when re-opening the sheet. */
  currentUrl: string | null;
  loading?: boolean;
}

const readRecent = (): string[] => {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

export const rememberUrl = (url: string) => {
  try {
    const next = [url, ...readRecent().filter((item) => item !== url)].slice(0, 4);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage may be unavailable in private mode — not fatal */
  }
};

/**
 * Material bottom sheet for loading a chat export.
 *
 * Uses a URL keyboard (`inputMode="url"`), submits on the keyboard's Go key and
 * offers paste/recent shortcuts — the flow an Android user expects when pasting
 * a gist link.
 */
export const LoadChatSheet: React.FC<LoadChatSheetProps> = ({
  open,
  onClose,
  onSubmit,
  onFileLoaded,
  currentUrl,
  loading,
}) => {
  const [url, setUrl] = useState(currentUrl ?? SAMPLE_URL);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setUrl(currentUrl ?? SAMPLE_URL);
    setError(null);
    setRecent(readRecent());
  }, [open, currentUrl]);

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Paste the raw URL of your chat export.');
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setError('The URL must start with http:// or https://');
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
        haptic(HAPTIC_TICK);
      }
    } catch {
      setError('Clipboard access was blocked — paste the link manually.');
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Load a WhatsApp chat"
      description="Paste the raw URL of an exported chat (GitHub Gist, Pastebin, …). Nothing is uploaded — the file is fetched straight into your browser."
      initialFocusRef={inputRef}
    >
      <form onSubmit={submit} className="space-y-4 pb-2">
        <div className="relative">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            type="url"
            inputMode="url"
            enterKeyHint="go"
            autoComplete="off"
            spellCheck={false}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://gist.githubusercontent.com/…/chat.txt"
            className="h-14 w-full rounded-2xl border border-slate-300 bg-white/70 pl-10 pr-12 text-[16px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-400/40 dark:border-white/15 dark:bg-white/5 dark:text-white"
          />
          <button
            type="button"
            onClick={pasteFromClipboard}
            aria-label="Paste from clipboard"
            title="Paste"
            className="ripple-host absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-600 transition-colors hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <ClipboardPaste className="h-5 w-5" />
          </button>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        {recent.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recent.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setUrl(item)}
                className="max-w-full truncate rounded-full bg-black/5 px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
              >
                {item.replace(/^https?:\/\//, '').slice(0, 42)}
              </button>
            ))}
          </div>
        )}

        <MaterialButton type="submit" size="lg" fullWidth disabled={loading} className="mt-1">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </>
          ) : (
            'View chat'
          )}
        </MaterialButton>

        {/* Android users usually already have the .txt export on the device. */}
        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            or
          </span>
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        <MaterialButton
          type="button"
          variant="tonal"
          size="lg"
          fullWidth
          icon={<FileText className="h-4 w-4" />}
          onClick={() => fileInputRef.current?.click()}
        >
          Open a .txt export from this device
        </MaterialButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            try {
              const text = await file.text();
              onFileLoaded(text, file.name);
            } catch {
              setError('That file could not be read. Try exporting the chat again.');
            }
          }}
        />

        <p className="flex items-center justify-center gap-2 pt-1 text-center text-[11.5px] leading-snug text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Your chat stays on your device. TSun never uploads or stores it.
        </p>
      </form>
    </BottomSheet>
  );
};

export default LoadChatSheet;
