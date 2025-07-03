
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Clock,
  FileText,
  Receipt,
  Upload,
  BarChart3,
  CreditCard,
  LogOut,
  Menu,
  X,
  Settings,
  Shield
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  profile?: {
    contact_name: string;
    subscription_plan: string;
  };
}

const getNavigationItems = (userRole: string | null) => {
  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'contractor', 'staff'] },
    { name: 'Jobs', href: '/jobs', icon: Briefcase, roles: ['contractor', 'staff'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['contractor'] },
    { name: 'Staff', href: '/staff', icon: Users, roles: ['contractor'] },
    { name: 'Time Tracking', href: '/time-tracking', icon: Clock, roles: ['contractor', 'staff'] },
    { name: 'Subscription', href: '/subscription', icon: CreditCard, roles: ['contractor'] },
    { name: 'Quotes', href: '/quotes', icon: FileText, roles: ['contractor'] },
    { name: 'Invoices', href: '/invoices', icon: Receipt, roles: ['contractor'] },
    { name: 'Files', href: '/files', icon: Upload, roles: ['contractor', 'staff'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['contractor'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['contractor'] },
    { name: 'Admin Panel', href: '/admin', icon: Shield, roles: ['admin'] },
  ];

  return baseItems.filter(item => item.roles.includes(userRole || ''));
};

export const DashboardLayout = ({ children, profile }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { userRole } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigationItems = getNavigationItems(userRole);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">ContractorPro</h1>
          </div>

          {/* Profile */}
          {profile && (
            <Card className="m-4">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">{profile.contact_name}</h3>
                  <Badge className={getPlanColor(profile.subscription_plan)}>
                    {profile.subscription_plan.charAt(0).toUpperCase() + profile.subscription_plan.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        <main className="h-full overflow-auto">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
