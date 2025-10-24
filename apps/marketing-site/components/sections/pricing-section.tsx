'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Check, Star } from 'lucide-react';

export function PricingSection() {
  const t = useTranslations('marketing.pricing');

  const plans = [
    {
      key: 'starter',
      popular: false,
      features: ['tables', 'qr', 'basic', 'support'],
    },
    {
      key: 'growth',
      popular: true,
      features: [
        'unlimited',
        'qr',
        'advanced',
        'priority',
        'loyalty',
        'analytics',
      ],
    },
    {
      key: 'enterprise',
      popular: false,
      features: ['custom', 'dedicated', 'api', 'sla', 'training', 'migration'],
    },
  ];

  return (
    <section id="pricing" className="section-spacing">
      <div className="container">
        <div className="content-narrow mb-12 text-center lg:mb-16">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">{t('title')}</h2>
          <p className="text-muted-foreground text-lg lg:text-xl">
            {t('subtitle')}
          </p>
        </div>

        <div className="content-wide grid gap-6 md:grid-cols-3 lg:gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={`relative flex flex-col ${
                plan.popular
                  ? 'border-primary ring-primary/10 to-primary/5 border-2 bg-gradient-to-br from-white shadow-xl ring-4'
                  : 'border bg-white shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-0 left-0 flex justify-center">
                  <Badge className="from-primary to-primary/80 bg-gradient-to-r px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                    <Star className="mr-1 h-3.5 w-3.5 fill-current" />
                    {t('mostPopular')}
                  </Badge>
                </div>
              )}

              <CardHeader className="pt-8 pb-8 text-center">
                <CardTitle className="text-2xl">
                  {t(`${plan.key}.name`)}
                </CardTitle>
                <CardDescription className="mt-2">
                  {t(`${plan.key}.description`)}
                </CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold">
                    {t(`${plan.key}.price`)}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {t('perMonth')}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      <span className="text-sm">
                        {t(`${plan.key}.features.${feature}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto pt-6">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 bg-gradient-to-r font-semibold shadow-lg transition-all hover:shadow-xl'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  asChild
                >
                  <a href="#demo">{t('getStarted')}</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-muted-foreground mt-8 text-center text-sm lg:mt-12">
          {t('contactSales')}
        </p>
      </div>
    </section>
  );
}
