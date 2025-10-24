'use client';

import { useTranslations } from 'next-intl';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion';

export function FAQSection() {
  const t = useTranslations('marketing.faq');

  const faqs = [
    'setup',
    'hardware',
    'languages',
    'pricing',
    'support',
    'integration',
    'training',
    'trial',
  ];

  return (
    <section id="faq" className="section-spacing">
      <div className="content-medium container">
        <div className="mb-12 text-center lg:mb-16">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">{t('title')}</h2>
          <p className="text-muted-foreground text-lg lg:text-xl">
            {t('subtitle')}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {t(`${faq}.question`)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t(`${faq}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            {t('stillHaveQuestions')}
          </p>
          <a href="#demo" className="text-primary font-medium hover:underline">
            {t('contactUs')}
          </a>
        </div>
      </div>
    </section>
  );
}
