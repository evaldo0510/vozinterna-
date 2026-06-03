import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Trophy, Star, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'level' | 'badge' | 'session';
  title: string;
  description: string;
}

interface NotificationToastProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  lang: 'pt' | 'en';
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onRemove, lang }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          // Color and Icon strategy for each type
          let bgColor = 'bg-stone-900/90 border-stone-850';
          let textColor = 'text-stone-100';
          let highlightColor = 'text-teal-400';
          let Icon = Star;

          if (toast.type === 'level') {
            bgColor = 'bg-teal-950/95 border-teal-500/30';
            highlightColor = 'text-teal-300';
            Icon = Award;
          } else if (toast.type === 'badge') {
            bgColor = 'bg-amber-950/95 border-amber-500/30';
            highlightColor = 'text-amber-400';
            Icon = Trophy;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              layout
              className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-3 pointer-events-auto ${bgColor} ${textColor}`}
            >
              {/* Icon Container */}
              <div className={`p-2 rounded-xl bg-stone-950/40 border border-stone-850/40 shrink-0 ${highlightColor}`}>
                <Icon className="w-5 h-5 animate-pulse" />
              </div>

              {/* Message section */}
              <div className="flex-1 space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-wider font-sans">
                  {toast.title}
                </h4>
                <p className="text-[10px] text-stone-400 leading-normal font-sans font-medium">
                  {toast.description}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => onRemove(toast.id)}
                className="text-stone-500 hover:text-stone-300 transition-colors p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
