'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/components/button';
import { ArrowRight, Lock, MessageCircle } from 'lucide-react';
import { ContactUsDialog } from './ContactUsDialog';
import { loginWithAuth0 } from '@/features/auth/services/auth0.service';

export function HeroSection() {
  const t = useTranslations('landing.hero');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  return (
    <section
      id="hero"
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-20"
    >
      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          {/* Main Headline */}
          <h1 className="text-4xl leading-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
            {t('title')}
          </h1>

          {/* Sub-headline */}
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg sm:text-xl md:text-2xl">
            {t('subtitle')}
          </p>

          {/* Trust Signals */}
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <div className="bg-primary h-2 w-2 rounded-full" />
              <span>{t('trustSignal1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary h-2 w-2 rounded-full" />
              <span>{t('trustSignal2')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary h-2 w-2 rounded-full" />
              <span>{t('trustSignal3')}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
            <Button
              size="lg"
              className="w-full bg-amber-600 px-8 py-6 text-lg text-white shadow-lg transition-all hover:bg-amber-700 hover:shadow-xl sm:w-auto"
              onClick={loginWithAuth0}
            >
              <Lock className="mr-2" size={20} />
              {t('primaryCta')}
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-amber-600 px-8 py-6 text-lg text-amber-600 hover:bg-amber-50 hover:text-black sm:w-auto"
              onClick={() => setContactDialogOpen(true)}
            >
              <MessageCircle className="mr-2" size={20} />
              {t('secondaryCta')}
            </Button>
          </div>

          {/* Social Proof */}
          <p className="pt-8 text-sm text-gray-500">{t('socialProof')}</p>
        </div>
      </div>

      {/* Contact Us Dialog */}
      <ContactUsDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
      />
    </section>
  );
}
