import mailCenterSaveDraftHandler from '../mail-center/save-draft.js';

export default async function handler(req, res) {
  return mailCenterSaveDraftHandler(req, res);
}
