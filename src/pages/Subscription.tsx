import { DashboardLayout } from '@/components/DashboardLayout';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { useLanguage } from '@/contexts/LanguageContext';

const Subscription = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('subscription')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('manageSubscriptionDescription')}
          </p>
        </div>
        
        <SubscriptionManager />
      </div>
    </DashboardLayout>
  );
};

export default Subscription;