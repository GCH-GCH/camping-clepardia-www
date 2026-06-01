import type { APIRoute } from 'astro';
import { handleReservationInquiryRequest } from '@/server/inquiry/handleReservationInquiryRequest';

export const OPTIONS: APIRoute = ({ request }) => handleReservationInquiryRequest(request);

export const POST: APIRoute = ({ request }) => handleReservationInquiryRequest(request);
