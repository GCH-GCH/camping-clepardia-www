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

const normalizeNodeHeaders = (headers: Record<string, string | string[] | undefined> = {}) => {
  const normalized = new Headers();

  Object.entries(headers).forEach(([key, value]) => {
    if (typeof value === 'string') {
      normalized.set(key, value);
      return;
    }

    if (Array.isArray(value)) {
      normalized.set(key, value.filter(Boolean).join(', '));
    }
  });

  return normalized;
};

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
    headers: normalizeNodeHeaders(req.headers),
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
  });
};

const sendNodeResponse = async (res: any, response: Response) => {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(await response.text());
};

export default async function handler(req: any, res?: any) {
  try {
    const request = req instanceof Request ? req : await nodeRequestToWebRequest(req);
    const response = await handleReservationInquiryRequest(request);

    if (res) {
      await sendNodeResponse(res, response);
      return;
    }

    return response;
  } catch (error) {
    const payload = JSON.stringify({
      ok: false,
      mode: 'error',
      message: 'Reservation endpoint failed before accepting the enquiry.',
      reason: error instanceof Error ? error.message : 'Unknown reservation endpoint error.',
    });

    if (res) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.setHeader('cache-control', 'no-store');
      res.end(payload);
      return;
    }

    return new Response(payload, {
      status: 500,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  }
}
