export type TierName = 'FREE' | 'STANDARD' | 'PREMIUM';

export interface TierLimits {
  tables: number;
  menuItems: number;
  staff: number;
  monthlyOrders: number;
}

export interface TierUsage extends TierLimits {
  tier: TierName;
}

export interface TierUsageResponse {
  tier: TierName;
  limits: TierLimits;
  current: TierLimits;
  features: {
    kds: boolean;
    advancedReports: boolean;
    multiLocation: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
  };
}

export interface TierFeatureComparison {
  tier: TierName;
  price: number;
  limits: TierLimits;
  features: string[];
}
