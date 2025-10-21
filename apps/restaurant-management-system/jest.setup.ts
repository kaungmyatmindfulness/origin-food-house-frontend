import '@testing-library/jest-dom';
import React from 'react';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/hub/menu',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock motion (framer-motion alternative) to avoid animation issues in tests
jest.mock('motion', () => ({
  motion: {
    aside: ({ children, ...props }: any) =>
      React.createElement('aside', props, children),
    div: ({ children, ...props }: any) =>
      React.createElement('div', props, children),
  },
  Variants: {},
}));
