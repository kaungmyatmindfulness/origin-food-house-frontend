import { getAuditLogs, downloadCsvBlob } from '../services/audit-log.service';
import type { AuditLogFilters } from '../types/audit-log.types';

// Mock apiClient
jest.mock('@/utils/apiFetch', () => ({
  apiClient: {
    GET: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

describe('Audit Log Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuditLogs', () => {
    it('should fetch audit logs with filters', async () => {
      const { apiClient } = await import('@/utils/apiFetch');
      const mockResponse = {
        data: {
          data: {
            items: [],
            total: 0,
            page: 1,
            limit: 50,
            totalPages: 0,
          },
        },
        error: null,
        response: { status: 200 },
      };
      (apiClient.GET as jest.Mock).mockResolvedValue(mockResponse);

      const filters: AuditLogFilters = {
        action: 'MENU_PRICE_CHANGED',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      const result = await getAuditLogs('store-123', 1, filters);

      expect(apiClient.GET).toHaveBeenCalledWith('/audit-logs/{storeId}', {
        params: {
          path: { storeId: 'store-123' },
          query: expect.objectContaining({
            page: '1',
            limit: '50',
            action: 'MENU_PRICE_CHANGED',
            startDate: '2025-01-01',
            endDate: '2025-01-31',
          }),
        },
      });
      expect(result).toBeDefined();
    });

    it('should handle empty filters', async () => {
      const { apiClient } = await import('@/utils/apiFetch');
      const mockResponse = {
        data: {
          data: {
            items: [],
            total: 0,
            page: 1,
            limit: 50,
            totalPages: 0,
          },
        },
        error: null,
        response: { status: 200 },
      };
      (apiClient.GET as jest.Mock).mockResolvedValue(mockResponse);

      await getAuditLogs('store-123', 1, {});

      expect(apiClient.GET).toHaveBeenCalled();
    });
  });

  describe('downloadCsvBlob', () => {
    it('should create download link and trigger download', () => {
      // Polyfill window.URL.createObjectURL and revokeObjectURL for jsdom
      if (!window.URL.createObjectURL) {
        window.URL.createObjectURL = jest.fn();
      }
      if (!window.URL.revokeObjectURL) {
        window.URL.revokeObjectURL = jest.fn();
      }

      // Mock DOM elements
      const mockAnchorElement: Partial<HTMLAnchorElement> = {
        href: '',
        download: '',
        style: { visibility: '' } as CSSStyleDeclaration,
        click: jest.fn(),
      };
      const mockCreateElement = jest
        .spyOn(document, 'createElement')
        .mockReturnValue(mockAnchorElement as HTMLAnchorElement);
      const mockCreateObjectURL = jest
        .spyOn(window.URL, 'createObjectURL')
        .mockReturnValue('blob:mock-url');
      const mockRevokeObjectURL = jest
        .spyOn(window.URL, 'revokeObjectURL')
        .mockImplementation();
      const mockAppendChild = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation();
      const mockRemoveChild = jest
        .spyOn(document.body, 'removeChild')
        .mockImplementation();

      const blob = new Blob(['test'], { type: 'text/csv' });
      downloadCsvBlob(blob, 'store-123');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(mockAnchorElement.click).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      // Cleanup
      mockCreateElement.mockRestore();
      mockCreateObjectURL.mockRestore();
      mockRevokeObjectURL.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });
  });
});
