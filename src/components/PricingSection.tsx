import { Check, Star } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const PricingSection = () => {
  const { t } = useLanguage();
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: t('starter'),
      description: t('starterDesc'),
      price: { monthly: 29, annual: 20 },
      staffLimit: '3',
      features: [
        t('basicInvoicing'),
        t('mobileApp'),
        t('basicReporting'),
        'Email support',
        'Basic GPS tracking'
      ],
      variant: 'professional' as const,
      popular: false
    },
    {
      name: t('professional'),
      description: t('professionalDesc'),
      price: { monthly: 79, annual: 55 },
      staffLimit: '15',
      features: [
        t('advancedInvoicing'),
        t('gpsTracking'),
        t('jobManagement'),
        t('payrollTracking'),
        'Photo documentation',
        'Driving monitoring',
        'Priority email support'
      ],
      variant: 'hero' as const,
      popular: true
    },
    {
      name: t('enterprise'),
      description: t('enterpriseDesc'),
      price: { monthly: 199, annual: 139 },
      staffLimit: t('unlimited'),
      features: [
        t('allProfessionalFeatures'),
        t('advancedReporting'),
        t('apiIntegrations'),
        t('prioritySupport'),
        t('customBranding'),
        'Dedicated account manager',
        'Custom integrations'
      ],
      variant: 'professional' as const,
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-16 px-4 bg-background">
      <div className="container mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-space text-foreground mb-4">
            {t('pricingTitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('pricingSubtitle')}
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 bg-muted rounded-full p-1 max-w-sm mx-auto">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-smooth ${
                !isAnnual 
                  ? 'bg-background text-foreground shadow-card' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('monthly')}
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-smooth flex items-center gap-2 ${
                isAnnual 
                  ? 'bg-background text-foreground shadow-card' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('annually')}
              <span className="bg-success text-success-foreground text-xs px-2 py-1 rounded-full">
                {t('save30')}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative rounded-2xl border p-8 transition-smooth hover:shadow-elevated ${
                plan.popular 
                  ? 'border-primary bg-gradient-card scale-105 shadow-elevated' 
                  : 'border-border bg-card shadow-card'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold font-space text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
                
                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">
                    CAD/{isAnnual ? 'month' : 'month'}
                  </span>
                  {isAnnual && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Billed annually (${plan.price.annual * 12} CAD/year)
                    </div>
                  )}
                </div>

                {/* Staff limit */}
                <div className="text-sm text-muted-foreground">
                  {plan.staffLimit === t('unlimited') ? t('unlimited') : `${t('upTo')} ${plan.staffLimit}`} {t('staffMembers')}
                </div>
              </div>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <Button 
                variant={plan.variant} 
                className="w-full text-base py-3 h-auto"
              >
                {index === 2 ? t('contactSales') : t('getStarted')}
              </Button>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include 14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};