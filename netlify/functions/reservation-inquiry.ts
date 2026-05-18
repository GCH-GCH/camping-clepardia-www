import { handleReservationInquiryRequest } from '../../src/server/inquiry/handleReservationInquiryRequest';

export default async function handler(request: Request) {
  return handleReservationInquiryRequest(request);
}

export const config = {
  path: '/api/reservation-inquiry',
};
