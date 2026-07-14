import mailCenterThreadHandler from '../../mail-center/thread.js';

export default async function handler(req, res) {
  return mailCenterThreadHandler(req, res);
}
