import {
  authorizeInboxRequest,
  checkReservationInquiriesTable,
  checkSupabaseTable,
  getInboxEnvHealth,
  logInboxError,
  serializeInboxError,
} from '../_lib/inbox.js';

const TABLES = {
  camp_stays: ['id'],
  site_events: ['id'],
  mail_threads: ['id'],
  mail_messages: ['id'],
  mail_thread_events: ['id'],
  reply_drafts: ['id'],
  inbox_activity_log: ['id'],
  analytics_recommendations: ['id'],
  stay_panels: ['id'],
};

const sendJson = (res, status, payload) => {
  res.status(status);
  res.setHeader('cache-control', 'no-store');
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.json(payload);
};

const safeTableFailure = (error) => {
  const diagnostic = serializeInboxError(error);
  const status = diagnostic.payload.supabaseStatus ?? null;
  const raw = `${diagnostic.payload.error || ''} ${diagnostic.payload.details || ''}`.toLowerCase();
  const migrationRequired = status === 404
    || /relation .* does not exist|schema cache|pgrst20[45]|undefined_table/.test(raw);
  return {
    ok: false,
    exists: migrationRequired ? false : null,
    status,
    code: migrationRequired ? 'TABLE_MISSING' : diagnostic.payload.code,
    migrationRequired,
  };
};

const checkTable = async (table, columns) => {
  try {
    const result = table === 'reservation_inquiries'
      ? await checkReservationInquiriesTable()
      : await checkSupabaseTable(table, columns);
    return { ok: true, exists: true, status: result.status, code: null, migrationRequired: false };
  } catch (error) {
    logInboxError('system-health-table', error, {
      endpoint: '/api/system/health',
      module: 'supabase-health',
      table,
    });
    return safeTableFailure(error);
  }
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
    const entries = await Promise.all([
      checkTable('reservation_inquiries', ['id']).then((result) => ['reservation_inquiries', result]),
      ...Object.entries(TABLES).map(async ([table, columns]) => [table, await checkTable(table, columns)]),
    ]);
    const tables = Object.fromEntries(entries);
    const checks = Object.values(tables);
    const connected = checks.some((table) => table.ok || (table.status !== null && Number.isFinite(Number(table.status))));
    const mailCenterNames = ['mail_threads', 'mail_messages', 'mail_thread_events', 'reply_drafts', 'inbox_activity_log'];
    const mailCenterReady = mailCenterNames.every((name) => tables[name]?.ok);
    const resendConfigured = Boolean(env.resendKeyPresent && env.reservationFromPresent && env.reservationToPresent);
    const storageReady = Boolean(tables.reservation_inquiries?.ok);
    const receptionReachable = storageReady || resendConfigured;

    return sendJson(res, 200, {
      ok: connected && receptionReachable,
      checkedAt: new Date().toISOString(),
      env: {
        environment: env.environment,
        supabaseUrlPresent: env.supabaseUrlPresent,
        supabaseUrlLength: env.supabaseUrlLength,
        serviceRolePresent: env.serviceRolePresent,
        serviceRoleLength: env.serviceRoleLength,
        inboxCodePresent: env.inboxCodePresent,
        inboxCodeLength: env.inboxCodeLength,
        supabaseHost: env.supabaseHost,
      },
      supabase: {
        connected,
        reservationInquiries: storageReady,
        campStays: Boolean(tables.camp_stays?.ok),
        siteEvents: Boolean(tables.site_events?.ok),
      },
      resend: {
        configured: resendConfigured,
        keyPresent: env.resendKeyPresent,
        keyLength: env.resendKeyLength,
        fromPresent: env.reservationFromPresent,
        toPresent: env.reservationToPresent,
      },
      forms: {
        ok: receptionReachable,
        storageReady,
        mailReady: resendConfigured,
      },
      modules: {
        camp: { ok: Boolean(tables.camp_stays?.ok), migrationRequired: Boolean(tables.camp_stays?.migrationRequired) },
        mailCenter: { ok: mailCenterReady, migrationRequired: !mailCenterReady && mailCenterNames.some((name) => tables[name]?.migrationRequired) },
        analytics: {
          ok: Boolean(tables.site_events?.ok && tables.analytics_recommendations?.ok),
          migrationRequired: Boolean(tables.site_events?.migrationRequired || tables.analytics_recommendations?.migrationRequired),
        },
      },
      tables,
    });
  } catch (error) {
    logInboxError('system-health', error, {
      endpoint: '/api/system/health',
      module: 'system-health',
    });
    return sendJson(res, 500, { ok: false, code: 'SYSTEM_HEALTH_FAILED' });
  }
}
