export type SubscriptionTier = 'FREE' | 'STANDARD' | 'PREMIUM';
export type SubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'SUSPENDED';
export type PaymentStatus =
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'ACTIVATED'
  | 'REJECTED';
export type RefundStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
export type RefundReason =
  | 'NOT_SATISFIED'
  | 'TECHNICAL_ISSUES'
  | 'FOUND_ALTERNATIVE'
  | 'OTHER';

export interface Subscription {
  id: string;
  storeId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  isTrialUsed: boolean;
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  daysUntilExpiry?: number;
}

export interface BankTransferDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  referenceNumber: string;
}

export interface PaymentRequest {
  id: string;
  subscriptionId?: string;
  requestedTier: SubscriptionTier;
  amount: string;
  currency: string;
  status: PaymentStatus;
  bankTransferDetails?: BankTransferDetails;
  requestedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  paymentProofUrl?: string;
}

export interface RefundRequest {
  id: string;
  status: RefundStatus;
  requestedAmount: string;
  reason: RefundReason;
  comments?: string;
  requestedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface OwnershipTransfer {
  transferId: string;
  otpSent: boolean;
  otpExpiresAt: string;
  message: string;
}

export interface TrialEligibility {
  eligible: boolean;
  remainingTrials: number;
  usedTrials: number;
  message: string;
}

export interface TrialStatus {
  isTrialActive: boolean;
  trialStartedAt?: string;
  trialEndsAt?: string;
  daysRemaining?: number;
}
