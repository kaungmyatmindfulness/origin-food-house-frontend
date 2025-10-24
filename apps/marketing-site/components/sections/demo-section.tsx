'use client';

import { useTranslations } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@repo/ui/components/card';
import { DemoRequestForm } from '@/components/forms/demo-request-form';

export function DemoSection() {
  const t = useTranslations('marketing.demo');

  return (
    <section id="demo" className="bg-muted/50 section-spacing">
      <div className="content-narrow container">
        <div className="mb-8 text-center lg:mb-12">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">{t('title')}</h2>
          <p className="text-muted-foreground text-lg lg:text-xl">
            {t('subtitle')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('formTitle')}</CardTitle>
            <CardDescription>{t('formDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <DemoRequestForm />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
