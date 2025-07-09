
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { RoleProvider } from '@/hooks/useRole';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SubscriptionProvider } from '@/hooks/useSubscription';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Jobs from '@/pages/Jobs';
import Customers from '@/pages/Customers';
import Staff from '@/pages/Staff';
import TimeTracking from '@/pages/TimeTracking';
import Subscription from '@/pages/Subscription';
import Quotes from '@/pages/Quotes';
import Invoices from '@/pages/Invoices';
import Files from '@/pages/Files';
import Analytics from '@/pages/Analytics';
import AdminDashboard from '@/pages/AdminDashboard';
import ContractorSettings from '@/pages/ContractorSettings';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RoleProvider>
          <SubscriptionProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/contractors" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AdminDashboard />} />
                <Route path="/admin/chats" element={<AdminDashboard />} />
                <Route path="/admin/invoices" element={<AdminDashboard />} />
                <Route path="/admin/settings" element={<AdminDashboard />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/time-tracking" element={<TimeTracking />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/files" element={<Files />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<ContractorSettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
          </SubscriptionProvider>
        </RoleProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
