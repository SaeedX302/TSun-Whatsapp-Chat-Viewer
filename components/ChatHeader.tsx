import React from 'react';

interface ChatHeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onChangeChat: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, searchQuery, onSearchChange, theme, onThemeToggle, onChangeChat }) => {
  return (
    <header className="flex-shrink-0 flex items-center justify-between p-4 bg-white/60 dark:bg-black/20 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10 z-10">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img src="https://i.pravatar.cc/40?u=chat-avatar" alt="Avatar" className="w-10 h-10 rounded-full" />
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 border-2 border-white dark:border-gray-800"></span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="text-sm text-green-600 dark:text-green-400">Online</p>
        </div>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2">
        <div className="relative hidden sm:block">
           <img src="https://img.icons8.com/plasticine/100/search.png" alt="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50"/>
           <input 
             type="text" 
             placeholder="Search..."
             value={searchQuery}
             onChange={(e) => onSearchChange(e.target.value)}
             className="w-32 lg:w-48 bg-black/5 dark:bg-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
           />
        </div>
        <button onClick={onChangeChat} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-300" title="Change Chat">
          <img src="https://img.icons8.com/plasticine/100/synchronize.png" alt="Change Chat" width="28" height="28"/>
        </button>
        <button onClick={onThemeToggle} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-300" title="Toggle Theme">
          {theme === 'dark' ? 
            <img src="https://img.icons8.com/plasticine/100/sun--v2.png" alt="Light Mode" width="28" height="28"/> :
            <img src="https://img.icons8.com/plasticine/100/crescent-moon.png" alt="Dark Mode" width="28" height="28"/>
          }
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;