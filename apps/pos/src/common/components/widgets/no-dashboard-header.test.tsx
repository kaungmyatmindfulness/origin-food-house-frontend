import React from 'react';
import { render, screen } from '@testing-library/react';
import { NoDashboardHeader } from './no-dashboard-header';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('NoDashboardHeader', () => {
  describe('Rendering', () => {
    it('should render the header element', () => {
      const { container } = render(<NoDashboardHeader />);
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('should render a logo image', () => {
      render(<NoDashboardHeader />);
      const logo = screen.getByAltText('Logo');
      expect(logo).toBeInTheDocument();
    });

    it('should render a link to home page', () => {
      render(<NoDashboardHeader />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('Logo', () => {
    it('should have correct logo attributes', () => {
      render(<NoDashboardHeader />);
      const logo = screen.getByAltText('Logo');

      expect(logo).toHaveAttribute('src', '/logo.svg');
      expect(logo).toHaveAttribute('alt', 'Logo');
      expect(logo).toHaveAttribute('width', '64');
      expect(logo).toHaveAttribute('height', '32');
    });

    it('should be wrapped in a link', () => {
      render(<NoDashboardHeader />);
      const link = screen.getByRole('link');
      const logo = screen.getByAltText('Logo');

      expect(link).toContainElement(logo);
    });
  });

  describe('Styling', () => {
    it('should apply correct CSS classes to header', () => {
      const { container } = render(<NoDashboardHeader />);
      const header = container.querySelector('header');

      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('items-center');
      expect(header).toHaveClass('justify-between');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('bg-white');
      expect(header).toHaveClass('p-4');
    });
  });

  describe('Layout', () => {
    it('should have a spacer div for layout', () => {
      const { container } = render(<NoDashboardHeader />);
      const divs = container.querySelectorAll('div');

      // Should have at least one empty div for layout spacing
      expect(divs.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should render as a header element for semantic HTML', () => {
      const { container } = render(<NoDashboardHeader />);
      expect(container.querySelector('header')).toBeInTheDocument();
    });

    it('should have accessible logo alt text', () => {
      render(<NoDashboardHeader />);
      const logo = screen.getByAltText('Logo');
      expect(logo).toHaveAccessibleName('Logo');
    });
  });
});
