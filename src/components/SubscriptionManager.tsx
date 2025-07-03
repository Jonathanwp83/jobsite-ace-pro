import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';

const SUBSCRIPTION_PLANS = [
  {
    name: 'Basic',
    priceId: 'price_basic_monthly', // Replace with actual Stripe price ID
    price: '$9.99',
    interval: 'month',
    features: [
      'Up to 3 staff members',
      'Basic time tracking',
      'Customer management',
      'Basic reporting'
    ],
    icon: Check
  },
  {
    name: 'Premium',
    priceId: 'price_premium_monthly', // Replace with actual Stripe price ID  
    price: '$19.99',
    interval: 'month',
    features: [
      'Up to 10 staff members',
      'Advanced time tracking with GPS',
      'Job management & scheduling',
      'Invoicing & quotes',
      'File uploads & photos',
      'Advanced reporting'
    ],
    icon: Star,
    popular: true
  },
  {
    name: 'Enterprise',
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    price: '$39.99',
    interval: 'month',
    features: [
      'Unlimited staff members',
      'Everything in Premium',
      'Custom branding',
      'API access',
      'Priority support',
      'Advanced analytics'
    ],
    icon: Crown
  }
];

export const SubscriptionManager = () => {
  const { subscribed, subscriptionTier, subscriptionEnd, loading, createCheckout, openCustomerPortal } = useSubscription();

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscribed && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Your Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">{subscriptionTier}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {subscriptionEnd && `Renews ${new Date(subscriptionEnd).toLocaleDateString()}`}
                  </span>
                </div>
              </div>
              <Button onClick={openCustomerPortal} variant="outline">
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = subscribed && subscriptionTier === plan.name;
          
          return (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-2 border-primary' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <div>
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan ? "outline" : "default"}
                  onClick={() => createCheckout(plan.priceId)}
                  disabled={loading || isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!subscribed && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Choose Your Plan</h3>
              <p className="text-muted-foreground">
                Select a subscription plan to unlock all ContractorPro features and grow your business.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};