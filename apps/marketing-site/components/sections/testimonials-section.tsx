'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@repo/ui/components/card';
import { Avatar, AvatarFallback } from '@repo/ui/components/avatar';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  const t = useTranslations('marketing.testimonials');

  const testimonials = [
    { key: 'sarah', initials: 'SM', restaurant: 'Bistro 21' },
    { key: 'michael', initials: 'MC', restaurant: 'Sakura Sushi' },
    { key: 'priya', initials: 'PR', restaurant: 'Spice Garden' },
  ];

  return (
    <section className="bg-muted/50 section-spacing">
      <div className="container">
        <div className="content-narrow mb-12 text-center lg:mb-16">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">{t('title')}</h2>
          <p className="text-muted-foreground text-lg lg:text-xl">
            {t('subtitle')}
          </p>
        </div>

        <div className="content-wide grid gap-6 md:grid-cols-3 lg:gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.key} className="relative">
              <CardContent className="pt-6">
                {/* Star Rating */}
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-muted-foreground mb-6 italic">
                  &quot;{t(`${testimonial.key}.quote`)}&quot;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {t(`${testimonial.key}.name`)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {t(`${testimonial.key}.role`)}, {testimonial.restaurant}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
