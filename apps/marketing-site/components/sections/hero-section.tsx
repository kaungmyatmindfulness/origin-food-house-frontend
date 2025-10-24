'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/components/button';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'motion/react';

export function HeroSection() {
  const t = useTranslations('marketing.hero');

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-green-50" />

      <div className="section-spacing container">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-6 text-5xl font-bold tracking-tight lg:text-6xl">
              {t('headline')}
            </h1>
            <p className="text-muted-foreground mb-8 text-xl">
              {t('subheadline')}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transform bg-gradient-to-r text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                asChild
              >
                <a href="#demo">
                  {t('ctaPrimary')} <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 border-2 text-lg font-semibold shadow-md transition-all hover:shadow-lg"
              >
                <Play className="mr-2 h-5 w-5" /> {t('ctaSecondary')}
              </Button>
            </div>
          </motion.div>

          {/* Right: Screenshot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card relative rounded-2xl border p-4 shadow-2xl">
              {/* Enhanced placeholder with mockup design */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 via-white to-green-50">
                {/* Mockup browser chrome */}
                <div className="absolute top-0 right-0 left-0 flex h-8 items-center gap-2 border-b border-gray-200 bg-gray-100 px-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="mx-4 h-5 flex-1 rounded bg-gray-200" />
                </div>

                {/* Mockup content with visual hierarchy */}
                <div className="absolute inset-0 top-8 space-y-4 p-6">
                  {/* Header bar */}
                  <div className="from-primary/20 to-primary/10 h-12 rounded-lg bg-gradient-to-r" />

                  {/* Content grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Cards */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-24 rounded-lg border border-gray-200/50 bg-white/60 shadow-sm backdrop-blur-sm"
                      />
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-16 rounded-lg bg-gradient-to-br from-blue-100/50 to-green-100/50"
                      />
                    ))}
                  </div>
                </div>

                {/* Subtle overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
              </div>
            </div>

            {/* Floating badge */}
            <div className="from-primary to-primary/80 absolute -right-4 -bottom-4 rounded-full bg-gradient-to-r px-6 py-3 text-sm font-semibold text-white shadow-xl">
              ✨ All-in-One Platform
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
