import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionContextType {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: (priceId: string) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!user || !session) {
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscribed(data.subscribed);
      setSubscriptionTier(data.subscription_tier);
      setSubscriptionEnd(data.subscription_end);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        variant: "destructive",
        title: "Subscription Check Failed",
        description: "Unable to verify subscription status",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (priceId: string) => {
    if (!session) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: "Unable to create checkout session",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!session) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        variant: "destructive",
        title: "Portal Access Failed",
        description: "Unable to open customer portal",
      });
    }
  };

  // Check subscription on user change
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const value = {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};