import React, { useState, useEffect, useMemo } from 'react';
import { PCH_VISUAL_LIBRARY, VisualScene, findSceneById } from './PCHVisualLibrary';
import { Sparkles, BarChart2, CheckCircle, RefreshCw, Eye, ThumbsUp, Heart, Image as ImageIcon } from 'lucide-react';
import { useId } from 'react';

interface ImmersiveVisualEngineProps {
  emotionalState?: string;
  neuroMode?: string;
  lang?: 'pt' | 'en';
  onAddPoints?: (pts: number) => void;
  inline?: boolean;
}

interface ImageCacheItem {
  key: string;
  sceneId: string;
  description: string;
  emotionalState: string;
  neuroMode: string;
  timestamp: number;
}

export const ImmersiveVisualEngine: React.FC<ImmersiveVisualEngineProps> = ({
  emotionalState = 'neutral',
  neuroMode = 'natural',
  lang = 'pt',
  onAddPoints,
  inline = false
}) => {
  const gradId = useId().replace(/[^a-zA-Z0-9]/g, '');

  // --- 1. STATES ---
  const [currentScene, setCurrentScene] = useState<VisualScene | null>(null);
  const [previousScene, setPreviousScene] = useState<VisualScene | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [userLikedCurrent, setUserLikedCurrent] = useState(false);
  const [isLastLoadedFromCache, setIsLastLoadedFromCache] = useState(false);

  // Stats for Admin Panel (persisted in localStorage)
  const [stats, setStats] = useState({
    imagesUsed: {} as Record<string, number>,
    emotionsDetected: {} as Record<string, number>,
    favorites: [] as string[],
    interactionCount: 0,
    generationAttempts: 0,
    cacheHits: 0
  });

  // --- 2. CATEGORY MAP BY NEUROMODE ---
  const getProfileTheme = (mode: string) => {
    switch (mode) {
      case 'adhd':
        return { category: 'breathing', keyword: 'floresta', namePt: 'Floresta Luminosa (TDAH)', nameEn: 'Bright Forest (ADHD)' };
      case 'autism':
        return { category: 'silence', keyword: 'geometria', namePt: 'Geometria Harmônica (Teal)', nameEn: 'Constellations (Autism)' };
      case 'anxiety':
        return { category: 'forgiveness', keyword: 'lago', namePt: 'Farol & Mar Calmo', nameEn: 'Calm Wave (Anxiety)' };
      case 'senior':
        return { category: 'gratitude', keyword: 'jardim', namePt: 'Jardim Centenário', nameEn: 'Garden Legacy (Senior)' };
      case 'child':
        return { category: 'inner-freedom', keyword: 'nuvem', namePt: 'Jardim Encantado', nameEn: 'Magical Sky (Child)' };
      case 'down':
        return { category: 'hope', keyword: 'flor', namePt: 'Céu Colorido de Borboletas', nameEn: 'Butterfly Sky (Down)' };
      case 'gifted':
        return { category: 'purpose', keyword: 'estrela', namePt: 'Galáxias & Bibliotecas', nameEn: 'Deep Galaxies (Gifted)' };
      case 'grief':
        return { category: 'forgiveness', keyword: 'amanhecer', namePt: 'Caminho Memória & Sol', nameEn: 'Remembrance Path (Grief)' };
      case 'burnout':
        return { category: 'silence', keyword: 'fogueira', namePt: 'Cabana Confortável', nameEn: 'Quiet Cabin (Burnout)' };
      default:
        return { category: 'breathing', keyword: 'ondas', namePt: 'Sintonia Natural', nameEn: 'Natural Grounding' };
    }
  };

  const profileTheme = useMemo(() => getProfileTheme(neuroMode), [neuroMode]);

  // --- 3. DYNAMIC SCENE BUILDER & CACHE ENGINE ---
  useEffect(() => {
    const emotionLower = emotionalState.toLowerCase();

    // Determine target category based on identified emotion
    let targetCategory = profileTheme.category;
    if (emotionLower.includes('sad') || emotionLower.includes('triste') || emotionLower.includes('luto') || emotionLower.includes('grief')) {
      targetCategory = 'forgiveness'; // Comforting
    } else if (emotionLower.includes('anx') || emotionLower.includes('accel') || emotionLower.includes('anxio') || emotionLower.includes('panic')) {
      targetCategory = 'silence'; // Soothing / Calm
    } else if (emotionLower.includes('hope') || emotionLower.includes('esper') || emotionLower.includes('desejo')) {
      targetCategory = 'hope'; // Bright
    } else if (emotionLower.includes('gold') || emotionLower.includes('grat') || emotionLower.includes('obrig') || emotionLower.includes('thank')) {
      targetCategory = 'gratitude'; // Golden / Warm
    } else if (emotionLower.includes('refle') || emotionLower.includes('pensa') || emotionLower.includes('silenc')) {
      targetCategory = 'purpose'; // Contemplative
    }

    const targetCatData = PCH_VISUAL_LIBRARY.find(cat => cat.id === targetCategory) || PCH_VISUAL_LIBRARY[0];
    const pool = targetCatData.scenes;
    const prospectiveScene = pool.find(s => 
      s.elements.includes(profileTheme.keyword) || 
      s.prompt.toLowerCase().includes(profileTheme.keyword)
    ) || pool[Math.floor(Math.random() * pool.length)];

    const targetDescription = prospectiveScene.prompt;

    // Load local cache to prevent redundant generation
    const localCacheStr = localStorage.getItem('pch_visual_cache') || '[]';
    const localCacheList: ImageCacheItem[] = JSON.parse(localCacheStr);

    // Look for a cached entry that has the SAME description AND same emotional profile (emotionalState + neuroMode)
    const existingCache = localCacheList.find(item => 
      item.description === targetDescription && 
      item.emotionalState === emotionalState && 
      item.neuroMode === neuroMode
    );

    let selectedScene: VisualScene | null = null;

    if (existingCache) {
      // Cache Hit: Recover Scene
      selectedScene = findSceneById(existingCache.sceneId);
      if (selectedScene) {
        setIsLastLoadedFromCache(true);
        setStats(prev => {
          const updated = {
            ...prev,
            cacheHits: prev.cacheHits + 1,
            imagesUsed: {
              ...prev.imagesUsed,
              [selectedScene!.id]: (prev.imagesUsed[selectedScene!.id] || 0) + 1
            }
          };
          localStorage.setItem('pch_visual_stats', JSON.stringify(updated));
          return updated;
        });
      }
    }

    if (!selectedScene) {
      // Cache Miss: Choose dedicated scene matching category
      selectedScene = prospectiveScene;
      setIsLastLoadedFromCache(false);

      // Persist to local visual cache with descriptive & emotional indicators
      const newCacheItem: ImageCacheItem = {
        key: `${neuroMode}_${targetCategory}_${emotionalState}`,
        sceneId: selectedScene.id,
        description: targetDescription,
        emotionalState: emotionalState,
        neuroMode: neuroMode,
        timestamp: Date.now()
      };
      const updatedCache = [newCacheItem, ...localCacheList.slice(0, 19)]; // Keep maximum 20 cached entries
      localStorage.setItem('pch_visual_cache', JSON.stringify(updatedCache));

      // Increment stats
      setStats(prev => {
        const emotionKey = emotionalState || 'neutral';
        const updated = {
          ...prev,
          generationAttempts: prev.generationAttempts + 1,
          imagesUsed: {
            ...prev.imagesUsed,
            [selectedScene!.id]: (prev.imagesUsed[selectedScene!.id] || 0) + 1
          },
          emotionsDetected: {
            ...prev.emotionsDetected,
            [emotionKey]: (prev.emotionsDetected[emotionKey] || 0) + 1
          }
        };
        localStorage.setItem('pch_visual_stats', JSON.stringify(updated));
        return updated;
      });
    }

    if (selectedScene && selectedScene.id !== currentScene?.id) {
      // Trigger Crossfade 2s transition animation
      setPreviousScene(currentScene);
      setCurrentScene(selectedScene);
      setIsCrossfading(true);
      setUserLikedCurrent(false);

      const timer = setTimeout(() => {
        setIsCrossfading(false);
      }, 2000); // exactly 2 second fade duration

      return () => clearTimeout(timer);
    }
  }, [emotionalState, neuroMode, profileTheme]);

  // --- 4. PERSIST STATS LOADER ---
  useEffect(() => {
    try {
      const savedStatsStr = localStorage.getItem('pch_visual_stats');
      if (savedStatsStr) {
        setStats(JSON.parse(savedStatsStr));
      }
    } catch {
      // No-op
    }
  }, []);

  // --- 5. INTERACTION ACTION (LIKE/FAVORITE) ---
  const handleLikeScene = () => {
    if (!currentScene) return;
    setUserLikedCurrent(true);

    // Give user an interactive experience reward points in cognitive progression!
    if (onAddPoints) {
      onAddPoints(10); // Reward 10 XP for reflecting with visuals
    }

    setStats(prev => {
      const favList = prev.favorites.includes(currentScene.id)
        ? prev.favorites
        : [...prev.favorites, currentScene.id];

      const updated = {
        ...prev,
        favorites: favList,
        interactionCount: prev.interactionCount + 1
      };
      localStorage.setItem('pch_visual_stats', JSON.stringify(updated));
      return updated;
    });
  };

  // --- 6. METRIC COMPUTATIONS FOR ADMIN VIEW ---
  const imagesUsedSorted = useMemo(() => {
    return Object.entries(stats.imagesUsed)
      .map(([id, count]) => {
        const matching = findSceneById(id);
        return {
          id,
          name: matching ? (lang === 'pt' ? matching.title : matching.titleEn) : id,
          count: Number(count)
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [stats.imagesUsed, lang]);

  const emotionsSorted = useMemo(() => {
    return Object.entries(stats.emotionsDetected)
      .map(([emotion, count]) => ({ emotion, count: Number(count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [stats.emotionsDetected]);

  const interactionRatePercentage = useMemo(() => {
    const total = stats.generationAttempts + stats.cacheHits;
    if (total === 0) return 0;
    return Math.round((stats.interactionCount / total) * 100);
  }, [stats.generationAttempts, stats.cacheHits, stats.interactionCount]);

  // --- 7. SVG DYNAMIC GENERATOR (MOCK OF ENGINE) ---
  const renderInteractiveArt = (scene: VisualScene | null) => {
    if (!scene) return null;
    const gradientColors = scene.gradient || ["from-teal-950 to-stone-950", "from-cyan-950 to-stone-950"];
    const themeClass = gradientColors[0] || "from-teal-950 to-stone-950";

    // Detect neuroMode and inject key therapeutic visual geometries
    return (
      <div className={`w-full h-full relative overflow-hidden bg-gradient-to-br ${themeClass} rounded-2xl border border-white/5 shadow-inner p-1 group flex items-center justify-center`}>
        {/* Soft atmospheric glowing orb */}
        <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none rounded-full scale-75 blur-3xl" />

        {/* Dynamic slow floating elements matching neurodivergence */}
        {neuroMode === 'autism' && (
          /* Geometry & Orbits - Predictable and soothing */
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
              <circle cx="50" cy="50" r="30" stroke="rgba(20, 184, 166, 0.4)" strokeWidth="0.5" fill="none" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(20, 184, 166, 0.2)" strokeWidth="0.25" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(20, 184, 166, 0.2)" strokeWidth="0.25" />
              <circle cx="50" cy="20" r="3" fill="rgba(45, 212, 191, 0.7)">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="45s" repeatCount="indefinite" />
              </circle>
              <circle cx="20" cy="50" r="2" fill="rgba(20, 184, 166, 0.7)">
                <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="30s" repeatCount="indefinite" />
              </circle>
              <polygon points="50,22 78,70 22,70" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="0.5" fill="none" />
            </svg>
          </div>
        )}

        {neuroMode === 'adhd' && (
          /* Moving stream flow - Keeps calm attention with slow flow */
          <div className="absolute inset-0 pointer-events-none opacity-50">
            <div className="absolute w-[500px] h-[2px] bg-gradient-to-r from-transparent via-teal-450/40 to-transparent top-1/4 -left-1/3 rotate-12 blur-xs animate-pulse duration-[8000ms]" />
            <div className="absolute w-[400px] h-[3px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent top-1/2 -right-1/4 -rotate-12 blur-xs animate-pulse duration-[6000ms]" />
            <div className="absolute w-[300px] h-[2px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent bottom-1/4 left-1/4 rotate-45 blur-xs" />
          </div>
        )}

        {neuroMode === 'anxiety' && (
          /* High contrast Sunset reflections / Light Beacon */
          <div className="absolute bottom-0 inset-x-0 h-1/2 pointer-events-none bg-gradient-to-t from-orange-500/10 to-transparent opacity-70">
            <div className="absolute w-24 h-24 bg-orange-400/15 rounded-full blur-2xl bottom-4 left-1/2 -translate-x-1/2" />
            <div className="absolute h-1 bg-gradient-to-r from-transparent via-orange-300/45 to-transparent bottom-1 px-8 inset-x-0" />
            <div className="absolute h-[2px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent bottom-4 px-12 inset-x-0" />
          </div>
        )}

        {neuroMode === 'gifted' && (
          /* Galaxical floating sparks and deep stellar orbits */
          <div className="absolute inset-0 pointer-events-none opacity-60">
            <div className="absolute w-1.5 h-1.5 bg-white rounded-full left-[25%] top-[20%] animate-ping" style={{ animationDuration: '6s' }} />
            <div className="absolute w-1 h-1 bg-white rounded-full right-[30%] bottom-[35%] animate-ping" style={{ animationDuration: '10s', animationDelay: '2s' }} />
            <div className="absolute w-2 h-2 bg-indigo-400/20 rounded-full left-[45%] top-[15%] blur-xs animate-pulse" />
            <div className="absolute w-1.5 h-1.5 bg-pink-400/30 rounded-full right-[20%] top-[40%] blur-xs animate-pulse" />
          </div>
        )}

        {/* Ambient Floating Particle Dust (Soothing and contemplative) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-1 h-1 bg-white/35 rounded-full top-[30%] left-[10%] animate-pulse duration-3000" />
          <div className="absolute w-1.5 h-1.5 bg-white/20 rounded-full bottom-[20%] right-[15%] animate-pulse duration-[4500ms]" />
          <div className="absolute w-1 h-1 bg-white/25 rounded-full top-[15%] right-[25%] animate-pulse duration-[5000ms]" />
        </div>

        {/* The Centerpiece Icon / Concept */}
        <div className="absolute flex flex-col items-center justify-center text-center p-4">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg group-hover:scale-105 transition-transform duration-700">
            {scene.icon === 'Wind' && <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l4.03 3.359a1.125 1.125 0 010 1.73l-4.03 3.358a1.125 1.125 0 01-1.53 0L7.595 9.551a1.125 1.125 0 010-1.73l4.03-3.358a1.125 1.125 0 011.125-.233z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12h19.5" /></svg>}
            {scene.icon === 'Sparkles' && <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />}
            {scene.icon === 'Heart' && <Heart className="w-6 h-6 text-rose-400" />}
            {scene.icon === 'Shield' && <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>}
            {scene.icon === 'RefreshCw' && <RefreshCw className="w-6 h-6 text-emerald-400" />}
            {scene.icon === 'Smile' && <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            {scene.icon === 'Compass' && <svg className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '60s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12z" /></svg>}
            {scene.icon === 'Sliders' && <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0n3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>}
          </div>
          <span className="text-[12px] font-serif text-white/95 mt-3 tracking-wider font-light uppercase">{lang === 'pt' ? scene.title : scene.titleEn}</span>
          <span className="text-[9px] text-white/50 tracking-widest font-mono uppercase mt-1">PCH • {scene.id.replace('_', ' ').toUpperCase()}</span>
          <p className="text-[10px] text-white/70 italic mt-2.5 max-w-[240px] leading-relaxed font-light">
            "{lang === 'pt' ? scene.prompt : scene.prompt}"
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-md mx-auto space-y-4 ${inline ? '' : 'p-2'}`} id="immersive-visual-engine">
      {/* Target Canvas Viewer Block */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-stone-850 bg-stone-900 group">
        
        {/* Layer 1: Previous scene for fade-out */}
        {previousScene && (
          <div className="absolute inset-0 z-0">
            {renderInteractiveArt(previousScene)}
          </div>
        )}

        {/* Layer 2: Active active scene for fade-in with 2-second transition */}
        <div 
          className={`absolute inset-0 z-10 transition-all duration-[2000ms] ease-in-out ${
            isCrossfading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {renderInteractiveArt(currentScene)}
        </div>

        {/* Ambient music option overlay */}
        <div className="absolute top-3 left-3 z-[15] flex flex-col gap-1 select-none">
          <div className="bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/5 text-[8px] tracking-widest font-mono text-white/70 uppercase">
            {lang === 'pt' ? '🔊 Música: Oceano de Sintonia' : '🔊 Track: Synthesis Ocean'}
          </div>
          {isLastLoadedFromCache && (
            <div className="bg-emerald-500/20 text-emerald-300 backdrop-blur-sm px-2.5 py-1 rounded-full border border-emerald-500/30 text-[8px] tracking-widest font-mono uppercase font-bold self-start animate-pulse">
              {lang === 'pt' ? '⚡ Recuperado do Cache' : '⚡ Restored from Cache'}
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 z-[15] flex space-x-1">
          {/* Performance admin trigger */}
          <button 
            type="button"
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/5 text-white/60 hover:text-white transition-all cursor-pointer"
            title={lang === 'pt' ? 'Painel Administrativo de Imagens' : 'Visual Engine Stats'}
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer controls inside image panel */}
        <div className="absolute bottom-3 right-3 z-[15] flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            disabled={userLikedCurrent}
            onClick={handleLikeScene}
            className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-wider font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
              userLikedCurrent 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                : 'bg-black/45 hover:bg-black/65 border border-white/10 text-white hover:text-amber-400'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>{userLikedCurrent ? (lang === 'pt' ? 'Favoritado! (+10 XP)' : 'Saved! (+10 XP)') : (lang === 'pt' ? 'Favoritar Imagem' : 'Save Image')}</span>
          </button>
        </div>
      </div>

      {/* --- STATS PANEL (PAINEL ADMINISTRATIVO) --- */}
      {showAdminPanel && (
        <div className="bg-stone-900 border border-stone-850 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-center border-b border-stone-800 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#a8a29e] font-bold font-mono">
              {lang === 'pt' ? 'Painel de Controle Visual - PCH' : 'Visual Engine Dashboard'}
            </span>
            <button 
              type="button"
              onClick={() => {
                // Clear statistics
                const defaultStats = {
                  imagesUsed: {},
                  emotionsDetected: {},
                  favorites: [],
                  interactionCount: 0,
                  generationAttempts: 0,
                  cacheHits: 0
                };
                setStats(defaultStats);
                localStorage.setItem('pch_visual_stats', JSON.stringify(defaultStats));
              }}
              className="text-[8px] text-stone-500 uppercase hover:text-stone-300 font-mono tracking-wider transition-colors"
            >
              [ {lang === 'pt' ? 'Redefinir' : 'Reset'} ]
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-850">
              <span className="text-[8px] text-stone-500 uppercase font-mono block">{lang === 'pt' ? 'Gerações Totais' : 'Total Generations'}</span>
              <span className="text-stone-200 text-lg font-mono font-bold">{(stats.generationAttempts || 0) + (stats.cacheHits || 0)}</span>
              <span className="text-[7px] text-stone-600 block mt-0.5">({stats.cacheHits || 0} Cache Hits)</span>
            </div>
            <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-850">
              <span className="text-[8px] text-stone-500 uppercase font-mono block">{lang === 'pt' ? 'Interatividade' : 'Interaction Rate'}</span>
              <span className="text-stone-200 text-lg font-mono font-bold">{interactionRatePercentage}%</span>
              <span className="text-[7px] text-stone-600 block mt-0.5">({stats.interactionCount || 0} clicks)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Top 3 Scenarios */}
            <div className="space-y-1.5">
              <span className="text-[8px] uppercase tracking-wider text-stone-500 text-left block font-bold">{lang === 'pt' ? 'Cenários Favoritos' : 'Top Scenes'}</span>
              {imagesUsedSorted.length === 0 ? (
                <span className="text-[8px] text-stone-600 italic block">{lang === 'pt' ? 'Nenhuma gerada.' : 'No data.'}</span>
              ) : (
                <div className="space-y-1">
                  {imagesUsedSorted.slice(0, 3).map((item, id) => (
                    <div key={id} className="flex justify-between items-center text-[9px] bg-stone-950/40 p-1.5 rounded border border-stone-950">
                      <span className="text-stone-300 truncate max-w-[100px]">{item.name}</span>
                      <span className="font-mono text-teal-400 font-bold">{item.count}x</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top 3 Detected Emotions */}
            <div className="space-y-1.5">
              <span className="text-[8px] uppercase tracking-wider text-stone-500 text-left block font-bold">{lang === 'pt' ? 'Emoções Detectadas' : 'Common Emotions'}</span>
              {emotionsSorted.length === 0 ? (
                <span className="text-[8px] text-stone-600 italic block">{lang === 'pt' ? 'Aguardando inputs.' : 'Waiting input.'}</span>
              ) : (
                <div className="space-y-1">
                  {emotionsSorted.slice(0, 3).map((item, id) => (
                    <div key={id} className="flex justify-between items-center text-[9px] bg-stone-900/60 p-1.5 rounded border border-stone-950">
                      <span className="text-stone-400 capitalize truncate max-w-[100px]">{item.emotion}</span>
                      <span className="font-mono text-amber-500 font-bold">{item.count}x</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
