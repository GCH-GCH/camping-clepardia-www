import { logInboxError } from '../../_lib/inbox.js';
import { readJsonBody, sendJson } from '../../_lib/mailCenter.js';
import { saveSiteEvent } from '../../_lib/camp.js';
import {
  getStayPanelByToken,
  recordStayPanelOpen,
  saveStayPanelFeedback,
} from '../../_lib/stay.js';

const genericError = (res, status = 404) => sendJson(res, status, {
  ok: false,
  code: status === 404 ? 'STAY_PANEL_NOT_FOUND' : 'STAY_PANEL_UNAVAILABLE',
  message: 'Nie znaleziono panelu pobytu. Skontaktuj się z recepcją.',
});

const track = async (eventType, result, metadata = {}) => {
  try {
    await saveSiteEvent({
      eventType,
      pagePath: '/stay/:token',
      locale: result.publicData.locale,
      metadata: { stayHash: result.tokenHash.slice(0, 24), ...metadata },
    });
  } catch (error) {
    logInboxError(`stay-${eventType}-analytics`, error);
  }
};

export default async function handler(req, res) {
  res.setHeader('x-robots-tag', 'noindex, nofollow, noarchive');
  try {
    if (!['GET', 'POST'].includes(req.method || '')) {
      res.setHeader('allow', 'GET, POST');
      return sendJson(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }

    const body = req.method === 'POST' ? await readJsonBody(req) : {};
    const token = String(body.token || req.query?.token || '').trim();
    const locale = String(body.lang || req.query?.lang || '').trim();
    const result = await getStayPanelByToken(token, locale);
    if (!result) return genericError(res, 404);

    if (req.method === 'GET') {
      let openState = {
        openCount: Number(result.panel.open_count || 0),
        lastOpenedAt: result.panel.last_opened_at || null,
      };
      try {
        openState = await recordStayPanelOpen(result.panel);
      } catch (error) {
        logInboxError('stay-open-count', error);
      }
      await track('open_my_stay', result, { source: 'magic_link' });
      return sendJson(res, 200, {
        ok: true,
        panel: { ...result.publicData, panel: { ...result.publicData.panel, ...openState } },
      });
    }

    if (body.action === 'feedback') {
      const feedback = await saveStayPanelFeedback(result.panel, body);
      await track('my_stay_feedback', result, {
        rating: feedback.rating,
        helpful: feedback.helpful,
        hasComment: Boolean(feedback.text),
      });
      return sendJson(res, 200, { ok: true, saved: true, feedback: { ...feedback, text: undefined } });
    }

    return sendJson(res, 400, { ok: false, code: 'STAY_ACTION_INVALID', message: 'Nieprawidłowa akcja.' });
  } catch (error) {
    logInboxError('stay-panel', error, { method: req.method || '' });
    return genericError(res, 503);
  }
}
