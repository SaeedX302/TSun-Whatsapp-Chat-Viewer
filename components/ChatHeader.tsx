
import React from 'react';

interface ChatHeaderProps {
  title: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title }) => {
  return (
    <header className="flex-shrink-0 flex items-center justify-between p-4 bg-black/20 backdrop-blur-md border-b border-white/10 z-10">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img src="https://picsum.photos/seed/chat/40/40" alt="Avatar" className="w-10 h-10 rounded-full" />
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 border-2 border-gray-800"></span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">{title}</h1>
          <p className="text-sm text-green-400">Online</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors duration-300">
           <img src="https://img.icons8.com/plasticine/100/phone.png" alt="phone" width="28" height="28"/>
        </button>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors duration-300">
          <img src="https://img.icons8.com/plasticine/100/video-call.png" alt="video-call" width="28" height="28"/>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
