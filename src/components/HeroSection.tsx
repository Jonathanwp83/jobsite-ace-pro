import { Play, ArrowRight, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="pt-24 pb-16 px-4 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto text-center">
        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-1 mb-6">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-accent text-accent" />
            ))}
          </div>
          <span className="text-sm text-muted-foreground ml-2">
            Trusted by 10,000+ contractors across Canada
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-space text-foreground mb-6 leading-tight">
          {t('heroTitle')}
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          {t('heroSubtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12">
          <Button variant="hero" size="lg" className="text-lg px-8 py-4 h-auto">
            {t('startFreeTrial')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button variant="professional" size="lg" className="text-lg px-8 py-4 h-auto">
            <Play className="w-5 h-5 mr-2" />
            {t('watchDemo')}
          </Button>
        </div>

        {/* Hero image placeholder */}
        <div className="relative max-w-5xl mx-auto">
          <div className="bg-gradient-card rounded-2xl shadow-elevated p-8 border border-border">
            <div className="bg-muted rounded-xl h-64 md:h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-primary-foreground">📱</span>
                </div>
                <p className="text-muted-foreground font-medium">
                  Dashboard Preview Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};