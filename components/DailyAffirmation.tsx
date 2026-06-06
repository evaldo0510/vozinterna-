import React, { useState } from 'react';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Quote, Heart, Copy, Check, Leaf } from 'lucide-react';

interface DailyAffirmationProps {
  lang: Language;
  onAddToast?: (toast: { type: string; title: string; description: string }) => void;
}

interface Affirmation {
  id: number;
  pt: string;
  en: string;
  authorPt: string;
  authorEn: string;
}

const PCH_AFFIRMATIONS: Affirmation[] = [
  {
    id: 1,
    pt: "Inspire o presente, exale o que passou. No fluxo suave da respiração, você se encontra inteiro, seguro e em paz.",
    en: "Inhale the present, exhale the past. In the gentle flow of your breath, you find yourself whole, secure and at peace.",
    authorPt: "Métrica do Sopro Resonante",
    authorEn: "Resonant Breath Meter"
  },
  {
    id: 2,
    pt: "Sua mente é um jardim fértil de infinitas sintonias. Cultive nela pensamentos de luz, sabendo que cada broto floresce no seu próprio e perfeito tempo.",
    en: "Your mind is a fertile garden of infinite tuning. Nourish it with thoughts of light, knowing that every seed blossoms in its own perfect time.",
    authorPt: "Eco das Sementes Mentais",
    authorEn: "Echo of Mental Seeds"
  },
  {
    id: 3,
    pt: "A quietude não exige esforço, apenas permissão poética. Permita-se simplesmente pausar e sintonizar os batimentos serenos do seu próprio pulsar primordial.",
    en: "Stillness requires no effort, only poetic permission. Grant yourself the simple grace to pause and tune to the serene heartbeat of your primordial pulse.",
    authorPt: "Círculo Poético do Santuário",
    authorEn: "Sanctuary Poetic Circle"
  },
  {
    id: 4,
    pt: "As sintonias da autocompaixão curam as cicatrizes invisíveis da alma. Fale com seu ser interno com a doçura de quem acolhe um velho e amado amigo.",
    en: "Symphonies of self-compassion heal the soul's invisible scars. Speak to your inner self with the sweetness of welcoming an old, beloved friend.",
    authorPt: "Sinfonia da Voz Interior",
    authorEn: "Inner Voice Symphony"
  },
  {
    id: 5,
    pt: "Cada respiração consciente e profunda é uma âncora sagrada, ligando o fluxo de seus pensamentos ao porto sereno e seguro do presente momento.",
    en: "Each conscious, deep breath is a sacred anchor, connecting the flow of your thoughts to the serene and secure harbor of the present moment.",
    authorPt: "Âncora Síncrona PCH",
    authorEn: "PCH Synchronous Anchor"
  },
  {
    id: 6,
    pt: "Não há pressa alguma na milagrosa jornada do autoconhecimento. O compasso sutil do seu caminhar compassivo é exatamente a frequência de que você precisa.",
    en: "There is no rush in the miraculous journey of self-discovery. The subtle rhythm of your compassionate path is exactly the frequency you need.",
    authorPt: "Guia do Caminho Interior",
    authorEn: "Inner Pathway Guide"
  },
  {
    id: 7,
    pt: "No silêncio majestoso que habita entre suas palavras sussurradas, reside a força compassiva e a sabedoria inabalável de sua verdadeira essência divina.",
    en: "In the majestic silence dwelling between your whispered words lies the compassionate strength and unshakeable wisdom of your true divine essence.",
    authorPt: "O Templo do Silêncio",
    authorEn: "The Temple of Silence"
  },
  {
    id: 8,
    pt: "Acolha as ricas nuances e tonalidades de suas emoções. Como nuvens no infinito firmamento da consciência, elas vêm para ensinar, flutuar e passar.",
    en: "Embrace the rich nuances and shades of your emotions. Like clouds in the infinite sky of consciousness, they come to teach, drift, and pass.",
    authorPt: "Metáforas Sensoriais",
    authorEn: "Sensory Metaphors"
  },
  {
    id: 9,
    pt: "Seu tom de voz interno é o farol que ilumina seus labirintos mais profundos. Escolha sempre palavras macias e carinhosas que confortam, sustentam e elevam.",
    en: "Your inner tone of voice is the lighthouse illuminating your deepest labyrinths. Always choose soft and gentle words that comfort, support, and elevate.",
    authorPt: "Farol das Frequências Doces",
    authorEn: "Lighthouse of Sweet Frequencies"
  },
  {
    id: 10,
    pt: "Você é o mestre compositor de sua própria harmonia existencial. Sintonize a frequência invisível da calma e sinta a ressonância salutar se infundir em seu ser.",
    en: "You are the master composer of your own existential harmony. Tune to the invisible frequency of calm and watch healthy resonance infuse your being.",
    authorPt: "Orquestração Cognitiva PCH",
    authorEn: "PCH Cognitive Orchestration"
  },
  {
    id: 11,
    pt: "O seu subconsciente floresce sob o orvalho sagrado da paciência amorosa. Descanse profundamente na doce certeza de que você já está exatamente onde deveria estar.",
    en: "Your subconscious flourishes under the sacred dew of loving patience. Rest deeply in the sweet certainty that you are already exactly where you belong.",
    authorPt: "Aforismos da Paciência Zen",
    authorEn: "Zen Patience Aphorisms"
  },
  {
    id: 12,
    pt: "Deixe que o ciclo síncrono e amoroso do sopro dissipe suavemente as neblinas flutuantes da mente agitada e instale a pureza cristalina do silêncio interior.",
    en: "Let the synchronous, loving cycle of your breath gently dissolve the floating mists of an active mind and establish the crystalline purity of inner silence.",
    authorPt: "Sopro Purificador PCH",
    authorEn: "PCH Purifying Breath"
  }
];

export const DailyAffirmation: React.FC<DailyAffirmationProps> = ({ lang, onAddToast }) => {
  const [copied, setCopied] = useState(false);
  const [isMeditating, setIsMeditating] = useState(false);

  // Pick a single affirmation consistently for the calendar day
  const getDailyAffirmation = (): Affirmation => {
    const day = new Date().getDate();
    const index = (day * 3) % PCH_AFFIRMATIONS.length; // pseudo-random stable index per day
    return PCH_AFFIRMATIONS[index];
  };

  const dailyQuote = getDailyAffirmation();
  const quoteText = lang === 'pt' ? dailyQuote.pt : dailyQuote.en;
  const quoteAuthor = lang === 'pt' ? dailyQuote.authorPt : dailyQuote.authorEn;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${quoteText}" — ${quoteAuthor}`);
      setCopied(true);
      
      if (onAddToast) {
        onAddToast({
          type: 'success',
          title: lang === 'pt' ? 'Copiado! 📝' : 'Copied! 📝',
          description: lang === 'pt' 
            ? 'Afirmação diária copiada para sua área de transferência.' 
            : 'Daily affirmation copied to clipboard.'
        });
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleMeditateToggle = () => {
    setIsMeditating(!isMeditating);
    if (!isMeditating && onAddToast) {
      onAddToast({
        type: 'success',
        title: lang === 'pt' ? 'Mente Harmonizada! ✨' : 'Mind Harmonized! ✨',
        description: lang === 'pt'
          ? 'Inspire fundo... Deixe que a afirmação divina ecoe nas ondas de sua consciência.'
          : 'Breathe deeply... Quietly let the divine affirmation echo through your consciousness waves.'
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-7 rounded-[2rem] bg-gradient-to-br from-[#ffffff] to-[#faf8f5] border border-stone-200/50 shadow-md space-y-5 flex flex-col relative overflow-hidden group select-none"
      id="daily-affirmation-container"
    >
      {/* Decorative ambient background shape */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#ecf2ed]/30 rounded-full blur-2xl pointer-events-none transition-all duration-700 group-hover:scale-110"></div>
      
      <div className="flex justify-between items-center bg-transparent z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ecf2ed] text-[#3e5f35] rounded-2xl border border-[#dce8de] shadow-sm flex items-center justify-center">
            <Leaf className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono tracking-[0.25em] font-bold text-[#5c7c64] uppercase block">
              {lang === 'pt' ? 'AFIRMAÇÃO GENTIL DO DIA' : 'DAILY GENTLE AFFIRMATION'}
            </span>
            <h3 className="text-base font-serif font-bold text-stone-850 leading-tight">
              {lang === 'pt' ? 'Harmonia e Autoconexão' : 'Harmony & Inner Peace'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-[#5c7c64] rounded-full border border-stone-200/30 transition-all cursor-pointer shadow-sm relative group/btn"
            title={lang === 'pt' ? 'Copiar afirmação' : 'Copy affirmation'}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600 animate-scale-up" />
            ) : (
              <Copy className="w-4 h-4 group-hover/btn:scale-105" />
            )}
          </button>
        </div>
      </div>

      {/* Quote display */}
      <div className="bg-[#fdfcfb] p-5 rounded-2.5xl border border-stone-100 shadow-sm relative min-h-[90px] flex flex-col justify-center transition-colors duration-500 z-10 group-hover:border-[#ecf2ed]">
        <Quote className="w-8 h-8 text-[#5c7c64]/5 absolute -top-1 -left-1 stroke-[3]" />
        
        <p className="text-base md:text-md font-serif italic text-stone-850 leading-relaxed font-normal text-stone-800 pr-2">
          "{quoteText}"
        </p>
        
        <div className="mt-3.5 flex items-center justify-end">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#5c7c64]/80">
            — {quoteAuthor}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-1 z-10">
        <span className="text-[10px] font-mono text-stone-400 font-light select-none">
          {lang === 'pt' 
            ? 'Respire devagar e incorpore o aforismo poético à sua consciência.' 
            : 'Inhale slowly and absorb the poetic message into your active mind.'}
        </span>

        <button
          onClick={handleMeditateToggle}
          className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-sm ${
            isMeditating 
              ? 'bg-[#ecf2ed] text-[#3e5f35] border border-[#dce8de] animate-pulse' 
              : 'bg-[#5c7c64] hover:bg-[#4dd38b]/20 hover:text-[#1d5236] hover:bg-[#4d6954] text-white border border-transparent hover:shadow'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isMeditating ? 'fill-[#3e5f35] animate-pulse text-[#3e5f35]' : ''}`} />
          <span>
            {isMeditating 
              ? (lang === 'pt' ? 'Mente Harmonizada...' : 'Mind Aligned...') 
              : (lang === 'pt' ? 'Absorver Energia' : 'Absorb Message')}
          </span>
        </button>
      </div>
    </motion.div>
  );
};
