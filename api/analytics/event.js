import {
  logInboxError,
  serializeInboxError,
} from '../_lib/inbox.js';
import {
  readJsonBody,
  sendJson,
} from '../_lib/mailCenter.js';
import {
  saveSiteEvent,
} from '../_lib/camp.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('allow', 'POST');
      return sendJson(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }

    const payload = await readJsonBody(req);
    const event = await saveSiteEvent(payload);
    return sendJson(res, 200, {
      ok: true,
      stored: true,
      table: 'site_events',
      eventId: event?.id || null,
    });
  } catch (error) {
    const diagnostic = serializeInboxError(error);
    logInboxError('analytics-event', error, { method: req.method || '' });

    if (diagnostic.payload.code === 'ANALYTICS_EVENT_NOT_ALLOWED') {
      return sendJson(res, 400, {
        ok: false,
        stored: false,
        code: diagnostic.payload.code,
        error: diagnostic.payload.error,
        details: diagnostic.payload.details,
      });
    }

    return sendJson(res, 200, {
      ok: true,
      stored: false,
      table: 'site_events',
      code: diagnostic.payload.code,
      reason: 'Analytics event was accepted but not persisted. Run the safe site_events migration or check Supabase ENV.',
    });
  }
}
