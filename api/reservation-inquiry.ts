import { handleReservationInquiryRequest } from '../src/server/inquiry/handleReservationInquiryRequest';

const collectBody = async (req: any) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk: Uint8Array | string) => {
      chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk);
    });
    req.on('end', () => {
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const body = new Uint8Array(totalLength);
      let offset = 0;
      chunks.forEach((chunk) => {
        body.set(chunk, offset);
        offset += chunk.length;
      });
      resolve(new TextDecoder().decode(body));
    });
    req.on('error', reject);
  });

const nodeRequestToWebRequest = async (req: any) => {
  const protocol = req.headers?.['x-forwarded-proto'] || 'https';
  const host = req.headers?.host || 'localhost';
  const url = `${protocol}://${host}${req.url || '/api/reservation-inquiry'}`;
  const body = req.body
    ? typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body)
    : await collectBody(req);

  return new Request(url, {
    method: req.method || 'POST',
    headers: req.headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
  });
};

const sendNodeResponse = async (res: any, response: Response) => {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(await response.text());
};

export default async function handler(req: any, res?: any) {
  const request = req instanceof Request ? req : await nodeRequestToWebRequest(req);
  const response = await handleReservationInquiryRequest(request);

  if (res) {
    await sendNodeResponse(res, response);
    return;
  }

  return response;
}
