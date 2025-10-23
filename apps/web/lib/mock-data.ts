type MatchScore = {
  providerId: string;
  needId: string;
  score: number;
  breakdown: Record<string, number>;
};

export interface Offer {
  id: string;
  providerName: string;
  price: number;
  etaMinutes: number;
  rating: number;
  message: string;
}

export interface NeedPreview {
  id: string;
  title: string;
  category: string;
  location: string;
  budget: string;
  status: string;
}

export const sampleOffers: Offer[] = [
  {
    id: 'offer-1',
    providerName: 'SwiftFix Plumbing',
    price: 120,
    etaMinutes: 45,
    rating: 4.8,
    message: 'Can arrive within the hour with all parts ready.',
  },
  {
    id: 'offer-2',
    providerName: 'Neighborhood Pros',
    price: 105,
    etaMinutes: 60,
    rating: 4.6,
    message: 'Includes cleanup and 30-day guarantee.',
  },
  {
    id: 'offer-3',
    providerName: 'Budget Hands',
    price: 85,
    etaMinutes: 90,
    rating: 4.2,
    message: 'Best for flexible scheduling later today.',
  },
];

export const sampleNeed: NeedPreview = {
  id: 'need-42',
  title: 'Fix leaking kitchen faucet',
  category: 'Home Services',
  location: 'Midtown',
  budget: '$150',
  status: 'Posted',
};

export const sampleMatchScores: MatchScore[] = [
  {
    providerId: 'swiftfix',
    needId: 'need-42',
    score: 91,
    breakdown: {
      distance: 85,
      price: 90,
      rating: 95,
      eta: 92,
    },
  },
  {
    providerId: 'neighborhood-pros',
    needId: 'need-42',
    score: 88,
    breakdown: {
      distance: 80,
      price: 88,
      rating: 92,
      eta: 90,
    },
  },
  {
    providerId: 'budget-hands',
    needId: 'need-42',
    score: 76,
    breakdown: {
      distance: 70,
      price: 82,
      rating: 68,
      eta: 84,
    },
  },
];

