
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

interface ChatViewProps {
  messages: Message[];
}

const DateSeparator: React.FC<{ date: string }> = ({ date }) => (
    <div className="flex justify-center my-4">
        <span className="bg-gray-800/70 text-xs text-gray-300 rounded-full px-3 py-1 backdrop-blur-sm">
            {date}
        </span>
    </div>
);

const ChatView: React.FC<ChatViewProps> = ({ messages }) => {
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
                        <MessageBubble message={message} />
                    </React.Fragment>
                );
            })}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default ChatView;
