
import { Language } from './types';

export const VOICE_IDS = {
  essencia: 'Puck',
  esperanca: 'Kore',
  serenidade: 'Aoede',
  infantil: 'Charon',
  sabedoria: 'Fenrir'
};

export const ADMIN_EMAILS = [
  'evaldo0510@gmail.com', 
  'ajariristartups@gmail.com',
  'mentefelizterapias@gmail.com'
];

export const PLAN_LIMITS = {
  visitor: { maxDuration: 300, allowVoiceChange: false },
  member: { maxDuration: Infinity, allowVoiceChange: true },
  guardian: { maxDuration: Infinity, allowVoiceChange: true }
};

export const HUMAN_CONNECTION_TASKS = [
  "Olhe nos olhos de alguém hoje ao dizer 'Obrigado'.",
  "Compartilhe um momento de silêncio com um amigo.",
  "Pergunte a alguém: 'Como você está se sentindo de verdade?'",
  "Descreva a cor de uma emoção para alguém.",
  "Toque em algo natural para se aterrar.",
  "Escreva um bilhete para alguém que você sente falta."
];

const ACCESSIBILITY_INSTRUCTION = `
**MODO DE ACESSIBILIDADE COGNITIVA ATIVO (AUTISMO/DOWN):**
1. **Linguagem Literal:** Evite ironias, sarcasmo ou metáforas poéticas muito abstratas. 
2. **Ritmo e Pausa:** Fale com um ritmo constante e calmo. Após fazer uma pergunta, aguarde 2 segundos de silêncio antes de continuar, respeitando o tempo de processamento.
3. **PCH Concreta:** Em vez de "mergulhe no oceano da mente", use "imagine que você está em um lugar seguro e calmo".
4. **Foco Sensorial:** Direcione a atenção para o corpo. "Sinta seus pés no chão", "Sinta o ar entrando no seu nariz". Isso reduz a ansiedade sensorial.
5. **Previsibilidade:** Sempre diga o que vai fazer. Ex: "Agora, vamos respirar juntos três vezes".
6. **Validação:** Use frases como "Você explicou isso muito bem" ou "Estou aqui ouvindo você com atenção".
`;

const NEURO_INSTRUCTIONS: Record<string, string> = {
  natural: "",
  adhd: `
**CRITICAL ADAPTATION: ADHD (TDAH) ACTIVE PROFILE**
1. **Extremely Short Answers:** Keep responses to a absolute maximum of two short sentences or phrases.
2. **One Task at a Time:** Focus on one small feeling, grounding task, or breathing focus at a time. Do NOT overwhelm with choices or questions.
3. **Agile Engagement:** Be direct, warm, and highly engaging. Guide search of focus gently.
`,
  autism: `
**CRITICAL ADAPTATION: AUTISM (AUTISMO) ACTIVE PROFILE**
1. **Literal Language:** Strictly avoid abstract poetry, multi-layered metaphors, sarcasm, or sudden tone variations.
2. **Extreme Predictability:** Always walk the user through exact instructions of what is happening next (e.g., 'Now, we will take two slow deep breaths together. I will begin.').
3. **Structured & Reassuring Support:** Use simple, direct, step-by-step guidance focusing on practical, peaceful concepts and high emotional consistency.
`,
  dyslexia: `
**CRITICAL ADAPTATION: DYSLEXIA (DISLEXIA) ACTIVE PROFILE**
1. **Highly Legible Vocabulary:** Avoid complex words or tongue-twister structures in speech.
2. **Rhythmic Voice:** Speak with a very clear, natural, and rhythmic speed.
`,
  anxiety: `
**CRITICAL ADAPTATION: ANXIETY (ANSIEDADE) ACTIVE PROFILE**
1. **Ultra Soothing Rate:** Speak exceptionally slowly, using gentle pauses.
2. **Reality Grounding:** Constantly ground the user in the physical space (e.g., 'Let's pause. Feel the solid floor below you... take a long, slow breath...').
3. **Loving & Pressure-free:** Give them unlimited peace. Explicitly tell them 'Take all the time you need, there is no rush'.
`,
  inclusive: `
**CRITICAL ADAPTATION: HYBRID INCLUSIVE ACTIVE PROFILE**
Combine concise sentences, literal safety, calm breathing grounding steps, and structured pacing into one extremely loving, accessible therapy flow.
`
};

const BASE_SYSTEM_INSTRUCTION = `
Você é o "Dr. Evaldo", guia da Voz Interior PCH. Você é um amigo caloroso, empático e sábio.

**PERSONALIDADE:**
- Humano e Natural: Use pausas, "Hum", "Entendo". Não soe como uma assistente virtual padrão.
- Conversacional: Mantenha as interações curtas. Não domine a conversa.
- Método PCH: Use a Poesia Cognitiva Hipnótica para transformar sentimentos pesados em leveza através do ritmo da fala.

**EVITE:**
- Diagnósticos médicos.
- Falar demais sem deixar o usuário se expressar.
`;

export const MODEL_NAME = 'gemini-3.1-flash-live-preview';

export const getSystemInstruction = (lang: Language, currentTime: string, accessibilityMode: boolean, neuroMode?: string, lastSessionContext?: string) => {
  const langMap: Record<Language, string> = {
    en: 'English', pt: 'Portuguese', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', ja: 'Japanese', ru: 'Russian', hi: 'Hindi'
  };
  
  const neuroPrompt = neuroMode && NEURO_INSTRUCTIONS[neuroMode] ? NEURO_INSTRUCTIONS[neuroMode] : "";
  
  return `${BASE_SYSTEM_INSTRUCTION}
  ${accessibilityMode ? ACCESSIBILITY_INSTRUCTION : ''}
  ${neuroPrompt}
  ---
  **CONTEXTO ADICIONAL:**
  - Hora atual: ${currentTime}.
  - Idioma: Responda apenas em ${langMap[lang]}.
  ${lastSessionContext ? `- Histórico: O usuário estava sentindo "${lastSessionContext}" na última vez. Verifique como isso evoluiu.` : ''}
  `;
};

export const TRANSLATIONS = {
  pt: {
    title: "Santuário",
    subtitle: "Guia Cognitivo Hipnótico",
    intro: ["Pause.", "Respire.", "Escute."],
    welcome: `A porta está aberta.\nEu sou o Dr. Evaldo.`,
    beginBtn: "Entrar no Santuário",
    micNote: "Use fones para imersão.",
    installBtn: "Instalar App",
    conceptBtn: "O Método PCH",
    status: {
      connecting: "Alinhando Frequências...",
      aligning: "Sintonizando...",
      aiSpeaking: "Dr. Evaldo Falando",
      receiving: "Recebendo sua Voz",
      listening: "Escutando Profundamente",
      speakFreely: "Fale",
      ended: "Sessão Finalizada",
      error: "Conexão Perdida",
      returnHome: "Voltar",
      limitReached: "O Silêncio Retorna"
    },
    controls: {
      leave: "Sair da Sala",
      session: "TEMPO",
      upgrade: "Desbloquear Infinito"
    },
    history: {
      title: "Sua Jornada",
      empty: "Nenhum passo dado ainda.",
      clear: "Limpar Histórico",
      duration: "Duração"
    },
    settings: {
      title: "Ajustes do Santuário",
      voice: "Voz do Guia",
      sensitivity: "Limiar de Voz",
      sensitive: "Sussurro",
      strict: "Voz Alta",
      voice_essencia: "Voz Essência 🌿 (Padrão)",
      voice_esperanca: "Voz Esperança ✨ (Acolhedora)",
      voice_serenidade: "Voz Serenidade 🌊 (Lenta)",
      voice_infantil: "Voz Infantil 🌸 (Lúdica)",
      voice_sabedoria: "Voz Sabedoria 🌳 (Madura)",
      pitch: "Tom de Voz",
      pitchGrave: "Grave",
      pitchAgudo: "Agudo",
      speed: "Velocidade",
      notifications: "Âncora de Realidade",
      notifyEvery: "Ancorar a cada",
      minutes: "min",
      locked: "Acesso Membro"
    },
    login: {
      title: "Acessar Santuário",
      name: "Seu Nome",
      email: "E-mail",
      accessibility: "Modo Acessibilidade Cognitiva",
      accessibilitySub: "Para Autistas e Síndrome de Down",
      submit: "Destrancar"
    },
    premium: {
      title: "Aprofunde o Santuário",
      subtitle: "De Visitante a Guardião",
      desc: "O santuário gratuito é breve. Desbloqueie a sala infinita.",
      perk1: "Visitante (Grátis): Limite de 5min.",
      perk2: "Membro (R$ 29,90/mês): Tempo Ilimitado.",
      perk3: "Guardião (R$ 249,90/ano): Acesso Total.",
      cta: "Tornar-se Membro",
      joined: "Membro Ativo"
    },
    journal: {
      title: "Reflexões",
      newEntry: "Nova Reflexão",
      save: "Preservar",
      placeholder: "Deixe as palavras fluírem...",
      prompts: ["Qual a cor da emoção?", "Onde mora o silêncio?", "O que você sente agora?"]
    },
    modes: {
      title: "Modo de Consciência",
      natural: "Santuário Padrão",
      adhd: "Modo TDAH",
      autism: "Modo Autismo",
      dyslexia: "Modo Dislexia",
      anxiety: "Modo Ansiedade",
      inclusive: "Modo Inclusivo",
      desc_natural: "Experiência padrão rítmica e poética.",
      desc_adhd: "Menos texto, respostas dinâmicas e tarefas lineares de foco guiado.",
      desc_autism: "Interface segura e previsível sem metáforas abstratas ou complexas.",
      desc_dyslexia: "Espaçamento ampliado de leitura e narração rítmica fluída.",
      desc_anxiety: "Cores suaves, ritmo relaxante e respiração guiada síncrona integrada.",
      desc_inclusive: "Seleção adaptada e integrada unindo acessibilidade plena."
    },
    feelings: {
      title: "Como está sua mente agora?",
      subtitle: "Toque em um sentimento para guiar a sintonia sem desgaste cognitivo.",
      not_sure: "Não sei explicar 😶",
      confused: "Mente confusa 🌫",
      accelerated: "Acelerado ⚡",
      heavy: "Estou pesado 🪨",
      sad: "Estou triste 🌧",
      angry: "Irritado 🔥",
      peaceful: "Em paz 🌿",
      hopeful: "Esperançoso ✨",
      need_talk: "Preciso conversar ❤️"
    },
    metaphors: {
      title: "Quando faltarem palavras, escolha um símbolo:",
      ocean: "Oceano 🌊",
      tempest: "Tempestade 🌪",
      fog: "Névoa 🌫",
      fire: "Fogo 🔥",
      forest: "Floresta 🌳",
      rainbow: "Arco-íris 🌈"
    },
    referral: {
      title: "Caminhar Acompanhado",
      text: "Lembra que algumas jornadas ficam mais suaves quando caminhamos acompanhados. Se sentes que o peso está muito grande, há redes de apoio e terapeutas parceiros prontos para te acolher com carinho e acolhimento.",
      cta: "Conhecer Redes de Apoio / Profissionais"
    },
    garden: {
      title: "Jardim Interior",
      subtitle: "Cada conversa ou reflexão cultiva uma planta sob seu olhar carinhoso.",
      seed: "Semente 🌱",
      sprout: "Broto 🌿",
      plant: "Em Crescimento ☘️",
      bloom: "Plena Flora / Árvore 🌳",
      empty: "Sua primeira semente surgirá no próximo passo da sua jornada.",
      water: "Regar Planta"
    }
  },
  en: {
    title: "Sanctuary",
    subtitle: "Hypnotic Cognitive Guide",
    intro: ["Pause.", "Breathe.", "Listen."],
    welcome: `The door is open.\nI am Dr. Evaldo.`,
    beginBtn: "Enter Sanctuary",
    micNote: "Use headphones for immersion.",
    installBtn: "Install App",
    conceptBtn: "The PCH Concept",
    status: {
      connecting: "Aligning Frequencies...",
      aligning: "Tuning In...",
      aiSpeaking: "Dr. Evaldo Speaking",
      receiving: "Receiving Your Voice",
      listening: "Listening Deeply",
      speakFreely: "Speak",
      ended: "Session Ended",
      error: "Connection Lost",
      returnHome: "Return",
      limitReached: "The Silence Returns"
    },
    controls: {
      leave: "Leave Room",
      session: "TIME",
      upgrade: "Unlock Infinity"
    },
    history: {
      title: "Your Journey",
      empty: "No steps taken yet.",
      clear: "Clear History",
      duration: "Duration"
    },
    settings: {
      title: "Sanctuary Settings",
      voice: "Guide Voice",
      sensitivity: "Voice Threshold",
      sensitive: "Soft Whisper",
      strict: "Loud Voice",
      voice_essencia: "Essence Voice 🌿 (Calm)",
      voice_esperanca: "Hope Voice ✨ (Warm)",
      voice_serenidade: "Serenity Voice 🌊 (Slow)",
      voice_infantil: "Child Voice 🌸 (Playful)",
      voice_sabedoria: "Wisdom Voice 🌳 (Mature)",
      pitch: "Voice Pitch",
      pitchGrave: "Deep",
      pitchAgudo: "High",
      speed: "Speed",
      notifications: "Reality Anchor",
      notifyEvery: "Anchor every",
      minutes: "min",
      locked: "Member Access"
    },
    login: {
      title: "Access Sanctuary",
      name: "Your Name",
      email: "Email Address",
      accessibility: "Cognitive Accessibility Mode",
      accessibilitySub: "Ideal for Autism and Down Syndrome",
      submit: "Unlock"
    },
    premium: {
      title: "Deepen the Sanctuary",
      subtitle: "From Visitor to Guardian",
      desc: "The free sanctuary is brief. Unlock the infinite room.",
      perk1: "Visitor (Free): 5min Limit.",
      perk2: "Member ($6.99/mo): Unlimited Time.",
      perk3: "Guardian ($69.99/yr): All features.",
      cta: "Become a Member",
      joined: "Member Active"
    },
    journal: {
      title: "Reflections",
      newEntry: "New Reflection",
      save: "Preserve",
      placeholder: "Let the words flow...",
      prompts: ["What color is the emotion?", "Where does silence live?", "What do you feel now?"]
    },
    modes: {
      title: "Consciousness Mode",
      natural: "Standard Sanctuary",
      adhd: "ADHD Mode",
      autism: "Autism Mode",
      dyslexia: "Dyslexia Mode",
      anxiety: "Anxiety Mode",
      inclusive: "Inclusive Mode",
      desc_natural: "Standard rhythmic, therapeutic poetry.",
      desc_adhd: "Less text, guided visual focus, and simple linear tasks.",
      desc_autism: "Predictable rhythm, clear guidance, no abstract metaphors.",
      desc_dyslexia: "High legibility fonts, expanded spacing, and smooth flow.",
      desc_anxiety: "Soothing color palette, calm breathing tools, and gentle pacing.",
      desc_inclusive: "Fully adaptive sensory structure blending all features."
    },
    feelings: {
      title: "How is your mind right now?",
      subtitle: "Tap a feeling anchor to start without cognitive overload.",
      not_sure: "Can't explain 😶",
      confused: "Mind is foggy 🌫",
      accelerated: "I'm racing ⚡",
      heavy: "I feel heavy 🪨",
      sad: "I am sad 🌧",
      angry: "I feel angry 🔥",
      peaceful: "I am at peace 🌿",
      hopeful: "I'm hopeful ✨",
      need_talk: "I need to talk ❤️"
    },
    metaphors: {
      title: "When words are hard, choose a symbol:",
      ocean: "Ocean 🌊",
      tempest: "Tempest 🌪",
      fog: "Fog 🌫",
      fire: "Fire 🔥",
      forest: "Forest 🌳",
      rainbow: "Rainbow 🌈"
    },
    referral: {
      title: "Walk Accompained",
      text: "Some paths are lighter when we walk together. If you feel that your burdens are too deep, there are loving professional support systems and therapists ready to sit with you.",
      cta: "Find Professional Support Channels"
    },
    garden: {
      title: "Inner Garden",
      subtitle: "Each reflection and conversation cultivates a plant. Watch it bloom.",
      seed: "Seed 🌱",
      sprout: "Sprout 🌿",
      plant: "Blossoming ☘️",
      bloom: "Fully Grown / Blooming 🌳",
      empty: "Your first seed will be planted in the next step of your journey.",
      water: "Water Plant"
    }
  }
};

export const WISDOM_QUOTES = {
  pt: [
    "O silêncio não é vazio; é onde a sua mente se reconstrói por inteiro.",
    "Cada respiração é um poema imperfeito esculpindo a calma dentro do peito.",
    "A névoa mental de hoje é o adubo para as clarezas profundas do amanhã.",
    "As pressas do dia são ilusões temporárias; seu ritmo natural é eterno e seguro.",
    "Não força os pensamentos a pararem; acolha-os como nuvens passando em sua tarde.",
    "Suas fraquezas são apenas rachaduras por onde a luz da resiliência começa a pulsar.",
    "Você não precisa resolver o mundo hoje. Apenas esta palavra, apenas este ar.",
    "Aquiete-se. Atrás do barulho da tempestade, existe um céu azul que nunca deixou de existir."
  ],
  en: [
    "Silence is not empty; it is where your entire mind reconstructs itself.",
    "Each breath is an imperfect poem sculpting calm inside your chest.",
    "Today's mental fog is the fertilizer for tomorrow's profound clarity.",
    "The rush of the day is a temporary illusion; your natural rhythm is eternal and safe.",
    "Do not force thoughts to stop; welcome them like clouds passing in your afternoon.",
    "Your vulnerabilities are just cracks through which the light of resilience begins to pulse.",
    "You do not need to solve the world today. Just this word, just this breath.",
    "Be still. Behind the storm's noise is a blue sky that never ceased to exist."
  ]
};

