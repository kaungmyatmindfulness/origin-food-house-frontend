'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/components/button';
import { Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { loginWithAuth0 } from '@/features/auth/services/auth0.service';

export function Navigation() {
  const t = useTranslations('landing.navigation');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 shadow-md backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-2xl font-bold text-amber-600 transition-colors hover:text-amber-700"
              aria-label={t('logoAriaLabel')}
            >
              Origin Food House
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            <button
              onClick={() => scrollToSection('features')}
              className="font-medium text-gray-700 transition-colors hover:text-amber-600"
            >
              {t('features')}
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="font-medium text-gray-700 transition-colors hover:text-amber-600"
            >
              {t('benefits')}
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="font-medium text-gray-700 transition-colors hover:text-amber-600"
            >
              {t('testimonials')}
            </button>
            <LanguageSwitcher size="compact" />
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={loginWithAuth0}
            >
              {t('signIn')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <LanguageSwitcher size="compact" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 transition-colors hover:text-amber-600"
              aria-label={isMobileMenuOpen ? t('closeMenu') : t('openMenu')}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white/95 py-4 backdrop-blur-md md:hidden">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection('features')}
                className="px-2 text-left font-medium text-gray-700 transition-colors hover:text-amber-600"
              >
                {t('features')}
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className="px-2 text-left font-medium text-gray-700 transition-colors hover:text-amber-600"
              >
                {t('benefits')}
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="px-2 text-left font-medium text-gray-700 transition-colors hover:text-amber-600"
              >
                {t('testimonials')}
              </button>
              <Button
                size="lg"
                className="w-full bg-amber-600 hover:bg-amber-700"
                onClick={loginWithAuth0}
              >
                {t('signIn')}
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
