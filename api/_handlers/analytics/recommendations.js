import { authorizeInboxRequest, logInboxError, serializeInboxError } from '../../_lib/inbox.js';
import { readJsonBody, sendJson } from '../../_lib/mailCenter.js';
import {
  aggregateEvents,
  generateRecommendations,
  loadAnalyticsEvents,
  loadFeedbackIntelligence,
  loadRecommendationStatuses,
  parseAnalyticsFilters,
  saveRecommendationStatus,
} from '../../_lib/analytics.js';

export default async function handler(req, res) {
  try {
    if (!['GET', 'PATCH', 'POST'].includes(req.method)) {
      res.setHeader('allow', 'GET, PATCH, POST');
      return sendJson(res, 405, { ok:false, code:'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) return sendJson(res, 401, { ok:false, code:'UNAUTHORIZED' });
    if (req.method !== 'GET') {
      const payload = await readJsonBody(req);
      const saved = await saveRecommendationStatus(payload.key, payload.status, payload.note);
      return sendJson(res, 200, { ok:true, recommendation:saved });
    }
    const [events, feedback, statusRows] = await Promise.all([
      loadAnalyticsEvents(), loadFeedbackIntelligence(req.query || {}), loadRecommendationStatuses(),
    ]);
    const dashboard = aggregateEvents(events, parseAnalyticsFilters(req.query || {}));
    return sendJson(res, 200, { ok:true, recommendations:generateRecommendations(dashboard, feedback, statusRows) });
  } catch (error) {
    logInboxError('analytics-recommendations', error, { method:req.method || '' });
    if (error instanceof Error && error.message === 'RECOMMENDATION_STATUS_INVALID') {
      return sendJson(res, 400, { ok:false, code:error.message, error:'Nieprawidłowy klucz albo status rekomendacji.' });
    }
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, { ...diagnostic.payload, ok:false });
  }
}
