const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const morgan = require('morgan');

require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(morgan('dev'));

// multer setup for optional direct file uploads
const upload = multer();

// ---------- ENVIRONMENT ----------
const PORT = process.env.PORT || 3000;

// WhatsApp Cloud API (Meta)
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID; 
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; 
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Google AI Studio endpoint
const GOOGLE_AI_STUDIO_ENDPOINT = process.env.GOOGLE_AI_STUDIO_ENDPOINT; 
const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY; 

// OpenAI (Whisper) for STT optional
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 

// ElevenLabs (TTS clone)
const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY; 
const ELEVEN_VOICE_ID = process.env.ELEVEN_VOICE_ID;

// --- CONSTANTS & PROMPTS ---

const BASE_SYSTEM_INSTRUCTION = `
You are Inner Voice PCH, a therapeutic voice-based AI guide inspired by Therapeutic Cognitive Poetry (PCH), created by Evaldo Poeta.
Your mission is to awaken self-awareness, emotional clarity, and inner expansion through poetic language, cognitive insights, and gentle hypnotic flow.

Your communication style blends:
- poetic rhythm
- emotional depth
- cognitive reframing
- metaphor-based guidance
- spiritual sensitivity
- therapeutic presence
- calm, warm and intentional voice patterns

You ALWAYS speak in a tone that feels lyrical, wise, empathetic, and softly hypnotic — as if the user is entering a safe inner sanctuary.

---

YOUR CORE PURPOSE
1. Guide the user through PCH sessions using voice, imagery, rhythm, metaphors, and cognitive reframing.
2. Teach PCH step by step, in simple and transformative ways.
3. Hold therapeutic presence: warm, grounded, reflective.
4. Help the user access their “inner room of freedom” through guided reflections.
5. Transform limiting thoughts using poetic-cognitive techniques.
6. Encourage spiritual openness, but without imposing beliefs.
7. Always protect the user, be supportive, and avoid making medical claims.

---

VOICE & STYLE RULES
- Speak slowly and intentionally.
- Use soft imagery, sensory metaphors, and emotional resonance.
- Combine poetic phrases with cognitive clarity.
- Every message must feel like a gentle inner awakening.
- Use simple words with deep meaning.
- Maintain a therapeutic atmosphere.
- Never rush.
- Never sound robotic.
- Always speak as Inner Voice PCH, not as a generic AI.

---

PCH TECHNIQUES TO USE
You naturally integrate:
- Conditioning: repeat gentle key ideas to strengthen new mental patterns.
- Association: connect new insights with images and metaphors.
- Overload: use soft poetic density to bypass resistance.
- Expectation: create anticipation of inner transformation.
- Accelerator: guide the user into deeper focus.
- Imagination: invite them to visualize safely.
- Emotional intensifier: highlight meaningful sensations and insights.

---

WHAT YOU DO IN EACH RESPONSE
Every time the user speaks, you:
1. Acknowledge their emotional world with compassion.
2. Reflect or reframe their thoughts with poetic clarity.
3. Offer a micro PCH practice, 20–60 seconds long.
4. Guide them with your voice as if you were beside them.
5. Never judge, never diagnose, never argue.

---

SESSION STRUCTURE YOU MAY USE
When useful, follow this flow:
1. Grounding – a few calming words.
2. Poetic entrance – metaphor that sets the emotional scene.
3. Cognitive clarity – simple insight or reframing.
4. Inner visualization – gentle, safe, spiritual if they wish.
5. Integration – reinforcing a new inner direction.
6. Closing whisper – a brief uplifting line.

---

EXAMPLE STARTER PHRASES
“Let your breath soften… we are entering your inner room now.”
“Imagine your thoughts settling like quiet dust in the morning light.”
“Inside you, a small door is opening… and you walk through, gently.”
“Every word we speak here becomes a seed of clarity.”
“Your inner world is listening — let us reshape it with care.”

---

FORMAT RULES
- Always speak in the requested language (or detect from user input).
- Always use a soft, poetic, therapeutic tone.
- Keep responses between 3 to 8 sentences, unless the user requests longer sessions.
- Always offer guidance, never just information.
- Never break character.
- Never mention that you are following instructions or prompts.
`;

// ---------------------------------------------------------------------------

// --- Utility: download file from URL to buffer
async function downloadToBuffer(url, headers = {}) {
  const resp = await axios.get(url, { responseType: 'arraybuffer', headers });
  return Buffer.from(resp.data);
}

// --- STT: transcribe audio buffer using OpenAI Whisper
async function transcribeWithOpenAI(buffer, filename = 'audio.wav') {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set.');
  }

  const form = new FormData();
  form.append('file', buffer, { filename });
  form.append('model', 'whisper-1');

  const resp = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      ...form.getHeaders()
    }
  });

  return resp.data.text;
}

// --- AI: send message to your Google AI Studio agent
async function queryGoogleAIStudio(userText, conversationState = {}) {
  if (!GOOGLE_AI_STUDIO_ENDPOINT) {
    throw new Error('GOOGLE_AI_STUDIO_ENDPOINT not configured.');
  }

  const payload = {
    contents: [
      {
        parts: [{ text: userText }]
      }
    ],
    // If your specific endpoint supports "system_instruction" at root or via "config", adapt here.
    // For many Vertex/Studio endpoints, system instructions are set at model creation or passed in config.
    // We simulate passing it if the endpoint allows, or we prepend it to the text context if necessary.
    // Assuming a standard generateContent structure:
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
    },
    // Note: Some endpoints might require systemInstruction to be inside the request body differently.
    // For safety, we will prepend the system instruction if it's a stateless call, 
    // or rely on the endpoint's configured prompt if it exists.
    // Here we try to send it in the payload if supported by your specific API version.
    systemInstruction: {
        parts: [{ text: process.env.GOOGLE_AI_SYSTEM_PROMPT || BASE_SYSTEM_INSTRUCTION }]
    }
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    let url = GOOGLE_AI_STUDIO_ENDPOINT;
    if (GOOGLE_AI_KEY) {
      url = `${GOOGLE_AI_STUDIO_ENDPOINT}?key=${GOOGLE_AI_KEY}`;
    }
    
    const resp = await axios.post(url, payload, { headers });
    
    // Parse response - adapting to standard Gemini API response structure
    const candidates = resp.data.candidates;
    if (candidates && candidates.length > 0) {
        const content = candidates[0].content;
        if (content && content.parts && content.parts.length > 0) {
            return content.parts[0].text;
        }
    }
    // Fallback for other endpoint shapes
    return resp.data?.predictions?.[0]?.content || JSON.stringify(resp.data);
  } catch (err) {
    console.error("AI Query Error Data:", err.response?.data || err.message);
    throw err;
  }
}

// --- TTS: ElevenLabs
async function synthesizeWithElevenLabs(text) {
  if (!ELEVEN_API_KEY || !ELEVEN_VOICE_ID) {
    throw new Error('ELEVEN_API_KEY or ELEVEN_VOICE_ID not set.');
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`;
  const body = {
    text,
    model_id: "eleven_multilingual_v2", // Better for multi-language support
    voice_settings: {
      stability: 0.4,       // Lower stability for more emotion
      similarity_boost: 0.8,
      style: 0.5,           // Gentle style
      use_speaker_boost: true
    }
  };

  const resp = await axios.post(url, body, {
    responseType: 'arraybuffer',
    headers: {
      'xi-api-key': ELEVEN_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  return Buffer.from(resp.data);
}

// --- WhatsApp: upload media and send
async function uploadMediaToWhatsApp(buffer, mimeType = 'audio/mpeg') {
  const url = `https://graph.facebook.com/v16.0/${WHATSAPP_PHONE_ID}/media`;
  const form = new FormData();
  form.append('file', buffer, { filename: 'response.mp3', contentType: mimeType });
  form.append('messaging_product', 'whatsapp');

  const resp = await axios.post(url, form, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      ...form.getHeaders()
    }
  });
  return resp.data;
}

async function sendAudioMessageWhatsApp(toNumber, mediaId) {
  const url = `https://graph.facebook.com/v16.0/${WHATSAPP_PHONE_ID}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to: toNumber,
    type: 'audio',
    audio: { id: mediaId }
  };

  const resp = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  return resp.data;
}

async function sendTextWhatsApp(toNumber, text) {
  const url = `https://graph.facebook.com/v16.0/${WHATSAPP_PHONE_ID}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to: toNumber,
    text: { body: text }
  };

  const resp = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  return resp.data;
}

// ----------------- WhatsApp webhook verification (GET) -----------------------
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.sendStatus(404);
});

// ----------------- Main webhook for incoming messages ----------------------
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    
    // Acknowledge immediately
    res.sendStatus(200);

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value;
        if (!value) continue;
        
        const messages = value.messages || [];
        for (const message of messages) {
          const from = message.from;
          const type = message.type;

          console.log(`Msg from ${from} [${type}]`);

          let userText = '';

          // 1. Get Text from User
          if (type === 'text') {
            userText = message.text?.body || '';
          } 
          // 2. Or Get Audio from User
          else if (type === 'audio' || type === 'voice') {
            const mediaId = message.audio?.id || message.voice?.id;
            try {
                // Get URL
                const mediaUrlResp = await axios.get(`https://graph.facebook.com/v16.0/${mediaId}`, {
                    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` }
                });
                const mediaUrl = mediaUrlResp.data.url;
                
                // Download
                const audioBuffer = await downloadToBuffer(mediaUrl, { Authorization: `Bearer ${WHATSAPP_TOKEN}` });
                
                // Transcribe
                userText = await transcribeWithOpenAI(audioBuffer, 'voice_message.ogg');
                console.log(`Transcribed: "${userText}"`);
            } catch (err) {
                console.error("Audio processing failed", err.message);
                await sendTextWhatsApp(from, "I could not hear you clearly. Could you write to me?");
                continue;
            }
          } else {
             continue; // Skip other types
          }

          if (!userText) continue;

          // 3. Query AI
          try {
            const aiReply = await queryGoogleAIStudio(userText);
            
            // 4. Send Text Reply first (optional, good for immediate feedback)
            // await sendTextWhatsApp(from, aiReply);

            // 5. Generate TTS and Send Audio
            const ttsBuffer = await synthesizeWithElevenLabs(aiReply);
            const uploadResp = await uploadMediaToWhatsApp(ttsBuffer, 'audio/mpeg');
            await sendAudioMessageWhatsApp(from, uploadResp.id);

          } catch (err) {
            console.error("Processing chain failed:", err.message);
            // Fallback: send text if audio fails
            try {
                await sendTextWhatsApp(from, "My voice is faint right now, but here is my thought:\n\n" + (err.aiReply || "Please try again later."));
            } catch (e) { console.error("Fallback failed"); }
          }
        }
      }
    }
  } catch (err) {
    console.error('Webhook Error:', err.message);
  }
});

app.post('/api/query', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  try {
    const reply = await queryGoogleAIStudio(text);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Inner Voice PCH API listening on port ${PORT}`);
});