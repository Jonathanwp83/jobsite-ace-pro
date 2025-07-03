import { Smartphone, MapPin, Users, Clock, Camera, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Smartphone,
      title: t('feature1Title'),
      description: t('feature1Desc'),
      color: 'text-primary'
    },
    {
      icon: MapPin,
      title: t('feature2Title'), 
      description: t('feature2Desc'),
      color: 'text-accent'
    },
    {
      icon: Users,
      title: t('feature3Title'),
      description: t('feature3Desc'),
      color: 'text-success'
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Automated time tracking with GPS verification for accurate payroll and billing.",
      color: 'text-primary'
    },
    {
      icon: Camera,
      title: "Photo Documentation",
      description: "Before and after photos with automatic project documentation and progress tracking.",
      color: 'text-accent'
    },
    {
      icon: CreditCard,
      title: "Payment Integration",
      description: "Get paid faster with built-in payment processing and automatic invoice reminders.",
      color: 'text-success'
    }
  ];

  return (
    <section id="features" className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-space text-foreground mb-4">
            {t('featuresTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to run your contracting business efficiently, from job site to client payment.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gradient-card rounded-xl p-6 border border-border shadow-card hover:shadow-elevated transition-smooth group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center group-hover:scale-110 transition-smooth">
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 font-space">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};