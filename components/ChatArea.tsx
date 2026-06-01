
import React from 'react';
import { Message, MessageRole } from '../types.ts';
import { Sparkles, Star, AlertCircle } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  isGeneratingImage: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  fontSize: number;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isTyping, isGeneratingImage, scrollRef, fontSize }) => {
  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 pb-24 space-y-6 scroll-smooth scrollbar-hide pt-32"
      style={{ scrollbarWidth: 'none' }}
    >
      {messages.map((msg, idx) => (
        <div 
          key={msg.id} 
          className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-700`}
        >
          <div 
            className={`max-w-[85%] p-5 rounded-[2.2rem] font-light leading-relaxed shadow-xl ${
              msg.role === MessageRole.USER 
                ? 'bg-white/10 text-white rounded-tr-sm border border-white/10' 
                : msg.isError 
                  ? 'bg-rose-500/10 text-rose-200 border border-rose-500/20 italic rounded-tl-sm'
                  : 'bg-black/20 text-white/90 rounded-tl-sm border border-white/5 backdrop-blur-md'
            }`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {msg.isError && <AlertCircle className="w-4 h-4 mb-2 opacity-50" />}
            {msg.content}
          </div>
          {msg.imageUrl && (
            <div className="mt-4 max-w-[90%] rounded-[2.8rem] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in duration-1000 group relative">
              <img 
                src={msg.imageUrl} 
                alt="Visão Interior" 
                className="w-full h-auto object-cover transform transition-transform duration-[3000ms] group-hover:scale-110" 
              />
              <div className="absolute bottom-0 inset-x-0 p-4 bg-black/40 backdrop-blur-sm border-t border-white/10">
                <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Visão Materializada
                </span>
              </div>
            </div>
          )}
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start animate-in fade-in slide-in-from-left-2">
          <div className="bg-black/20 px-5 py-4 rounded-3xl rounded-tl-sm border border-white/5 flex space-x-1.5 items-center">
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {isGeneratingImage && (
        <div className="flex justify-start animate-in zoom-in-95">
          <div className="bg-indigo-500/10 px-5 py-4 rounded-3xl rounded-tl-sm border border-indigo-500/20 flex space-x-3 items-center backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold">Materializando visão...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
