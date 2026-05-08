import { useState, useCallback, useRef } from 'react';
import { lsGet, lsSet } from '../utils/helpers';

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
const MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';
const STORAGE_KEY = 'iss-chat-messages';
const MAX_MESSAGES = 30;

function buildSystemPrompt(issData, newsData) {
  const issInfo = issData
    ? `ISS is currently at Latitude: ${issData.position?.lat?.toFixed(4)}, Longitude: ${issData.position?.lon?.toFixed(4)}, Speed: ${issData.speed} km/h, Location: ${issData.location}, Tracking ${issData.history?.length || 0} positions.`
    : 'ISS data not yet available.';

  const peopleInfo = issData?.people
    ? `People in space: ${issData.people.number}. Names: ${issData.people.people?.map(p => p.name).join(', ')}`
    : '';

  const newsSnippets = newsData
    ? Object.entries(newsData)
        .flatMap(([cat, arts]) => (arts || []).slice(0, 2).map(a => `[${cat}] ${a.title}`))
        .slice(0, 10)
        .join('\n')
    : 'No news loaded.';

  return `You are a dashboard assistant. You can ONLY answer questions based on the following real-time data. Do not use external knowledge or make up information.

=== ISS TRACKER DATA ===
${issInfo}
${peopleInfo}

=== LATEST NEWS HEADLINES ===
${newsSnippets}

Rules:
- Only answer based on the data above
- If asked something outside this data, say: "I can only answer based on the dashboard data (ISS tracking and news headlines)."
- Keep answers concise and helpful`;
}

export function useChat() {
  const [messages, setMessages] = useState(() => lsGet(STORAGE_KEY, []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const saveMessages = (msgs) => {
    const trimmed = msgs.slice(-MAX_MESSAGES);
    setMessages(trimmed);
    lsSet(STORAGE_KEY, trimmed);
  };

  const sendMessage = useCallback(async (text, issData, newsData) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text, id: Date.now() };
    const nextMsgs = [...messages, userMsg];
    saveMessages(nextMsgs);
    setLoading(true);
    setError(null);

    try {
      const systemPrompt = buildSystemPrompt(issData, newsData);
      const conversationHistory = nextMsgs.slice(-6);
      const prompt = `<s>[INST] ${systemPrompt}

${conversationHistory.map(m => m.role === 'user' ? m.content : `[/INST] ${m.content} </s><s>[INST]`).join('\n')} [/INST]`;

      if (!HF_TOKEN || HF_TOKEN === 'your_huggingface_token_here') {
        // Offline mock response
        await new Promise(r => setTimeout(r, 1200));
        const reply = generateMockReply(text, issData, newsData);
        const assistantMsg = { role: 'assistant', content: reply, id: Date.now() + 1 };
        saveMessages([...nextMsgs, assistantMsg]);
        return;
      }

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${MODEL}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 256, temperature: 0.7, return_full_text: false },
          }),
          signal: (abortRef.current = new AbortController()).signal,
        }
      );

      if (!response.ok) throw new Error(`HF API error: ${response.status}`);
      const data = await response.json();
      const raw = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
      const content = (raw || '').replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/g, '').trim()
        || 'I could not generate a response. Please try again.';

      const assistantMsg = { role: 'assistant', content, id: Date.now() + 1 };
      saveMessages([...nextMsgs, assistantMsg]);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e.message);
        const errMsg = { role: 'assistant', content: `Error: ${e.message}. Using dashboard data directly: ${generateMockReply(text, issData, newsData)}`, id: Date.now() + 1 };
        saveMessages([...nextMsgs, errMsg]);
      }
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const clearChat = useCallback(() => {
    saveMessages([]);
  }, []);

  return { messages, loading, error, sendMessage, clearChat };
}

function generateMockReply(text, issData, newsData) {
  const q = text.toLowerCase();
  if (q.includes('iss') || q.includes('station') || q.includes('location') || q.includes('where')) {
    if (!issData?.position) return 'ISS data is currently loading. Please wait a moment.';
    return `The ISS is currently at Latitude ${issData.position.lat?.toFixed(4)}°, Longitude ${issData.position.lon?.toFixed(4)}° — over ${issData.location}. It's traveling at approximately ${issData.speed} km/h. I've tracked ${issData.history?.length || 0} positions so far.`;
  }
  if (q.includes('speed')) {
    return `The ISS is traveling at approximately ${issData?.speed || 'N/A'} km/h. The ISS orbits Earth at an average altitude of ~408 km and completes one orbit every ~92 minutes.`;
  }
  if (q.includes('people') || q.includes('astronaut') || q.includes('crew')) {
    if (!issData?.people) return 'Astronaut data is loading.';
    const names = issData.people.people?.map(p => p.name).join(', ');
    return `There are currently ${issData.people.number} people in space. Their names are: ${names}.`;
  }
  if (q.includes('news') || q.includes('headline') || q.includes('article')) {
    const allNews = Object.values(newsData || {}).flat().slice(0, 5);
    if (!allNews.length) return 'No news articles are loaded yet.';
    return `Here are the latest headlines:\n${allNews.map((a, i) => `${i+1}. ${a.title} (${a.source?.name})`).join('\n')}`;
  }
  return "I can only answer questions based on the dashboard data — ISS tracking information and the loaded news headlines. Try asking about the ISS location, speed, crew, or recent news articles.";
}
