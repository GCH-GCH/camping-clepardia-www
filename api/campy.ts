import { buildCampySystemPrompt, getCampyFallbackResponse } from '../src/lib/campy/systemPrompt.ts';

type CampyRequestBody = {
  message?: unknown;
  language?: unknown;
  pageContext?: unknown;
  conversationHistory?: unknown;
};

const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_ITEMS = 10;

const sanitize = (value: unknown) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);

const normalizeLanguage = (value: unknown) => {
  const language = String(value ?? 'pl').toLowerCase();
  return ['pl', 'en', 'de', 'it', 'fr', 'es', 'nl', 'cs', 'sk', 'sv'].includes(language) ? language : 'en';
};

const normalizeHistory = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => {
      const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        role: record.role === 'assistant' ? 'assistant' : 'user',
        content: sanitize(record.content),
      };
    })
    .filter((item) => item.content.length > 0);
};

const sendJson = (response: any, status: number, data: unknown) => {
  response.status(status).setHeader('cache-control', 'no-store').json(data);
};

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('allow', 'POST');
    return sendJson(response, 405, { ok: false, message: 'Method not allowed.' });
  }

  const body = (request.body || {}) as CampyRequestBody;
  const message = sanitize(body.message);
  const language = normalizeLanguage(body.language);
  const pageContext = sanitize(body.pageContext);
  const conversationHistory = normalizeHistory(body.conversationHistory);

  if (!message) {
    return sendJson(response, 400, { ok: false, message: 'Message is required.' });
  }

  // Placeholder pod docelowy rate limit per IP/session. Vercel Serverless
  // może podpiąć tutaj trwały store bez zmiany kontraktu endpointu.
  const rateLimit = { ok: true, remaining: null };
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const fallbackAnswer = getCampyFallbackResponse(language, message);

  if (!apiKey) {
    return sendJson(response, 200, {
      ok: true,
      mode: 'fallback',
      rateLimit,
      answer: fallbackAnswer,
      escalationEmail: process.env.CAMPY_HUMAN_ESCALATION_EMAIL || 'clepardia@gmail.com',
    });
  }

  try {
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 420,
        messages: [
          { role: 'system', content: buildCampySystemPrompt(language) },
          ...(pageContext ? [{ role: 'system', content: `Current page context: ${pageContext}` }] : []),
          ...conversationHistory,
          { role: 'user', content: message },
        ],
      }),
    });

    if (!aiResponse.ok) {
      return sendJson(response, 200, { ok: true, mode: 'fallback', rateLimit, answer: fallbackAnswer });
    }

    const data = await aiResponse.json();
    const answer = sanitize(data?.choices?.[0]?.message?.content) || fallbackAnswer;
    return sendJson(response, 200, { ok: true, mode: 'ai', rateLimit, answer });
  } catch {
    return sendJson(response, 200, { ok: true, mode: 'fallback', rateLimit, answer: fallbackAnswer });
  }
}
