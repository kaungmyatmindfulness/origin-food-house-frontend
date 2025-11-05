import { http, HttpResponse } from 'msw';

interface PaymentRequestDetailDto {
  id: string;
  subscriptionId: string;
  requestedTier: 'STANDARD' | 'PREMIUM';
  amount: string;
  currency: 'USD';
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'ACTIVATED' | 'REJECTED';
  requestedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  storeName: string;
  requestedBy: {
    userId: string;
    email: string;
    name: string;
  };
  paymentProofUrl?: string;
  paymentProofPresignedUrl?: string;
  bankTransferDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    referenceNumber: string;
  };
}

const mockPaymentRequests: PaymentRequestDetailDto[] = [
  {
    id: 'pr_7char1',
    subscriptionId: 'sub_7ch2',
    requestedTier: 'STANDARD',
    amount: '240.00',
    currency: 'USD',
    status: 'PENDING_VERIFICATION',
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    storeName: 'The Great Thai Restaurant',
    requestedBy: {
      userId: 'user_abc123',
      email: 'owner@restaurant.com',
      name: 'John Doe',
    },
    paymentProofUrl: 'payment-proofs/pr_7char1.jpg',
    paymentProofPresignedUrl:
      'https://via.placeholder.com/800x600/2563eb/ffffff?text=Payment+Proof+1',
    bankTransferDetails: {
      bankName: 'Bangkok Bank',
      accountNumber: '1234567890',
      accountName: 'Origin Food House Ltd.',
      referenceNumber: 'OFH-2025-123456',
    },
  },
  {
    id: 'pr_7char2',
    subscriptionId: 'sub_7ch3',
    requestedTier: 'PREMIUM',
    amount: '1200.00',
    currency: 'USD',
    status: 'PENDING_VERIFICATION',
    requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    storeName: 'Sushi Palace',
    requestedBy: {
      userId: 'user_xyz789',
      email: 'owner@sushipalace.com',
      name: 'Jane Smith',
    },
    paymentProofUrl: 'payment-proofs/pr_7char2.pdf',
    paymentProofPresignedUrl:
      'https://via.placeholder.com/800x600/dc2626/ffffff?text=Payment+Proof+2',
    bankTransferDetails: {
      bankName: 'Kasikorn Bank',
      accountNumber: '9876543210',
      accountName: 'Origin Food House Ltd.',
      referenceNumber: 'OFH-2025-789012',
    },
  },
  {
    id: 'pr_7char3',
    subscriptionId: 'sub_7ch4',
    requestedTier: 'STANDARD',
    amount: '240.00',
    currency: 'USD',
    status: 'VERIFIED',
    requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    verifiedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    storeName: 'Pizza Express',
    requestedBy: {
      userId: 'user_pqr456',
      email: 'owner@pizzaexpress.com',
      name: 'Mike Johnson',
    },
    paymentProofUrl: 'payment-proofs/pr_7char3.jpg',
    paymentProofPresignedUrl:
      'https://via.placeholder.com/800x600/16a34a/ffffff?text=Payment+Proof+3',
    bankTransferDetails: {
      bankName: 'SCB',
      accountNumber: '5555666677',
      accountName: 'Origin Food House Ltd.',
      referenceNumber: 'OFH-2025-345678',
    },
  },
  {
    id: 'pr_7char4',
    subscriptionId: 'sub_7ch5',
    requestedTier: 'STANDARD',
    amount: '240.00',
    currency: 'USD',
    status: 'REJECTED',
    requestedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    verifiedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    rejectionReason: 'Invalid payment proof - amount mismatch',
    storeName: 'Burger King',
    requestedBy: {
      userId: 'user_lmn890',
      email: 'owner@burgerking.com',
      name: 'Sarah Williams',
    },
    paymentProofUrl: 'payment-proofs/pr_7char4.jpg',
    paymentProofPresignedUrl:
      'https://via.placeholder.com/800x600/ea580c/ffffff?text=Payment+Proof+4',
    bankTransferDetails: {
      bankName: 'Bangkok Bank',
      accountNumber: '1111222233',
      accountName: 'Origin Food House Ltd.',
      referenceNumber: 'OFH-2025-901234',
    },
  },
];

export const adminHandlers = [
  http.get('/admin/payment-requests', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    let filteredRequests = [...mockPaymentRequests];

    if (status) {
      filteredRequests = filteredRequests.filter(
        (req) => req.status === status
      );
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = filteredRequests.slice(start, end);

    const pendingCount = mockPaymentRequests.filter(
      (req) => req.status === 'PENDING_VERIFICATION'
    ).length;

    return HttpResponse.json({
      data: paginatedData.map((req) => ({
        id: req.id,
        storeName: req.storeName,
        requestedTier: req.requestedTier,
        amount: req.amount,
        referenceNumber: req.bankTransferDetails.referenceNumber,
        requestedAt: req.requestedAt,
        requestedBy: req.requestedBy,
        paymentProofUrl: req.paymentProofUrl,
      })),
      meta: {
        total: filteredRequests.length,
        page,
        pageSize,
        pendingCount,
      },
    });
  }),

  http.get('/admin/payment-requests/:id', ({ params }) => {
    const { id } = params;
    const request = mockPaymentRequests.find((req) => req.id === id);

    if (!request) {
      return HttpResponse.json(
        {
          statusCode: 404,
          message: 'Payment request not found',
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(request);
  }),

  http.get('/admin/payment-requests/:id/payment-proof', ({ params }) => {
    const { id } = params;
    const request = mockPaymentRequests.find((req) => req.id === id);

    if (!request || !request.paymentProofPresignedUrl) {
      return HttpResponse.json(
        {
          statusCode: 404,
          message: 'Payment proof not found',
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      presignedUrl: request.paymentProofPresignedUrl,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  }),

  http.post('/admin/payment-requests/:id/verify', async ({ params }) => {
    const { id } = params;

    const paymentRequest = mockPaymentRequests.find((req) => req.id === id);

    if (!paymentRequest) {
      return HttpResponse.json(
        {
          statusCode: 404,
          message: 'Payment request not found',
          error: 'Not Found',
        },
        { status: 404 }
      );
    }

    if (paymentRequest.status !== 'PENDING_VERIFICATION') {
      return HttpResponse.json(
        {
          statusCode: 400,
          message: 'Payment request is not pending verification',
          error: 'Bad Request',
        },
        { status: 400 }
      );
    }

    paymentRequest.status = 'VERIFIED';
    paymentRequest.verifiedAt = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
    });
  }),

  http.post(
    '/admin/payment-requests/:id/reject',
    async ({ params, request }) => {
      const { id } = params;
      const body = await request.json();
      const { reason } = body as { reason: string };

      if (!reason) {
        return HttpResponse.json(
          {
            statusCode: 400,
            message: 'Rejection reason is required',
            error: 'Bad Request',
          },
          { status: 400 }
        );
      }

      const paymentRequest = mockPaymentRequests.find((req) => req.id === id);

      if (!paymentRequest) {
        return HttpResponse.json(
          {
            statusCode: 404,
            message: 'Payment request not found',
            error: 'Not Found',
          },
          { status: 404 }
        );
      }

      if (paymentRequest.status !== 'PENDING_VERIFICATION') {
        return HttpResponse.json(
          {
            statusCode: 400,
            message: 'Payment request is not pending verification',
            error: 'Bad Request',
          },
          { status: 400 }
        );
      }

      paymentRequest.status = 'REJECTED';
      paymentRequest.rejectionReason = reason;
      paymentRequest.verifiedAt = new Date().toISOString();

      return HttpResponse.json({
        success: true,
        message: 'Payment rejected',
      });
    }
  ),

  http.post('/admin/payment-requests/bulk-verify', async ({ request }) => {
    const body = await request.json();
    const { paymentRequestIds } = body as { paymentRequestIds: string[] };

    if (!paymentRequestIds || paymentRequestIds.length === 0) {
      return HttpResponse.json(
        {
          statusCode: 400,
          message: 'Payment request IDs are required',
          error: 'Bad Request',
        },
        { status: 400 }
      );
    }

    let verified = 0;
    let failed = 0;

    for (const id of paymentRequestIds) {
      const paymentRequest = mockPaymentRequests.find((req) => req.id === id);
      if (paymentRequest && paymentRequest.status === 'PENDING_VERIFICATION') {
        paymentRequest.status = 'VERIFIED';
        paymentRequest.verifiedAt = new Date().toISOString();
        verified++;
      } else {
        failed++;
      }
    }

    return HttpResponse.json({
      success: true,
      verified,
      failed,
    });
  }),

  http.get('/admin/metrics', () => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const verifiedToday = mockPaymentRequests.filter(
      (req) =>
        req.status === 'VERIFIED' &&
        req.verifiedAt &&
        new Date(req.verifiedAt) >= todayStart
    ).length;

    const rejectedToday = mockPaymentRequests.filter(
      (req) =>
        req.status === 'REJECTED' &&
        req.verifiedAt &&
        new Date(req.verifiedAt) >= todayStart
    ).length;

    const pendingCount = mockPaymentRequests.filter(
      (req) => req.status === 'PENDING_VERIFICATION'
    ).length;

    const verificationTimes = mockPaymentRequests
      .filter((req) => req.status === 'VERIFIED' && req.verifiedAt)
      .map((req) => {
        const requested = new Date(req.requestedAt).getTime();
        const verified = new Date(req.verifiedAt!).getTime();
        return (verified - requested) / (1000 * 60 * 60);
      });

    const avgVerificationTime =
      verificationTimes.length > 0
        ? verificationTimes.reduce((a, b) => a + b, 0) /
          verificationTimes.length
        : 0;

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const verifiedCount = mockPaymentRequests.filter((req) => {
        if (req.status !== 'VERIFIED' || !req.verifiedAt) return false;
        const verifiedDate = new Date(req.verifiedAt);
        return verifiedDate >= date && verifiedDate < nextDate;
      }).length;

      last7Days.push({
        date: date.toISOString().split('T')[0],
        verified: verifiedCount,
      });
    }

    return HttpResponse.json({
      pendingCount,
      verifiedToday,
      rejectedToday,
      avgVerificationTimeHours: avgVerificationTime,
      verificationTrend: last7Days,
      tierDistribution: {
        STANDARD: mockPaymentRequests.filter(
          (req) => req.requestedTier === 'STANDARD'
        ).length,
        PREMIUM: mockPaymentRequests.filter(
          (req) => req.requestedTier === 'PREMIUM'
        ).length,
      },
    });
  }),
];
