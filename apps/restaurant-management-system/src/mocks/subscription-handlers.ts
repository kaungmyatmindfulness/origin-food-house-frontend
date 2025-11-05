import { http, HttpResponse } from 'msw';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const subscriptionHandlers = [
  http.post(
    `${BASE_URL}/subscriptions/payment-requests`,
    async ({ request }) => {
      const body = (await request.json()) as {
        storeId: string;
        requestedTier: 'STANDARD' | 'PREMIUM';
      };
      const amount = body.requestedTier === 'STANDARD' ? '240.00' : '1200.00';
      const referenceNumber = `OFH-2025-${Math.floor(Math.random() * 900000 + 100000)}`;

      return HttpResponse.json(
        {
          id: `pr_${Math.random().toString(36).substring(2, 9)}`,
          subscriptionId: `sub_${Math.random().toString(36).substring(2, 9)}`,
          requestedTier: body.requestedTier,
          amount,
          currency: 'USD',
          status: 'PENDING_VERIFICATION',
          bankTransferDetails: {
            bankName: 'Bangkok Bank',
            accountNumber: '1234567890',
            accountName: 'Origin Food House Ltd.',
            referenceNumber,
          },
          requestedAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    }
  ),

  http.post(
    `${BASE_URL}/subscriptions/payment-requests/:id/upload-proof`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({
        success: true,
        paymentProofUrl: `https://s3.amazonaws.com/mock-url/payment-proof-${Date.now()}.jpg`,
      });
    }
  ),

  http.get(`${BASE_URL}/subscriptions/payment-requests/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id: id as string,
      status: 'PENDING_VERIFICATION',
      requestedTier: 'STANDARD',
      amount: '240.00',
      requestedAt: new Date().toISOString(),
    });
  }),

  http.get(`${BASE_URL}/subscriptions/payment-requests`, () => {
    return HttpResponse.json({
      data: [
        {
          id: `pr_${Math.random().toString(36).substring(2, 9)}`,
          status: 'PENDING_VERIFICATION',
          requestedTier: 'STANDARD',
          amount: '240.00',
          requestedAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: `pr_${Math.random().toString(36).substring(2, 9)}`,
          status: 'VERIFIED',
          requestedTier: 'STANDARD',
          amount: '240.00',
          requestedAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          verifiedAt: new Date(
            Date.now() - 4 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ],
      meta: {
        total: 2,
        page: 1,
        pageSize: 20,
      },
    });
  }),

  http.get(`${BASE_URL}/subscriptions/stores/:storeId`, ({ params }) => {
    const { storeId } = params;
    const isFreeTier = Math.random() > 0.5;

    if (isFreeTier) {
      return HttpResponse.json({
        id: `sub_${Math.random().toString(36).substring(2, 9)}`,
        storeId: storeId as string,
        tier: 'FREE',
        status: 'ACTIVE',
        isTrialUsed: false,
        trialEndsAt: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        daysUntilExpiry: null,
      });
    }

    const trialEndsAt = new Date(
      Date.now() + 15 * 24 * 60 * 60 * 1000
    ).toISOString();
    return HttpResponse.json({
      id: `sub_${Math.random().toString(36).substring(2, 9)}`,
      storeId: storeId as string,
      tier: 'STANDARD',
      status: 'TRIAL',
      isTrialUsed: true,
      trialEndsAt,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: trialEndsAt,
      daysUntilExpiry: 15,
    });
  }),

  http.get(`${BASE_URL}/subscriptions/trial-eligibility`, () => {
    return HttpResponse.json({
      eligible: true,
      remainingTrials: 2,
      usedTrials: 0,
      message: 'You can start a trial for your next 2 stores',
    });
  }),

  http.get(`${BASE_URL}/subscriptions/stores/:storeId/trial`, () => {
    const isTrialActive = Math.random() > 0.7;

    if (!isTrialActive) {
      return HttpResponse.json({
        isTrialActive: false,
      });
    }

    const trialStartedAt = new Date(
      Date.now() - 15 * 24 * 60 * 60 * 1000
    ).toISOString();
    const trialEndsAt = new Date(
      Date.now() + 15 * 24 * 60 * 60 * 1000
    ).toISOString();

    return HttpResponse.json({
      isTrialActive: true,
      trialStartedAt,
      trialEndsAt,
      daysRemaining: 15,
    });
  }),

  http.post(
    `${BASE_URL}/subscriptions/stores/:storeId/transfer-ownership`,
    async () => {
      return HttpResponse.json({
        transferId: `tr_${Math.random().toString(36).substring(2, 9)}`,
        otpSent: true,
        otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        message: 'OTP sent to your email',
      });
    }
  ),

  http.post(
    `${BASE_URL}/subscriptions/transfer/:transferId/verify-otp`,
    async ({ request }) => {
      const body = (await request.json()) as { otpCode: string };

      if (body.otpCode === '123456') {
        return HttpResponse.json({
          success: true,
          message: 'Ownership transferred successfully',
        });
      }

      return HttpResponse.json(
        {
          error: 'Invalid OTP. 2 attempts remaining.',
        },
        { status: 401 }
      );
    }
  ),

  http.delete(`${BASE_URL}/subscriptions/transfer/:transferId`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Transfer cancelled',
    });
  }),

  http.post(`${BASE_URL}/subscriptions/refund-requests`, async () => {
    return HttpResponse.json({
      id: `rf_${Math.random().toString(36).substring(2, 9)}`,
      status: 'REQUESTED',
      requestedAmount: '240.00',
      message: 'Refund request submitted',
    });
  }),

  http.get(`${BASE_URL}/subscriptions/refund-requests`, () => {
    return HttpResponse.json({
      data: [
        {
          id: `rf_${Math.random().toString(36).substring(2, 9)}`,
          status: 'REQUESTED',
          requestedAmount: '240.00',
          reason: 'NOT_SATISFIED',
          requestedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ],
    });
  }),
];
