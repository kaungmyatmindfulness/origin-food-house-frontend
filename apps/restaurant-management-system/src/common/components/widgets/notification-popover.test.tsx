import React from 'react';
import { render, screen } from '@testing-library/react';
import { NotificationPopover } from './notification-popover';
import { Popover } from '@repo/ui/components/popover';

// Wrapper component to provide Popover context
const PopoverWrapper = ({ children }: { children: React.ReactNode }) => (
  <Popover open={true}>
    <div>{children}</div>
  </Popover>
);

const renderWithPopover = () => {
  return render(
    <PopoverWrapper>
      <NotificationPopover />
    </PopoverWrapper>
  );
};

describe('NotificationPopover', () => {
  describe('Rendering', () => {
    it('should render the popover content', () => {
      renderWithPopover();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('should render the heading', () => {
      renderWithPopover();
      const heading = screen.getByRole('heading', { name: /notifications/i });
      expect(heading).toBeInTheDocument();
    });

    it('should render "No new notifications" message', () => {
      renderWithPopover();
      expect(screen.getByText('No new notifications')).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should have proper heading hierarchy', () => {
      renderWithPopover();
      const heading = screen.getByRole('heading', { name: /notifications/i });
      expect(heading.tagName).toBe('H3');
    });
  });

  describe('Styling', () => {
    it('should apply correct CSS classes to the heading', () => {
      renderWithPopover();
      const heading = screen.getByRole('heading', { name: /notifications/i });

      expect(heading).toHaveClass('mb-2');
      expect(heading).toHaveClass('font-semibold');
      expect(heading).toHaveClass('text-gray-800');
    });
  });

  describe('Empty State', () => {
    it('should display empty state message when no notifications', () => {
      renderWithPopover();
      expect(screen.getByText('No new notifications')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      renderWithPopover();
      const heading = screen.getByRole('heading', { name: /notifications/i });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have proper spacing between heading and content', () => {
      renderWithPopover();
      const heading = screen.getByRole('heading', { name: /notifications/i });
      expect(heading).toHaveClass('mb-2');
    });
  });
});
