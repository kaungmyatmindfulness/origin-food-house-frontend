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
import {
  CheckCircle2,
  Crown,
  BarChart3,
  ChefHat,
  UserCheck,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function RoleBenefitsSection() {
  const t = useTranslations('landing.roleBenefits');
  const [activeTab, setActiveTab] = useState('owners');

  const roles: Array<{
    key: string;
    label: string;
    icon: LucideIcon;
  }> = [
    { key: 'owners', label: t('ownersLabel'), icon: Crown },
    { key: 'managers', label: t('managersLabel'), icon: BarChart3 },
    { key: 'chefs', label: t('chefsLabel'), icon: ChefHat },
    { key: 'servers', label: t('serversLabel'), icon: UserCheck },
    { key: 'cashiers', label: t('cashiersLabel'), icon: Wallet },
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
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm transition-all duration-200 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md data-[state=active]:border-amber-600 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg sm:text-base"
              >
                <role.icon className="mr-2" size={18} />
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
                      <div className="rounded-lg bg-amber-100 p-3">
                        <role.icon className="text-amber-600" size={48} />
                      </div>
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
