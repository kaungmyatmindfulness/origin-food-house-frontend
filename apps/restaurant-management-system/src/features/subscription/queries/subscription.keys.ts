export const subscriptionKeys = {
  all: ['subscription'] as const,

  subscriptions: () => [...subscriptionKeys.all, 'subscriptions'] as const,

  subscription: (storeId: string) =>
    [...subscriptionKeys.subscriptions(), storeId] as const,

  trialEligibility: (userId: string) =>
    [...subscriptionKeys.all, 'trial-eligibility', userId] as const,

  trialStatus: (storeId: string) =>
    [...subscriptionKeys.all, 'trial-status', storeId] as const,

  paymentRequests: () => [...subscriptionKeys.all, 'payment-requests'] as const,

  paymentRequestsList: (storeId: string) =>
    [...subscriptionKeys.paymentRequests(), 'list', storeId] as const,

  paymentRequest: (id: string) =>
    [...subscriptionKeys.paymentRequests(), id] as const,

  refundRequests: () => [...subscriptionKeys.all, 'refund-requests'] as const,

  refundRequestsList: (storeId: string) =>
    [...subscriptionKeys.refundRequests(), 'list', storeId] as const,
};
