
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
      id: 'admin',
      email: 'admin@contractorpro.com',
      password: 'testpass123',
      type: 'Platform Admin',
      description: 'Contractor Pro platform administrator - manages the SaaS platform',
      role: 'admin'
    },
    {
      id: 'contractor1',
      email: 'john@acmeconstruction.com',
      password: 'testpass123',
      type: 'Contractor Customer',
      description: 'Paying customer - runs Acme Construction Company',
      role: 'contractor',
      companyData: {
        company_name: 'Acme Construction Co.',
        contact_name: 'John Smith'
      }
    },
    {
      id: 'contractor2',
      email: 'sarah@elitehomes.com',
      password: 'testpass123',
      type: 'Contractor Customer',
      description: 'Paying customer - runs Elite Homes Builder',
      role: 'contractor',
      companyData: {
        company_name: 'Elite Homes Builder',
        contact_name: 'Sarah Johnson'
      }
    },
    {
      id: 'staff',
      email: 'mike@acmeconstruction.com',
      password: 'testpass123',
      type: 'Staff Member',
      description: 'Employee of Acme Construction (works for John Smith)',
      role: 'staff'
    }
  ];

  const handleCreateAndLogin = async (account: typeof testAccounts[0]) => {
    setLoading(account.id);
    
    try {
      console.log('Creating test account:', account.email, account.type);
      
      // Try to sign up first
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

      // Sign in
      const { error: signinError } = await signIn(account.email, account.password);
      if (signinError) {
        throw signinError;
      }

      // Get the user to set up their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Failed to get user after login');

      // Set up the user profile based on their role
      if (account.role === 'admin') {
        // Create/update contractor record with admin flag
        await supabase.from('contractors').upsert({
          user_id: user.id,
          email: account.email,
          company_name: 'Contractor Pro',
          contact_name: 'Platform Admin',
          subscription_plan: 'enterprise',
          is_platform_admin: true
        }, { onConflict: 'user_id' });

      } else if (account.role === 'contractor' && account.companyData) {
        // Create contractor customer record
        await supabase.from('contractors').upsert({
          user_id: user.id,
          email: account.email,
          company_name: account.companyData.company_name,
          contact_name: account.companyData.contact_name,
          subscription_plan: 'professional',
          is_platform_admin: false
        }, { onConflict: 'user_id' });

      } else if (account.role === 'staff') {
        // Find the contractor they work for (Acme Construction)
        const { data: contractor } = await supabase
          .from('contractors')
          .select('id')
          .eq('company_name', 'Acme Construction Co.')
          .single();

        if (contractor) {
          // Create staff record
          await supabase.from('staff').upsert({
            user_id: user.id,
            contractor_id: contractor.id,
            email: account.email,
            first_name: 'Mike',
            last_name: 'Wilson',
            is_active: true,
            hourly_rate: 25.00
          }, { onConflict: 'user_id' });
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
        <h3 className="text-lg font-semibold mb-2">Test Login Accounts</h3>
        <p className="text-sm text-gray-600">
          Demo accounts for Contractor Pro SaaS platform
        </p>
      </div>

      {testAccounts.map((account) => (
        <Card key={account.id} className="border-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                {account.type}
                <Badge variant={account.role === 'admin' ? 'default' : 'outline'}>
                  {account.role}
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
        <h4 className="font-medium text-blue-900 mb-2">Business Model Clarification:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Platform Admin:</strong> Manages the Contractor Pro SaaS platform</li>
          <li><strong>Contractor Customer:</strong> Pays for Contractor Pro to manage their business</li>
          <li><strong>Staff Member:</strong> Employee of a contractor customer</li>
        </ul>
      </div>
    </div>
  );
};
