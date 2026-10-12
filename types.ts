export interface Message {
  id: number;
  date: string;
  time: string;
  sender: string;
  content: string;
  /** True for WhatsApp system lines ("Messages are end-to-end encrypted"). */
  isSystem?: boolean;
  /** True when the export replaced an attachment with a "<Media omitted>" marker. */
  isMedia?: boolean;
}

export interface Participant {
  name: string;
  messageCount: number;
}

export interface ParsedChat {
  messages: Message[];
  title: string;
  participants: Participant[];
  /** Sender treated as the device owner (rendered on the right, like WhatsApp). */
  selfSender: string | null;
  /** Date string of the most recent message, used for the app-bar subtitle. */
  lastActiveDate: string | null;
}
