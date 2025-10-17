import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  searchQuery: string;
}

const renderFormattedText = (text: string, searchQuery: string): React.ReactNode => {
    const regex = /(\[c\]|\[[0-9a-fA-F]{6}\])|(\*.*?\*)|(_.*?_)|(~.*?~)|(```.*?```)|(https?:\/\/[^\s]+)/g;

    const parts = text.split(regex).filter(Boolean);
    const elements: React.ReactNode[] = [];
    let key = 0;
    let currentColor = 'inherit';

    const highlight = (content: string) => {
        if (!searchQuery || !content.toLowerCase().includes(searchQuery.toLowerCase())) {
            return content;
        }
        const subParts = content.split(new RegExp(`(${searchQuery})`, 'gi'));
        return subParts.map((subPart, i) =>
            subPart.toLowerCase() === searchQuery.toLowerCase() ?
            <mark key={i} className="bg-yellow-400 text-black rounded px-1 py-0.5 mx-0">{subPart}</mark> :
            subPart
        );
    };

    parts.forEach(part => {
        key++;
        if (part.match(/^\[([0-9a-fA-F]{6})\]$/)) {
            currentColor = `#${part.slice(1, -1)}`;
        } else if (part === '[c]') {
            currentColor = 'inherit';
        } else if (part.startsWith('*') && part.endsWith('*')) {
            elements.push(<strong key={key} style={{ color: currentColor }}>{renderFormattedText(part.slice(1, -1), searchQuery)}</strong>);
        } else if (part.startsWith('_') && part.endsWith('_')) {
            elements.push(<em key={key} style={{ color: currentColor }}>{renderFormattedText(part.slice(1, -1), searchQuery)}</em>);
        } else if (part.startsWith('~') && part.endsWith('~')) {
            elements.push(<del key={key} style={{ color: currentColor }}>{renderFormattedText(part.slice(1, -1), searchQuery)}</del>);
        } else if (part.startsWith('```') && part.endsWith('```')) {
            elements.push(<code key={key} className="font-mono bg-black/10 dark:bg-white/10 px-2 py-1 rounded text-sm whitespace-pre-wrap" style={{ color: currentColor }}>{highlight(part.slice(3, -3))}</code>);
        } else if (part.match(/^https?:\/\//)) {
            elements.push(<a href={part} key={key} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline break-all">{highlight(part)}</a>);
        } else {
            elements.push(<span key={key} style={{ color: currentColor }}>{highlight(part)}</span>);
        }
    });

    return <>{elements}</>;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, searchQuery }) => {
  const isMe = false; // This is a placeholder; in a real app, you'd determine this dynamically

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-end max-w-lg lg:max-w-xl">
        <div
          className={`relative px-4 py-3 rounded-2xl transition-all duration-300 hover:shadow-lg ${
            isMe
              ? 'bg-gradient-to-tr from-sky-500 to-cyan-400 text-white rounded-br-none'
              : 'bg-white/80 text-slate-800 dark:bg-gradient-to-br from-gray-700 to-gray-800 dark:text-white rounded-bl-none'
          }`}
        >
          <div className="whitespace-pre-wrap break-words leading-relaxed">
            {renderFormattedText(message.content, searchQuery)}
          </div>
          <div className={`text-right text-xs mt-2 ${isMe ? 'text-sky-100/90' : 'text-gray-500 dark:text-gray-400'}`}>
            {message.time}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;