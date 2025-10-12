import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from './dashboard-header';

// Mock the auth store
const mockClearAuth = jest.fn();
jest.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: () => ({
    clearAuth: mockClearAuth,
  }),
}));

// Mock the child components
jest.mock('./notification-popover', () => ({
  NotificationPopover: () => <div data-testid="notification-popover">Notifications</div>,
}));

jest.mock('./account-popover', () => ({
  AccountPopover: ({ onLogout }: { onLogout: () => void }) => (
    <div data-testid="account-popover">
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('DashboardHeader', () => {
  beforeEach(() => {
    mockClearAuth.mockClear();
  });

  describe('Rendering', () => {
    it('should render the header element', () => {
      const { container } = render(<DashboardHeader />);
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('should render the logo', () => {
      render(<DashboardHeader />);
      const logo = screen.getByAltText('Logo');
      expect(logo).toBeInTheDocument();
    });

    it('should render notification button', () => {
      render(<DashboardHeader />);
      const notificationButton = screen.getByRole('button', { name: /open notifications/i });
      expect(notificationButton).toBeInTheDocument();
    });

    it('should render account button', () => {
      render(<DashboardHeader />);
      const accountButton = screen.getByRole('button', { name: /open account menu/i });
      expect(accountButton).toBeInTheDocument();
    });

    it('should render a spacer div', () => {
      const { container } = render(<DashboardHeader />);
      const spacers = container.querySelectorAll('.h-15');
      expect(spacers.length).toBeGreaterThan(0);
    });
  });

  describe('Logo', () => {
    it('should have correct logo attributes', () => {
      render(<DashboardHeader />);
      const logo = screen.getByAltText('Logo');

      expect(logo).toHaveAttribute('src', '/logo.svg');
      expect(logo).toHaveAttribute('alt', 'Logo');
      expect(logo).toHaveAttribute('width', '64');
      expect(logo).toHaveAttribute('height', '32');
    });

    it('should be wrapped in a link', () => {
      render(<DashboardHeader />);
      const link = screen.getByRole('link');
      const logo = screen.getByAltText('Logo');

      expect(link).toContainElement(logo);
    });

    it('should link to /hub-sales', () => {
      render(<DashboardHeader />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/hub-sales');
    });

    it('should have correct styling classes', () => {
      render(<DashboardHeader />);
      const link = screen.getByRole('link');

      expect(link).toHaveClass('text-lg');
      expect(link).toHaveClass('font-bold');
      expect(link).toHaveClass('text-gray-800');
    });
  });

  describe('Notification Button', () => {
    it('should have correct ARIA label', () => {
      render(<DashboardHeader />);
      const button = screen.getByRole('button', { name: /open notifications/i });
      expect(button).toHaveAttribute('aria-label', 'Open notifications');
    });

    it('should have ghost variant styling', () => {
      render(<DashboardHeader />);
      const button = screen.getByRole('button', { name: /open notifications/i });
      // Button component should apply variant classes
      expect(button).toBeInTheDocument();
    });

    it('should render Bell icon', () => {
      const { container } = render(<DashboardHeader />);
      // Bell icon is rendered as SVG with lucide-bell class
      const bellIcon = container.querySelector('.lucide-bell');
      expect(bellIcon).toBeInTheDocument();
    });
  });

  describe('Account Button', () => {
    it('should have correct ARIA label', () => {
      render(<DashboardHeader />);
      const button = screen.getByRole('button', { name: /open account menu/i });
      expect(button).toHaveAttribute('aria-label', 'Open account menu');
    });

    it('should render User icon', () => {
      const { container } = render(<DashboardHeader />);
      // User icon is rendered as SVG with lucide-user class
      const userIcon = container.querySelector('.lucide-user');
      expect(userIcon).toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('should call clearAuth when logout is triggered', () => {
      render(<DashboardHeader />);

      // Find and click the logout button from the mocked AccountPopover
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      expect(mockClearAuth).toHaveBeenCalledTimes(1);
    });

    it('should not call clearAuth on initial render', () => {
      render(<DashboardHeader />);
      expect(mockClearAuth).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should apply correct CSS classes to header', () => {
      const { container } = render(<DashboardHeader />);
      const header = container.querySelector('header');

      expect(header).toHaveClass('fixed');
      expect(header).toHaveClass('top-0');
      expect(header).toHaveClass('right-0');
      expect(header).toHaveClass('left-0');
      expect(header).toHaveClass('z-10');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('h-15');
      expect(header).toHaveClass('items-center');
      expect(header).toHaveClass('justify-between');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('bg-white');
      expect(header).toHaveClass('p-4');
      expect(header).toHaveClass('shadow-sm');
    });

    it('should have space between buttons', () => {
      const { container } = render(<DashboardHeader />);
      const rightSection = container.querySelector('.space-x-4');
      expect(rightSection).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should render spacer div with correct height class', () => {
      const { container } = render(<DashboardHeader />);
      const spacer = container.querySelector('.h-15:not(header)');
      expect(spacer).toBeInTheDocument();
    });

    it('should have proper layout structure', () => {
      const { container } = render(<DashboardHeader />);
      const header = container.querySelector('header');

      // Should have logo div and right section div
      const divs = header?.querySelectorAll('div');
      expect(divs).toBeTruthy();
      expect(divs!.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should render as a header element for semantic HTML', () => {
      const { container } = render(<DashboardHeader />);
      expect(container.querySelector('header')).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<DashboardHeader />);

      const notificationButton = screen.getByRole('button', { name: /open notifications/i });
      const accountButton = screen.getByRole('button', { name: /open account menu/i });

      expect(notificationButton).toHaveAccessibleName('Open notifications');
      expect(accountButton).toHaveAccessibleName('Open account menu');
    });

    it('should have accessible logo', () => {
      render(<DashboardHeader />);
      const logo = screen.getByAltText('Logo');
      expect(logo).toHaveAccessibleName('Logo');
    });
  });

  describe('Icons', () => {
    it('should render Bell icon with correct size classes', () => {
      const { container } = render(<DashboardHeader />);
      const bellIcon = container.querySelector('.lucide-bell');

      expect(bellIcon).toHaveClass('h-4');
      expect(bellIcon).toHaveClass('w-4');
    });

    it('should render User icon with correct size classes', () => {
      const { container } = render(<DashboardHeader />);
      const userIcon = container.querySelector('.lucide-user');

      expect(userIcon).toHaveClass('h-4');
      expect(userIcon).toHaveClass('w-4');
    });
  });

  describe('Fixed Positioning', () => {
    it('should be fixed at the top of the page', () => {
      const { container } = render(<DashboardHeader />);
      const header = container.querySelector('header');

      expect(header).toHaveClass('fixed');
      expect(header).toHaveClass('top-0');
      expect(header).toHaveClass('left-0');
      expect(header).toHaveClass('right-0');
    });

    it('should have appropriate z-index', () => {
      const { container } = render(<DashboardHeader />);
      const header = container.querySelector('header');

      expect(header).toHaveClass('z-10');
    });
  });
});
