import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Download, FileText, Link2, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Message, Participant } from './types';
import { parseChatExport } from './utils/parser';
import AppBar from './components/AppBar';
import ChatView from './components/ChatView';
import ChatSidebar from './components/ChatSidebar';
import Footer from './components/Footer';
import LoadChatSheet, { rememberUrl } from './components/LoadChatSheet';
import ChatMenuSheet from './components/ChatMenuSheet';
import ParticipantsSheet from './components/ParticipantsSheet';
import InstallBanner from './components/InstallBanner';
import Snackbar, { SnackbarTone } from './components/ui/Snackbar';
import MaterialButton from './components/ui/MaterialButton';
import { useKeyboardInset } from './hooks/useKeyboardInset';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { copyToClipboard } from './utils/clipboard';
import { haptic, HAPTIC_CONFIRM, HAPTIC_TICK } from './utils/haptics';

const APP_VERSION = '2.0.0';
const SELF_KEY = 'tsun-self-sender';
const URL_KEY = 'chatUrl';
const THEME_KEY = 'theme';

interface SnackbarState {
  open: boolean;
  message: string;
  tone: SnackbarTone;
  actionLabel?: string;
  action?: () => void;
}

const initialSnackbar: SnackbarState = { open: false, message: '', tone: 'info' };

/** Reads a theme preference, falling back to the Android system setting. */
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [chatUrl, setChatUrl] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const fromQuery = new URLSearchParams(window.location.search).get('chat');
    return fromQuery || window.localStorage.getItem(URL_KEY);
  });
  const [fileSource, setFileSource] = useState<{ name: string; text: string } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selfSender, setSelfSender] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : window.localStorage.getItem(SELF_KEY)
  );
  const [title, setTitle] = useState('TSun Chat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [loadSheetOpen, setLoadSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>(initialSnackbar);
  const scrollRef = useRef<HTMLElement | null>(null);
  const selfRef = useRef<string | null>(selfSender);
  selfRef.current = selfSender;

  useKeyboardInset();
  const { canInstall, promptInstall, dismiss: dismissInstall } = useInstallPrompt();

  const showSnackbar = useCallback(
    (message: string, tone: SnackbarTone = 'info', action?: { label: string; onClick: () => void }) => {
      setSnackbar({
        open: true,
        message,
        tone,
        actionLabel: action?.label,
        action: action?.onClick,
      });
    },
    []
  );

  const dismissSnackbar = useCallback(
    () => setSnackbar((current) => ({ ...current, open: false })),
    []
  );

  /* Keep the Android status bar colour in sync with the app theme. */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    window.localStorage.setItem(THEME_KEY, theme);

    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = theme === 'dark' ? '#0f1512' : '#ffffff';
    document.head.appendChild(meta);
  }, [theme]);

  /* Parses raw export text into the chat model. */
  const applyParsedText = useCallback(
    (text: string, options?: { fileName?: string; silent?: boolean }) => {
      const parsed = parseChatExport(text, { selfSender: selfRef.current });
      setMessages(parsed.messages);
      setParticipants(parsed.participants);
      // Keep the app-level identity in sync with the parser's resolution so
      // "my" messages render on the right from the very first paint.
      selfRef.current = parsed.selfSender;
      setSelfSender(parsed.selfSender);
      setTitle(
        options?.fileName ? options.fileName.replace(/\.txt$/i, '') : parsed.title || 'TSun Chat'
      );
      if (!options?.silent) {
        haptic(HAPTIC_CONFIRM);
        showSnackbar(
          `Loaded ${parsed.messages.length.toLocaleString()} messages from ${parsed.participants.length} participant${
            parsed.participants.length === 1 ? '' : 's'
          }.`,
          'success'
        );
      }
    },
    [showSnackbar]
  );

  /* Deep link support: /?chat=<encoded url> (used by Android app shortcuts). */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('chat');
    if (!fromQuery) return;
    setChatUrl(fromQuery);
    // Persist it like an in-app submission, otherwise a reload would lose the chat.
    window.localStorage.setItem(URL_KEY, fromQuery);
    params.delete('chat');
    const query = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
  }, []);

  /* Fetches and parses the export whenever the URL (or reload token) changes. */
  useEffect(() => {
    if (!chatUrl) return;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(chatUrl, { signal: controller.signal });
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        const rawText = await response.text();
        applyParsedText(rawText);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setMessages([]);
        setError(
          cause instanceof Error
            ? `Could not load that chat: ${cause.message}. Check the link and your connection, then try again.`
            : 'Could not load that chat. Check the link and try again.'
        );
        haptic(HAPTIC_TICK);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, [applyParsedText, chatUrl, reloadToken]);

  /* Refreshing from the pull-to-refresh gesture. */
  const handleRefresh = useCallback(() => {
    haptic(HAPTIC_TICK);
    if (chatUrl) {
      setReloadToken((token) => token + 1);
      showSnackbar('Refreshing chat…');
      return;
    }
    if (fileSource) {
      applyParsedText(fileSource.text, { fileName: fileSource.name, silent: true });
      showSnackbar('Chat re-parsed from the local file.', 'success');
    }
  }, [applyParsedText, chatUrl, fileSource, showSnackbar]);

  const handleUrlSubmit = (url: string) => {
    setFileSource(null);
    setChatUrl(url);
    setLoadSheetOpen(false);
    window.localStorage.setItem(URL_KEY, url);
    rememberUrl(url);
  };

  const handleFileLoaded = (text: string, fileName: string) => {
    setChatUrl(null);
    setFileSource({ name: fileName, text });
    setError(null);
    setLoadSheetOpen(false);
    window.localStorage.removeItem(URL_KEY);
    applyParsedText(text, { fileName });
  };

  const handleChangeSelf = (sender: string) => {
    setSelfSender(sender);
    window.localStorage.setItem(SELF_KEY, sender);
    setDetailsOpen(false);
    showSnackbar(`Your messages now appear on the right as ${sender}.`, 'success');
  };

  const handleCopyMessage = useCallback(
    async (message: Message) => {
      const ok = await copyToClipboard(message.content);
      showSnackbar(ok ? 'Message copied to clipboard.' : 'Could not copy that message.', ok ? 'success' : 'error');
    },
    [showSnackbar]
  );

  const handleCopyLink = useCallback(async () => {
    setMenuOpen(false);
    if (!chatUrl) {
      showSnackbar('This chat was opened from a local file — there is no link to copy.');
      return;
    }
    const ok = await copyToClipboard(chatUrl);
    showSnackbar(ok ? 'Chat link copied.' : 'Could not copy the link.', ok ? 'success' : 'error');
  }, [chatUrl, showSnackbar]);

  const handleInstall = useCallback(async () => {
    if (canInstall) {
      const accepted = await promptInstall();
      showSnackbar(accepted ? 'Installing TSun Chat Viewer…' : 'Install dismissed.', accepted ? 'success' : 'info');
      return;
    }
    showSnackbar('Open Chrome’s ⋮ menu and choose “Add to Home screen”.');
  }, [canInstall, promptInstall, showSnackbar]);

  const handleThemeToggle = useCallback(() => {
    haptic(HAPTIC_TICK);
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter(
      (message) =>
        message.content.toLowerCase().includes(query) ||
        message.sender.toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  const dateRange = useMemo(() => {
    const dated = messages.filter((message) => !message.isSystem && message.date);
    if (dated.length === 0) return null;
    return { from: dated[0].date, to: dated[dated.length - 1].date };
  }, [messages]);

  const headerTitle = useMemo(() => {
    const others = participants.filter((participant) => participant.name !== selfSender);
    if (others.length === 1) return others[0].name;
    if (others.length > 1) return `${others.length} participants`;
    return title;
  }, [participants, selfSender, title]);

  const subtitle = loading
    ? 'Loading…'
    : messages.length === 0
      ? 'No chat loaded yet'
      : `${messages.length.toLocaleString()} messages · last active ${dateRange?.to ?? '—'}`;

  const hasContent = messages.length > 0;

  /* Surface load failures as a Material snackbar with a retry action. */
  useEffect(() => {
    if (!error) return;
    showSnackbar(error, 'error', { label: 'Retry', onClick: handleRefresh });
  }, [error, handleRefresh, showSnackbar]);

  const handleScrollState = useCallback(
    (state: { elevated: boolean; atBottom: boolean }) => setElevated(state.elevated),
    []
  );

  return (
    <div className={theme}>
      <div className="flex h-dvh flex-col overflow-hidden bg-[#efeae2] font-sans text-slate-800 dark:bg-[#0b141a] dark:text-white">
        <AppBar
          title={headerTitle}
          subtitle={subtitle}
          avatarName={headerTitle}
          searchQuery={searchQuery}
          searchActive={searchActive}
          onSearchChange={setSearchQuery}
          onSearchToggle={setSearchActive}
          onOpenMenu={() => setMenuOpen(true)}
          onOpenParticipants={() => setDetailsOpen(true)}
          elevated={elevated}
          resultCount={searchQuery ? filteredMessages.length : null}
        />

        {canInstall && <InstallBanner onInstall={handleInstall} onDismiss={dismissInstall} />}

        <div className="flex min-h-0 flex-1">
          {hasContent && !error && (
            <ChatSidebar
              title={headerTitle}
              participants={participants}
              selfSender={selfSender}
              totalMessages={messages.length}
              dateRange={dateRange}
              theme={theme}
              onThemeToggle={handleThemeToggle}
              onOpenParticipants={() => setDetailsOpen(true)}
              onReload={handleRefresh}
              onCopyLink={handleCopyLink}
              canInstall={canInstall}
              onInstall={handleInstall}
            />
          )}

          <main
            id="chat-container"
            ref={scrollRef}
            className="material-scroll relative min-h-0 flex-1 overscroll-contain"
          >
            {loading && !hasContent && (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                <p className="text-sm text-slate-600 dark:text-slate-300">Loading your chat…</p>
              </div>
            )}

            {!loading && error && !hasContent && (
              <div className="flex h-full items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white/95 p-6 text-center shadow-m3-2 dark:border-red-500/30 dark:bg-slate-900/90">
                  <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
                  <h2 className="mt-3 text-lg font-semibold">Could not load that chat</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{error}</p>
                  <div className="mt-5 flex flex-col gap-2">
                    <MaterialButton fullWidth icon={<RefreshCw className="h-4 w-4" />} onClick={handleRefresh}>
                      Try again
                    </MaterialButton>
                    <MaterialButton
                      variant="tonal"
                      fullWidth
                      icon={<Link2 className="h-4 w-4" />}
                      onClick={() => setLoadSheetOpen(true)}
                    >
                      Use a different link
                    </MaterialButton>
                  </div>
                </div>
              </div>
            )}

            {hasContent && (
              <ChatView
                messages={filteredMessages}
                searchQuery={searchQuery}
                selfSender={selfSender}
                showSender={participants.length > 2}
                onCopy={handleCopyMessage}
                onRefresh={handleRefresh}
                scrollRef={scrollRef}
                onScrollStateChange={handleScrollState}
              />
            )}

            {!hasContent && !loading && !error && (
              <div className="flex h-full items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white/95 p-6 text-center shadow-m3-2 dark:border-white/10 dark:bg-slate-900/85">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-m3-2">
                    <Sparkles className="h-8 w-8" />
                  </span>
                  <h1 className="mt-4 text-xl font-semibold">TSun Chat Viewer</h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Turn a WhatsApp “Export chat” file into a fast, app-like experience.
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    <MaterialButton
                      size="lg"
                      fullWidth
                      icon={<Link2 className="h-4 w-4" />}
                      onClick={() => setLoadSheetOpen(true)}
                    >
                      Load chat from URL
                    </MaterialButton>
                    <MaterialButton
                      size="lg"
                      variant="tonal"
                      fullWidth
                      icon={<FileText className="h-4 w-4" />}
                      onClick={() => setLoadSheetOpen(true)}
                    >
                      Open a .txt export
                    </MaterialButton>
                    <MaterialButton
                      size="lg"
                      variant="outlined"
                      fullWidth
                      icon={<Sparkles className="h-4 w-4" />}
                      onClick={() => handleUrlSubmit('/sample-chat.txt')}
                    >
                      Try a sample chat
                    </MaterialButton>
                    {canInstall && (
                      <MaterialButton
                        variant="text"
                        fullWidth
                        icon={<Download className="h-4 w-4" />}
                        onClick={handleInstall}
                      >
                        Install on Android
                      </MaterialButton>
                    )}
                  </div>
                  <ol className="mt-6 space-y-2 text-left text-[12.5px] leading-snug text-slate-600 dark:text-slate-400">
                    <li>1. In WhatsApp, open the chat → ⋮ → More → Export chat (without media).</li>
                    <li>2. Paste the file contents into a GitHub Gist, then copy the raw URL.</li>
                    <li>3. Paste the link above — or open the .txt straight from your phone.</li>
                  </ol>
                </div>
              </div>
            )}
          </main>
        </div>

        <Footer />
      </div>

      <LoadChatSheet
        open={loadSheetOpen}
        onClose={() => setLoadSheetOpen(false)}
        onSubmit={handleUrlSubmit}
        onFileLoaded={handleFileLoaded}
        currentUrl={chatUrl}
        loading={loading}
      />

      <ChatMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onChangeChat={() => {
          setMenuOpen(false);
          setLoadSheetOpen(true);
        }}
        onReload={() => {
          setMenuOpen(false);
          handleRefresh();
        }}
        onCopyLink={handleCopyLink}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        canInstall={canInstall}
        onInstall={handleInstall}
        version={APP_VERSION}
      />

      <ParticipantsSheet
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        participants={participants}
        selfSender={selfSender}
        onChangeSelf={handleChangeSelf}
        totalMessages={messages.length}
        dateRange={dateRange}
      />

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        tone={snackbar.tone}
        actionLabel={snackbar.actionLabel}
        onAction={snackbar.action}
        onDismiss={dismissSnackbar}
      />
    </div>
  );
};

export default App;
