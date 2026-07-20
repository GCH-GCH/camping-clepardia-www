import {
  authorizeInboxRequest,
  logInboxError,
  serializeInboxError,
} from '../../_lib/inbox.js';
import {
  sendJson,
} from '../../_lib/mailCenter.js';
import {
  getSiteEventsStatus,
} from '../../_lib/camp.js';
import { getStayPanelsStatus } from '../../_lib/stay.js';

const isAnalyticsMigrationError = (payload = {}) => {
  const text = `${payload.error || ''} ${payload.details || ''}`.toLowerCase();
  return payload.code === 'SUPABASE_QUERY_FAILED'
    && (/site_events|analytics_recommendations/.test(text) || /relation .*does not exist/.test(text) || /schema cache|column .*does not exist/.test(text));
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('allow', 'GET');
      return sendJson(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
    }
    if (!authorizeInboxRequest(req)) {
      return sendJson(res, 401, { ok: false, code: 'UNAUTHORIZED' });
    }

    const [analyticsResult, myStayResult] = await Promise.allSettled([getSiteEventsStatus(), getStayPanelsStatus()]);
    const analyticsError = analyticsResult.status === 'rejected' ? serializeInboxError(analyticsResult.reason) : null;
    const myStayError = myStayResult.status === 'rejected' ? serializeInboxError(myStayResult.reason) : null;
    if (analyticsError) logInboxError('analytics-status-site-events', analyticsResult.reason, { method:req.method || '' });
    if (myStayError) logInboxError('analytics-status-my-stay', myStayResult.reason, { method:req.method || '' });
    const analyticsMigrationRequired = Boolean(analyticsError && isAnalyticsMigrationError(analyticsError.payload));
    const myStayErrorText = `${myStayError?.payload?.error || ''} ${myStayError?.payload?.details || ''}`.toLowerCase();
    const myStayMigrationRequired = Boolean(myStayError && (/stay_panels/.test(myStayErrorText) || /relation .*does not exist/.test(myStayErrorText) || /schema cache/.test(myStayErrorText)));
    const analytics = analyticsResult.status === 'fulfilled' ? analyticsResult.value : {
      table:'site_events', eventCount:0, recentEvents:[], summary:{},
    };
    const myStay = myStayResult.status === 'fulfilled'
      ? { status:'active', migrationRequired:false, ...myStayResult.value }
      : {
          ok:false,
          status:myStayMigrationRequired ? 'migration_required' : 'error',
          migrationRequired:myStayMigrationRequired,
          table:'stay_panels', panelCount:0, activeTokens:0, feedbackCount:0, totalOpens:0,
          reason:myStayMigrationRequired ? 'Migracja stay_panels nie została jeszcze uruchomiona w Supabase.' : 'Nie udało się sprawdzić My Stay.',
        };
    return sendJson(res, 200, {
      ok: analyticsResult.status === 'fulfilled',
      migrationRequired: analyticsMigrationRequired,
      ...analytics,
      myStay,
    });
  } catch (error) {
    logInboxError('analytics-status', error, { method: req.method || '' });
    const diagnostic = serializeInboxError(error);
    const migrationRequired = isAnalyticsMigrationError(diagnostic.payload);
    return sendJson(res, diagnostic.status, {
      ...diagnostic.payload,
      ok: false,
      table: 'site_events',
      migrationRequired,
      eventCount: 0,
      recentEvents: [],
      reason: migrationRequired
        ? 'Migracja site_events nie została jeszcze uruchomiona w Supabase.'
        : diagnostic.payload.error,
    });
  }
}
