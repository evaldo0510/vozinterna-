import React from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { NeuroProfileType, UserNeuroProfile } from '../types';

export interface NeuroProfileConfig {
  id: NeuroProfileType;
  labelPt: string;
  labelEn: string;
  badge: string;
  colorPalette: {
    bg: string;
    card: string;
    accent: string;
    glow: string;
    text: string;
  };
  typography: {
    fontSize: string;
    letterSpacing: string;
    lineHeight: string;
    fontWeight: string;
  };
  animationMode: 'normal' | 'slow' | 'none' | 'fast';
  tonePt: string;
  toneEn: string;
  journeyNamePt: string;
  journeyNameEn: string;
  journeyStars: Array<{ id: string; namePt: string; nameEn: string; xp: number; cx: number; cy: number; poemPt: string; poemEn: string }>;
  exercisesPt: string[];
  exercisesEn: string[];
  gamificationGoalPt: string;
  gamificationGoalEn: string;
  recommendationsPt: string[];
  recommendationsEn: string[];
}

export const neuroProfiles: Record<NeuroProfileType, NeuroProfileConfig> = {
  normal: {
    id: 'normal',
    labelPt: 'Usuário Padrão 🍃',
    labelEn: 'Standard Natural Profile 🍃',
    badge: 'Standard',
    colorPalette: {
      bg: '#080B14',
      card: '#0d1324',
      accent: '#14B8A6',
      glow: 'rgba(20, 184, 166, 0.4)',
      text: '#E0E7E5'
    },
    typography: {
      fontSize: '100%',
      letterSpacing: '0.025em',
      lineHeight: '1.65',
      fontWeight: '400'
    },
    animationMode: 'normal',
    tonePt: 'Equilibrado, poético e acolhedor.',
    toneEn: 'Balanced, poetic, and welcoming.',
    journeyNamePt: 'Caminho da Presença Cósmica',
    journeyNameEn: 'Cosmic Presence Horizon',
    journeyStars: [
      { id: 'n1', namePt: 'Despertar', nameEn: 'Awakening', xp: 10, cx: 40, cy: 35, poemPt: '“A mente encontrou o primeiro sussurro de quietude. Um farol acendeu.”', poemEn: '“The mind captured its first ripple of quiet. A stellar beacon ignited.”' },
      { id: 'n2', namePt: 'Sintonia Diária', nameEn: 'Daily Tuning', xp: 100, cx: 120, cy: 50, poemPt: '“Diante da névoa pesada, você se manteve firme. O hábito de respirar cura.”', poemEn: '“Faced with thick mist, you stood firm. The rhythmic breath keeps healing.”' },
      { id: 'n3', namePt: 'Cultivo Orgânico', nameEn: 'Organic Cultivation', xp: 200, cx: 190, cy: 80, poemPt: '“As sementes de intenção abriram folhas. Você regou o amanhã hoje.”', poemEn: '“Your seeds of intention unfurled. You watered tomorrow in your presence today.”' },
      { id: 'n4', namePt: 'Sopro Lúcido', nameEn: 'Lucid Breath', xp: 450, cx: 260, cy: 40, poemPt: '“Percursos longos e fardos decodificados. Você escuta as próprias profundezas.”', poemEn: '“Long paths traversed and weights unraveled. You listen to your own depth.”' },
      { id: 'n5', namePt: 'Santuário de Cristal', nameEn: 'Crystalline Sanctuary', xp: 750, cx: 340, cy: 65, poemPt: '“O cosmos interno brilha cristalino. O santuário se tornou parte de quem você é.”', poemEn: '“The cosmic horizon shines crystalline. The sanctuary is now part of you.”' }
    ],
    exercisesPt: [
      'Respirar profundamente por 2 minutos observando as ondas do mar.',
      'Refletir e ancorar uma palavra-chave para inspirar seu dia.',
      'Regar o Jardim Interior guiando a intuição poética.'
    ],
    exercisesEn: [
      'Inhale deeply for 2 minutes observing virtual ocean waves.',
      'Reflect and anchor a key positive word to inspire your day.',
      'Water the Soul Garden guiding your poetic flow.'
    ],
    gamificationGoalPt: 'Alcance 100 XP para florescer sua semente cósmica a broto sagrado.',
    gamificationGoalEn: 'Reach 100 XP to evolve the cosmic seed into a sacred sprout.',
    recommendationsPt: [
      'Alterne períodos de chat livre com ciclos de Sopro Coerente.',
      'Utilize o Espelho Emocional para autoindução cognitiva.',
      'Salve poemas sintonizados na sua Biblioteca de Refúgio.'
    ],
    recommendationsEn: [
      'Alternate free chat segments with Coherent Breath loops.',
      'Use the Emotional Mirror for positive cognitive induction.',
      'Save tuned poems inside your safe sanctuary Refúgio.'
    ]
  },
  tdah: {
    id: 'tdah',
    labelPt: 'Foco Blindado TDAH ⚡',
    labelEn: 'ADHD Laser Focus Engine ⚡',
    badge: 'ADHD Focus',
    colorPalette: {
      bg: '#05070f',
      card: '#0c0f1d',
      accent: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.45)',
      text: '#F1F5F9'
    },
    typography: {
      fontSize: '100%',
      letterSpacing: '0.04em',
      lineHeight: '1.6',
      fontWeight: '500'
    },
    animationMode: 'fast',
    tonePt: 'Objetivo, dinâmico, gratificante e focado em micro-passos.',
    toneEn: 'Actionable, rewarding, dynamic, and micro-focused.',
    journeyNamePt: 'Sinfonia Atenta Dinâmica',
    journeyNameEn: 'ADHD Active Rhythm Stream',
    journeyStars: [
      { id: 't1', namePt: 'Impulso Inicial', nameEn: 'First Spark', xp: 15, cx: 50, cy: 40, poemPt: '“Você domou a tempestade elétrica inicial. O primeiro átomo de foco acendeu.”', poemEn: '“You tamed the electric storm. The first atom of pure focus sparked.”' },
      { id: 't2', namePt: 'Rastro Estável', nameEn: 'Steady Streak', xp: 80, cx: 130, cy: 30, poemPt: '“Foco mantido por pequenos passos contínuos. A clareza irrompe a pressa.”', poemEn: '“Constant micro-steps conquered. Clear focus breaks the anxious hurry.”' },
      { id: 't3', namePt: 'Domínio do Fogo', nameEn: 'Mindful Spark', xp: 180, cx: 210, cy: 75, poemPt: '“A energia que antes dispersava agora nutre seu Jardim de Presença.”', poemEn: '“The wild chaotic spark now warms and grows your garden of calm.”' },
      { id: 't4', namePt: 'Laser Cognitivo', nameEn: 'Laser Compass', xp: 400, cx: 280, cy: 45, poemPt: '“Sua atenção se moldou como espada polida. O silêncio obedece seu comando.”', poemEn: '“Your attention aligns like a polished blade. Silence conforms to your command.”' }
    ],
    exercisesPt: [
      'Checklist rápido de 3 micro-ações focadas.',
      'Sopro Rítmico acelerado 4-4 com visualizações energéticas.',
      'Desafio PCH Express: registre uma única frase do seu subconsciente.'
    ],
    exercisesEn: [
      'Rapid checklist with 3 action-focused micro-goals.',
      'Dynamic 4-4 breathing loop with energetic visual stimuli.',
      'Subconscious Capture: type exactly one raw sentence for instant feedback.'
    ],
    gamificationGoalPt: 'Conclua tarefas rápidas hoje para liberar recompensas imediatas de XP.',
    gamificationGoalEn: 'Complete high-speed daily items to trigger instant XP bursts.',
    recommendationsPt: [
      'Ative o Modo Foco para remover fardos visuais.',
      'Adicione novos hábitos ao console para ganhar +25 XP.',
      'Defina prazos simbólicos para treinar seu subconsciente.'
    ],
    recommendationsEn: [
      'Enable Focus Shield Mode to mask complex sidebars.',
      'Add fresh routine tasks to claim direct +25 XP rewards.',
      'Inject friendly symbolic boundaries to anchor mental release.'
    ]
  },
  autismo: {
    id: 'autismo',
    labelPt: 'Roteiro Previsível Autismo 🧩',
    labelEn: 'Predictable Symmetry Profile 🧩',
    badge: 'ASD Calm',
    colorPalette: {
      bg: '#0F121C',
      card: '#161A29',
      accent: '#3B82F6',
      glow: 'none',
      text: '#EAEDF5'
    },
    typography: {
      fontSize: '100%',
      letterSpacing: '0.015em',
      lineHeight: '1.7',
      fontWeight: '500'
    },
    animationMode: 'none',
    tonePt: 'Simétrico, literal, focado em rotinas fixas e livre de ruídos sensoriais.',
    toneEn: 'Symmetrical, literal, highly scheduled, free from sensory noise.',
    journeyNamePt: 'Mapa das Órbitas Seguras',
    journeyNameEn: 'Safe Orbit Trajectory',
    journeyStars: [
      { id: 'a1', namePt: 'Ancoragem', nameEn: 'Anchored Coordinate', xp: 20, cx: 40, cy: 50, poemPt: '“Roteiro desenhado. A mente reconhece a constância segura das formas.”', poemEn: '“The routine is aligned. The mind welcomes the quiet consistency of geometry.”' },
      { id: 'a2', namePt: 'Constância', nameEn: 'Symmetry Loop', xp: 120, cx: 140, cy: 50, poemPt: '“Estrutura mantida em perfeita simetria. Sem surpresas, apenas paz.”', poemEn: '“Structure preserved in safe balance. No sudden changes, only serenity.”' },
      { id: 'a3', namePt: 'Sintonia Clara', nameEn: 'Clear Resonance', xp: 300, cx: 250, cy: 50, poemPt: '“A simetria se tornou um escudo protetor contra o mundo exterior barulhento.”', poemEn: '“Symmetry is now a protective fortress blocking out environmental noise.”' }
    ],
    exercisesPt: [
      'Exercício rotineiro de respiração 5-5-5-5 perfeitamente estruturado.',
      'Organização visual de elementos do jardim em simetria de cores.',
      'Revisão da mesma diretriz poética diária para assegurar previsão consciente.'
    ],
    exercisesEn: [
      'Highly structured box breathing loop (5s inhale, 5s hold, etc.).',
      'Visual organization of plants using rigid color symmetry models.',
      'Contemplating highly consistent daily poems to reinforce prediction.'
    ],
    gamificationGoalPt: 'Mantenha a rotina por 7 dias para carregar o Título de Mente Sintonizada.',
    gamificationGoalEn: 'Maintain systematic checks for 7 days to trigger the Structuring Title.',
    recommendationsPt: [
      'Desative animações e desfrute de estabilidade visual tranquila.',
      'Escolha falar via comandos de Texto Direto.',
      'Utilize o mapeamento gráfico para prever todos os passos antes de interagir.'
    ],
    recommendationsEn: [
      'Disable ambient motion grids to unlock visual stillness.',
      'Communicate securely utilizing Direct Text inputs.',
      'Consult the journey visualizer map to preview every flow.'
    ]
  },
  ansiedade: {
    id: 'ansiedade',
    labelPt: 'Refúgio de Ansiedade 💕',
    labelEn: 'Anxiety Calming Haven 💕',
    badge: 'Calm Shield',
    colorPalette: {
      bg: '#0B1515',
      card: '#102221',
      accent: '#10B981',
      glow: 'rgba(16, 185, 129, 0.35)',
      text: '#E6F4F0'
    },
    typography: {
      fontSize: '102%',
      letterSpacing: '0.04em',
      lineHeight: '1.75',
      fontWeight: '400'
    },
    animationMode: 'slow',
    tonePt: 'Acolhedor, suave, respiratório e desacelerador de fluxo.',
    toneEn: 'Co-regulatory, slow, breathing-focused, and deeply reassuring.',
    journeyNamePt: 'Refúgio de Co-Regulação Leve',
    journeyNameEn: 'Sopros Calming Refuge Way',
    journeyStars: [
      { id: 'an1', namePt: 'Ancoragem Humana', nameEn: 'Somatic Check', xp: 10, cx: 45, cy: 60, poemPt: '“Seu peito subiu e desceu com o vento leve. O pânico recuou sob a presença.”', poemEn: '“The chest expands and releases on comforting air waves. Fear subsides.”' },
      { id: 'an2', namePt: 'Voo Suave', nameEn: 'Gentle Drift', xp: 100, cx: 135, cy: 35, poemPt: '“Os pensamentos pesados encolheram como pequenas pedras na margem do lago.”', poemEn: '“Thick thoughts morph into smooth beach stones on the water edge.”' },
      { id: 'an3', namePt: 'Horizonte Azul', nameEn: 'Protected Clearing', xp: 250, cx: 220, cy: 70, poemPt: '“O ar que entra agora cura e reconstrói o seu santuário de proteção mental.”', poemEn: '“Each safe breath restores and fortifies your mental protection dome.”' }
    ],
    exercisesPt: [
      'Ciclo assistido de Sopro de Alívio com guia de balão expansor.',
      'Sintonização sensorial profunda: liste 3 sons calmos no ambiente.',
      'Autoindução terapêutica de tranquilidade através do espelho poético.'
    ],
    exercisesEn: [
      'Guided Somatic Relief air cycle utilizing the adaptive balloon expander.',
      'Profound sensory sync: list 3 beautiful, calming sounds in your proximity.',
      'Soothing auto-induction utilizing the PCH Emotional Mirror.'
    ],
    gamificationGoalPt: 'Complete o exercício respiratório inicial antes de conversar.',
    gamificationGoalEn: 'Complete the somatic check-in before opening verbose chat areas.',
    recommendationsPt: [
      'Evite extensas conversas se sentir angústia; prefira ciclos de sopro.',
      'Ative vozes de tom extremamente calmo nas preferências de áudio.',
      'Mantenha seu Jardim Interior sempre regado para ver o florescer verde.'
    ],
    recommendationsEn: [
      'Keep conversational input short; let breathing guide your pulse.',
      'Load highly relaxed background wind sounds inside Settings.',
      'Keep the Soul Garden hydrated to witness emerald leaf expansions.'
    ]
  },
  burnout: {
    id: 'burnout',
    labelPt: 'Recuperação de Burnout 🌌',
    labelEn: 'Adrenal Exhaustion Relief 🌌',
    badge: 'Cozy Rest',
    colorPalette: {
      bg: '#0A0813',
      card: '#121021',
      accent: '#8B5CF6',
      glow: 'rgba(139, 92, 246, 0.4)',
      text: '#F5F3FF'
    },
    typography: {
      fontSize: '100%',
      letterSpacing: '0.02em',
      lineHeight: '1.7',
      fontWeight: '400'
    },
    animationMode: 'slow',
    tonePt: 'Acolhedor, indulgente, livre de metas laborais e focado no descanso pleno.',
    toneEn: 'Deeply relaxing, non-demanding, anti-productivity focused.',
    journeyNamePt: 'Senda do Silêncio Reparador',
    journeyNameEn: 'Twilight Restorative Path',
    journeyStars: [
      { id: 'b1', namePt: 'Pausa Geral', nameEn: 'Absolute Halt', xp: 10, cx: 50, cy: 55, poemPt: '“Você parou de correr na esteira do tempo. A alma agradece o repouso.”', poemEn: '“You stepped off the wheel of performance. The soul breathes in rest.”' },
      { id: 'b2', namePt: 'Sombra Suave', nameEn: 'Twilight Canopy', xp: 90, cx: 151, cy: 30, poemPt: '“Sem métricas, sem tarefas pendentes. O silêncio hoje é seu melhor amigo.”', poemEn: '“No checklist, no pending logs. Stillness is your absolute friend today.”' },
      { id: 'b3', namePt: 'Evolução Doce', nameEn: 'Sweet Regeneration', xp: 220, cx: 250, cy: 65, poemPt: '“Bateria vital recarregando no seu próprio ritmo reconfortante.”', poemEn: '“Vital energy pools starting to replenish at your own gentle pace.”' }
    ],
    exercisesPt: [
      'Pausa meditativa com áudio ambiente de chuva e mantras calmos.',
      'Escreva sem limites sobre as pressões cotidianas para descarregar o ser.',
      'Contemplar o crescimento da planta do jardim sem o fardo de regras.'
    ],
    exercisesEn: [
      'Ambient meditation integrating soundscapes of storm and soft whispers.',
      'Cognitive Vent: type whatever demands feel heavy to purge. Zero logic constraint.',
      'Passive Garden monitoring to enjoy growth without active performance metrics.'
    ],
    gamificationGoalPt: 'Sem cobranças. Apenas estar presente no aplicativo rende sementes aromáticas.',
    gamificationGoalEn: 'No strict milestones. Your simple resting presence triggers calming points.',
    recommendationsPt: [
      'Ative o Modo Rest para suavizar as luzes de fundo.',
      'Dedique alguns minutos apenas para escutar a voz guiada do Dr. Evaldo.',
      'Não se sinta culpado por não preencher todas as missões.'
    ],
    recommendationsEn: [
      'Activate Rest Screen overlays to quieten eye fatigue.',
      'Dedicate few minutes relaxing into custom-guided narration.',
      'Never feel obligated to satisfy daily missions. Leisure is the cure.'
    ]
  },
  idoso: {
    id: 'idoso',
    labelPt: 'Acessibilidade Idoso 👵👴',
    labelEn: 'Enlarged Senior Display 👵👴',
    badge: 'Senior Easy',
    colorPalette: {
      bg: '#0F1210',
      card: '#19201B',
      accent: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.3)',
      text: '#F5F5EC'
    },
    typography: {
      fontSize: '110%',
      letterSpacing: '0.04em',
      lineHeight: '1.8',
      fontWeight: '600'
    },
    animationMode: 'slow',
    tonePt: 'Respeitoso, afetuoso, simples, com comandos fáceis e botões grandes.',
    toneEn: 'Dignified, warm, simple, leveraging large visual actions.',
    journeyNamePt: 'Caminho das Recordações Sábias',
    journeyNameEn: 'Horizon of Shared Wisdom',
    journeyStars: [
      { id: 'i1', namePt: 'Passo Firme', nameEn: 'Steady Step', xp: 10, cx: 60, cy: 45, poemPt: '“A sabedoria do ser reside na caminhada compassiva. Siga em paz.”', poemEn: '“Your life wisdom shines in gentle deliberate updates. Walk on peacefully.”' },
      { id: 'i2', namePt: 'Raízes Fortes', nameEn: 'Deep Rooted Wisdom', xp: 100, cx: 160, cy: 55, poemPt: '“Como uma árvore centenária, sua presença acalma o vento ao redor.”', poemEn: '“Like a master botanical specimen, your presence quietens the gale.”' }
    ],
    exercisesPt: [
      'Gravação de reflexão por áudio (comunicação preferencial por voz).',
      'Leitura de poemas terapêuticos com tamanho de fonte ampliado do Dr. Evaldo.',
      'Sopro de relaxamento estimulado por instruções faladas.'
    ],
    exercisesEn: [
      'Record micro-audios describing today\'s sensations (prefer voice updates).',
      'Read comforting poetic suggestions with bold display layout rules.',
      'Guided somatic recovery with clear verbal prompts rather than fast timers.'
    ],
    gamificationGoalPt: 'Celebre momentos de introspecção e ganhe belas flores digitais no Jardim.',
    gamificationGoalEn: 'Incorporate peaceful memories to trigger beautiful, distinct flowers.',
    recommendationsPt: [
      'Prefira realizar comandos utilizando o microfone e comandos de voz.',
      'Use o leitor interno para ouvir as revelações e poesias em áudio.',
      'Aproveite as letras grandes para ler com total conforto visual.'
    ],
    recommendationsEn: [
      'Choose voice control elements over tiny keyboard entries.',
      'Use narration triggers to listen to poetic lessons.',
      'Enjoy the comfort of big fonts and high contrast targets.'
    ]
  },
  adolescente: {
    id: 'adolescente',
    labelPt: 'Expressão Jovem 🪐',
    labelEn: 'Teens Cyber Horizon 🪐',
    badge: 'Teen Expression',
    colorPalette: {
      bg: '#050B0D',
      card: '#0D161A',
      accent: '#8B5CF6',
      glow: 'rgba(139, 92, 246, 0.5)',
      text: '#F0F9FF'
    },
    typography: {
      fontSize: '100%',
      letterSpacing: '0.015em',
      lineHeight: '1.6',
      fontWeight: '400'
    },
    animationMode: 'normal',
    tonePt: 'Empático, conectado, dinâmico, moderno e focado na livre expressão.',
    toneEn: 'Empathetic, authentic, creative, styled for open expression.',
    journeyNamePt: 'Navegação da Expressão Livre',
    journeyNameEn: 'Cyber Compass Pathway',
    journeyStars: [
      { id: 'ad1', namePt: 'Rótulo Zero', nameEn: 'No Labels', xp: 10, cx: 40, cy: 40, poemPt: '“Nenhum padrão externo te define aqui. Você é livre para apenas soar.”', poemEn: '“No external code defines who you are. You are free to just resonate.”' },
      { id: 'ad2', namePt: 'Eco Autêntico', nameEn: 'True Resonance', xp: 90, cx: 140, cy: 60, poemPt: '“Segurança para descarregar o caos sem medo de sermões ou julgamentos.”', poemEn: '“Constructive venting without rules, preachiness, or social pressure.”' }
    ],
    exercisesPt: [
      'Mural de Expressão Livre: desabafe utilizando palavras-chave e sentimentos.',
      'Crie um avatar de ressonância e sintonize com cores expressivas.',
      'Sopro Cyber: inspire com luzes pulsantes de cor neon.'
    ],
    exercisesEn: [
      'Cyber Vent Hub: throw random texts containing emotional waves.',
      'Sync a personalized resonance avatar inside your profile setup.',
      'Cyber Breath loop powered by dynamic neon stardust grids.'
    ],
    gamificationGoalPt: 'Desbloqueie insígnias descoladas para decorar o seu Diário.',
    gamificationGoalEn: 'Unlock stylish visual badges to personalize your Diary log card.',
    recommendationsPt: [
      'Troque de avatar sempre que seu sentimento encontrar novas cores.',
      'Desabafe sobre as cobranças no Chat com retorno super tolerante da IA.',
      'Ancore as lições mais legais do Dr. Evaldo no seu Refúgio.'
    ],
    recommendationsEn: [
      'Change profile visual tokens to map changes in inner resonance.',
      'Vent about peer pressure safely with deeply non-judgmental AI feedback.',
      'Stash outstanding poetic verses inside your permanent sanctuary portfolio.'
    ]
  },
  luto: {
    id: 'luto',
    labelPt: 'Acolhimento Luto 🌹',
    labelEn: 'Grief Gentle Solace 🌹',
    badge: 'Gentle Solace',
    colorPalette: {
      bg: '#0F0E13',
      card: '#16151E',
      accent: '#EC4899',
      glow: 'rgba(236, 72, 153, 0.25)',
      text: '#F5F5FA'
    },
    typography: {
      fontSize: '100%',
      letterSpacing: '0.03em',
      lineHeight: '1.7',
      fontWeight: '400'
    },
    animationMode: 'slow',
    tonePt: 'Compassivo, afetuoso, focado na memória afetiva segura, sem pressa para cicatrizar.',
    toneEn: 'Compassionate, silent-honoring, focusing on precious memories.',
    journeyNamePt: 'Oceano de Amor e Memória',
    journeyNameEn: 'Grief Gentle Oceans Solace',
    journeyStars: [
      { id: 'l1', namePt: 'Lembrança Doce', nameEn: 'Faded Splendor', xp: 10, cx: 50, cy: 50, poemPt: '“A saudade é o amor que não pode ser entregue em mãos. Ele repousa aqui.”', poemEn: '“Memory is the fragrance of love that has no physical home. It rests here.”' },
      { id: 'l2', namePt: 'Mar de Rosas', nameEn: 'Solace Waves', xp: 120, cx: 160, cy: 35, poemPt: '“A dor diminui mas o laço afetivo vive brilhando no topo do sutil.”', poemEn: '“Pain subsides slowly but the warm attachment shines forever in the peak.”' }
    ],
    exercisesPt: [
      'Diário do Encontro Espiritual: escreva cartas de amor e memórias para desabafar.',
      'Respiração guiada com pausas estendidas para momentos de choro ou descarga somática.',
      'Plante sementes de saudosa homenagem no seu Jardim de Relembrar.'
    ],
    exercisesEn: [
      'Solace Lettering: write letters of remembrance to dissolve deep attachment.',
      'Calming ocean-pacing breath loops with extended pauses for complete chest release.',
      'Grow beautiful custom memorial shrubs in your Jardim de Relembrar.'
    ],
    gamificationGoalPt: 'Resgate sementes raras e cultive flores brancas de paz no Jardim.',
    gamificationGoalEn: 'Incorporate soothing memories to plant pristine white peace-lilies.',
    recommendationsPt: [
      'Não se apresse nas respostas; tire o tempo que for necessário para chorar e respirar.',
      'Sintonize o som ambiente de chuva mansa para relaxar os canais corticais.',
      'Utilize o diário poético para arquivar lembranças doces e momentos inestimáveis.'
    ],
    recommendationsEn: [
      'Take all time needed with the assistant; silence is a healthy part of the loop.',
      'Play gentle, non-clinical rainy soundscapes within the Settings pane.',
      'Use the diary to document the finest remnants of outstanding bonds.'
    ]
  },
  cristao: {
    id: 'cristao',
    labelPt: 'Fé Contemplativa ⛪',
    labelEn: 'Christian Faith Contemplative ⛪',
    badge: 'Spiritual',
    colorPalette: {
      bg: '#080912',
      card: '#0F1221',
      accent: '#D97706',
      glow: 'rgba(217, 119, 6, 0.35)',
      text: '#F8FAF5'
    },
    typography: {
      fontSize: '100%',
      letterSpacing: '0.025em',
      lineHeight: '1.7',
      fontWeight: '500'
    },
    animationMode: 'normal',
    tonePt: 'Inspirador, bíblico-poético, repleto de termos sobre fé, graça, oração e amor divino.',
    toneEn: 'Devotional, spiritually uplifting, centered on divine grace, faith, and prayer.',
    journeyNamePt: 'Caminho de Sintonia da Alma e Graça',
    journeyNameEn: 'Sovereign Contemplative Pathway',
    journeyStars: [
      { id: 'c1', namePt: 'Altar da Quietude', nameEn: 'Sovereign Altar', xp: 15, cx: 45, cy: 40, poemPt: '“Acalmai-vos e sabei que a graça divina guia vossos passos neste deserto.”', poemEn: '“Be still and witness that divine grace guides your steps through this path.”' },
      { id: 'c2', namePt: 'Oração Sutil', nameEn: 'Devout Alignment', xp: 110, cx: 130, cy: 60, poemPt: '“A oração sutil no silêncio é o laço mais forte que conecta a terra aos céus.”', poemEn: '“Sincere prayer in the quietude connects the fragile earth to highest heavens.”' }
    ],
    exercisesPt: [
      'Diário da Oração Secreta: escreva suas súplicas, agradecimentos e reflexões espirituavas.',
      'Respiração inspirada em salmos de acalento e contemplação interior.',
      'Sintonização das bênçãos do dia: liste 3 motivos pelos quais você é profundamente grato.'
    ],
    exercisesEn: [
      'Devotional Journaling: draft your secret prayers, petitions, and praises securely.',
      'Somatic breath loop inspired by quiet psalms of absolute peace.',
      'Gratitude Inventory: register 3 specific blessings you received today.'
    ],
    gamificationGoalPt: 'Cultive o Jardim de Boas Obras acumulando sementes de fé cristã.',
    gamificationGoalEn: 'Gather seeds of deep faith to nourish the garden of good deeds.',
    recommendationsPt: [
      'Contemple passagens poéticas do Dr. Evaldo associadas a conforto espiritual.',
      'Use o Sopro Coerente como uma forma de silenciar e escutar a voz de Deus.',
      'Sente-se confortavelmente e sintonize luzes suaves inspiradas em vitrais sagrados.'
    ],
    recommendationsEn: [
      'Incorporate beautiful biblical-poetic metaphors in your conversations.',
      'Leverage silence during coherent breathing as prayerful stillness.',
      'Configure ambient overlays that mimic divine amber catedral lights.'
    ]
  }
};

// Firestore Profile Connector & Sync Manager hook
export function useNeuroProfileManager(userId?: string) {
  const [profile, setProfile] = React.useState<UserNeuroProfile | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  const fetchProfile = async (uid: string) => {
    if (!uid) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'user_neuro_profile', uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setProfile({ id: snapshot.id, ...snapshot.data() } as UserNeuroProfile);
      } else {
        // Initialize a new default structure
        const defaultProfile: UserNeuroProfile = {
          userId: uid,
          neuroType: 'normal',
          adaptations: {
            themeColor: '#14B8A6',
            fontSize: 'medium',
            animationSpeed: 'normal',
            languageTone: 'poetic',
            focusModePriority: false
          },
          preferredLanguage: 'pt',
          accessibilityLevel: 'standard',
          currentJourney: neuroProfiles.normal.journeyNamePt,
          currentLevel: 1,
          lastInteraction: new Date().toISOString(),
          evolutionHistory: []
        };
        await setDoc(docRef, defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error('Error fetching/setting neuro profile in Firestore: ', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (uid: string, updates: Partial<UserNeuroProfile>) => {
    if (!uid) return;
    try {
      const docRef = doc(db, 'user_neuro_profile', uid);
      await updateDoc(docRef, updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating neuro profile: ', err);
    }
  };

  const addEvolutionLog = async (uid: string, pointsGained: number, activity: string, alignmentPercent: number) => {
    if (!uid || !profile) return;
    const history = [...(profile.evolutionHistory || [])];
    history.push({
      date: new Date().toISOString(),
      pointsGained,
      activity,
      alignmentPercent
    });
    // Keep it trimmed to prevent document bloat
    if (history.length > 20) history.shift();
    await updateProfile(uid, {
      evolutionHistory: history,
      lastInteraction: new Date().toISOString()
    });
  };

  React.useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId]);

  return {
    profile,
    loading,
    updateProfile,
    addEvolutionLog,
    reloadProfile: () => userId && fetchProfile(userId)
  };
}
