'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';
import { Card, CardContent } from '@repo/ui/components/card';
import { CheckCircle2 } from 'lucide-react';

export function RoleBenefitsSection() {
  const t = useTranslations('landing.roleBenefits');
  const [activeTab, setActiveTab] = useState('owners');

  const roles = [
    { key: 'owners', label: t('ownersLabel'), icon: '👑' },
    { key: 'managers', label: t('managersLabel'), icon: '📊' },
    { key: 'chefs', label: t('chefsLabel'), icon: '👨‍🍳' },
    { key: 'servers', label: t('serversLabel'), icon: '🙋' },
    { key: 'cashiers', label: t('cashiersLabel'), icon: '💰' },
  ];

  const getBenefits = (roleKey: string) => {
    const benefits = [];
    let i = 1;
    while (t.has(`${roleKey}Benefit${i}`)) {
      benefits.push(t(`${roleKey}Benefit${i}`));
      i++;
    }
    return benefits;
  };

  return (
    <section
      id="benefits"
      className="bg-gradient-to-br from-gray-50 to-amber-50 py-16 sm:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            {t('heading')}
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 sm:text-xl">
            {t('subheading')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid h-auto w-full grid-cols-2 gap-2 bg-transparent sm:grid-cols-3 lg:grid-cols-5">
            {roles.map((role) => (
              <TabsTrigger
                key={role.key}
                value={role.key}
                className="px-4 py-3 text-sm data-[state=active]:bg-amber-600 data-[state=active]:text-white sm:text-base"
              >
                <span className="mr-2">{role.icon}</span>
                {role.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {roles.map((role) => (
            <TabsContent key={role.key} value={role.key} className="mt-8">
              <Card className="border-none shadow-xl">
                <CardContent className="p-8 sm:p-12">
                  <div className="space-y-6">
                    <div className="mb-8 flex items-center space-x-4">
                      <span className="text-5xl">{role.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                          {t(`${role.key}Title`)}
                        </h3>
                        <p className="mt-2 text-gray-600">
                          {t(`${role.key}Description`)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {getBenefits(role.key).map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle2
                            className="mt-1 flex-shrink-0 text-green-600"
                            size={20}
                          />
                          <p className="text-gray-700">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
