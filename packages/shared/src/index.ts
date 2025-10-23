import { z } from 'zod';

export const userRoles = ['client', 'expert', 'business', 'worker', 'admin'] as const;
export type UserRole = (typeof userRoles)[number];
export const userRoleSchema = z.enum(userRoles);

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  location?: GeoLocation;
}

export const needStatuses = ['draft', 'posted', 'matched', 'in_progress', 'completed', 'cancelled'] as const;
export type NeedStatus = (typeof needStatuses)[number];

export const offerStatuses = ['pending', 'accepted', 'declined', 'expired'] as const;
export type OfferStatus = (typeof offerStatuses)[number];

export const orderStatuses = [
  'initiated',
  'awaiting_payment',
  'in_fulfillment',
  'fulfilled',
  'cancelled',
  'disputed',
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const paymentStatuses = ['pending', 'succeeded', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const disputeStatuses = ['open', 'under_review', 'resolved', 'reversed'] as const;
export type DisputeStatus = (typeof disputeStatuses)[number];

export interface MatchScore {
  providerId: string;
  needId: string;
  score: number;
  breakdown: {
    distance: number;
    price: number;
    rating: number;
    eta: number;
  };
}

export const currencies = ['USD', 'EUR', 'GBP'] as const;
export type CurrencyCode = (typeof currencies)[number];

export const budgetSchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.enum(currencies),
});

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const timeWindowSchema = z.object({
  earliest: z.string(),
  latest: z.string().optional(),
});

export const paginatedRequestSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type PaginatedRequest = z.infer<typeof paginatedRequestSchema>;
