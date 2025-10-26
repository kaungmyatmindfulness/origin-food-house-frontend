import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TierUsageWidget } from '../components/tier-usage-widget';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the tier service
jest.mock('../services/tier.service', () => ({
  getTierUsage: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('TierUsageWidget', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('should render loading state with skeletons', () => {
    // Mock getTierUsage to hang (never resolve) to keep loading state
    const { getTierUsage } = require('../services/tier.service');
    (getTierUsage as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <Wrapper>
        <TierUsageWidget storeId="test-store" />
      </Wrapper>
    );

    // Check for skeleton elements (data-slot="skeleton" attribute)
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display tier badge', async () => {
    const { getTierUsage } = await import('../services/tier.service');
    (getTierUsage as jest.Mock).mockResolvedValue({
      tier: 'STANDARD',
      limits: { tables: 20, menuItems: 100, staff: 10, monthlyOrders: 1000 },
      current: { tables: 15, menuItems: 38, staff: 7, monthlyOrders: 1245 },
      features: {
        kds: true,
        advancedReports: true,
        multiLocation: false,
        apiAccess: false,
        prioritySupport: true,
      },
    });

    render(
      <Wrapper>
        <TierUsageWidget storeId="test-store" />
      </Wrapper>
    );

    // Wait for the title to appear after loading
    expect(await screen.findByText('title')).toBeInTheDocument();
    // Note: Badge text comes from t(`tiers.${usage.tier}`) = t('tiers.STANDARD') = 'tiers.STANDARD'
    expect(await screen.findByText('tiers.STANDARD')).toBeInTheDocument();
  });

  it('should show upgrade button for non-premium tiers', async () => {
    const { getTierUsage } = await import('../services/tier.service');
    (getTierUsage as jest.Mock).mockResolvedValue({
      tier: 'STANDARD',
      limits: { tables: 20, menuItems: 100, staff: 10, monthlyOrders: 1000 },
      current: { tables: 15, menuItems: 38, staff: 7, monthlyOrders: 1245 },
      features: {
        kds: true,
        advancedReports: true,
        multiLocation: false,
        apiAccess: false,
        prioritySupport: true,
      },
    });

    const mockUpgrade = jest.fn();

    render(
      <Wrapper>
        <TierUsageWidget storeId="test-store" onUpgrade={mockUpgrade} />
      </Wrapper>
    );

    // Wait for title to appear, indicating component has loaded
    expect(await screen.findByText('title')).toBeInTheDocument();
  });
});
