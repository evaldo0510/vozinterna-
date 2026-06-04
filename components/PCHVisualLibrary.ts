export interface VisualScene {
  id: string;
  title: string;
  titleEn: string;
  prompt: string;
  gradient: string[]; // tailwind color classes or hex strings
  icon: string;
  elements: string[];
}

export interface VisualCategory {
  id: string;
  name: string;
  nameEn: string;
  scenes: VisualScene[];
}

export const PCH_VISUAL_LIBRARY: VisualCategory[] = [
  {
    id: "breathing",
    name: "Respiração",
    nameEn: "Breathing",
    scenes: Array.from({ length: 20 }, (_, i) => ({
      id: `breathing_${i + 1}`,
      title: [
        "Sopro da Noite", "Pulsação das Ondas", "Respiro Celeste", "Ciclo da Névoa", "Vento nas Colinas",
        "Ar do Pinhal", "Onda Azulada", "Expansão da Luz", "Sinfonia do Peito", "Sopro de Cristal",
        "Maré Serena", "Vácuo das Estrelas", "Ar da Alvorada", "Pulso Terapêutico", "Sopro no Lago",
        "Suspiro Sagrado", "Oxigênio Dourado", "Ciclo das Flores", "Vento Teleguiado", "Pulso de Bambu"
      ][i],
      titleEn: [
        "Night Whisper", "Wave Pulse", "Heavenly Breath", "Mist Cycle", "Wind on Hills",
        "Pine Forest Air", "Azure Overwave", "Expansion of Light", "Chest Symphony", "Crystal Breathe",
        "Serene Tide", "Star Void", "Dawn Refresh", "Therapeutic Pulse", "Lakeside Air",
        "Sacred Sigh", "Golden Oxygen", "Floral Breath", "Guided Breezes", "Bamboo Pulse"
      ][i],
      prompt: [
        "Um sopro suave de névoa flutuando sobre uma clareira silenciosa com raios de sol suaves.",
        "Ondas circulares concêntricas propagando-se em um lago azul profundo e calmo.",
        "Uma nuvem translúcida se expandindo e contraindo ritmicamente sob o céu estrelado.",
        "Partículas de luz suspensas flutuando suavemente em um espaço geométrico azul marinho.",
        "Folhas verdes flutuando sobre uma brisa suave que corta montanhas distantes sem pressa.",
        "Um pinheiro solitário envolto em uma brisa fresca da manhã com luz tênue.",
        "Ondulações delicadas e contínuas em tons de ciano pastel transmitindo cura e paz.",
        "Um feixe de luz âmbar suave se expandindo suavemente em meio a uma névoa pacífica.",
        "Uma pulsação azul-esverdeada suave lembrando batimentos lentos e compassados.",
        "Cristais translúcidos refletindo um arco-íris suave que se expande compassadamente.",
        "A maré recuando suavemente sobre a areia úmida e fofa ao pôr do sol.",
        "Um cosmos tranquilo em tons violeta que se contrai e expande em ritmo meditativo.",
        "O céu mudando delicadamente de lavanda para dourado quente do amanhecer.",
        "Esferas abstratas esmeralda subindo lentamente em ritmo calmo e cadenciado.",
        "Uma folha caindo em câmera lenta encostando na superfície líquida gerando círculos.",
        "Um feixe de luz que desce suavemente das nuvens em direção a um campo tranquilo.",
        "Partículas de ouro pairando no ar ao redor de uma fogueira que se apaga calmamente.",
        "Pétalas de flor de lótus se abrindo em ciclos lentos e contínuos.",
        "Linhas cinéticas suaves desenhando trajetórias curvas e calmas no espaço.",
        "Hastes de bambu balançando levemente de um lado para o outro sob brisa leve."
      ][i],
      gradient: [
        ["from-teal-950 to-stone-950", "from-cyan-900 to-emerald-950"],
        ["from-blue-950 to-stone-900", "from-sky-900/80 to-teal-950"],
        ["from-purple-950 to-stone-950", "from-indigo-900 to-purple-950"],
        ["from-indigo-950 to-slate-950", "from-blue-900 to-stone-950"],
        ["from-emerald-950 to-stone-950", "from-teal-900 to-emerald-950"]
      ][i % 5],
      icon: "Wind",
      elements: ["sopro", "respiração", "movimento", "ondas", "ar", "pulso"]
    }))
  },
  {
    id: "hope",
    name: "Esperança",
    nameEn: "Hope",
    scenes: Array.from({ length: 20 }, (_, i) => ({
      id: `hope_${i + 1}`,
      title: [
        "Amanhecer Lilás", "Raio de Sol Suave", "Flor no Asfalto", "Farol Distante", "Horizonte Claro",
        "Primeiro Broto", "Céu de Transição", "Luz na Caverna", "Estrela da Manhã", "Orvalho Brilhante",
        "Caminho Iluminado", "Arco-íris Pálido", "Espelho d'Água", "Ninho no Galho", "Janela Entreaberta",
        "Constelação Guia", "Semente do Amanhã", "Esmaltado Solar", "Sopro de Alívio", "Cume Iluminado"
      ][i],
      titleEn: [
        "Lilac Dawn", "Soft Sunbeam", "Sprout on Stone", "Distant Beacon", "Clear Horizon",
        "First Sprout", "Transition Sky", "Light in Cave", "Morning Star", "Shining Dew",
        "Illuminated Path", "Pale Rainbow", "Water Mirror", "Branch Nest", "Half-Open Window",
        "Guiding Constellation", "Tomorrow's Seed", "Solar Enamel", "Sigh of Relief", "Gilded Summit"
      ][i],
      prompt: [
        "O céu se tingindo de rosa e lilás acima de montanhas escuras, sinalizando o novo dia.",
        "Um raio dourado de sol atravessando nuvens cinzentas e tocando o solo úmido.",
        "Uma pequena flor verde oliva brotando pacientemente entre frestas de pedras cinzas.",
        "A luz suave de um farol brilhando ritmicamente no horizonte marítimo calmo.",
        "Um horizonte infinito onde o mar escuro encontra um céu amarelo pastel e suave.",
        "Um pequeno broto carregando uma gota d'água brilhando sob a primeira luz.",
        "Nuvens se dissipando gradualmente revelando um céu azul translúcido e limpo.",
        "Uma chama pequena e constante iluminando as paredes de uma fresta rochosa escura.",
        "Uma única estrela brilhando com forte tom azulado no céu clareando da aurora.",
        "Gotas de orvalho matinal capturando os tons quentes de um sol que começa a nascer.",
        "Um caminho coberto de cascalhos claros que reflete uma luz celestial acolhedora.",
        "Um espectro de cores suaves e desbotadas cruzando um céu cinza úmido sem trovões.",
        "A superfície calma de uma lagoa refletindo perfeitamente o fim de uma tempestade.",
        "Um ninho delicado aquecido por feixes de luz mística sob ramos de carvalho seco.",
        "Uma nesga de sol que entra através de venezianas de madeira iluminando poeira áurea.",
        "Um aglomerado de estrelas que formam um traço delicado de esperança no céu noturno.",
        "Uma semente dourada enterrada emitindo uma aura suave de energia vital e calma.",
        "Uma superfície cerâmica esmaltada brilhando com reflexos quentes do sol da tarde.",
        "O contorno de uma montanha que exibe uma luz suave de esperança em seu topo.",
        "A crista de um monte que reluz sob os raios oblíquos e gentis de um sol protetor."
      ][i],
      gradient: [
        ["from-teal-900 to-indigo-950", "from-pink-900/30 to-teal-950"],
        ["from-amber-950 to-stone-950", "from-amber-900/40 to-stone-900"],
        ["from-emerald-950 to-stone-950", "from-emerald-900/30 to-teal-950"],
        ["from-violet-950 to-stone-950", "from-pink-950 to-indigo-950"],
        ["from-sky-950 to-stone-900", "from-cyan-900/40 to-stone-950"]
      ][i % 5],
      icon: "Sparkles",
      elements: ["esperança", "amanhecer", "luz", "farol", "sol", "horizonte"]
    }))
  },
  {
    id: "gratitude",
    name: "Gratidão",
    nameEn: "Gratitude",
    scenes: Array.from({ length: 20 }, (_, i) => ({
      id: `gratitude_${i + 1}`,
      title: [
        "Abraço de Sol", "Coração Quente", "Chuva de Ouro", "Colheita de Paz", "Lar Acolhedor",
        "Mãos Estendidas", "Chá de Ervas", "Campo Amarelo", "Lareira Mansa", "Agradecimento",
        "Sombra Amiga", "Oásis Seguro", "Presença Atenta", "Mel Protetor", "Altar Símbolo",
        "Trigo ao Vento", "Ninho Aquecido", "Olhar Fraterno", "Toque Suave", "Tenda de Algodão"
      ][i],
      titleEn: [
        "Sun Embrace", "Warm Heart", "Golden Rain", "Peace Harvest", "Warm Hearth",
        "Extended Hands", "Herbal Tea", "Yellow Meadow", "Calm Fireplace", "Thanksgiving",
        "Friendly Shadow", "Safe Oasis", "Mindful Presence", "Protective Honey", "Symbolic Altar",
        "Windy Wheat", "Warm Nest", "Fraternal Look", "Gentle Touch", "Cotton Tent"
      ][i],
      prompt: [
        "Uma luz dourada e extremamente difusa aquecendo um jardim arborizado de outono.",
        "O brilho sutil e confortador de uma vela dentro de um copo de vidro âmbar jateado.",
        "Faíscas douradas descendo devagar como uma cortina brilhante de pura gratidão.",
        "Um campo de cereais brilhando sob o sol poente com ventania morna e suave.",
        "Uma xícara fumegante emanando espirais lentas de vapor contra um fundo escuro.",
        "Duas mãos esculpidas em madeira clara segurando delicadamente uma pequena folha seca.",
        "Folhas de camomila e hortelã repousando no fundo de um bule de vidro transparente.",
        "Um planalto verdejante salpicado de pequenas flores amarelas que dançam ao vento.",
        "Brasas vermelhas pulsando calor em silêncio absoluto no centro de uma cabana.",
        "Um pergaminho antigo exibindo caligrafias suaves banhado em luz de fim de tarde.",
        "A copa de uma árvore centenária projetando sombras complexas e mansas no gramado.",
        "Um poço de água cristalina cercado por pedras arenosas mornas no deserto.",
        "Uma silhueta meditativa diante de um pôr do sol dourado e alaranjado em paz total.",
        "Mel escorrendo lentamente por uma colher de madeira, capturando o brilho do sol.",
        "Um pequeno arranjo de pedras empilhadas com perfeição à beira de um riacho calmo.",
        "Trigais maduros ondulando como ondas douradas sob um céu crepuscular limpo.",
        "Um ninho forrado com algodão e penas macias, abrigado em uma ramagem pacífica.",
        "A calidez do fogo sob as mãos de quem agradece em um plano simétrico.",
        "Um abraço implícito delineado por sombras curvas e luzes suaves de acolhimento.",
        "Uma cabana feita de tecidos leves que flutua suavemente sob o vento da montanha."
      ][i],
      gradient: [
        ["from-amber-950 to-stone-950", "from-yellow-900/40 to-stone-900"],
        ["from-rose-950 to-stone-950", "from-orange-950 to-stone-950"],
        ["from-emerald-950 to-zinc-950", "from-amber-950 to-stone-950"],
        ["from-stone-950 to-stone-900", "from-yellow-950 to-slate-950"],
        ["from-orange-950 to-stone-950", "from-amber-900 to-stone-950"]
      ][i % 5],
      icon: "Heart",
      elements: ["gratidão", "ouro", "abraço", "aconchego", "sol", "fogo"]
    }))
  },
  {
    id: "courage",
    name: "Coragem",
    nameEn: "Courage",
    scenes: Array.from({ length: 20 }, (_, i) => ({
      id: `courage_${i + 1}`,
      title: [
        "Montanha de Bronze", "Raiz Firme", "Chama Infinita", "Escudo Invisível", "Passo de Luz",
        "Voo Solitário", "Ancoragem", "Força Mansa", "Pedra Polida", "Amanhecer no Pico",
        "Caminho do Guerreiro", "Escalar", "Olhar Confiante", "Resiliência do Tronco", "Luz de Aço",
        "Roda do Vento", "Farol de Rocha", "Onda Rompe", "Ponte Estreita", "Chama de Velas"
      ][i],
      titleEn: [
        "Bronze Mountain", "Firm Root", "Endless Flame", "Hidden Shield", "Step of Light",
        "Solo Flight", "Anchor", "Calm Strength", "Polished Stone", "Peak Dawn",
        "Warrior's Path", "The Climb", "Confident Vision", "Trunk Resilience", "Steel Light",
        "Wind Wheel", "Rock Beacon", "Breaking Wave", "Narrow Bridge", "Candle Core"
      ][i],
      prompt: [
        "Uma imensa montanha de pedra maciça iluminada por um sol vermelho poente de outono.",
        "Raízes grossas e profundas de uma velha figueira agarradas firmemente à terra marrom.",
        "Um candeeiro de ferro antigo com uma chama vermelha e pulsante resistindo ao vento.",
        "Uma névoa cobrindo uma colina escarpada que se abre diante de uma luz guia.",
        "Um rastro de pegadas luminosas cruzando um terreno rochoso e árido em segurança.",
        "Um falcão majestoso plainando com asas abertas sobre nuvens cinzentas e calmas.",
        "Uma âncora pesada de bronze descansando silenciosamente entre conchas no fundo azul do mar.",
        "Uma cachoeira que flui constante e com força calma sobre rochas cinza-escuras.",
        "Uma rocha perfeitamente lisa e polida brilhando sob a incidência de luz matinal.",
        "O nascer do sol visto do topo de uma montanha, iluminando a névoa abaixo em paz.",
        "Uma clareira onde o vento forte verga as árvores, mas nenhuma cai devido à flexibilidade.",
        "Uma corda firme amarrada a uma estaca forte nos limites de um desfiladeiro seguro.",
        "Um feixe de luz azul-aço que corta a escuridão da tempestade de forma contundente.",
        "Um tronco que resiste pacientemente ao inverno, guardando a primavera em seu cerne.",
        "Um ponto focal luminoso que atrai e estabiliza quem se aproxima com serenidade.",
        "Um moinho antigo de pedra cujas pás giram devagar contra o vento impetuoso.",
        "Um farol construído sobre um penhasco rústico, banhado por spray de água do mar.",
        "Uma barreira natural de pedregulhos que filtra suavemente as ondas bravias do oceano.",
        "Uma ponte de pedra sólida cruzando um abismo sob a luz da lua cheia.",
        "Várias velas acesas cujas pequenas chamas se unem criando um foco denso de luz."
      ][i],
      gradient: [
        ["from-amber-950 to-stone-950", "from-orange-950 to-stone-950"],
        ["from-blue-950 to-stone-950", "from-slate-900 to-indigo-950"],
        ["from-indigo-950 to-stone-950", "from-violet-900/40 to-stone-950"],
        ["from-stone-900 to-stone-950", "from-amber-950 to-stone-900"],
        ["from-emerald-950 to-slate-950", "from-teal-950 to-stone-950"]
      ][i % 5],
      icon: "Shield",
      elements: ["coragem", "montanha", "raiz", "chama", "força", "âncora"]
    }))
  },
  {
    id: "new-beginnings",
    name: "Recomeço",
    nameEn: "New Beginnings",
    scenes: Array.from({ length: 20 }, (_, i) => ({
      id: `recomeco_${i + 1}`,
      title: [
        "Primeira Folha", "Casulo Aberto", "Orvalho de Luz", "Rio Renovado", "Página em Branco",
        "Semente Rompendo", "Nuvem Passageira", "Passos na Areia", "Clareira Verde", "Desgelo Suave",
        "Novo Horizonte", "Casca Antiga", "Pássaro Parte", "Nascimento do Dia", "Rastro de Água",
        "Sombra Recua", "Brotar do Zero", "Caminho Reaberto", "Solo Fértil", "Brisa que Cura"
      ][i],
      titleEn: [
        "First Leaf", "Open Cocoon", "Light Dew", "Renewed River", "Blank Page",
        "Sprouting Seed", "Passing Cloud", "Sand Steps", "Green Clearing", "Soft Thaw",
        "New Horizon", "Old Bark", "Bird Departs", "Day Birth", "Water Trail",
        "Receding Shadow", "Zero Sprout", "Reopened Trail", "Fertile Soil", "Healing Breeze"
      ][i],
      prompt: [
        "Um raminho verde com apenas uma folha abrindo-se sob a luz suave de cura.",
        "Um casulo de seda translúcido vazio balançando levemente em um galho de macieira.",
        "Gotas brilhantes de orvalho escorrendo suavemente por uma pétala de rosa branca.",
        "A nascente de um pequeno riacho de águas límpidas abrindo caminho entre cascalhos.",
        "Um livro aberto com folhas de papel artesanal texturizadas sob luz morna.",
        "Uma semente que rompe a terra escura com um broto esmeralda cheio de vigência.",
        "Uma nuvem de chuva escura se movendo para longe, revelando um sol acolhedor.",
        "Uma fileira de passos marcados em areia fina, que caminham em direção ao mar manso.",
        "Uma clareira verde e ensolarada no coração de uma selva densa e milenar.",
        "Gelo derretendo muito devagar em uma encosta rochosa, alimentando flores de inverno.",
        "O sol surgindo tímido por trás das colinas, trazendo a promessa de um recomeço.",
        "Um tronco de árvore descascando naturalmente para revelar uma madeira nova e saudável.",
        "Um jovem pássaro alçando voo a partir de um ninho seguro em direção ao infinito.",
        "O céu se iluminando em degradê ciano e dourado no início de uma manhã promissora.",
        "Um arco de água limpa que irriga de forma mansa um canteiro de ervas aromáticas.",
        "Uma sombra rochosa que diminui à medida que o sol do meio-dia sobe no firmamento.",
        "Pequenas mudas verdes enfileiradas de forma organizada em uma estufa de vidro.",
        "Uma antiga trilha na floresta que é limpa das folhas secas pelo vento fresco.",
        "Terra preta úmida e fofa pronta para acolher novas semeaduras sob luz amena.",
        "Uma brisa fresca que varre a poeira e traz um aroma relaxante de terra molhada."
      ][i],
      gradient: [
        ["from-emerald-950 to-stone-950", "from-teal-900/30 to-stone-950"],
        ["from-sky-950 to-zinc-950", "from-cyan-900/40 to-stone-950"],
        ["from-stone-950 to-indigo-950", "from-purple-950 to-stone-950"],
        ["from-teal-950 to-stone-900", "from-emerald-900 to-stone-950"],
        ["from-amber-950 to-stone-950", "from-emerald-950 to-stone-950"]
      ][i % 5],
      icon: "RefreshCw",
      elements: ["recomeço", "broto", "rio", "horizonte", "claridade", "página"]
    }))
  },
  {
    id: "forgiveness",
    name: "Perdão",
    nameEn: "Forgiveness",
    scenes: Array.from({ length: 20 }, (_, i) => ({
      id: `perdao_${i + 1}`,
      title: [
        "Coração de Algodão", "Lago de Vidro", "Bálsamo Suave", "Pedra Solta", "Fio que Desata",
        "Nuvem de Penas", "Chuva de Lavanda", "Sorriso da Alma", "Mar Manso", "Luz Integradora",
        "Aperto de Mão", "Espaço Livre", "Gota de Orvalho", "Sopro de Paz", "Cicatriz Dourada",
        "Abraço no Tempo", "Véu que Cai", "Vela no Altar", "Caminho Limpo", "Flor do Perdão"
      ][i],
      titleEn: [
        "Cotton Heart", "Glass Lake", "Soothing Balm", "Loose Stone", "Untying Thread",
        "Feather Cloud", "Lavender Rain", "Soul Smile", "Calm Shore", "Integrating Light",
        "Handshake", "Free Space", "Dew Drop", "Puff of Calm", "Golden Scar",
        "Abbrace in Time", "Falling Veil", "Altar Candle", "Clear Footpath", "Forgiveness Bloom"
      ][i],
      prompt: [
        "Uma textura fofa e suave semelhante à nuvem ou algodão flutuando sob tons rosados.",
        "A superfície absolutamente imóvel e cristalina de um lago refletindo árvores mansas.",
        "Uma gota de óleo de lavanda misturando-se suavemente em águas termais claras.",
        "Uma pedra arredondada deslizando suavemente de um penhasco, trazendo alívio.",
        "Um nó de corda rústica que se desfaz e desliza de maneira livre e sem esforço.",
        "Pequenas plumas brancas flutuando em câmera lenta contra um fundo violeta profundo.",
        "Uma chuva fina de pétalas roxas de lavanda caindo sobre um gramado verde-escuro.",
        "Um campo aberto onde a luz do sol brilha amigável por trás de nuvens fofas.",
        "O mar recuando para lamber a praia deserta, lavando todas as velhas marcas.",
        "Um tom de luz avermelhado suavizado que unifica formas abstratas em perfeita paz.",
        "Duas mãos que se tocam de leve em um plano de fundo iluminado de forma espiritual.",
        "Um imenso céu limpo de cor pastel que transmite sensação de espaço e liberdade.",
        "Uma grande gota translúcida que escorre limpando uma folha de bananeira em paz.",
        "Um suspiro suave que desfaz espinhos secos, transformando-os em pétalas suaves.",
        "Uma racha no asfalto preenchida com ouro sutil, simulando a técnica Kintsugi.",
        "Um feixe duplo de luz que se cruza e se funde em uma aura dourada pacífica.",
        "Um véu fino e transparente sendo levado suavemente pelo vento para revelar a luz.",
        "Uma pequena chama de vela brilhando com calor e estabilidade no silêncio.",
        "Um caminho plano e arenoso totalmente desobstruído cercado por cercas vivas bonitas.",
        "Uma flor branca solitária desabrochando em um vaso de argila rústica sob sol morno."
      ][i],
      gradient: [
        ["from-rose-950 to-stone-950", "from-pink-900/40 to-stone-950"],
        ["from-sky-950 to-teal-950", "from-cyan-950 to-stone-950"],
        ["from-violet-950 to-slate-950", "from-purple-900/30 to-stone-950"],
        ["from-emerald-950 to-stone-950", "from-teal-900 to-emerald-950"],
        ["from-slate-900 to-stone-950", "from-stone-900 to-indigo-950"]
      ][i % 5],
      icon: "Heart",
      elements: ["perdão", "luz", "lago", "algodão", "libertação", "suavidade"]
    }))
  },
  {
    id: "faith",
    name: "Fé",
    nameEn: "Faith",
    scenes: Array.from({ length: 20 }, (_, i) => ({
      id: `fe_${i + 1}`,
      title: [
        "Templo do Vácuo", "Luz na Nevasca", "Segurança Invisível", "Olhar no Horizonte", "Vela Eterna",
        "Anjos de Luz", "Firmeza na Rocha", "Catedral da Selva", "Chama do Corretor", "Tenda Sagrada",
        "Raio Vertical", "Estrela d'Alva", "Constelação Amiga", "Santuário de Pedra", "Vento que Guia",
        "Restauração", "Confiança Plena", "Pombo no Céu", "Presença Silenciosa", "Fonte Inesgotável"
      ][i],
      titleEn: [
        "Void Temple", "Light in Blizzard", "Unseen Safety", "Horizon Gaze", "Eternal Lamp",
        "Light Angels", "Rock Firmness", "Jungle Cathedral", "Guiding Torch", "Sacred Tent",
        "Vertical Ray", "Star of Dawn", "Helper Constellation", "Stone Sanctuary", "Guiding Breeze",
        "Restoration", "Complete Trust", "Dove in Sky", "Silent Presence", "Endless Fountain"
      ][i],
      prompt: [
        "Um portal circular minimalista de pedra que emoldura um horizonte infinito iluminado.",
        "Uma lanterna pequena brilhando constante e forte na escuridão de uma tempestade.",
        "Uma ponte de luz invisível flutuando segura sobre um abismo de nuvens brancas.",
        "Um olhar que repousa no horizonte infinito onde o sol se põe com cores místicas.",
        "O fogo estável de uma tocha de metal fixada em uma parede rústica de arenito.",
        "Silhuetas angelicais abstratas formadas por feixes difusos de luz branca e azul.",
        "Um pedestal de granito inabalável sob ventos fortes projetando sombra calma.",
        "O interior de uma mata densa onde as árvores parecem se curvar formando arcos majestosos.",
        "Uma chama límpida que queima e flutua no ar, transmitindo proteção e fé espiritual.",
        "Uma tenda de tecidos brancos aquecida por dentro por uma lâmpada âmbar reconfortante.",
        "Um pilar de luz que cruza o céu verticalmente indo do chão sagrado até as nuvens.",
        "A estrela mais brilhante do céu reluzindo sobre colinas escuras no fim de noite.",
        "Uma constelação em formato de concha que brilha protetora no céu índigo profundo.",
        "Um nicho seguro esculpido no interior de uma caverna com água límpida e morna.",
        "Uma brisa invisível que alinha as copas das árvores em direção à luz dourada.",
        "Um vaso quebrado cujas partes se juntam com luz brilhando pelas suturas.",
        "Uma pessoa de costas contemplando a vastidão cercada por uma aura celeste de paz.",
        "Um pombo estilizado de asas abertas cruzando as nuvens mansas ao entardecer.",
        "Uma atmosfera de luz azul-marinho que preenche o ambiente transmitindo segurança.",
        "Uma fonte de pedra onde a água brota de forma contínua e sem parar sob o pôr do sol."
      ][i],
      gradient: [
        ["from-violet-950 to-stone-950", "from-indigo-900/40 to-stone-950"],
        ["from-blue-950 to-zinc-950", "from-cyan-900 to-blue-950"],
        ["from-amber-950 to-stone-950", "from-yellow-950 to-stone-900"],
        ["from-stone-950 to-purple-950", "from-indigo-950 to-stone-950"],
        ["from-teal-950 to-emerald-950", "from-cyan-900 to-stone-950"]
      ][i % 5],
      icon: "Smile",
      elements: ["fé", "portal", "luz", "chama", "proteção", "segurança"]
    }))
  },
  {
    id: "silence",
    name: "Silêncio",
    nameEn: "Silence",
    scenes: Array.from({ length: 20 }, (_, i) => ({
      id: `silencio_${i + 1}`,
      title: [
        "Fundo das Águas", "Ermo da Lua", "Quarto Escuro", "Névoa Matinal", "Lago de Espelho",
        "Deserto Silencioso", "Céu Sem Nuvens", "Sombra Mansa", "Rastro do Vento", "Pedra Solitária",
        "Claraboia", "Cúpula de Vidro", "Abismo Calmo", "Silêncio das Copas", "Areia Fina",
        "Neve Caindo", "Pântano Manso", "Templo Vazio", "Fogueira Silenciosa", "Segredo da Noite"
      ][i],
      titleEn: [
        "Deep Water", "Moon Wilderness", "Dark Room", "Morning Mist", "Mirror Lake",
        "Silent Desert", "Cloudless Sky", "Calm Shadow", "Wind's Trail", "Lone Stone",
        "Skylight Window", "Glass Dome", "Calm Abyss", "Canopy Silence", "Fine Sand",
        "Falling Snow", "Calm Swamp", "Empty Temple", "Quiet Campfire", "Night's Mystery"
      ][i],
      prompt: [
        "A quietude de águas azuis profundas sem correntezas, com raios de sol atenuados.",
        "Um deserto lunar arenoso cinza-claro sob a escuridão do espaço estrelado solitário.",
        "Um ambiente minimalista com sombras mansas e uma única nesga de luz de luar azul.",
        "Uma névoa branca densa e macia que cobre totalmente o vale de pinheiros calmos.",
        "A superfície espelhada de águas termais pretas imunes a qualquer sopro de vento.",
        "Dunas de areia fina que se estendem no deserto sob luz prateada das estrelas.",
        "Um céu azul-escuro totalmente limpo de nuvens, transmitindo quietude e imensidão.",
        "Um bosque calmo à noite, onde as sombras das árvores projetam formas mansas.",
        "A grama baixa de uma planície adormecida, sem nenhum ruído ou trepidação.",
        "Uma pedra arredondada monumental que repousa sozinha no centro de um planalto.",
        "Uma janela Zen circular no teto que exibe o céu escuro e estrelado de inverno.",
        "Uma cúpula de vidro protetora que envolve uma pequena planta em desenvolvimento.",
        "Um abismo suave repleto de nuvens brancas amortecedoras que absorvem som.",
        "As copas altas de ciprestes imunes ao menor balanço ou farfalhar de folhas.",
        "Uma duna de areia intocada cujas ondulações geométricas transmitem simetria.",
        "Flocos delicados de neve caindo sem som sobre a superfície de um lago cinza.",
        "Um riacho de várzea que corre preguiçoso sob a névoa fria da madrugada.",
        "O interior de uma capela minimalista onde a luz entra de lado de forma artística.",
        "Cinzas frias de uma fogueira cobertas por folhas secas no silêncio da colina.",
        "O contorno sutil de dunas de areia prateada sob o silêncio da meia-noite."
      ][i],
      gradient: [
        ["from-slate-950 to-stone-950", "from-stone-950 to-stone-900"],
        ["from-indigo-950 to-slate-950", "from-blue-950 to-stone-950"],
        ["from-stone-950 to-stone-950", "from-indigo-950 to-stone-950"],
        ["from-neutral-950 to-stone-900", "from-stone-950 to-neutral-950"],
        ["from-blue-950 to-stone-950", "from-cyan-950 to-stone-950"]
      ][i % 5],
      icon: "Compass",
      elements: ["silêncio", "névoa", "lago", "deserto", "luar", "sombras"]
    }))
  },
  {
    id: "purpose",
    name: "Propósito",
    nameEn: "Purpose",
    scenes: Array.from({ length: 20 }, (_, i) => ({
      id: `proposito_${i + 1}`,
      title: [
        "Linha de Luz", "Flecha Segura", "Farol do Sul", "Pé Firme", "Ímã da Alma",
        "Constelação Amiga", "Caminho Plano", "Fio Condutor", "Bússola Interna", "Anel de Prata",
        "Eixo do Mundo", "Porto Seguro", "Centro de Cuidado", "Trilha Limpa", "Estrela Cadente",
        "Chave Dourada", "Âncoras e Velas", "Círculo Perfeito", "Foco do Sopro", "Alinhamento"
      ][i],
      titleEn: [
        "Light Line", "Steady Arrow", "South Beacon", "Firm Footing", "Soul Magnet",
        "Helper Constellation", "Flat Trail", "Conducting Thread", "Inner Compass", "Silver Ring",
        "World Axis", "Safe Harbor", "Care Center", "Clear Footpath", "Shooting Star",
        "Golden Key", "Anchor & Sail", "Perfect Circle", "Breath Focus", "Alignment"
      ][i],
      prompt: [
        "Um feixe reto e dourado de luz cruzando a escuridão de forma geométrica e firme.",
        "Uma flecha abstrata de luz brilhando em direção à constelação que guia.",
        "A estrutura geométrica de um farol emitindo uma luz contínua em direção ao mar.",
        "Passadas marcadas na terra úmida que caminham com firmeza e sem titubear.",
        "Uma espiral concêntrica de metal polido brilhando e atraindo partículas de luz.",
        "Um grupo de estrelas brilhantes que indicam de forma limpa o caminho do norte.",
        "Uma trilha demarcada com pedras alinhadas de forma organizada pelo bosque.",
        "Um cabo de seda dourado que brilha atravessando labirintos de pedra cinza.",
        "Uma bússola minimalista cuja agulha azul aponta firme para uma estrela.",
        "Um anel geométrico metálico que gira em torno de seu próprio eixo em paz.",
        "Um pilar de cristal que desce das estrelas em simetria perfeita ao altar.",
        "Um porto rústico de madeira banhado por águas calmas azul-marinho e luz.",
        "Uma centelha brilhante ardendo estável no centro simétrico da moldura.",
        "Um caminho de terra limpo cercado por bambus organizados de forma natural.",
        "Um risco brilhante no céu noturno que dá direção e coragem às montanhas.",
        "Uma antiga chave esculpida em bronze suspensa em um feixe acolhedor de sol.",
        "Uma pequena embarcação à vela singrando águas calmas em uma rota traçada.",
        "Um círculo Zen traçado a carvão que emoldura um horizonte de paz contemplativa.",
        "Uma gota de água parada gerando uma onda perfeitamente circular de alinhamento.",
        "Três esferas de pedra empilhadas que se equilibram perfeitamente sobre o topo do morro."
      ][i],
      gradient: [
        ["from-indigo-950 to-stone-950", "from-teal-950 to-stone-950"],
        ["from-amber-950 to-stone-950", "from-amber-900/30 to-stone-950"],
        ["from-stone-950 to-emerald-950", "from-teal-900 to-stone-950"],
        ["from-slate-900 to-stone-950", "from-indigo-950 to-stone-950"],
        ["from-emerald-950 to-stone-950", "from-teal-950 to-emerald-950"]
      ][i % 5],
      icon: "Sliders",
      elements: ["propósito", "direção", "luz", "bússola", "estrela", "caminho"]
    }))
  },
  {
    id: "inner-freedom",
    name: "Liberdade Interior",
    nameEn: "Inner Freedom",
    scenes: Array.from({ length: 20 }, (_, i) => ({
      id: `liberdade_${i + 1}`,
      title: [
        "Voo Selvagem", "Gaiola Aberta", "Asas do Vento", "Espaço Infinito", "Horizonte Sem Fim",
        "Nuvem Azul", "Pena Solta", "Páginas ao Vento", "Dente de Leão", "Salto na Luz",
        "Corrente Quebrada", "Brisa do Mar", "Pássaro de Papel", "Céu de Papagaio", "Planar Sob Sol",
        "Onda Gigante Calma", "Porta Esculpida", "Trilha Ampla", "Sopro Livre", "Expansão Violeta"
      ][i],
      titleEn: [
        "Wild Flight", "Open Cage", "Wind Wings", "Infinite Space", "Boundless Horizon",
        "Blue Cloud", "Floating Feather", "Pages in Wind", "Dandelion Puff", "Leap of Light",
        "Broken Chain", "Sea Breeze", "Paper Bird", "Kite Sky", "Gliding in Sun",
        "Calm Giant Wave", "Carved Door", "Broad Trail", "Free Sip", "Violet Expansion"
      ][i],
      prompt: [
        "Uma gaivota estilizada plainando livre sobre o oceano límpido do fim de tarde.",
        "Uma gaiola entalhada em madeira rústica com a porta aberta sob o céu estrelado.",
        "Formas abstratas que lembram asas se desmaterializando no ar de forma leve.",
        "A vastidão mística de um planalto verdejante visto de cima, sem fronteiras.",
        "O encontro pacífico de um mar azul-celeste pastel com um céu desobstruído.",
        "Uma única nuvem isolada flutuando livremente no azul do fim de tarde.",
        "Uma caneta de pena branca que flutua no ar girando de forma lúdica sobre a mesa.",
        "Folhas de diário antigas se desprendendo e flutuando mansas com o vento da tarde.",
        "Pequenas sementes de dente-de-leão flutuando em tons solares sobre o jardim.",
        "Um feixe de luz que brota do vale subindo em direção ao cosmos em expansão.",
        "Anéis de bronze de uma corrente rachando e se desfazendo como pó brilhante.",
        "Arvoredos costeiros balançando livremente sob a brisa salgada e fresca do mar.",
        "Origamis de garças brancas flutuando em suspensão calma sobre águas escuras.",
        "Uma pipa de cores pastéis subindo cada vez mais alto no céu limpo da manhã.",
        "Um planador que corta o ar desenhando círculos delicados e livres sem motor.",
        "Uma onda marítima monumental suspensa em câmera lenta no ar, sem colapso.",
        "Uma antiga porta de marfim escancarada para revelar um infinito de galáxias.",
        "Um caminho que se alarga indefinidamente à medida que se aproxima do planalto.",
        "Um sopro de vento translúcido desenhando caminhos de luz nos trigais secos.",
        "Espirais de luz lilás e violeta se expandindo geometricamente pelo universo."
      ][i],
      gradient: [
        ["from-sky-950 to-stone-950", "from-cyan-900 to-indigo-950"],
        ["from-purple-950 to-stone-950", "from-pink-950 to-stone-950"],
        ["from-emerald-950 to-indigo-950", "from-teal-950 to-stone-950"],
        ["from-rose-950 to-stone-950", "from-orange-950 to-stone-950"],
        ["from-stone-950 to-indigo-950", "from-slate-900 to-indigo-950"]
      ][i % 5],
      icon: "Award",
      elements: ["liberdade", "voo", "gaiola", "dente-de-leão", "expansion", "espaço"]
    }))
  }
];

export function findSceneById(id: string): VisualScene | null {
  for (const cat of PCH_VISUAL_LIBRARY) {
    const scene = cat.scenes.find(s => s.id === id);
    if (scene) return scene;
  }
  return null;
}

export function getRandomSceneForCategory(catId: string): VisualScene {
  const cat = PCH_VISUAL_LIBRARY.find(c => c.id === catId);
  if (!cat || cat.scenes.length === 0) {
    return PCH_VISUAL_LIBRARY[0].scenes[0];
  }
  return cat.scenes[Math.floor(Math.random() * cat.scenes.length)];
}

export function getScenesByTag(tag: string): VisualScene[] {
  const matches: VisualScene[] = [];
  PCH_VISUAL_LIBRARY.forEach(cat => {
    cat.scenes.forEach(scene => {
      if (scene.elements.includes(tag.toLowerCase()) || scene.prompt.toLowerCase().includes(tag.toLowerCase())) {
        matches.push(scene);
      }
    });
  });
  return matches;
}
