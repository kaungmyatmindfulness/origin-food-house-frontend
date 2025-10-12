import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardFooter } from './footer';

describe('DashboardFooter', () => {
  describe('Rendering', () => {
    it('should render the footer element', () => {
      const { container } = render(<DashboardFooter />);
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should render copyright text', () => {
      render(<DashboardFooter />);
      expect(screen.getByText(/Origin Food House POS/i)).toBeInTheDocument();
      expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    });

    it('should display the current year', () => {
      render(<DashboardFooter />);
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
    });

    it('should display the copyright symbol', () => {
      render(<DashboardFooter />);
      expect(screen.getByText(/©/)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct CSS classes', () => {
      const { container } = render(<DashboardFooter />);
      const footer = container.querySelector('footer');

      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('bg-white');
      expect(footer).toHaveClass('p-4');
      expect(footer).toHaveClass('text-center');
      expect(footer).toHaveClass('text-sm');
      expect(footer).toHaveClass('text-gray-500');
    });
  });

  describe('Accessibility', () => {
    it('should render as a footer element for semantic HTML', () => {
      const { container } = render(<DashboardFooter />);
      expect(container.querySelector('footer')).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should render the full copyright message', () => {
      render(<DashboardFooter />);
      const currentYear = new Date().getFullYear();
      const expectedText = `© ${currentYear} Origin Food House POS. All rights reserved.`;
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });
  });
});
