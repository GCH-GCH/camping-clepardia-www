import analyticsEventHandler from './_handlers/analytics/event.js';
import analyticsDashboardHandler from './_handlers/analytics/dashboard.js';
import analyticsFeedbackHandler from './_handlers/analytics/feedback.js';
import analyticsRecommendationsHandler from './_handlers/analytics/recommendations.js';
import analyticsReportHandler from './_handlers/analytics/report.js';
import analyticsStatusHandler from './_handlers/analytics/status.js';
import campStaysHandler from './_handlers/camp/stays.js';
import clientsDetailHandler from './_handlers/clients/detail.js';
import clientsListHandler from './_handlers/clients/list.js';
import clientsNoteHandler from './_handlers/clients/note.js';
import inboxActivityHandler from './_handlers/inbox/activity.js';
import inboxSaveDraftHandler from './_handlers/inbox/save-draft.js';
import inboxSendReplyHandler from './_handlers/inbox/send-reply.js';
import inboxThreadHandler from './_handlers/inbox/thread.js';
import reservationInquiryHandler from './_handlers/reservation-inquiry.js';
import stayAdminHandler from './_handlers/stay/admin.js';
import stayPanelHandler from './_handlers/stay/panel.js';
import weatherHandler from './_handlers/weather.js';

const handlers = new Map([
  ['analytics/event', analyticsEventHandler],
  ['analytics/dashboard', analyticsDashboardHandler],
  ['analytics/feedback', analyticsFeedbackHandler],
  ['analytics/recommendations', analyticsRecommendationsHandler],
  ['analytics/report', analyticsReportHandler],
  ['analytics/status', analyticsStatusHandler],
  ['camp/stays', campStaysHandler],
  ['clients/detail', clientsDetailHandler],
  ['clients/list', clientsListHandler],
  ['clients/note', clientsNoteHandler],
  ['inbox/activity', inboxActivityHandler],
  ['inbox/save-draft', inboxSaveDraftHandler],
  ['inbox/send-reply', inboxSendReplyHandler],
  ['inbox/thread', inboxThreadHandler],
  ['reservation-inquiry', reservationInquiryHandler],
  ['stay/admin', stayAdminHandler],
  ['stay/panel', stayPanelHandler],
  ['weather', weatherHandler],
]);

const routeFromRequest = (req) => {
  const raw = req.query?.path ?? req.query?.['...path'];
  if (Array.isArray(raw)) return raw.join('/');
  if (typeof raw === 'string' && raw) return raw.replace(/^\/+|\/+$/g, '');

  const url = new URL(req.url || '/', 'http://localhost');
  return url.pathname.replace(/^\/api\/?/, '').replace(/^\/+|\/+$/g, '');
};

export default async function handler(req, res) {
  const route = routeFromRequest(req);
  const selected = handlers.get(route);
  if (!selected) {
    res.status(404).setHeader('cache-control', 'no-store').json({
      ok: false,
      code: 'API_ROUTE_NOT_FOUND',
      route,
    });
    return;
  }
  return selected(req, res);
}
