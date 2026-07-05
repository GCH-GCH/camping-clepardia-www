import {
  authorizeInboxRequest,
  checkReservationInquiriesTable,
  getInboxEnvHealth,
  logInboxError,
  serializeInboxError,
} from '../_lib/inbox.js';
import {
  checkMailCenterTables,
} from '../_lib/mailCenter.js';

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
      const [tableCheck, mailCenter] = await Promise.all([
        checkReservationInquiriesTable(),
        checkMailCenterTables(),
      ]);
      return sendJson(res, 200, { ok: true, env, tableCheck, mailCenter });
    } catch (error) {
      logInboxError('inbox-health-table', error);
      const diagnostic = serializeInboxError(error);
      const mailCenter = await checkMailCenterTables().catch(() => ({
        ok: false,
        historyActive: false,
        draftsActive: false,
        migrationRequired: true,
        message: 'Nie udało się sprawdzić tabel Mail Center.',
        tables: {},
      }));
      return sendJson(res, diagnostic.status, {
        ok: false,
        env,
        tableCheck: {
          ok: false,
          status: diagnostic.payload.supabaseStatus ?? null,
          error: diagnostic.payload.error,
        },
        mailCenter,
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
