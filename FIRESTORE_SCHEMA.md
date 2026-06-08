# Mapeamento do Banco de Dados Firestore — Voz Interior PCH
Este documento descreve a arquitetura detalhada do banco de dados Cloud Firestore do ecossistema Voz Interior, projetado para suportar o **Admin Master PCH** com máxima escalabilidade, segurança rigorosa e consultas otimizadas.

---

## Estrutura Geral das Coleções

```text
/
├── users/{userId}                          (Coleção Root: Perfis do Usuário)
│   ├── journals/{journalId}                (Subcoleção: Notas de Reflexão e Diário Vivo)
│   └── plants/{plantId}                    (Subcoleção: Plantas do Jardim Interior - Gamificação)
│
├── user_neuro_profile/{userId}             (Coleção Root: Configurações de Neuroadaptação)
│
├── journeys/{journeyId}                    (Coleção Root: Jornadas Terapêuticas do Sistema)
│   └── days/{dayId}                        (Subcoleção: Programação Diária e Metadados de Atividades)
│
├── pch_library/{contentId}                 (Coleção Root: Biblioteca PCH / Acervo Intelectual)
│
├── gamification_config/{itemId}            (Coleção Root: Conquistas, Medalhas e Regras de Nível)
│
├── subscription_plans/{planId}             (Coleção Root: Catálogo e Parâmetros de Assinaturas)
│
├── ai_config/{configId}                    (Coleção Root: Ajustes de Personalidade e Expressividade da IA)
│
├── global_insights/{insightId}             (Coleção Root: Métricas Anônimas Coletivas de Humor)
│
├── system_config/{configId}                (Coleção Root: Parâmetros administrativos globais)
│
├── security_logs/{logId}                   (Coleção Root: Auditoria Ativa de Segurança e Acesso)
│
└── pch_lab_sandbox/{sandboxId}             (Coleção Root: Área Experimental e Sandbox de Laboratório)
```

---

## 1. Mapeamento Detalhado por Coleção

### 1.1 Coleção: `users`
* **Caminho:** `/users/{userId}`
* **Descrição:** Armazena os dados cadastrais primários, metadados de status de uso, saldo de pontuação geral e configuração de assinatura ativa.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo / Valores |
| :--- | :--- | :--- | :--- |
| `id` | `string` | UID do usuário correspondente à autenticação do Firebase. | `auth_uid_123abc` |
| `name` | `string` | Nome de exibição preenchido pelo usuário. | `Clarice Lispector` |
| `email` | `string` | E-mail do usuário unicamente cadastrado. | `clarice@exemplo.com` |
| `isAdmin` | `boolean` | Flag que determina privilégio administrativo. | `false` |
| `plan` | `string` | Nível de assinatura / plano ativo do usuário. | `"visitor"`, `"essential"`, `"premium"`, `"guardian"`, `"institutional"` |
| `registeredAt` | `string` (ISO) | Data/Hora em que a conta foi criada. | `2026-06-08T15:10:00Z` |
| `lastActive` | `string` (ISO) | Último registro de requisição ou atividade do utilizador. | `2026-06-08T22:30:15Z` |
| `points` | `integer` | Acumulado total de pontos de experiência (XP). | `1450` |
| `level` | `integer` | Nível atual do usuário baseado na tabela de gamificação. | `12` |
| `unlockedBadges` | `array<string>` | Lista de IDs de medalhas conquistadas. | `["primeiro_sopro", "resiliencia_ouro"]` |
| `resonanceScore` | `number` | Índice unificado de sintonia interior medido recentemente. | `87.5` |
| `accessibilityMode`| `boolean` | Flag para habilitar alto contraste ou leitura adaptada. | `true` |
| `seekingGoal` | `string` | Objetivo informado na jornada inicial. | `"reducao_ansiedade"` |
| `communicationPreference` | `string` | Tipo de expressão desejada. | `"voice"`, `"text"`, `"hybrid"` |

---

#### 1.1.1 Subcoleção: `journals` (Nested em `/users/{userId}/journals/{journalId}`)
* **Descrição:** Guarda os registros confessionais íntimos, fragmentos poéticos e notas feitas pelo usuário.
* **Privacidade:** Acesso restrito apenas ao próprio dono sob regra rígida de autenticação.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Identificador único do registro de diário. | `day_j_881` |
| `userId` | `string` | ID de associação do usuário dono. | `auth_uid_123abc` |
| `date` | `string` (ISO) | Data correspondente ao registro. | `2026-06-08T15:15:00Z` |
| `feeling` | `string` | Emoção selecionada no check-in diário. | `"brisa_leve"`, `"nevoa_calma"`, `"sol"` |
| `text` | `string` | Texto de autoria livre do usuário. | `"A mente estava correndo sob intensa pressão..."` |
| `prompt` | `string` | (Opcional) Pergunta poética que inspirou a resposta. | `"O que silencia seus olhos hoje?"` |
| `isiScore` | `number` | Score de sintonia vinculado ao estado deste dia. | `75.0` |

---

#### 1.1.2 Subcoleção: `plants` (Nested em `/users/{userId}/plants/{plantId}`)
* **Descrição:** Representa os espécimes botânicos ativos no **Jardim Interior** do usuário.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo / Valores |
| :--- | :--- | :--- | :--- |
| `id` | `string` | ID único da planta no jardim do usuário. | `p_cherry_01` |
| `type` | `string` | Tipo taxonômico ou visual da planta. | `"flower"`, `"tree"`, `"shrub"`, `"succulent"`, `"fern"` |
| `name` | `string` | Apelido dado pelo usuário para a planta. | `"Cerejeira da Paz"` |
| `stage` | `integer`| Estágio de maturação da semente à árvore mística. | `0` (Semente), `1` (Broto), `2` (Planta), `3` (Madura) |
| `color` | `string` | Cor personalizada (Hex ou classe Tailwind) que adorna o caule. | `"#14B8A6"` |
| `createdAt` | `string` (ISO) | Data em que o usuário plantou essa semente. | `2026-05-12T10:00:00Z` |
| `lastWatered` | `string` (ISO) | Data da última ação de rega realizada. | `2026-06-08T15:00:00Z` |

---

### 1.2 Coleção: `user_neuro_profile`
* **Caminho:** `/user_neuro_profile/{userId}` (ID do documento = ID do Usuário)
* **Descrição:** Armazena dados de neuroadaptação pautados para adaptar a UX para TDAH, Autismo, Ansiedade, Burnout, Senilidade ou Adolescência.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo / Valores |
| :--- | :--- | :--- | :--- |
| `userId` | `string` | Identificação do usuário. | `uid_abc456` |
| `neuroType` | `string` | Perfil clínico neurológico mapeado pelo sistema. | `"normal"`, `"tdah"`, `"autismo"`, `"ansiedade"`, `"burnout"`, `"idoso"`, `"adolescente"` |
| `adaptations` | `map` | Objeto contendo ajustes finos de layout do cliente. | Visualizado abaixo |
| `adaptations.fontSize` | `string` | Tamanho padrão de fontes textuais recomendado. | `"large"`, `"normal"`, `"xl"` |
| `adaptations.themeColor`| `string` | Token de cor preferencial para reduzir fadiga visual. | `"slate"`, `"forest"`, `"night"` |
| `adaptations.animationSpeed` | `string` | Velocidade das transições ou pulsações da interface. | `"slow"`, `"none"`, `"normal"` |
| `adaptations.languageTone` | `string` | Linguagem adotada no direcionamento do Dr. Evaldo. | `"metaphorical"`, `"direct"`, `"gentle"` |
| `preferredLanguage`| `string` | Idioma mapeado para geração dinâmica de caminhos. | `"pt"`, `"en"`, `"es"` |
| `currentJourney` | `string` | ID da jornada de 30 dias que o usuário está trilhando atualmente. | `jornada_ansiedade_30d` |
| `currentLevel` | `integer`| Progresso correlacionado com a estrutura ativa. | `5` |
| `lastInteraction` | `string` (ISO) | Data e hora exatas da última alteração de estado. | `2026-06-08T15:00:00Z` |
| `evolutionHistory` | `array<map>` | Histórico evolutivo consolidando ganhos diários de foco. | `[{ "date": "2026-06-08", "pointsGained": 20, "activity": "Sopro Respiratório Coerente" }]` |

---

### 1.3 Coleção: `journeys`
* **Caminho:** `/journeys/{journeyId}`
* **Descrição:** Define as jornadas terapêuticas que podem ser assinadas ou seguidas. Substitui a codificação manual, permitindo que administradores criem trilhas clínicas completas diretamente no Admin Master.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo |
| :--- | :--- | :--- | :--- |
| `id` | `string` | ID único da jornada. | `jornada_ansiedade` |
| `title` | `string` | Título expressivo no idioma configurado. | `"Vencendo a Ansiedade: 30 Dias"` |
| `description` | `string` | Propósito clínico da trilha de dias. | `"Trilha com respirações e reflexões construídas..."` |
| `targetProfile` | `string` | Perfil cognitivo de destino para recomendações de IA. | `"ansiedade"`, `"tdah"`, `"normal"` |
| `durationDays` | `integer` | Quantidade total de blocos sequenciais na jornada. | `30` |
| `active` | `boolean` | Flag indicando se a jornada está disponível para os usuários. | `true` |
| `createdAt` | `string` (ISO) | Data de criação da jornada pela equipe. | `2026-04-10T12:00:00Z` |
| `createdBy` | `string` | Identificador do Administrador criador do protocolo. | `doctor_evaldo_uid` |

---

#### 1.3.1 Subcoleção: `days` (Nested em `/journeys/{journeyId}/days/{dayId}`)
* **Caminho Físico:** `/journeys/{journeyId}/days/{dayNumber}` (Pode usar o ID como string `"day_1"`)
* **Descrição:** Guarda a lição, exercício, áudio, vídeo ou poema referente a cada um dos dias específicos daquela jornada.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo |
| :--- | :--- | :--- | :--- |
| `dayNumber` | `integer` | Índice de sequenciamento do dia. | `1` |
| `title` | `string` | Título do tema diário trabalhado. | `"Dia 1 — O Reconhecimento das Âncoras"` |
| `text` | `string` | Conteúdo clínico/reflexivo em Markdown ou HTML. | `"A respiração consciente é o limite entre..."` |
| `audioUrl` | `string` | URL contendo o áudio meditativo opcional gravado. | `https://api.s3.url/dr_evaldo/audios/ancora_1.mp3` |
| `exerciseId` | `string` | ID correspondente a um exercício ou respiração guiada associada. | `exercicio_sopro_coerente` |
| `poetryText` | `string` | Poesia de acolhimento integrada para relaxamento mental. | `"Brisa mansa que me cobre, traz a paz ao peito..."` |
| `videoUrl` | `string` | Link opcional para material visual de apoio. | `https://vimeo.exemplo.com/832194` |
| `durationMinutes`| `integer` | Estimativa de tempo sugerida para engajamento ativo. | `10` |

---

### 1.4 Coleção: `pch_library`
* **Caminho:** `/pch_library/{contentId}`
* **Descrição:** Central de patrimônio intelectual do Voz Interior (CMS). Abriga as dezenas de poemas, reflexões metafóricas e exercícios utilizados de maneira global ou sob demanda no sistema.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo / Valores |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Referência única da obra literária ou de áudio. | `p_silencio_coracao` |
| `category` | `string` | Categoria de publicação no ecossistema de autoajuda. | `"poems"`, `"reflections"`, `"audios"`, `"videos"`, `"exercises"`, `"spirituality"`, `"meditations"` |
| `title` | `string` | Nome da obra ou conteúdo de apoio. | `"O Silêncio dos Pássaros"` |
| `content` | `string` | Texto completo da obra (Suporta Markdown). | `"O vento passa de mansinho sobre as copas..."` |
| `mediaUrl` | `string` | URL hospedada do arquivo correspondente. | `https://storage.exemplo.com/audios/clip.mp3` |
| `author` | `string` | Identificação do autor literário da obra. | `"Equipe de Apoio - Voz Interior"` |
| `targetNeuro` | `string` | Indicador se este conteúdo serve especificamente para um perfil. | `"tdah"`, `"autismo"`, `"ansiedade"`, `"comum"` |
| `tags` | `array<string>` | Palavras-chave para motores de busca e filtros do Admin. | `["calma", "autoaceitacao", "noite"]` |
| `isDraft` | `boolean` | Indica se o material está em rascunho ou publicado. | `false` |
| `createdAt` | `string` (ISO) | Registro cronológico de criação no acervo. | `2026-06-08T15:20:00Z` |

---

### 1.5 Coleção: `gamification_config`
* **Caminho:** `/gamification_config/{itemId}`
* **Descrição:** Tabela de referências de gamificação que parametriza recompensas, títulos de medalhas e faixas de XP necessárias para progressão no sistema.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo |
| :--- | :--- | :--- | :--- |
| `id` | `string` | ID único da conquista / regra. | `badge_sopro_iniciante` |
| `badgeTitle` | `string` | Título oficial que aparecerá no perfil do usuário. | `"Iniciado do Sopro"` |
| `badgeDescription`| `string` | Descrição instruindo o que o usuário realizou para obter. | `"Completou com sucesso 3 ciclos inteiros de Sopro Coerente."` |
| `badgeIcon` | `string` | Nome do ícone da biblioteca (referenciado pelo Lucide). | `"Wind"` |
| `xpRequired` | `integer` | Quantidade de XP exigida para liberar o item ou progredir de nível. | `500` |

---

### 1.6 Coleção: `subscription_plans`
* **Caminho:** `/subscription_plans/{planId}`
* **Descrição:** Tabela de planos e políticas de restrição do ecossistema para controlar permissões das contas.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Identificação do plano. | `plan_premium` |
| `name` | `string` | Título da categoria de acesso comercializado. | `"Premium"` |
| `price` | `number` | Tarifa monetária calculada por período de renovação. | `29.90` |
| `billingPeriod` | `string` | Período transacional do plano. | `"mensal"`, `"anual"`, `"vitalicio"` |
| `features` | `array<string>` | Funcionalidades atômicas desbloqueadas por esse nível. | `["sopro_ilimitado", "jardim_total", "diálogo_ia"]` |
| `maxActiveSessions`| `integer` | Limite tolerável de logins simultâneos por assinatura. | `3` |
| `activeCount` | `integer` | Contador em cache de quantos assinantes estão vigentes na base. | `1420` |

---

### 1.7 Coleção: `ai_config`
* **Caminho:** `/ai_config/{configId}` (Geralmente `current` ou indexado por perfil cognitivo)
* **Descrição:** Guarda os parâmetros regulatórios e comportamentais da inteligência artificial **Dr. Evaldo**.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo / Valores |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Código de identificação do set de comportamento da IA. | `dr_evaldo_normal` |
| `mode` | `string` | Nome descritivo da personalidade ou tom adotado. | `"Acolhedor poético"` |
| `intensity` | `integer` | Grau de foco clínico e assertividade regulatória. | `70` (Escala 0-100) |
| `poeticPercent` | `integer` | Porcentagem de metáforas literárias na estruturação das falas. | `85` (Escala 0-100) |
| `directivePercent`| `integer` | Grau de respostas curtas, orientadoras ou impositivas. | `40` (Escala 0-100) |
| `personalityPrompt` | `string` | System Prompt / Instrução profunda passada ao modelo Gemini. | `"Você atua como um preceptor de calmaria..."` |
| `tone` | `string` | Vibe ou tom das palavras escolhidas pela IA. | `"suave"`, `"intelectual"`, `"clinico"`|
| `limits` | `map` | Objeto organizador que blinda as conversações. | `{"maxTokens": 500, "safetyFilter": "high"}` |
| `updatedAt` | `string` (ISO) | Última data de ajuste deste prompt de personalidade. | `2026-06-08T15:00:00Z` |
| `updatedBy` | `string` | Nome ou ID do administrador responsável pelo ajuste. | `admin_evaldo` |

---

### 1.8 Coleção: `security_logs`
* **Caminho:** `/security_logs/{logId}`
* **Descrição:** Log unificado e isolado (compliance) para rastrear o uso do Admin Master e mitigar fraudes de escalação de privilégios.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo / Valores |
| :--- | :--- | :--- | :--- |
| `id` | `string` | ID único gerado de forma sequencial-aleatória. | `sec_9918239a` |
| `timestamp` | `string` (ISO) | Registro exato e imutável determinado no servidor. | `2026-06-08T15:10:00Z` |
| `userId` | `string` | UID do usuário ou administrador que executou o evento. | `auth_uid_123abc` |
| `userEmail` | `string` | E-mail associado do executor para rápida conferência visual.| `evaldo0510@gmail.com` |
| `ipAddress` | `string` | IP de origem da chamada de rede. | `189.123.45.67` |
| `eventType` | `string` | Natureza e escopo do evento acionado. | `"login"`, `"login_failed"`, `"permission_denied"`, `"admin_escalation_attempt"`, `"session_revoke"`, `"content_modified"` |
| `userAgent` | `string` | Navegador utilizado durante a auditoria. | `"Mozilla/5.0 (Macintosh; Intel Mac OS...)"` |
| `details` | `string` | Descrição amigável detalhando a alteração realizada. | `"O administrador alterou os prompts de personalidade do IA AIConfig: dr_evaldo_normal"` |

---

### 1.9 Coleção: `pch_lab_sandbox`
* **Caminho:** `/pch_lab_sandbox/{sandboxId}`
* **Descrição:** Sandbox de testes isolados do **Laboratório PCH**. Permite aos pesquisadores ou administradores simular e desenhar novos poemas, rotinas respiratórias e prompts de IA experimentais sem afetar as tabelas reais de produção dos pacientes ativos.
* **Campos:**

| Campo | Tipo | Descrição | Exemplo / Valores |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Identificador único do experimento ou simulação de rotina.| `exp_breath_beta` |
| `experimentType`| `string` | Natureza do sandbox em desenvolvimento. | `"exercicios"`, `"poemas"`, `"protocolos"`, `"jornadas"`, `"ia_agents"` |
| `name` | `string` | Título informal ou de laboratório associado ao modelo. | `"Protocolo Beta 4-7-8 Focado em Idosos"` |
| `parameters` | `map` | Objeto que guarda as variáveis isoladas do teste. | `{"inhale": 4, "hold": 7, "exhale": 8}` |
| `content` | `string` | Dados livres (suporta Markdown e estruturas de texto). | `"Sopro experimental e poético direcionado para..."` |
| `createdAt` | `string` (ISO) | Marca cronológica de criação da rota experimental. | `2026-06-08T15:00:00Z` |
| `createdBy` | `string` | Admin responsável pelo laboratório experimental. | `admin_ajariristartups` |

---

## 2. Abordagem de Escalabilidade e Otimização de Consultas

Para acomodar milhares de usuários diários ativos e garantir tempos de resposta de milissegundos sem custos de faturamento desalinhados, este modelo aplica as seguintes premissas de arquitetura:

1. **Estratégia de Nested Colections (Subcoleções) no Perfil de Usuários:**
   * Itens confessionais privados (`journals`) e elementos crescentes de gamificação do jardim (`plants`) são alocados em subcoleções.
   * Evita atingir o limite físico de `1MB` por documento do Firestore que ocorreria se fossem mantidos vetores intermináveis dentro do próprio documento `/users/{userId}`.
   * Isolamento de permissão pontual, já que o usuário comum só consegue listar suas subcoleções privadas, diminuindo a complexidade de regras de segurança.

2. **Isolamento de PII (Personally Identifiable Information) e Desempenho:**
   * Embora o e-mail e nome básicos apoiem a UI primária, as regras e dados adaptativos clínicos ficam apartados em `/user_neuro_profile`, limitando vazamento de dados de saúde mental sensíveis e racionalizando o tamanho da carga básica do documento de usuário (`/users/{userId}`).

3. **Consultas com Filtros Exatos e Compostos (Indexação):**
   * Os administradores executam no painel as ações de filtragem na tela de usuários (`/users`) por: `plan`, `registeredAt` e `lastActive`.
   * No CMS (`/pch_library`), as buscas por categoria e flag de rascunho são sustentadas por índices compostos pré-definidos: `category ASC, isDraft ASC, createdAt DESC`.

4. **Desacoplamento de logs pesados:**
   * Logs administrativos (`/security_logs`) possuem sua própria coleção na raiz e não dentro do usuário, assegurando que o consumo de leituras do aplicativo pelo cliente (`/users`) não carregue registros irrelevantes de auditoria de segurança.
