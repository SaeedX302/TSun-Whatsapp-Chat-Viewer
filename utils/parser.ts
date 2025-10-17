
import { Message } from '../types';

export const parseChatExport = (rawText: string): { messages: Message[]; title: string } => {
  const messageLineRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}\s?(?:AM|PM)) - ([^:]+): ([\s\S]+)/;
  
  const lines = rawText.trim().split('\n');
  const messages: Message[] = [];
  let currentMessage: Message | null = null;
  const senderCounts: Record<string, number> = {};

  lines.forEach((line) => {
    const match = line.match(messageLineRegex);
    if (match) {
      if (currentMessage) {
        messages.push(currentMessage);
      }
      
      const [, dateTime, sender, content] = match;
      const [date, time] = dateTime.split(', ');

      currentMessage = {
        id: messages.length,
        date: date.trim(),
        time: time.trim(),
        sender: sender.trim(),
        content: content.trim(),
      };
      
      senderCounts[sender.trim()] = (senderCounts[sender.trim()] || 0) + 1;

    } else if (currentMessage) {
      currentMessage.content += '\n' + line;
    }
  });

  if (currentMessage) {
    messages.push(currentMessage);
  }

  const title = Object.keys(senderCounts).length > 0
    ? Object.entries(senderCounts).sort((a, b) => b[1] - a[1])[0][0]
    : 'WhatsApp Chat';
  
  return { messages, title };
};
