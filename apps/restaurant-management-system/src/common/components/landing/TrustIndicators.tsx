'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@repo/ui/components/card';
import { TrendingUp, Clock, Users, CheckCircle } from 'lucide-react';

export function TrustIndicators() {
  const t = useTranslations('landing.trustIndicators');

  const stats = [
    {
      icon: Users,
      value: t('stat1Value'),
      label: t('stat1Label'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      value: t('stat2Value'),
      label: t('stat2Label'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Clock,
      value: t('stat3Value'),
      label: t('stat3Label'),
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: CheckCircle,
      value: t('stat4Value'),
      label: t('stat4Label'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <section className="bg-gray-50 py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('heading')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {t('subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="border-none shadow-lg transition-shadow hover:shadow-xl"
              >
                <CardContent className="space-y-4 p-6 text-center">
                  <div
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${stat.bgColor}`}
                  >
                    <Icon className={`${stat.color}`} size={32} />
                  </div>
                  <div className="text-4xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
