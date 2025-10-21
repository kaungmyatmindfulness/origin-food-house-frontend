import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardSidebar } from './sidebar';

// Mock the LanguageSwitcher component
jest.mock('@/common/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => (
    <div data-testid="language-switcher">Language Switcher</div>
  ),
}));

describe('DashboardSidebar', () => {
  let mockSetCollapsed: jest.Mock;

  beforeEach(() => {
    mockSetCollapsed = jest.fn();
  });

  describe('Rendering', () => {
    it('should render the sidebar in expanded state', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should render the sidebar in collapsed state', () => {
      render(
        <DashboardSidebar collapsed={true} setCollapsed={mockSetCollapsed} />
      );

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should render the version number', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      expect(screen.getByText('v0.0.1')).toBeInTheDocument();
    });
  });

  describe('Navigation Items', () => {
    it('should render all main navigation items when expanded', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      // Main navigation items (mock returns just the key without namespace)
      expect(screen.getByText('sale')).toBeInTheDocument();
      expect(screen.getByText('kitchenDisplay')).toBeInTheDocument();
      expect(screen.getByText('menu')).toBeInTheDocument();
      expect(screen.getByText('store')).toBeInTheDocument();
      expect(screen.getByText('tables')).toBeInTheDocument();
      expect(screen.getByText('storePersonnel')).toBeInTheDocument();
      expect(screen.getByText('reports')).toBeInTheDocument();
    });

    it('should render sub-navigation items when expanded', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      // Store sub-items (mock returns just the key without namespace)
      expect(screen.getByText('information')).toBeInTheDocument();
      expect(screen.getByText('settings')).toBeInTheDocument();

      // Tables sub-items
      expect(screen.getByText('manage')).toBeInTheDocument();
      expect(screen.getByText('qrCodes')).toBeInTheDocument();

      // Reports sub-items
      expect(screen.getByText('sales')).toBeInTheDocument();
      expect(screen.getByText('salesHistory')).toBeInTheDocument();
      expect(screen.getByText('menuItems')).toBeInTheDocument();
    });

    it('should not render sub-items text when collapsed', () => {
      render(
        <DashboardSidebar collapsed={true} setCollapsed={mockSetCollapsed} />
      );

      // Text should not be visible when collapsed (mock returns just the key without namespace)
      expect(screen.queryByText('information')).not.toBeInTheDocument();
      expect(screen.queryByText('settings')).not.toBeInTheDocument();
    });

    it('should render correct navigation links', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      const saleLink = screen.getByRole('link', { name: /^sale$/i });
      expect(saleLink).toHaveAttribute('href', '/hub/sale');

      const menuLink = screen.getByRole('link', { name: /^menu$/i });
      expect(menuLink).toHaveAttribute('href', '/hub/menu');

      const storePersonnelLink = screen.getByRole('link', {
        name: /storePersonnel/i,
      });
      expect(storePersonnelLink).toHaveAttribute(
        'href',
        '/hub/store-personnel'
      );
    });

    it('should render correct sub-item links', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      const informationLink = screen.getByRole('link', {
        name: /information/i,
      });
      expect(informationLink).toHaveAttribute('href', '/hub/store/information');

      const qrCodesLink = screen.getByRole('link', { name: /qrCodes/i });
      expect(qrCodesLink).toHaveAttribute('href', '/hub/tables/qr-code');

      const salesLink = screen.getByRole('link', { name: /^sales$/i });
      expect(salesLink).toHaveAttribute('href', '/hub/reports/sales');
    });
  });

  describe('Collapse Toggle', () => {
    it('should render collapse button with text when expanded', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      const collapseButton = screen.getByRole('button', {
        name: /toggle sidebar collapse/i,
      });
      expect(collapseButton).toBeInTheDocument();
      expect(collapseButton).toHaveTextContent('collapse');
    });

    it('should render collapse button without text when collapsed', () => {
      render(
        <DashboardSidebar collapsed={true} setCollapsed={mockSetCollapsed} />
      );

      const collapseButton = screen.getByRole('button', {
        name: /toggle sidebar collapse/i,
      });
      expect(collapseButton).toBeInTheDocument();
      expect(collapseButton).not.toHaveTextContent('collapse');
    });

    it('should call setCollapsed when collapse button is clicked', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      const collapseButton = screen.getByRole('button', {
        name: /toggle sidebar collapse/i,
      });
      fireEvent.click(collapseButton);

      expect(mockSetCollapsed).toHaveBeenCalledTimes(1);
      expect(mockSetCollapsed).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should toggle collapsed state correctly', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      const collapseButton = screen.getByRole('button', {
        name: /toggle sidebar collapse/i,
      });
      fireEvent.click(collapseButton);

      // Get the function passed to setCollapsed and verify it toggles
      const toggleFunction = mockSetCollapsed.mock.calls[0][0];
      expect(toggleFunction(false)).toBe(true);
      expect(toggleFunction(true)).toBe(false);
    });
  });

  describe('Language Switcher', () => {
    it('should render LanguageSwitcher when expanded', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    });

    it('should not render LanguageSwitcher when collapsed', () => {
      render(
        <DashboardSidebar collapsed={true} setCollapsed={mockSetCollapsed} />
      );

      expect(screen.queryByTestId('language-switcher')).not.toBeInTheDocument();
    });
  });

  describe('Active States', () => {
    it('should apply active styles to the current route', () => {
      // The mock usePathname returns '/hub/menu'
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      const menuLink = screen.getByRole('link', { name: /^menu$/i });
      expect(menuLink).toHaveClass('bg-gray-200', 'font-medium');
    });

    it('should not apply active styles to inactive routes', () => {
      // The mock usePathname returns '/hub/menu'
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      const saleLink = screen.getByRole('link', { name: /^sale$/i });
      expect(saleLink).not.toHaveClass('bg-gray-200');
    });
  });

  describe('Icons', () => {
    it('should render icons for all navigation items', () => {
      const { container } = render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      // Check that SVG icons are present (lucide-react icons render as SVGs)
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('should render icons when collapsed', () => {
      const { container } = render(
        <DashboardSidebar collapsed={true} setCollapsed={mockSetCollapsed} />
      );

      // Icons should still be present when collapsed
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Sections', () => {
    it('should render section dividers between navigation groups', () => {
      const { container } = render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      // There should be horizontal rules separating sections
      const dividers = container.querySelectorAll('hr');
      expect(dividers.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label on collapse button', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      const collapseButton = screen.getByRole('button', {
        name: /toggle sidebar collapse/i,
      });
      expect(collapseButton).toHaveAttribute(
        'aria-label',
        'Toggle sidebar collapse'
      );
    });

    it('should render as an aside element', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should render a nav element for navigation', () => {
      render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct classes for expanded state', () => {
      const { container } = render(
        <DashboardSidebar collapsed={false} setCollapsed={mockSetCollapsed} />
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass(
        'fixed',
        'top-[64px]',
        'bottom-0',
        'left-0',
        'z-20'
      );
    });

    it('should apply correct classes for collapsed state', () => {
      const { container } = render(
        <DashboardSidebar collapsed={true} setCollapsed={mockSetCollapsed} />
      );

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass(
        'fixed',
        'top-[64px]',
        'bottom-0',
        'left-0',
        'z-20'
      );
    });
  });
});
