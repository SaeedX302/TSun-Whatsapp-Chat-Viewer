
import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

// This parser function is self-contained within the component that uses it.
const renderFormattedText = (text: string): React.ReactNode => {
    const regex = /(\[c\]|\[[0-9a-fA-F]{6}\])|(\*.*?\*)|(_.*?_)|(~.*?~)|(```.*?```)|(https?:\/\/[^\s]+)/g;

    const parts = text.split(regex).filter(Boolean);
    const elements: React.ReactNode[] = [];
    let key = 0;
    let currentColor = 'inherit';

    parts.forEach(part => {
        key++;
        if (part.match(/^\[([0-9a-fA-F]{6})\]$/)) {
            currentColor = `#${part.slice(1, -1)}`;
        } else if (part === '[c]') {
            currentColor = 'inherit';
        } else if (part.startsWith('*') && part.endsWith('*')) {
            elements.push(<strong key={key} style={{ color: currentColor }}>{renderFormattedText(part.slice(1, -1))}</strong>);
        } else if (part.startsWith('_') && part.endsWith('_')) {
            elements.push(<em key={key} style={{ color: currentColor }}>{renderFormattedText(part.slice(1, -1))}</em>);
        } else if (part.startsWith('~') && part.endsWith('~')) {
            elements.push(<del key={key} style={{ color: currentColor }}>{renderFormattedText(part.slice(1, -1))}</del>);
        } else if (part.startsWith('```') && part.endsWith('```')) {
            elements.push(<code key={key} className="font-mono bg-white/10 px-2 py-1 rounded text-sm whitespace-pre-wrap" style={{ color: currentColor }}>{part.slice(3, -3)}</code>);
        } else if (part.match(/^https?:\/\//)) {
            elements.push(<a href={part} key={key} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">{part}</a>);
        } else {
            elements.push(<span key={key} style={{ color: currentColor }}>{part}</span>);
        }
    });

    return <>{elements}</>;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isMe = false; // For this specific chat, there's only one sender. We can style it as "other".

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-end max-w-lg lg:max-w-xl">
        <div
          className={`relative px-4 py-3 rounded-2xl transition-all duration-300 hover:shadow-lg ${
            isMe
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 rounded-br-none'
              : 'bg-gradient-to-br from-gray-700 to-gray-800 rounded-bl-none'
          }`}
        >
          <div className="whitespace-pre-wrap break-words text-white leading-relaxed">
            {renderFormattedText(message.content)}
          </div>
          <div className="text-right text-xs text-gray-400 mt-2">
            {message.time}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
