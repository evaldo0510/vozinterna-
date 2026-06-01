
import React, { useState } from 'react';
import { Mic, MicOff, Send, Plus } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.ts';

interface InputAreaProps {
  onSend: (text: string) => void;
  isListening: boolean;
  onToggleListening: (val: boolean) => void;
  onToggleAccessibility: () => void;
  showAccessibility: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isListening, onToggleListening, onToggleAccessibility, showAccessibility }) => {
  const [text, setText] = useState('');

  const { startListening, stopListening } = useSpeechRecognition((transcript) => {
    onSend(transcript);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
      onToggleListening(false);
    } else {
      startListening();
      onToggleListening(true);
    }
  };

  return (
    <div className="p-3 bg-black/40 border-t border-white/5 flex flex-col z-30 relative backdrop-blur-md">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <button 
          type="button" 
          onClick={onToggleAccessibility}
          className={`p-3.5 rounded-full transition-colors flex-shrink-0 ${showAccessibility ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-white/50'}`}
          title="Comunicação Alternativa"
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl flex items-center overflow-hidden transition-all focus-within:ring-1 focus-within:ring-white/30 focus-within:bg-white/10">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isListening ? "A escutar..." : "Escreva ou fale..."}
            className="w-full bg-transparent px-4 py-3.5 text-[15px] text-white placeholder-white/30 focus:outline-none"
          />
          <button 
            type="button" 
            onClick={handleToggleMic}
            className={`p-3 transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-white/40 hover:text-white/80'}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        <button 
          type="submit" 
          disabled={!text.trim()}
          className="p-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-30 disabled:bg-white/10 flex-shrink-0 shadow-lg"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default InputArea;
