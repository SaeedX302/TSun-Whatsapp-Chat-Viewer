import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, History, Loader2, MessageSquareDashed, SearchX } from 'lucide-react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import Fab from './ui/Fab';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

interface ChatViewProps {
  messages: Message[];
  searchQuery: string;
  /** Participant rendered on the right-hand side. */
  selfSender: string | null;
  /** Show sender names (group conversations). */
  showSender: boolean;
  onCopy: (message: Message) => void;
  /** Pull-to-refresh handler (re-fetches the export). */
  onRefresh: () => void;
  /** The scrolling element owned by <App />. */
  scrollRef: React.RefObject<HTMLElement | null>;
  /** Reports scroll position so the app bar can raise its elevation. */
  onScrollStateChange?: (state: { elevated: boolean; atBottom: boolean }) => void;
}

/** Page size for the "load earlier messages" windowing. */
const PAGE_SIZE = 150;

const DateSeparator: React.FC<{ date: string }> = ({ date }) => (
  <div className="sticky top-2 z-10 flex justify-center py-2">
    <span className="rounded-lg bg-white/95 px-3 py-1 text-[11.5px] font-medium uppercase tracking-wide text-slate-600 shadow-sm dark:bg-[#182229]/95 dark:text-slate-300">
      {date}
    </span>
  </div>
);

const EmptyState: React.FC<{ searchQuery: string }> = ({ searchQuery }) => (
  <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
    {searchQuery ? (
      <>
        <SearchX className="h-10 w-10 text-slate-400" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          No messages match <span className="font-semibold">“{searchQuery}”</span>
        </p>
      </>
    ) : (
      <>
        <MessageSquareDashed className="h-10 w-10 text-slate-400" />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This export does not contain any messages.
        </p>
      </>
    )}
  </div>
);



const ChatView: React.FC<ChatViewProps> = ({
  messages,
  searchQuery,
  selfSender,
  showSender,
  onCopy,
  onRefresh,
  scrollRef,
  onScrollStateChange,
}) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [atBottom, setAtBottom] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const didInitialScroll = useRef(false);

  const startIndex = Math.max(0, messages.length - visibleCount);
  const visibleMessages = useMemo(() => messages.slice(startIndex), [messages, startIndex]);
  const hasEarlier = startIndex > 0;

  // A chat export can hold tens of thousands of lines; opening on the newest
  // message keeps the first paint fast on a phone.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    didInitialScroll.current = false;
  }, [messages]);

  useEffect(() => {
    if (didInitialScroll.current || visibleMessages.length === 0) return;
    didInitialScroll.current = true;
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [visibleMessages.length]);

  useEffect(() => {
    if (searchQuery) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [visibleMessages.length, searchQuery]);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setAtBottom(distanceFromBottom < 120);
    onScrollStateChange?.({
      elevated: container.scrollTop > 4,
      atBottom: distanceFromBottom < 120,
    });
  }, [onScrollStateChange, scrollRef]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, scrollRef]);

  // Jump to the first match as the user types, without losing chat context.
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;
    const matchIndex = messages.findIndex((message) =>
      message.content.toLowerCase().includes(query)
    );
    if (matchIndex === -1) return;
    setVisibleCount((current) => Math.max(current, messages.length - matchIndex + 4));
    const id = window.requestAnimationFrame(() => {
      document
        .getElementById(`msg-${messages[matchIndex].id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [messages, searchQuery]);

  const { pull, refreshing, progress, active } = usePullToRefresh({
    onRefresh,
    scrollRef,
    enabled: Boolean(onRefresh),
  });

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });

  let lastDate: string | null = null;

  if (messages.length === 0) {
    return <EmptyState searchQuery={searchQuery} />;
  }


  return (
    <div className="chat-canvas relative min-h-full">
      {/* Pull-to-refresh indicator: Material circular progress. */}
      {active && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center"
          style={{ transform: `translateY(${Math.max(pull, refreshing ? 48 : 0)}px)` }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-m3-2 dark:bg-slate-800">
            <Loader2
              className={`h-4 w-4 text-primary-600 ${refreshing ? 'animate-spin' : ''}`}
              style={refreshing ? undefined : { transform: `rotate(${progress * 300}deg)` }}
            />
          </span>
        </div>
      )}

      <div className="flex flex-col px-1.5 pb-24 pt-1 sm:px-3 md:px-6">
        <div ref={topRef} className="h-px" />

        {hasEarlier && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="ripple-host flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-white dark:bg-slate-800/90 dark:text-slate-200"
            >
              <History className="h-3.5 w-3.5" />
              Load earlier messages ({startIndex} hidden)
            </button>
          </div>
        )}

        {visibleMessages.map((message) => {
          const showDateSeparator = message.date !== lastDate;
          lastDate = message.date;
          return (
            <React.Fragment key={message.id}>
              {showDateSeparator && <DateSeparator date={message.date} />}
              <div id={`msg-${message.id}`}>
                <MessageBubble
                  message={message}
                  searchQuery={searchQuery}
                  isMine={message.sender === selfSender}
                  showSender={showSender}
                  onCopy={onCopy}
                />
              </div>
            </React.Fragment>
          );
        })}

        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Floating scroll controls, bottom-right so they stay thumb reachable. */}
      <div className="bottom-nav pointer-events-none absolute right-3 z-30 flex flex-col items-end gap-2 sm:right-4">
        {!atBottom && (
          <Fab
            label="Scroll to latest message"
            size="sm"
            className="pointer-events-auto animate-pop-in"
            onClick={scrollToBottom}
          >
            <ArrowDown />
          </Fab>
        )}
        <Fab
          label="Scroll to first message"
          size="sm"
          variant="surface"
          className="pointer-events-auto"
          onClick={scrollToTop}
        >
          <ArrowUp />
        </Fab>
      </div>
    </div>
  );
};

export default ChatView;
