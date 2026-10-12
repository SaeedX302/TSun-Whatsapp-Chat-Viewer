import { describe, expect, it } from 'vitest';
import { formatMessageCount, isMediaPlaceholder, parseChatExport } from './parser';

const ANDROID_24H = `12/03/2024, 09:12 - Messages and calls are end-to-end encrypted.
12/03/2024, 09:13 - Aarav: Morning *team*
12/03/2024, 09:14 - Priya: hello
second line
12/03/2024, 09:15 - Priya: <Media omitted>`;

describe('parseChatExport', () => {
  it('parses the classic Android export format', () => {
    const { messages } = parseChatExport(ANDROID_24H);
    expect(messages).toHaveLength(4);
    expect(messages[1]).toMatchObject({ date: '12/03/2024', time: '09:13', sender: 'Aarav' });
  });

  it('keeps multi-line messages in a single entry', () => {
    const { messages } = parseChatExport(ANDROID_24H);
    expect(messages[2].content).toBe('hello\nsecond line');
  });

  it('flags system notices and media placeholders', () => {
    const { messages } = parseChatExport(ANDROID_24H);
    expect(messages[0].isSystem).toBe(true);
    expect(messages[3].isMedia).toBe(true);
  });

  it('supports 12-hour, bracketed and unicode-dash timestamps', () => {
    const text = [
      '3/12/24, 2:05 pm - Aarav: twelve hour',
      '[12.03.2024, 14:05:32] Priya: bracketed',
      '12-03-2024, 14:06 \u2013 Aarav: unicode dash',
    ].join('\n');
    const { messages } = parseChatExport(text);
    expect(messages.map((m) => m.content)).toEqual(['twelve hour', 'bracketed', 'unicode dash']);
    expect(messages[0].time).toBe('2:05 pm');
    expect(messages[1].time).toBe('14:05:32');
  });

  it('derives participants, identity and a 1:1 title', () => {
    const parsed = parseChatExport(ANDROID_24H);
    expect(parsed.participants.map((p) => p.name)).toEqual(['Priya', 'Aarav']);
    // Most active participant is assumed to be the device owner.
    expect(parsed.selfSender).toBe('Priya');
    expect(parsed.title).toBe('Aarav');
  });

  it('honours an explicit identity override and recomputes the title', () => {
    const parsed = parseChatExport(ANDROID_24H, { selfSender: 'Aarav' });
    expect(parsed.selfSender).toBe('Aarav');
    expect(parsed.title).toBe('Priya');
  });

  it('falls back gracefully when the export is empty or malformed', () => {
    expect(parseChatExport('').messages).toEqual([]);
    expect(parseChatExport('not a chat at all').messages).toEqual([]);
    expect(parseChatExport('').title).toBe('WhatsApp Chat');
  });

  it('labels group chats by participant count', () => {
    const group = [
      '12/03/2024, 09:00 - Aarav: hi',
      '12/03/2024, 09:01 - Priya: hello',
      '12/03/2024, 09:02 - Sam: yo',
    ].join('\n');
    expect(parseChatExport(group).title).toBe('2 participants');
  });
});

describe('helpers', () => {
  it('recognises media placeholders', () => {
    expect(isMediaPlaceholder('<Media omitted>')).toBe(true);
    expect(isMediaPlaceholder('IMAGE OMITTED')).toBe(true);
    expect(isMediaPlaceholder('hello')).toBe(false);
  });

  it('formats message counts', () => {
    expect(formatMessageCount(1)).toBe('1 message');
    expect(formatMessageCount(42)).toBe('42 messages');
    expect(formatMessageCount(1500)).toBe('1.5K messages');
    expect(formatMessageCount(25000)).toBe('25K messages');
    expect(formatMessageCount(2_400_000)).toBe('2.4M messages');
  });
});
