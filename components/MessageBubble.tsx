import React, { useCallback, useRef } from 'react';
import { Check, CheckCheck, ImageOff } from 'lucide-react';
import { Message } from '../types';
import { haptic, HAPTIC_TICK } from '../utils/haptics';

interface MessageBubbleProps {
  message: Message;
  searchQuery: string;
  /** True when the message was sent by the device owner (rendered on the right). */
  isMine: boolean;
  /** Show the sender name (group chats). */
  showSender: boolean;
  /** Called on long-press / right-click so the parent can copy the text. */
  onCopy?: (message: Message) => void;
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Stable colour per participant, like WhatsApp's group sender colours. */
const senderHue = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 33 + name.charCodeAt(i)) % 360;
  return hash;
};

/**
 * Renders WhatsApp markup: *bold*, _italic_, ~strike~, ```mono```, URLs and the
 * custom `[rrggbb]` colour syntax, while highlighting live search matches.
 */
const renderFormattedText = (text: string, searchQuery: string): React.ReactNode => {
  const regex =
    /(\[c\]|\[[0-9a-fA-F]{6}\])|(\*[^*]+\*)|(_[^_]+_)|(~[^~]+~)|(```[\s\S]+?```)|(https?:\/\/[^\s]+)/g;
  const parts = text.split(regex).filter((part) => part !== undefined && part !== '');
  const elements: React.ReactNode[] = [];
  const highlightPattern = searchQuery ? new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi') : null;
  let currentColor = 'inherit';

  const highlight = (content: string): React.ReactNode => {
    if (!highlightPattern) return content;
    highlightPattern.lastIndex = 0;
    return content.split(highlightPattern).map((subPart, index) =>
      subPart.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={index} className="rounded bg-amber-300 px-0.5 text-black">
          {subPart}
        </mark>
      ) : (
        <React.Fragment key={index}>{subPart}</React.Fragment>
      )
    );
  };

  parts.forEach((part, index) => {
    const key = `p${index}`;

    if (/^\[[0-9a-fA-F]{6}\]$/.test(part)) {
      currentColor = `#${part.slice(1, -1)}`;
      return;
    }
    if (part === '[c]') {
      currentColor = 'inherit';
      return;
    }
    if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
      elements.push(
        <strong key={key} style={{ color: currentColor }}>
          {renderFormattedText(part.slice(1, -1), searchQuery)}
        </strong>
      );
      return;
    }
    if (part.length > 2 && part.startsWith('_') && part.endsWith('_')) {
      elements.push(
        <em key={key} style={{ color: currentColor }}>
          {renderFormattedText(part.slice(1, -1), searchQuery)}
        </em>
      );
      return;
    }
    if (part.length > 2 && part.startsWith('~') && part.endsWith('~')) {
      elements.push(
        <del key={key} style={{ color: currentColor }}>
          {renderFormattedText(part.slice(1, -1), searchQuery)}
        </del>
      );
      return;
    }
    if (part.startsWith('```') && part.endsWith('```')) {
      elements.push(
        <code
          key={key}
          className="my-0.5 block overflow-x-auto whitespace-pre-wrap rounded-md bg-black/10 px-2 py-1 font-mono text-[13px] dark:bg-white/10"
          style={{ color: currentColor }}
        >
          {highlight(part.slice(3, -3))}
        </code>
      );
      return;
    }
    if (/^https?:\/\//.test(part)) {
      elements.push(
        <a
          key={key}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-cyan-700 underline decoration-cyan-700/40 hover:decoration-cyan-700 dark:text-cyan-300 dark:decoration-cyan-300/40"
        >
          {highlight(part)}
        </a>
      );
      return;
    }
    elements.push(
      <span key={key} style={{ color: currentColor }}>
        {highlight(part)}
      </span>
    );
  });

  return <>{elements}</>;
};

/** Touch long-press (500ms) that also works with a mouse right-click. */
const useLongPress = (onLongPress?: () => void) => {
  const timer = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!onLongPress) return;
    clear();
    timer.current = window.setTimeout(() => {
      haptic(HAPTIC_TICK);
      onLongPress();
    }, 500);
  }, [clear, onLongPress]);

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchMove: clear,
    onTouchCancel: clear,
    onContextMenu: (event: React.MouseEvent) => {
      if (!onLongPress) return;
      event.preventDefault();
      onLongPress();
    },
  };
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  searchQuery,
  isMine,
  showSender,
  onCopy,
}) => {
  const longPress = useLongPress(onCopy ? () => onCopy(message) : undefined);

  // System notices ("Messages are end-to-end encrypted") render as centred chips.
  if (message.isSystem) {
    return (
      <div className="cv-auto flex justify-center px-4 py-1.5">
        <span className="max-w-[85%] rounded-lg bg-white/90 px-3 py-1.5 text-center text-[11.5px] leading-snug text-slate-600 shadow-sm dark:bg-slate-800/90 dark:text-slate-300">
          {renderFormattedText(message.content, searchQuery)}
        </span>
      </div>
    );
  }

  return (
    <div className={`cv-auto flex px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        {...longPress}
        className={[
          'bubble selectable relative my-0.5 max-w-[85%] px-2.5 py-1.5',
          'sm:max-w-[75%] md:max-w-[65%] lg:max-w-[60%]',
          isMine
            ? 'rounded-2xl rounded-br-md bg-[#d9fdd3] text-slate-900 dark:bg-[#005c4b] dark:text-white'
            : 'rounded-2xl rounded-bl-md bg-white text-slate-900 dark:bg-[#202c33] dark:text-white',
          onCopy ? 'active:brightness-[0.97]' : '',
        ].join(' ')}
      >
        {showSender && !isMine && (
          <div
            className="mb-0.5 truncate text-[12.5px] font-semibold"
            style={{ color: `hsl(${senderHue(message.sender)} 65% 42%)` }}
          >
            {message.sender}
          </div>
        )}

        {message.isMedia ? (
          <div className="flex items-center gap-2 py-1 text-slate-600 dark:text-slate-300">
            <ImageOff className="h-4 w-4 shrink-0" />
            <span className="text-[13px] italic">Media omitted in export</span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words text-[14.5px] leading-[1.45] sm:text-[15px]">
            {renderFormattedText(message.content, searchQuery)}
          </div>
        )}

        <div
          className={`mt-0.5 flex items-center justify-end gap-1 text-[10.5px] ${
            isMine ? 'text-emerald-800/70 dark:text-white/60' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span>{message.time}</span>
          {isMine &&
            (message.id % 2 === 0 ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

