import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { parseCommand } from '../utils/agentEngine';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export const ChatAgent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: 'AI Agent ready. Try: "place 20 houses", "pipe water from start to end", or "clear all".',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const handleSend = async (commandText?: string) => {
    const textToSend = (commandText || input).trim();
    if (!textToSend || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const state = useStore.getState();
      const responseText = await parseCommand(textToSend, state, state);

      const agentMsg: ChatMessage = {
        id: `msg-a-${Date.now()}`,
        sender: 'agent',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'agent',
          text: 'Error processing command. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none font-mono text-black">
      <div className="w-[320px] bg-white border border-black shadow-[3px_3px_0_0_#000]">
        {/* Header */}
        <div className="p-2 border-b border-black flex items-center justify-between bg-[#f8f8f8]">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
            <span className="w-2 h-2 bg-[#00cc66] border border-black" />
            <span>🤖 AUTONOMOUS AGENT</span>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-5 h-5 border border-black bg-white hover:bg-[#e0e0e0] font-bold text-xs flex items-center justify-center cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            title={isMinimized ? 'Expand Agent' : 'Minimize Agent'}
          >
            {isMinimized ? '+' : '–'}
          </button>
        </div>

        {!isMinimized && (
          <>
            {/* Quick Action Suggestion Chips */}
            <div className="p-1.5 border-b border-[#eeeeee] bg-[#fafafa] flex gap-1 overflow-x-auto text-[9px]">
              <button
                onClick={() => handleSend('place 20 houses')}
                className="px-1.5 py-0.5 border border-black bg-white hover:bg-[#fff9e6] uppercase font-bold shrink-0 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
              >
                + 20 Houses
              </button>
              <button
                onClick={() => handleSend('pipe water from start to end')}
                className="px-1.5 py-0.5 border border-black bg-white hover:bg-[#fff9e6] uppercase font-bold shrink-0 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
              >
                + Route Water
              </button>
              <button
                onClick={() => handleSend('clear all')}
                className="px-1.5 py-0.5 border border-black bg-white hover:bg-[#ffebeb] uppercase font-bold shrink-0 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
              >
                Clear
              </button>
            </div>

            {/* Message History Area */}
            <div
              ref={scrollRef}
              className="p-2.5 h-[190px] overflow-y-auto space-y-2 text-xs bg-white"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 text-[9px] text-[#666666] mb-0.5">
                    <span className="font-bold uppercase">
                      {m.sender === 'user' ? 'YOU' : 'AGENT'}
                    </span>
                    <span>·</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <div
                    className={`p-2 border border-black max-w-[85%] whitespace-pre-wrap leading-tight text-[11px] ${
                      m.sender === 'user'
                        ? 'bg-[#1a1e24] text-white shadow-[2px_2px_0_0_#dc0000]'
                        : 'bg-[#f4f4f4] text-black shadow-[2px_2px_0_0_#000]'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="text-[10px] text-[#666666] italic font-bold">
                  🤖 Parsing command...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-2 border-t border-black bg-[#f8f8f8] flex items-center gap-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. place 50 houses..."
                disabled={isProcessing}
                className="flex-1 px-2 py-1 text-xs font-mono border border-black bg-white text-black focus:outline-none placeholder:text-[#999999]"
              />
              <button
                onClick={() => handleSend()}
                disabled={isProcessing || !input.trim()}
                className="px-3 py-1 bg-black hover:bg-[#222222] disabled:bg-[#cccccc] text-white border border-black text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] disabled:shadow-none cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
