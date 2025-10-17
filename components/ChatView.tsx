import React, { useEffect, useRef, useState } from 'react';
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
    const startOfMessagesRef = useRef<HTMLDivElement>(null);
    const [showScrollButtons, setShowScrollButtons] = useState(false);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const container = document.getElementById('chat-container');
        const handleScroll = () => {
            if (container) {
                setShowScrollButtons(container.scrollHeight > container.clientHeight);
            }
        };

        handleScroll();
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [messages]);

    const scrollToTop = () => {
        startOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    let lastDate: string | null = null;

    return (
        <>
            <div className="p-3 sm:p-4 space-y-1">
                <div ref={startOfMessagesRef} />
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

            {showScrollButtons && messages.length > 0 && (
                <div className="absolute bottom-4 right-4 sm:right-6 flex flex-col gap-2 z-20">
                    <button
                        onClick={scrollToTop}
                        className="bg-white dark:bg-white/10 dark:backdrop-blur-lg text-slate-800 dark:text-white p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-white/20"
                        title="Go to First Message"
                    >
                        <img src="https://img.icons8.com/plasticine/100/up--v1.png" alt="Top" className="w-5 h-5" />
                    </button>
                    <button
                        onClick={scrollToBottom}
                        className="bg-white dark:bg-white/10 dark:backdrop-blur-lg text-slate-800 dark:text-white p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-white/20"
                        title="Go to Last Message"
                    >
                        <img src="https://img.icons8.com/plasticine/100/down--v1.png" alt="Bottom" className="w-5 h-5" />
                    </button>
                </div>
            )}
        </>
    );
};

export default ChatView;