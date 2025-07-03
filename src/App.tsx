
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Jobs from '@/pages/Jobs';
import Customers from '@/pages/Customers';
import Staff from '@/pages/Staff';
import TimeTracking from '@/pages/TimeTracking';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/time-tracking" element={<TimeTracking />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
