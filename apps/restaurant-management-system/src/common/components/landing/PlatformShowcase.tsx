'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { MonitorSmartphone, Smartphone, Zap, Globe } from 'lucide-react';

export function PlatformShowcase() {
  const t = useTranslations('landing.platformShowcase');

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            {t('heading')}
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
            {t('subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* RMS Card */}
          <Card className="overflow-hidden border-2 border-amber-200 shadow-xl">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white">
                <div className="mb-4 flex items-center space-x-4">
                  <MonitorSmartphone size={40} />
                  <div>
                    <Badge className="mb-2 bg-white text-amber-600">
                      {t('rmsLabel')}
                    </Badge>
                    <h3 className="text-2xl font-bold sm:text-3xl">
                      {t('rmsTitle')}
                    </h3>
                  </div>
                </div>
                <p className="text-amber-50">{t('rmsDescription')}</p>
              </div>

              <div className="space-y-4 p-8">
                <h4 className="mb-4 font-semibold text-gray-900">
                  {t('rmsKeyFeatures')}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <div className="mt-2 h-2 w-2 rounded-full bg-amber-600" />
                    <span className="text-gray-700">{t('rmsFeature1')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="mt-2 h-2 w-2 rounded-full bg-amber-600" />
                    <span className="text-gray-700">{t('rmsFeature2')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="mt-2 h-2 w-2 rounded-full bg-amber-600" />
                    <span className="text-gray-700">{t('rmsFeature3')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="mt-2 h-2 w-2 rounded-full bg-amber-600" />
                    <span className="text-gray-700">{t('rmsFeature4')}</span>
                  </li>
                </ul>

                <div className="flex flex-wrap gap-2 pt-4">
                  <Badge variant="secondary">{t('rmsBadge1')}</Badge>
                  <Badge variant="secondary">{t('rmsBadge2')}</Badge>
                  <Badge variant="secondary">{t('rmsBadge3')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SOS Card */}
          <Card className="overflow-hidden border-2 border-blue-200 shadow-xl">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white">
                <div className="mb-4 flex items-center space-x-4">
                  <Smartphone size={40} />
                  <div>
                    <Badge className="mb-2 bg-white text-blue-600">
                      {t('sosLabel')}
                    </Badge>
                    <h3 className="text-2xl font-bold sm:text-3xl">
                      {t('sosTitle')}
                    </h3>
                  </div>
                </div>
                <p className="text-blue-50">{t('sosDescription')}</p>
              </div>

              <div className="space-y-4 p-8">
                <h4 className="mb-4 font-semibold text-gray-900">
                  {t('sosKeyFeatures')}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <div className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-gray-700">{t('sosFeature1')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-gray-700">{t('sosFeature2')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-gray-700">{t('sosFeature3')}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                    <span className="text-gray-700">{t('sosFeature4')}</span>
                  </li>
                </ul>

                <div className="flex flex-wrap gap-2 pt-4">
                  <Badge variant="secondary">{t('sosBadge1')}</Badge>
                  <Badge variant="secondary">{t('sosBadge2')}</Badge>
                  <Badge variant="secondary">{t('sosBadge3')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Highlight */}
        <div className="mt-12 text-center">
          <Card className="border-2 border-green-200 bg-green-50/50">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                <Zap className="text-green-600" size={40} />
                <div className="text-center sm:text-left">
                  <h4 className="mb-2 text-xl font-bold text-gray-900">
                    {t('integrationTitle')}
                  </h4>
                  <p className="text-gray-600">{t('integrationDescription')}</p>
                </div>
                <Globe className="text-green-600" size={40} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
