import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountPopover } from './account-popover';
import { Popover } from '@repo/ui/components/popover';

// Wrapper component to provide Popover context
const PopoverWrapper = ({ children }: { children: React.ReactNode }) => (
  <Popover open={true}>
    <div>{children}</div>
  </Popover>
);

const renderWithPopover = (mockOnLogout: jest.Mock) => {
  return render(
    <PopoverWrapper>
      <AccountPopover onLogout={mockOnLogout} />
    </PopoverWrapper>
  );
};

describe('AccountPopover', () => {
  let mockOnLogout: jest.Mock;

  beforeEach(() => {
    mockOnLogout = jest.fn();
  });

  describe('Rendering', () => {
    it('should render the Profile link', () => {
      renderWithPopover(mockOnLogout);
      const profileLink = screen.getByRole('link', { name: /profile/i });
      expect(profileLink).toBeInTheDocument();
    });

    it('should render the Logout button', () => {
      renderWithPopover(mockOnLogout);
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });
  });

  describe('Profile Link', () => {
    it('should link to the profile page', () => {
      renderWithPopover(mockOnLogout);
      const profileLink = screen.getByRole('link', { name: /profile/i });
      expect(profileLink).toHaveAttribute('href', '/profile');
    });

    it('should have correct styling classes', () => {
      renderWithPopover(mockOnLogout);
      const profileLink = screen.getByRole('link', { name: /profile/i });

      expect(profileLink).toHaveClass('block');
      expect(profileLink).toHaveClass('px-2');
      expect(profileLink).toHaveClass('py-1');
      expect(profileLink).toHaveClass('text-sm');
      expect(profileLink).toHaveClass('text-gray-700');
      expect(profileLink).toHaveClass('hover:bg-gray-100');
    });
  });

  describe('Logout Button', () => {
    it('should call onLogout when clicked', () => {
      renderWithPopover(mockOnLogout);
      const logoutButton = screen.getByRole('button', { name: /logout/i });

      fireEvent.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('should have correct styling classes', () => {
      renderWithPopover(mockOnLogout);
      const logoutButton = screen.getByRole('button', { name: /logout/i });

      expect(logoutButton).toHaveClass('block');
      expect(logoutButton).toHaveClass('w-full');
      expect(logoutButton).toHaveClass('px-2');
      expect(logoutButton).toHaveClass('py-1');
      expect(logoutButton).toHaveClass('text-left');
      expect(logoutButton).toHaveClass('text-sm');
      expect(logoutButton).toHaveClass('text-red-600');
      expect(logoutButton).toHaveClass('hover:bg-gray-100');
    });

    it('should be a button element', () => {
      renderWithPopover(mockOnLogout);
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton.tagName).toBe('BUTTON');
    });
  });

  describe('Interaction', () => {
    it('should not call onLogout multiple times on single click', () => {
      renderWithPopover(mockOnLogout);
      const logoutButton = screen.getByRole('button', { name: /logout/i });

      fireEvent.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('should call onLogout each time button is clicked', () => {
      renderWithPopover(mockOnLogout);
      const logoutButton = screen.getByRole('button', { name: /logout/i });

      fireEvent.click(logoutButton);
      fireEvent.click(logoutButton);
      fireEvent.click(logoutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible link text', () => {
      renderWithPopover(mockOnLogout);
      const profileLink = screen.getByRole('link', { name: /profile/i });
      expect(profileLink).toHaveAccessibleName('Profile');
    });

    it('should have accessible button text', () => {
      renderWithPopover(mockOnLogout);
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toHaveAccessibleName('Logout');
    });
  });

  describe('Props', () => {
    it('should accept and use onLogout prop', () => {
      const customLogout = jest.fn();
      render(
        <PopoverWrapper>
          <AccountPopover onLogout={customLogout} />
        </PopoverWrapper>
      );
      const logoutButton = screen.getByRole('button', { name: /logout/i });

      fireEvent.click(logoutButton);

      expect(customLogout).toHaveBeenCalledTimes(1);
    });
  });
});
