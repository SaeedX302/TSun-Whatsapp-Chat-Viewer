import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Message } from './types';
import { parseChatExport } from './utils/parser';
import ChatHeader from './components/ChatHeader';
import ChatView from './components/ChatView';
import Footer from './components/Footer';

// --- Gist URL Modal Component ---
const GistUrlModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [url, setUrl] = useState('https://gist.githubusercontent.com/SaeedX302/14ce71f3aa3b7fb2eba2d4206cc4862c/raw/d614b4d64ff15cbe7b7aa8572e9561b01f9d3bc4/gistfile1.txt');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 w-11/12 max-w-md animate-fade-in-scale" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Load WhatsApp Chat</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Paste the raw URL of your exported WhatsApp chat from a service like GitHub Gist.</p>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://gist.githubusercontent.com/..."
            className="w-full bg-black/5 dark:bg-gray-900/50 border border-gray-300 dark:border-white/20 rounded-lg px-4 py-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-colors"
          />
          <button type="submit" className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 shadow-lg">
            View Chat
          </button>
        </form>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedPrefs = window.localStorage.getItem('theme');
        if (storedPrefs === 'light' || storedPrefs === 'dark') return storedPrefs;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTitle, setChatTitle] = useState<string>('TSun Chat');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [chatUrl, setChatUrl] = useState<string | null>(() => localStorage.getItem('chatUrl'));
  const [isModalOpen, setIsModalOpen] = useState<boolean>(!chatUrl);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    if (!chatUrl) return;

    const fetchAndParseChat = async () => {
      try {
        setLoading(true);
        setError(null);
        setMessages([]);
        const response = await fetch(chatUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawText = await response.text();
        const { messages: parsedMessages, title } = parseChatExport(rawText);
        setMessages(parsedMessages);
        setChatTitle(title);
        localStorage.setItem('chatUrl', chatUrl);
      } catch (e) {
        if (e instanceof Error) {
            setError(`Failed to load chat data: ${e.message}. Please check the URL and try again.`);
        } else {
            setError('An unknown error occurred.');
        }
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAndParseChat();
  }, [chatUrl]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    return messages.filter(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [messages, searchQuery]);

  const handleThemeToggle = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const handleUrlSubmit = (url: string) => {
    setChatUrl(url);
    setIsModalOpen(false);
  };

  return (
    <div className={theme}>
      <GistUrlModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleUrlSubmit} />
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:bg-gradient-to-br from-gray-900 via-slate-900 to-black text-slate-800 dark:text-white flex flex-col items-center justify-start pt-4 sm:pt-6 p-2 sm:p-4 font-sans">
        <div className="w-full max-w-4xl h-[85vh] flex flex-col bg-white dark:bg-white/5 dark:backdrop-blur-2xl rounded-3xl shadow-2xl dark:shadow-cyan-500/10 border border-gray-200 dark:border-white/10 overflow-hidden">
          <ChatHeader 
            title={chatTitle}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            theme={theme}
            onThemeToggle={handleThemeToggle}
            onChangeChat={() => setIsModalOpen(true)}
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative" id="chat-container">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-full text-red-500 dark:text-red-400 p-4 text-center">
                <p>{error}</p>
              </div>
            )}
            {!loading && !error && chatUrl && <ChatView messages={filteredMessages} searchQuery={searchQuery} />}
            {!chatUrl && !loading && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <h2 className="text-2xl font-bold mb-2">Welcome to TSun Chat Viewer</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Please load a chat to begin.</p>
                    <button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Load Chat From URL
                    </button>
                </div>
            )}
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default App;