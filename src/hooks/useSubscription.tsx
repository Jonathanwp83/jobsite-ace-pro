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
      // First check if this user is an admin - admins don't need subscriptions
      const { data: roleData } = await supabase.rpc('get_user_role', {
        _user_id: user.id
      });
      
      if (roleData === 'admin') {
        console.log('👤 User is admin, skipping subscription check');
        setSubscribed(true);
        setSubscriptionTier('Admin');
        setSubscriptionEnd(null);
        return;
      }

      console.log('🔍 Checking subscription for user:', user.email);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription check error:', error);
        // For non-admin users, default to unsubscribed state if check fails
        setSubscribed(false);
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
        return;
      }

      setSubscribed(data.subscribed);
      setSubscriptionTier(data.subscription_tier);
      setSubscriptionEnd(data.subscription_end);
      console.log('✅ Subscription check complete:', data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Silently fail for better UX - default to unsubscribed
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
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

  // Check subscription on user change, but delay slightly to let role detection complete
  useEffect(() => {
    if (user) {
      // Small delay to ensure role detection is complete
      const timer = setTimeout(() => {
        checkSubscription();
      }, 1000);
      return () => clearTimeout(timer);
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