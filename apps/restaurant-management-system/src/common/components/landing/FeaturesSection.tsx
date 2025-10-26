'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import {
  Building2,
  MenuSquare,
  ChefHat,
  QrCode,
  Shield,
  CreditCard,
} from 'lucide-react';

export function FeaturesSection() {
  const t = useTranslations('landing.features');

  const features = [
    {
      icon: Building2,
      title: t('feature1Title'),
      description: t('feature1Description'),
      badge: t('feature1Badge'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: MenuSquare,
      title: t('feature2Title'),
      description: t('feature2Description'),
      badge: t('feature2Badge'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: ChefHat,
      title: t('feature3Title'),
      description: t('feature3Description'),
      badge: t('feature3Badge'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: QrCode,
      title: t('feature4Title'),
      description: t('feature4Description'),
      badge: t('feature4Badge'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Shield,
      title: t('feature5Title'),
      description: t('feature5Description'),
      badge: t('feature5Badge'),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: CreditCard,
      title: t('feature6Title'),
      description: t('feature6Description'),
      badge: t('feature6Badge'),
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <section id="features" className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <Badge className="mb-4" variant="secondary">
            {t('badge')}
          </Badge>
          <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            {t('heading')}
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
            {t('subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group border-2 transition-all hover:border-amber-200 hover:shadow-xl"
              >
                <CardContent className="space-y-4 p-8">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-lg ${feature.bgColor} transition-transform group-hover:scale-110`}
                    >
                      <Icon className={feature.color} size={28} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
