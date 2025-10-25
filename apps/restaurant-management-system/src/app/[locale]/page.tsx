'use client';

import { Navigation } from '@/common/components/landing/Navigation';
import { HeroSection } from '@/common/components/landing/HeroSection';
import { TrustIndicators } from '@/common/components/landing/TrustIndicators';
import { FeaturesSection } from '@/common/components/landing/FeaturesSection';
import { RoleBenefitsSection } from '@/common/components/landing/RoleBenefitsSection';
import { PlatformShowcase } from '@/common/components/landing/PlatformShowcase';
import { TestimonialsSection } from '@/common/components/landing/TestimonialsSection';
import { FinalCTASection } from '@/common/components/landing/FinalCTASection';
import { Footer } from '@/common/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Navigation */}
      <Navigation />

      {/* Main Content */}
      <main>
        <HeroSection />
        <TrustIndicators />
        <FeaturesSection />
        <RoleBenefitsSection />
        <PlatformShowcase />
        <TestimonialsSection />
        <FinalCTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
