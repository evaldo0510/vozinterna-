
import { Language } from './types';

export const VOICE_IDS = {
  male: 'Puck',
  female: 'Kore'
};

export const ADMIN_EMAILS = [
  'evaldo0510@gmail.com', 
  'ajariristartups@gmail.com'
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

export const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';

export const getSystemInstruction = (lang: Language, currentTime: string, accessibilityMode: boolean, lastSessionContext?: string) => {
  const langMap: Record<Language, string> = {
    en: 'English', pt: 'Portuguese', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', ja: 'Japanese', ru: 'Russian', hi: 'Hindi'
  };
  
  return `${BASE_SYSTEM_INSTRUCTION}
  ${accessibilityMode ? ACCESSIBILITY_INSTRUCTION : ''}
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
      male: "Masculina (Puck)",
      female: "Feminina (Kore)",
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
      male: "Male (Puck)",
      female: "Female (Kore)",
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
    }
  }
};
