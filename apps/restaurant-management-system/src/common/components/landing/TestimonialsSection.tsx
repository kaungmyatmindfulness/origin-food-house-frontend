'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@repo/ui/components/card';
import { Quote, Star } from 'lucide-react';

export function TestimonialsSection() {
  const t = useTranslations('landing.testimonials');

  const testimonials = [
    {
      quote: t('testimonial1Quote'),
      name: t('testimonial1Name'),
      role: t('testimonial1Role'),
      restaurant: t('testimonial1Restaurant'),
      rating: 5,
    },
    {
      quote: t('testimonial2Quote'),
      name: t('testimonial2Name'),
      role: t('testimonial2Role'),
      restaurant: t('testimonial2Restaurant'),
      rating: 5,
    },
    {
      quote: t('testimonial3Quote'),
      name: t('testimonial3Name'),
      role: t('testimonial3Role'),
      restaurant: t('testimonial3Restaurant'),
      rating: 5,
    },
  ];

  return (
    <section
      id="testimonials"
      className="bg-gradient-to-br from-amber-50 to-orange-50 py-16 sm:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            {t('heading')}
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
            {t('subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-none shadow-xl transition-shadow hover:shadow-2xl"
            >
              <CardContent className="space-y-6 p-8">
                <Quote className="text-amber-600" size={40} />

                {/* Rating */}
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="fill-amber-400 text-amber-400"
                      size={20}
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="leading-relaxed text-gray-700 italic">
                  {testimonial.quote}
                </p>

                {/* Author Info */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm font-medium text-amber-600">
                    {testimonial.restaurant}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
