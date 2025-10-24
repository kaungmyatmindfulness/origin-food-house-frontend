'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@repo/ui/components/card';
import { QrCode, LayoutDashboard, ChefHat, Check } from 'lucide-react';

export function FeaturesSection() {
  const t = useTranslations('marketing.features');

  const features = [
    {
      icon: QrCode,
      key: 'sos',
      benefits: ['instant', 'multilingual', 'realtime'],
    },
    {
      icon: LayoutDashboard,
      key: 'rms',
      benefits: ['comprehensive', 'rolebased', 'reporting'],
    },
    {
      icon: ChefHat,
      key: 'kds',
      benefits: ['efficient', 'tracking', 'coordination'],
    },
  ];

  return (
    <section id="features" className="bg-muted/50 section-spacing">
      <div className="container">
        <div className="content-narrow mb-12 text-center lg:mb-16">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">{t('title')}</h2>
          <p className="text-muted-foreground text-lg lg:text-xl">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isReversed = index % 2 === 1;

            return (
              <div
                key={feature.key}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
              >
                {/* Image */}
                <div className={isReversed ? 'lg:order-2' : 'lg:order-1'}>
                  <Card className="bg-gradient-to-br from-blue-50 to-green-50 p-6 lg:p-8">
                    <div className="flex aspect-[16/10] items-center justify-center">
                      <Icon className="text-primary h-20 w-20 opacity-50 lg:h-24 lg:w-24" />
                    </div>
                  </Card>
                </div>

                {/* Content */}
                <div className={isReversed ? 'lg:order-1' : 'lg:order-2'}>
                  <div className="mb-4 flex items-center gap-3 lg:gap-4">
                    <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg lg:h-12 lg:w-12">
                      <Icon className="text-primary h-5 w-5 lg:h-6 lg:w-6" />
                    </div>
                    <h3 className="text-2xl font-bold lg:text-3xl">
                      {t(`${feature.key}.title`)}
                    </h3>
                  </div>

                  <p className="text-muted-foreground mb-6 text-base lg:text-lg">
                    {t(`${feature.key}.description`)}
                  </p>

                  <ul className="space-y-2 lg:space-y-3">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <span>{t(`${feature.key}.benefits.${benefit}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
