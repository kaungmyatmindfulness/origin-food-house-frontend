import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { StructuredData } from '@/components/seo/structured-data';
import { AnalyticsProvider } from './analytics-provider';
import { Toaster } from '@repo/ui/components/sonner';
import '../globals.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Origin Food House - Restaurant Management Platform',
    zh: 'Origin Food House - 餐厅管理平台',
    my: 'Origin Food House - စားသောက်ဆိုင်စီမံခန့်ခွဲမှုပလက်ဖောင်း',
    th: 'Origin Food House - แพลตฟอร์มการจัดการร้านอาหาร',
  };

  const descriptions = {
    en: 'Transform your restaurant operations with QR ordering, kitchen display system, and real-time analytics. All-in-one platform for modern restaurants.',
    zh: '通过二维码点餐、厨房显示系统和实时分析改变您的餐厅运营。现代餐厅的一体化平台。',
    my: 'QR ကုဒ်မှာယူခြင်း၊ မီးဖိုချောင်ပြသမှုစနစ်နှင့် အချိန်နှင့်တစ်ပြေးညီ ခွဲခြမ်းစိတ်ဖြာမှုဖြင့် သင့်စားသောက်ဆိုင်လုပ်ငန်းများကို ပြောင်းလဲပါ။',
    th: 'เปลี่ยนการดำเนินงานร้านอาหารของคุณด้วยการสั่งอาหารผ่าน QR, ระบบแสดงผลครัว และการวิเคราะห์แบบเรียลไทม์',
  };

  return {
    title: {
      default: titles[locale as keyof typeof titles] || titles.en,
      template: `%s | ${titles[locale as keyof typeof titles] || titles.en}`,
    },
    description:
      descriptions[locale as keyof typeof descriptions] || descriptions.en,
    keywords: [
      'restaurant management',
      'QR ordering',
      'kitchen display system',
      'restaurant POS',
      'table management',
      'restaurant analytics',
      'digital menu',
    ],
    authors: [{ name: 'Origin Food House' }],
    creator: 'Origin Food House',
    publisher: 'Origin Food House',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003'
    ),
    alternates: {
      canonical: '/',
      languages: {
        en: '/en',
        zh: '/zh',
        my: '/my',
        th: '/th',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: '/',
      title: titles[locale as keyof typeof titles] || titles.en,
      description:
        descriptions[locale as keyof typeof descriptions] || descriptions.en,
      siteName: 'Origin Food House',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Origin Food House Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.en,
      description:
        descriptions[locale as keyof typeof descriptions] || descriptions.en,
      images: ['/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className="antialiased">
        <AnalyticsProvider />
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
