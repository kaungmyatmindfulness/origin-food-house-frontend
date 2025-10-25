'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/components/button';
import { ArrowRight, Lock, MessageCircle } from 'lucide-react';

export function FinalCTASection() {
  const t = useTranslations('landing.finalCta');

  return (
    <section className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          {/* Heading */}
          <h2 className="text-3xl leading-tight font-bold text-white sm:text-4xl md:text-5xl">
            {t('heading')}
          </h2>

          {/* Subheading */}
          <p className="mx-auto max-w-2xl text-lg text-amber-50 sm:text-xl">
            {t('subheading')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
            <Button
              size="lg"
              className="w-full bg-white px-8 py-6 text-lg text-amber-600 shadow-lg transition-all hover:bg-amber-50 hover:shadow-xl sm:w-auto"
            >
              <Lock className="mr-2" size={20} />
              {t('primaryCta')}
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-white px-8 py-6 text-lg text-white hover:bg-white/10 sm:w-auto"
            >
              <MessageCircle className="mr-2" size={20} />
              {t('secondaryCta')}
            </Button>
          </div>

          {/* Trust Indicator */}
          <p className="pt-8 text-sm text-amber-100">{t('trustIndicator')}</p>
        </div>
      </div>
    </section>
  );
}
