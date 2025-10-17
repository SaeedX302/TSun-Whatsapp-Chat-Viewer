import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

interface ChatViewProps {
  messages: Message[];
  searchQuery: string;
}

const DateSeparator: React.FC<{ date: string }> = ({ date }) => (
    <div className="flex justify-center my-4">
        <span className="bg-white/60 dark:bg-gray-800/70 text-xs text-gray-600 dark:text-gray-300 rounded-full px-3 py-1 backdrop-blur-sm">
            {date}
        </span>
    </div>
);

const ChatView: React.FC<ChatViewProps> = ({ messages, searchQuery }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    let lastDate: string | null = null;

    return (
        <div className="p-4 sm:p-6 space-y-1">
            {messages.map((message) => {
                const showDateSeparator = message.date !== lastDate;
                lastDate = message.date;
                return (
                    <React.Fragment key={message.id}>
                        {showDateSeparator && <DateSeparator date={message.date} />}
                        <MessageBubble message={message} searchQuery={searchQuery} />
                    </React.Fragment>
                );
            })}
             {messages.length === 0 && searchQuery && (
                <div className="text-center py-10 text-gray-500">
                    No messages found for "{searchQuery}"
                </div>
            )}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default ChatView;