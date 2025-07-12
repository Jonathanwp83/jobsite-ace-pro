
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const TestLoginHelper = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const testAccounts = [
    {
      id: 'platform-admin',
      email: 'admin@contractorpro.com',
      password: 'testpass123',
      type: 'Platform Admin',
      description: 'Contractor Pro employee - manages the SaaS platform and customers',
      role: 'admin',
      badge: 'Platform'
    },
    {
      id: 'contractor-customer-1',
      email: 'john@acmeconstruction.com',
      password: 'testpass123',
      type: 'Contractor Customer',
      description: 'Paying customer - owns Acme Construction Company',
      role: 'contractor',
      badge: 'Customer',
      companyData: {
        company_name: 'Acme Construction Co.',
        contact_name: 'John Smith'
      }
    },
    {
      id: 'contractor-customer-2',
      email: 'sarah@elitehomes.com',
      password: 'testpass123',
      type: 'Contractor Customer',
      description: 'Paying customer - owns Elite Homes Builder',
      role: 'contractor',
      badge: 'Customer',
      companyData: {
        company_name: 'Elite Homes Builder',
        contact_name: 'Sarah Johnson'
      }
    },
    {
      id: 'staff-member',
      email: 'mike@acmeconstruction.com',
      password: 'testpass123',
      type: 'Staff Member',
      description: 'Employee of Acme Construction (works for John Smith)',
      role: 'staff',
      badge: 'Staff'
    }
  ];

  const handleCreateAndLogin = async (account: typeof testAccounts[0]) => {
    setLoading(account.id);
    
    try {
      console.log('Creating clean test account:', account.email, account.type);
      
      // Try to sign up first (will handle existing users gracefully)
      const { error: signupError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (signupError && signupError.message !== 'User already registered') {
        throw signupError;
      }

      // Sign in to get the user
      const { error: signinError } = await signIn(account.email, account.password);
      if (signinError) {
        throw signinError;
      }

      // Get the user to set up their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Failed to get user after login');

      // Set up user profile based on their role
      if (account.role === 'admin') {
        // Platform Admin: Create user_roles entry
        await supabase.from('user_roles').upsert({
          user_id: user.id,
          role: 'admin'
        }, { onConflict: 'user_id,role' });

        console.log('✅ Platform Admin role created');

      } else if (account.role === 'contractor' && account.companyData) {
        // Contractor Customer: Create contractors record
        await supabase.from('contractors').upsert({
          user_id: user.id,
          email: account.email,
          company_name: account.companyData.company_name,
          contact_name: account.companyData.contact_name,
          subscription_plan: 'professional',
          subscription_active: true,
          is_platform_admin: false
        }, { onConflict: 'user_id' });

        console.log('✅ Contractor Customer record created');

      } else if (account.role === 'staff') {
        // Staff Member: Find the contractor they work for and create staff record
        const { data: contractor } = await supabase
          .from('contractors')
          .select('id')
          .eq('company_name', 'Acme Construction Co.')
          .single();

        if (contractor) {
          await supabase.from('staff').upsert({
            user_id: user.id,
            contractor_id: contractor.id,
            email: account.email,
            first_name: 'Mike',
            last_name: 'Wilson',
            is_active: true,
            hourly_rate: 25.00
          }, { onConflict: 'user_id' });

          console.log('✅ Staff Member record created');
        } else {
          throw new Error('Contractor company not found for staff member');
        }
      }

      toast({
        title: 'Success',
        description: `Logged in as ${account.type}`
      });

    } catch (error) {
      console.error('Test login error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create test account'
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Clean Test Login Accounts</h3>
        <p className="text-sm text-gray-600">
          Fresh accounts for Contractor Pro SaaS platform testing
        </p>
      </div>

      {testAccounts.map((account) => (
        <Card key={account.id} className="border-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                {account.type}
                <Badge variant={account.role === 'admin' ? 'default' : 'outline'}>
                  {account.badge}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{account.description}</p>
              
              <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                <div><strong>Email:</strong> {account.email}</div>
                <div><strong>Password:</strong> {account.password}</div>
              </div>

              <Button 
                onClick={() => handleCreateAndLogin(account)}
                disabled={loading !== null}
                className="w-full"
                variant={account.role === 'admin' ? 'default' : 'outline'}
              >
                {loading === account.id ? 'Setting up...' : `Login as ${account.type}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Contractor Pro SaaS Business Model:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Platform Admin:</strong> Contractor Pro employees who manage the SaaS platform</li>
          <li><strong>Contractor Customer:</strong> Contractors who pay for Contractor Pro subscriptions</li>
          <li><strong>Staff Member:</strong> Employees of contractor customers</li>
          <li><strong>Future: Contractor Client:</strong> End customers of contractors (homeowners, etc.)</li>
        </ul>
      </div>
    </div>
  );
};
