import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaxAndServiceTab } from '../tax-and-service-tab';
import { updateStoreSettings } from '../../../services/store.service';

// Mock the service
jest.mock('../../../services/store.service');

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock toast
jest.mock('@repo/ui/lib/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('TaxAndServiceTab', () => {
  const mockUpdateStoreSettings = updateStoreSettings as jest.MockedFunction<
    typeof updateStoreSettings
  >;

  const createQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  const renderComponent = (props = {}) => {
    const queryClient = createQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <TaxAndServiceTab
          storeId="store-123"
          vatRate="0.07"
          serviceChargeRate="0.10"
          {...props}
        />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with initial values', () => {
    renderComponent();

    expect(screen.getByLabelText(/vatLabel/i)).toHaveValue(7);
    expect(screen.getByLabelText(/serviceChargeLabel/i)).toHaveValue(10);
  });

  it('should validate VAT rate range (0-30%)', async () => {
    const user = userEvent.setup();
    renderComponent();

    const vatInput = screen.getByLabelText(/vatLabel/i);
    const submitButton = screen.getByRole('button', { name: /save/i });

    // Test exceeding max
    await user.clear(vatInput);
    await user.type(vatInput, '35');
    await user.click(submitButton); // Trigger form submission to run validation

    await waitFor(() => {
      expect(screen.getByText(/Rate must be 30% or less/i)).toBeInTheDocument();
    });

    // Test negative
    await user.clear(vatInput);
    await user.type(vatInput, '-5');
    await user.click(submitButton); // Trigger form submission to run validation

    await waitFor(() => {
      expect(screen.getByText(/Rate cannot be negative/i)).toBeInTheDocument();
    });
  });

  it('should validate service charge rate range (0-30%)', async () => {
    const user = userEvent.setup();
    renderComponent();

    const serviceChargeInput = screen.getByLabelText(/serviceChargeLabel/i);
    const submitButton = screen.getByRole('button', { name: /save/i });

    // Test exceeding max
    await user.clear(serviceChargeInput);
    await user.type(serviceChargeInput, '35');
    await user.click(submitButton); // Trigger form submission to run validation

    await waitFor(() => {
      expect(screen.getByText(/Rate must be 30% or less/i)).toBeInTheDocument();
    });
  });

  it('should update preview calculation when values change', async () => {
    const user = userEvent.setup();
    renderComponent({ vatRate: null, serviceChargeRate: null });

    const vatInput = screen.getByLabelText(/vatLabel/i);
    const serviceChargeInput = screen.getByLabelText(/serviceChargeLabel/i);

    // Change VAT rate
    await user.type(vatInput, '10');
    await user.type(serviceChargeInput, '5');

    await waitFor(() => {
      const preview = screen.getByText(/previewTitle/i);
      expect(preview).toBeInTheDocument();
    });
  });

  it('should submit form with correct API format', async () => {
    const user = userEvent.setup();
    mockUpdateStoreSettings.mockResolvedValue({
      id: 'setting-123',
      storeId: 'store-123',
      currency: 'THB',
      vatRate: '0.15',
      serviceChargeRate: '0.10',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    renderComponent();

    const vatInput = screen.getByLabelText(/vatLabel/i);
    await user.clear(vatInput);
    await user.type(vatInput, '15');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateStoreSettings).toHaveBeenCalledWith('store-123', {
        vatRate: '0.1500',
        serviceChargeRate: '0.1000',
      });
    });
  });

  it('should disable submit button when form is pristine', () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: /save/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when form is dirty', async () => {
    const user = userEvent.setup();
    renderComponent();

    const vatInput = screen.getByLabelText(/vatLabel/i);
    await user.clear(vatInput);
    await user.type(vatInput, '8');

    const submitButton = screen.getByRole('button', { name: /save/i });
    expect(submitButton).toBeEnabled();
  });
});
