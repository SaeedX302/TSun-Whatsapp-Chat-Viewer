import { Message, Participant, ParsedChat } from '../types';

/**
 * Matches every timestamp flavour WhatsApp actually produces:
 *   12/03/2024, 14:05 - Sender: hello
 *   3/12/24, 2:05 pm - Sender: hello
 *   [12.03.2024, 14:05:32] Sender: hello
 *   12/03/2024, 14:05 - Messages and calls are end-to-end encrypted.   (system)
 */
const TIMESTAMP_SOURCES = [
  // [DD/MM/YYYY, HH:MM:SS] Sender: text  (iOS / newer Android exports)
  '^\\[(?<dt>\\d{1,4}[./-]\\d{1,2}[./-]\\d{1,4},\\s*\\d{1,2}:\\d{2}(?::\\d{2})?(?:\\s?[APap]\\.?[Mm]\\.?)?)\\]\\s*(?:(?<sender>[^:]{1,80}?):\\s*)?(?<body>[\\s\\S]*)$',
  // DD/MM/YYYY, HH:MM - Sender: text  (classic Android export, dash variants)
  '^(?<dt>\\d{1,4}[./-]\\d{1,2}[./-]\\d{1,4},\\s*\\d{1,2}:\\d{2}(?::\\d{2})?(?:\\s?[APap]\\.?[Mm]\\.?)?)\\s*[-\u2013\u2014]\\s*(?:(?<sender>[^:]{1,80}?):\\s*)?(?<body>[\\s\\S]*)$',
];

const MESSAGE_LINE_REGEXES = TIMESTAMP_SOURCES.map((source) => new RegExp(source));

const MEDIA_PATTERNS = [
  /^<media omitted>$/i,
  /^(image|video|audio|sticker|document|gif|contact card|vcard) omitted$/i,
  /^\u200e?(image|video|audio|sticker|document) omitted$/i,
];

const isMediaPlaceholder = (body: string) => MEDIA_PATTERNS.some((re) => re.test(body.trim()));

const splitDateTime = (dateTime: string): { date: string; time: string } => {
  const separatorIndex = dateTime.lastIndexOf(',');
  if (separatorIndex === -1) return { date: dateTime.trim(), time: '' };
  return {
    date: dateTime.slice(0, separatorIndex).trim(),
    time: dateTime.slice(separatorIndex + 1).trim(),
  };
};

export interface ParseOptions {
  /** Force a specific participant to be rendered as "me". */
  selfSender?: string | null;
}

/**
 * Parses a WhatsApp "Export chat" .txt file.
 *
 * Multi-line messages are re-joined, system notices are flagged, and the
 * participant list is derived so the UI can offer a WhatsApp-like
 * "who am I?" switch. Nothing here is Android specific, but the output is what
 * drives the native-looking chat layout.
 */
export const parseChatExport = (rawText: string, options: ParseOptions = {}): ParsedChat => {
  const lines = rawText.replace(/\r\n?/g, '\n').split('\n');
  const messages: Message[] = [];
  const senderCounts: Record<string, number> = {};
  let currentMessage: Message | null = null;

  for (const line of lines) {
    let match: RegExpMatchArray | null = null;
    for (const regex of MESSAGE_LINE_REGEXES) {
      match = line.match(regex);
      if (match) break;
    }

    if (match?.groups) {
      const { date, time } = splitDateTime(match.groups.dt ?? '');
      const sender = (match.groups.sender ?? '').trim();
      const body = (match.groups.body ?? '').trim();
      const isSystem = sender.length === 0;

      currentMessage = {
        id: messages.length,
        date,
        time,
        sender: isSystem ? 'System' : sender,
        content: body,
        isSystem,
        isMedia: isMediaPlaceholder(body),
      };
      messages.push(currentMessage);

      if (!isSystem) senderCounts[sender] = (senderCounts[sender] || 0) + 1;
      continue;
    }

    // Continuation of the previous message (multi-line text / media captions).
    if (currentMessage) {
      currentMessage.content += `\n${line}`;
    }
  }

  const participants: Participant[] = Object.entries(senderCounts)
    .map(([name, messageCount]) => ({ name, messageCount }))
    .sort((a, b) => b.messageCount - a.messageCount || a.name.localeCompare(b.name));

  const requestedSelf = options.selfSender?.trim();
  const selfSender =
    (requestedSelf && participants.some((p) => p.name === requestedSelf) ? requestedSelf : null) ??
    participants[0]?.name ??
    null;

  const others = participants.filter((p) => p.name !== selfSender);
  const title =
    others.length === 1
      ? others[0].name
      : others.length > 1
        ? `${others.length} participants`
        : selfSender ?? 'WhatsApp Chat';

  const lastMessage = [...messages].reverse().find((message) => !message.isSystem);

  return {
    messages,
    title,
    participants,
    selfSender,
    lastActiveDate: lastMessage?.date ?? null,
  };
};

/** Formats a message count for the participant sheet, e.g. "1.2K messages". */
export const formatMessageCount = (count: number): string => {
  if (count < 1000) return `${count} message${count === 1 ? '' : 's'}`;
  if (count < 1_000_000) return `${(count / 1000).toFixed(count < 10_000 ? 1 : 0)}K messages`;
  return `${(count / 1_000_000).toFixed(1)}M messages`;
};

export { isMediaPlaceholder };
