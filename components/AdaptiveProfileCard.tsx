import React from "react";

interface AdaptiveProfileCardProps {
  neuroMode: string;
  lang: 'pt' | 'en';
  currentUser: any;
  autismTab: string;
  setAutismTab: (v: 'talk' | 'breath' | 'register' | 'rest') => void;
  childFeeling: string;
  setChildFeeling: (v: string) => void;
  burnoutEnergy: number;
  setBurnoutEnergy: (v: number) => void;
  griefRemembrance: boolean;
  setGriefRemembrance: (v: boolean) => void;
}

export const AdaptiveProfileCard: React.FC<AdaptiveProfileCardProps> = ({
  neuroMode,
  lang,
  currentUser,
  autismTab,
  setAutismTab,
  childFeeling,
  setChildFeeling,
  burnoutEnergy,
  setBurnoutEnergy,
  griefRemembrance,
  setGriefRemembrance,
}) => {
  return (
    <div className="w-full max-w-xl transition-all duration-1000 mt-4 mb-2">
      {/* 1. NATURAL / STANDARD PROFILE */}
      {neuroMode === 'natural' && (
        <div className="w-full p-4 bg-stone-900/30 border border-stone-850/60 rounded-2xl flex flex-col items-center">
          <div className="w-full flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-[#14b8a6] mb-1">
            <span>{lang === 'pt' ? 'Índice de Sintonia Interior (ISI)' : 'Inner Resonance Tuning Index (ISI)'}</span>
            <span className="font-bold text-[#14b8a6]">{(currentUser?.resonanceScore || 75) + 5}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden mb-3 border border-stone-900">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(30, (currentUser?.resonanceScore || 75) + 5))}%` }}
            />
          </div>
          <div className="flex items-center space-x-2 text-[9px] font-mono text-stone-400 self-start">
            <span>{lang === 'pt' ? 'Metáfora Da Sincronia:' : 'Resonance Metaphor:'}</span>
            <span className="text-stone-300 font-bold">
              {((currentUser?.resonanceScore || 75) + 3) <= 20 ? (lang === 'pt' ? '🌱 Semente' : '🌱 Seed') :
               ((currentUser?.resonanceScore || 75) + 3) <= 45 ? (lang === 'pt' ? '🌿 Broto' : '🌿 Sprout') :
               ((currentUser?.resonanceScore || 75) + 3) <= 70 ? (lang === 'pt' ? '🌳 Árvore' : '🌳 Tree') :
               ((currentUser?.resonanceScore || 75) + 3) <= 90 ? (lang === 'pt' ? '✨ Florescimento' : '✨ Flourescent') : (lang === 'pt' ? '🌌 Constelação Interior' : '🌌 Inner Constellation')}
            </span>
          </div>
        </div>
      )}

      {/* 2. ADHD / TDAH - MINIMALIST SINGLE FOCUS MISSION */}
      {neuroMode === 'adhd' && (
        <div className="w-full p-4 bg-stone-900/40 border border-stone-850 rounded-2xl text-left font-sans shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h5 className="text-[10px] text-amber-400 font-black tracking-widest uppercase flex items-center gap-1">⚡ {lang === 'pt' ? 'Missão Única do Dia' : "Today's Single Focus"}</h5>
              <p className="text-[9px] text-stone-400 mt-0.5">{lang === 'pt' ? 'Mente ágil, voo suave.' : 'Swift mind, smooth landing.'}</p>
            </div>
            <div className="flex items-center space-x-1 text-[9px] font-mono text-amber-400 bg-amber-955/20 px-2 py-0.5 rounded border border-amber-900/10">
              <span>{lang === 'pt' ? 'Sementes de Foco:' : 'Focus Seeds:'}</span>
              <span className="font-bold">✦ ✦ ✦ ✧ ✧ (+3)</span>
            </div>
          </div>
          <div className="my-2 p-3.5 bg-stone-955/80 border border-stone-850/80 rounded-xl">
            <span className="text-[7.5px] font-mono font-bold tracking-widest text-amber-500 uppercase block mb-1">★ {lang === 'pt' ? 'FOCO PRINCIPAL' : 'PRIMARY FOCUS'}</span>
            <p className="text-[11.5px] text-stone-100 italic leading-relaxed">
              {lang === 'pt' 
                ? '“Conclua apenas um foco consciente hoje. Deixe o ruído externo passar. Siga o balanço.”' 
                : '“Complete exactly one mindful action today. Let external clutter drift away. Flow with ease.”'}
            </p>
          </div>
          <div className="flex justify-between items-center text-[8px] font-mono text-stone-500 pt-1">
            <span>{lang === 'pt' ? '⚠️ Sem menus excessivos ou poluição mental' : '⚠️ No clutter or excessive steps'}</span>
            <span>{lang === 'pt' ? '1 Atividade por Vez' : '1 Activity at a Time'}</span>
          </div>
        </div>
      )}

      {/* 3. AUTISM / AUTISMO - PREDICTABLE INTERACTION CARD */}
      {neuroMode === 'autism' && (
        <div className="w-full p-4 bg-[#0a1122]/40 border border-blue-900/35 rounded-2xl font-mono text-left shadow-lg">
          <div className="flex justify-between items-center mb-3 border-b border-blue-955/50 pb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">🧩</span>
              <h5 className="text-[10px] text-blue-400 font-black tracking-widest uppercase">{lang === 'pt' ? 'Estabilidade e Rotina' : 'Stability and Routine'}</h5>
            </div>
            <span className="text-[8.5px] font-mono font-bold text-blue-400 bg-blue-955/40 px-2 py-0.5 rounded border border-blue-900/30">
              {lang === 'pt' ? 'Constelação: ⭐️ ⭐️ ⭐️ ⭐️ ✧' : 'Constellation: ⭐️ ⭐️ ⭐️ ⭐️ ✧'}
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {(['talk', 'breath', 'register', 'rest'] as const).map(tab => {
              const isSelected = autismTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setAutismTab(tab)}
                  className="py-2 px-0.5 rounded-xl text-[9px] font-bold tracking-wider transition-all pointer-events-auto cursor-pointer text-center bg-stone-900/50 border border-stone-800 text-stone-400 hover:text-stone-200"
                  style={{
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.25)' : '',
                    borderColor: isSelected ? 'rgba(96, 165, 250, 0.5)' : '',
                    color: isSelected ? '#dbeafe' : ''
                  }}
                >
                  {tab === 'talk' && (lang === 'pt' ? '🗣️ Conversar' : '🗣️ Talk')}
                  {tab === 'breath' && (lang === 'pt' ? '🌬️ Respirar' : '🌬️ Breathe')}
                  {tab === 'register' && (lang === 'pt' ? '📝 Diário' : '📝 Journal')}
                  {tab === 'rest' && (lang === 'pt' ? '😴 Pausa' : '😴 Pause')}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-stone-955/70 border border-blue-955/40 rounded-xl">
            <span className="text-[8px] font-mono font-semibold text-blue-500 uppercase tracking-widest block mb-1">
              {lang === 'pt' ? 'Instrução do Guardião' : 'Guardian Instructions'}
            </span>
            <p className="text-[10px] text-stone-300 leading-relaxed">
              {autismTab === 'talk' && (lang === 'pt' ? 'Fale ou digite no seu próprio ritmo. Sem pressões, sem surpresas de contexto.' : 'Speak or type at your own pace. Clean structure, no context jumps.')}
              {autismTab === 'breath' && (lang === 'pt' ? 'Acompanhe o respirador circular verde mais abaixo para se acalmar.' : 'Follow the green circular breathing coach below to align energy.')}
              {autismTab === 'register' && (lang === 'pt' ? 'Seus pensamentos estão salvos no Diário Interior de forma linear.' : 'Your inner thoughts are saved inside your Private Journal space.')}
              {autismTab === 'rest' && (lang === 'pt' ? 'Sessão estruturada segura concluída. Sinta a constelação amigável.' : 'Structured alignment completed. Rest key metrics inside.')}
            </p>
          </div>
        </div>
      )}

      {/* 4. ANXIETY / ANSIEDADE - EXPLICIT WELCOME SANCTUARY */}
      {neuroMode === 'anxiety' && (
        <div className="w-full p-4 bg-[#021d15]/50 border border-emerald-900/30 rounded-2xl text-left font-sans shadow-lg">
          <div className="flex items-center space-x-2 text-emerald-400 mb-2">
            <span className="text-sm">🗼</span>
            <h5 className="text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase">{lang === 'pt' ? 'Faroleiro da Calmaria' : 'Beacon of Calm'}</h5>
          </div>
          
          <div className="p-3.5 bg-emerald-955/30 border border-emerald-900/35 rounded-xl text-center shadow-inner mb-2">
            <p className="text-xs font-serif font-bold text-emerald-250 animate-pulse leading-relaxed">
              {lang === 'pt' ? '“Você está seguro, protegido e totalmente amparado neste exato momento.”' : '“You are completely safe, protected, and fully grounded at this very moment.”'}
            </p>
          </div>

          <div className="flex justify-between items-center text-[8.5px] font-mono text-emerald-500/80">
            <span>{lang === 'pt' ? '📍 Porto Seguro: Alinhado' : '📍 Safe Harbor: Aligned'}</span>
            <span>{lang === 'pt' ? 'Nível de Estresse: Reduzindo' : 'Stress Level: Reducing'}</span>
          </div>
        </div>
      )}

      {/* 5. SENIORS / IDOSO - LARGE TYPOGRAPHY CLICKS */}
      {neuroMode === 'senior' && (
        <div className="w-full p-5 bg-[#141414] border border-stone-800 rounded-2xl text-left space-y-3 font-serif shadow-lg">
          <div className="flex justify-between items-center border-b border-stone-855 pb-2 font-sans">
            <span className="text-xs font-sans font-bold text-stone-100 flex items-center gap-1.5">👵 {lang === 'pt' ? 'Guardião das Memórias' : 'Memory Keeper'}</span>
            <span className="text-[9px] font-mono text-stone-400">{lang === 'pt' ? 'Livro de Memórias' : 'History Log'}</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed font-serif">
            {lang === 'pt' 
              ? 'Querido guardião, suas recordações de hoje são pedras de ouro no seu legado de sabedoria. O que mais te trouxe alegria ou gratidão nas últimas horas?' 
              : 'Dear keeper, your memories are golden steps on your path of wisdom. What brought you peace or gentle joy in the past hours?'}
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1">
            <button 
              onClick={() => {
                  const diaryTab = document.getElementById('diary-tab-trigger');
                  if (diaryTab) diaryTab.click();
              }}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-850 border border-stone-800 rounded-xl text-xs text-stone-200 text-center transition-colors shadow cursor-pointer pointer-events-auto"
            >
               {lang === 'pt' ? '✍️ Registrar Minha História' : '✍️ Write My Story'}
            </button>
            <button 
              onClick={() => {
                  const diaryTab = document.getElementById('diary-tab-trigger');
                  if (diaryTab) diaryTab.click();
              }}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-855 border border-stone-800 rounded-xl text-xs text-stone-200 text-center transition-colors shadow cursor-pointer pointer-events-auto"
            >
               {lang === 'pt' ? '🕊️ Compartilhar Gratidão' : '🕊️ Share Thankfulness'}
            </button>
          </div>
        </div>
      )}

      {/* 6. KIDS / INFANTIL - PASSARINHO FUN INTERACTIVE CHANGER */}
      {neuroMode === 'child' && (
        <div className="w-full p-4 bg-indigo-955/20 border border-indigo-900/35 rounded-2xl text-center space-y-3 font-sans shadow-lg">
          <div className="flex justify-center items-center space-x-2">
            <span className="text-lg">🐥</span>
            <h5 className="text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase">{lang === 'pt' ? 'Passarinho PCH' : 'Little Bird PCH'}</h5>
          </div>
          <p className="text-[11px] text-indigo-200 font-medium font-sans">
            {lang === 'pt' ? 'Como você se sente hoje, amiguinho?' : 'How do you feel today, little friend?'}
          </p>
          
          <div className="flex items-center justify-center space-x-1.5 flex-wrap gap-1">
            {[
              { e: '🐥', l: 'Feliz', h: 'Happy' },
              { e: '🧸', l: 'Cansado', h: 'Tired' },
              { e: '☁️', l: 'Sensível', h: 'Calm' },
              { e: '🌈', l: 'Mágico', h: 'Magic' }
            ].map((emo) => (
              <button
                key={emo.e}
                onClick={() => setChildFeeling(emo.e)}
                className="p-2 py-1 rounded-xl border text-base transition-all active:scale-95 flex flex-col items-center cursor-pointer pointer-events-auto"
                style={{
                  backgroundColor: childFeeling === emo.e ? 'rgba(99, 102, 241, 0.25)' : 'rgba(28, 25, 23, 0.5)',
                  borderColor: childFeeling === emo.e ? 'rgba(129, 140, 248, 0.4)' : 'rgba(44, 40, 36, 0.8)'
                }}
              >
                <span className="text-base">{emo.e}</span>
                <span className="text-[7.5px] mt-0.5 text-stone-400 font-mono">{lang === 'pt' ? emo.l : emo.h}</span>
              </button>
            ))}
          </div>

          {childFeeling && (
            <div className="p-3 bg-stone-955/70 border border-indigo-955 rounded-xl text-left text-[10px] text-stone-350 font-sans leading-relaxed">
              <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest block mb-0.5">{lang === 'pt' ? 'Voz do Amigo Passarinho' : 'Message from Bird Companion'}</span>
              {lang === 'pt' 
                ? `O Passarinho PCH pousou pertinho de você porque viu que seu coração está ${childFeeling === '🐥' ? 'Feliz e Brilhante' : childFeeling === '🧸' ? 'um pouco Cansado' : childFeeling === '☁️' ? 'Calmo como uma Nuvem Suave' : 'Mágico e cheio de Imaginação'}. Ele canta uma poesia de carinho para você agora!`
                : `Our companion bird landed beside you because he saw you feel ${childFeeling === '🐥' ? 'Happy and Bright' : childFeeling === '🧸' ? 'Tired' : childFeeling === '☁️' ? 'Calm like a Soft Cloud' : 'Magical and full of Dreams'}. He whistles a sweet song of peace!`}
            </div>
          )}
        </div>
      )}

      {/* 7. DOWN / ASSISTIVE ARCO-IRIS VOICE CARD */}
      {neuroMode === 'down' && (
        <div className="w-full p-4 bg-teal-955/10 border border-teal-500/20 rounded-[2.5rem] text-center space-y-4 font-sans shadow-lg">
          <div className="flex justify-center items-center space-x-2 text-teal-400 font-bold">
            <span className="text-xl animate-bounce">🌈</span>
            <span className="text-[11px] font-black tracking-widest uppercase text-teal-300">{lang === 'pt' ? 'Amigo Arco-Íris' : 'Rainbow Friend'}</span>
          </div>
          
          <h4 className="text-[12.5px] font-black text-stone-100 text-center font-sans">
            {lang === 'pt' ? 'Clique no botão grande para me escutar dizer uma fofura!' : 'Click the big button to hear me talk directly to you!'}
          </h4>

          <div className="p-1">
            <button 
              onClick={() => {
                const msg = lang === 'pt' 
                  ? 'Você é uma pessoa maravilhosa e cheia de amor. Estou muito feliz que estamos conversando!' 
                  : 'You are wonderful and full of love. I am so glad we are talking right now!';
                try {
                  const utterance = new SpeechSynthesisUtterance(msg);
                  utterance.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
                  window.speechSynthesis.speak(utterance);
                } catch (e) {
                  console.error('Audio assist failure', e);
                }
              }}
              className="w-full py-4 bg-teal-500 hover:bg-teal-400 active:scale-95 text-stone-950 font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 pointer-events-auto cursor-pointer shadow-lg shadow-teal-500/25 border-b-2 border-teal-600"
            >
               🔊 {lang === 'pt' ? 'OUVIR MÚSICA DA VOZ' : 'LISTEN TO MY GUIDING VOICE'}
            </button>
          </div>

          <div className="flex justify-center space-x-1.5 text-[10px] font-bold text-teal-400/90 font-mono uppercase">
            <span>✦ {lang === 'pt' ? 'Amigos virtuais: Ativo' : 'Virtual Companion: Active'}</span>
          </div>
        </div>
      )}

      {/* 8. DYSLEXIA / TRANSCRIPTS EASY PLAYER */}
      {neuroMode === 'dyslexia' && (
        <div className="w-full p-4 bg-stone-900/30 border border-stone-800 rounded-2xl text-left space-y-2 font-sans shadow-lg">
          <div className="flex justify-between items-center text-amber-200 border-b border-stone-850 pb-1 flex-wrap gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1">📚 {lang === 'pt' ? 'Facilitador de Leitura' : 'Reader Assist'}</span>
            <button 
              onClick={() => {
                const activeText = currentUser?.emotionalState ? (lang === 'pt' ? `Sinto agora: ${currentUser?.emotionalState}. Respire suavemente no balanço da voz.` : `I feel like: ${currentUser?.emotionalState}. Relax and follow the calm wind structure.`) : (lang === 'pt' ? 'Santuário de luz da hipnose poética cognitiva.' : 'Cognitive poetics hypnosis safe sanctuary.');
                try {
                  const utterance = new SpeechSynthesisUtterance(activeText);
                  utterance.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
                  window.speechSynthesis.speak(utterance);
                } catch (e) {
                  console.error('Speech utility issue', e);
                }
              }}
              className="py-1 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[8.5px] uppercase tracking-widest text-[#d97706] rounded font-mono cursor-pointer transition-all pointer-events-auto"
            >
              🔊 {lang === 'pt' ? 'Ouvir Texto Falado' : 'Play text voice audio'}
            </button>
          </div>
          <p className="text-[10px] text-stone-400 leading-relaxed tracking-[0.14em] font-sans font-medium">
            {lang === 'pt' 
              ? 'Oferecemos fonte com alta legibilidade espacial, espaçamento aumentado e leitura automatizada para facilitar seu descanso cognitivo.' 
              : 'We provide heavy letter spacing, musical cadence indicators, and instant reader utilities to optimize reading comfort.'}
          </p>
        </div>
      )}

      {/* 9. GIFTED / ALTAS HABILIDADES - COSMIC CONCEPT MATRIX */}
      {neuroMode === 'gifted' && (
        <div className="w-full p-4 bg-violet-955/10 border border-violet-900/35 rounded-2xl text-left space-y-2 font-mono shadow-lg">
          <div className="flex justify-between items-center border-b border-violet-950 pb-1.5 flex-wrap gap-1">
            <span className="text-[10px] font-black tracking-widest uppercase text-violet-400 flex items-center gap-1 font-mono">🌌 {lang === 'pt' ? 'Explorador Intelectual' : 'Intellectual Depth MAP'}</span>
            <span className="text-[8.5px] font-mono text-violet-400 uppercase font-bold">{lang === 'pt' ? 'Profundidade Ativa' : 'Depth Active'}</span>
          </div>
          <span className="text-[8px] font-mono text-stone-500 block uppercase">{lang === 'pt' ? 'CONCEITO DO DIA' : 'CONCEPT OF THE DAY'}</span>
          <p className="text-[11px] text-stone-300 italic leading-relaxed font-serif">
            {lang === 'pt' 
              ? '“Se a mente humana é um sistema de conexões poéticas, até onde vai sua habilidade de expandir a realidade interna?”' 
              : '“If the human mind is mapped through poetic resonances, how deep goes your ability to project and expand inner reality?”'}
          </p>
          <div className="pt-1.5 flex items-center space-x-1 font-mono text-[9px] text-stone-500">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span>Cognitive Thread: Active Connections V3</span>
          </div>
        </div>
      )}

      {/* 10. BURNOUT - SUAVE PROGRESS DECOMPRESSION CONTROLS */}
      {neuroMode === 'burnout' && (
        <div className="w-full p-4 bg-[#161211]/80 border border-stone-850 rounded-2xl text-left space-y-3.5 font-sans shadow-lg">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-orange-400 font-black tracking-widest uppercase flex items-center gap-1">🔥 {lang === 'pt' ? 'Carga de Cobrança Interna' : 'Internal Pressure Release'}</span>
            <span className="text-[9px] font-mono text-stone-500 font-bold">Decompress Core Active</span>
          </div>
          
          <div className="space-y-1.5 font-sans">
            <div className="flex justify-between items-center text-[8.5px] font-mono text-stone-300 mb-0.5">
              <span>{lang === 'pt' ? 'Nível de Auto-Cobrança:' : 'Inner Pressure Level:'}</span>
              <span className="text-orange-400 font-bold">{burnoutEnergy}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={burnoutEnergy}
              onChange={(e) => setBurnoutEnergy(parseInt(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer h-1.5 bg-stone-950 rounded-lg appearance-none pointer-events-auto"
            />
            <p className="text-[8.5px] text-stone-400 font-mono">
              {lang === 'pt' ? 'Arraste para reduzir manualmente o nível de urgência interna de hoje.' : 'Slide to manually reduce your level of internal pressure now.'}
            </p>
          </div>

          <div className="flex justify-between items-center text-[8.5px] font-mono text-stone-500 border-t border-stone-900 pt-2">
            <span>{lang === 'pt' ? 'Esgotamento: Reduzindo Passo' : 'Exhaustion: Halting pace'}</span>
            <span>{lang === 'pt' ? 'Fogueiras: Sincronizadas' : 'Fires: Synced'}</span>
          </div>
        </div>
      )}

      {/* 11. GRIEF / LUTO - SAFE MEMORIAL ROSE GARDEN */}
      {neuroMode === 'grief' && (
        <div className="w-full p-4 bg-rose-955/10 border border-rose-900/30 rounded-2xl text-left space-y-3 font-serif shadow-lg">
          <div className="flex justify-between items-center border-b border-rose-950/20 pb-1.5">
            <span className="text-[10px] text-[#fda4af] font-black tracking-widest uppercase flex items-center gap-1 font-sans">🌹 {lang === 'pt' ? 'Santuário de Lembranças' : 'Sanctuary of Grace'}</span>
            <span className="text-[8.5px] font-mono text-rose-450 uppercase">Espaço Reservado</span>
          </div>
          <p className="text-xs text-rose-200 leading-relaxed font-serif italic text-center">
            {lang === 'pt' 
              ? '“Tudo o que amamos profundamente torna-se parte de quem somos.”' 
              : '“What we once enjoyed and deeply loved we can never lose, for it becomes a secure lock of our heart.”'}
          </p>

          <div className="flex items-center space-x-3 bg-stone-955/50 p-2.5 rounded-xl border border-rose-955/20">
            <button 
              onClick={() => setGriefRemembrance(!griefRemembrance)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-rose-550/5 hover:bg-rose-550/10 border border-rose-500/20 text-rose-455 shrink-0 text-lg cursor-pointer pointer-events-auto"
            >
              {griefRemembrance ? '🕯️' : '🌸'}
            </button>
            <p className="text-[9.5px] text-stone-400 leading-snug font-sans font-medium">
              {griefRemembrance 
                ? (lang === 'pt' ? 'Vela virtual acesa em memória e honra eterna. Respire fundo.' : 'Virtual candle lit in timeless honor. Take a long, gentle breath.')
                : (lang === 'pt' ? 'Clique no botão ao lado para acender uma vela virtual do amor.' : 'Click the icon to light a secure virtual memory candle.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
