'use client';

import { useTranslations } from 'next-intl';
import { Separator } from '@repo/ui/components/separator';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const t = useTranslations('landing.footer');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Origin Food House</h3>
            <p className="text-sm text-gray-400">{t('tagline')}</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Mail size={16} className="text-amber-500" />
                <a
                  href="mailto:info@originfoodhouse.com"
                  className="transition-colors hover:text-amber-400"
                >
                  {t('email')}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone size={16} className="text-amber-500" />
                <a
                  href="tel:+1234567890"
                  className="transition-colors hover:text-amber-400"
                >
                  {t('phone')}
                </a>
              </div>
              <div className="flex items-start space-x-2 text-sm">
                <MapPin
                  size={16}
                  className="mt-1 flex-shrink-0 text-amber-500"
                />
                <span className="text-gray-400">{t('address')}</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              {t('productTitle')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#features"
                  className="transition-colors hover:text-amber-400"
                >
                  {t('features')}
                </a>
              </li>
              <li>
                <a
                  href="#benefits"
                  className="transition-colors hover:text-amber-400"
                >
                  {t('benefits')}
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="transition-colors hover:text-amber-400"
                >
                  {t('testimonials')}
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              {t('resourcesTitle')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="transition-colors hover:text-amber-400">
                  {t('documentation')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-amber-400">
                  {t('support')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-amber-400">
                  {t('contactUs')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              {t('legalTitle')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="transition-colors hover:text-amber-400">
                  {t('privacyPolicy')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-amber-400">
                  {t('termsOfService')}
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-amber-400">
                  {t('cookiePolicy')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <p className="text-sm text-gray-400">
            {t('copyright', { year: currentYear })}
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <span className="text-gray-400">{t('multiLanguageSupport')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
