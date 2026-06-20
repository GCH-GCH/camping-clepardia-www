import {
  authorizeInboxRequest,
  checkReservationInquiriesTable,
  getInboxEnvHealth,
  logInboxError,
  serializeInboxError,
} from '../_lib/inbox.js';

const sendJson = (res, status, payload) => {
  res.status(status);
  res.setHeader('cache-control', 'no-store');
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.json(payload);
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

    const env = getInboxEnvHealth();
    try {
      const tableCheck = await checkReservationInquiriesTable();
      return sendJson(res, 200, { ok: true, env, tableCheck });
    } catch (error) {
      logInboxError('inbox-health-table', error);
      const diagnostic = serializeInboxError(error);
      return sendJson(res, diagnostic.status, {
        ok: false,
        env,
        tableCheck: {
          ok: false,
          status: diagnostic.payload.supabaseStatus ?? null,
          error: diagnostic.payload.error,
        },
        code: diagnostic.payload.code,
        details: diagnostic.payload.details,
      });
    }
  } catch (error) {
    logInboxError('inbox-health', error);
    const diagnostic = serializeInboxError(error);
    return sendJson(res, diagnostic.status, diagnostic.payload);
  }
}
