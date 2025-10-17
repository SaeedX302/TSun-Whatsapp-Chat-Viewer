
import React, { useState, useEffect } from 'react';
import { Message } from './types';
import { parseChatExport } from './utils/parser';
import ChatHeader from './components/ChatHeader';
import ChatView from './components/ChatView';
import Footer from './components/Footer';

const CHAT_DATA_URL = 'https://gist.githubusercontent.com/SaeedX302/14ce71f3aa3b7fb2eba2d4206cc4862c/raw/d614b4d64ff15cbe7b7aa8572e9561b01f9d3bc4/gistfile1.txt';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTitle, setChatTitle] = useState<string>('Loading Chat...');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndParseChat = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(CHAT_DATA_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawText = await response.text();
        const { messages: parsedMessages, title } = parseChatExport(rawText);
        setMessages(parsedMessages);
        setChatTitle(title);
      } catch (e) {
        if (e instanceof Error) {
            setError(`Failed to load chat data: ${e.message}`);
        } else {
            setError('An unknown error occurred.');
        }
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAndParseChat();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white flex flex-col items-center justify-center p-2 sm:p-4 font-sans">
      <div className="w-full max-w-4xl h-[95vh] flex flex-col bg-black/30 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-cyan-500/10 border border-white/10 overflow-hidden">
        <ChatHeader title={chatTitle} />
        <main className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full text-red-400 p-4">
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && <ChatView messages={messages} />}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;
